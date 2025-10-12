import 'dotenv/config';
import WebSocket, { WebSocketServer } from 'ws';
import mysql from 'mysql2/promise';

const wss = new WebSocketServer({ port: 3001 });

const sessions = {};

let db;

async function getDbConnection() {
  if (!db) {
    db = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
  }
  return db;
}

async function retryDbOperation(operation) {
  let attempts = 3;
  while (attempts > 0) {
    try {
      return await operation();
    } catch (error) {
      attempts--;
      if (attempts === 0) {
        throw error;
      }
      await new Promise(res => setTimeout(res, 100)); // wait 100ms before retrying
    }
  }
}

console.log('WebSocket server started on port 3001');

wss.on('connection', ws => {
  console.log('Client connected');

  ws.on('message', async message => {
    const data = JSON.parse(message);
    const { type, payload } = data;
    const { sessionId } = payload;

    if (!sessions[sessionId]) {
      sessions[sessionId] = {
        clients: new Set(),
        admin: null,
        students: new Set(),
        quizState: {
          isQuizStarted: false,
          isQuizEnded: false,
          scoringMode: 'individual',
          isBuzzerActive: false,
          activeStudent: null,
          currentQuestionIndex: 0,
          currentRound: 1,
          scores: {},
          roundScores: {},
          remainingTime: 10000,
          timerId: null,
          ineligibleStudents: [],
          showAnswer: false,
        },
      };
    }

    const session = sessions[sessionId];

    const getCleanQuizState = () => {
      const cleanState = { ...session.quizState };
      delete cleanState.timerId;
      return cleanState;
    };

    const broadcast = (data) => {
      for (const client of session.clients) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      }
    };

    const startTimer = () => {
      clearInterval(session.quizState.timerId);
      session.quizState.timerId = setInterval(() => {
        session.quizState.remainingTime -= 100;
        if (session.quizState.remainingTime <= 0) {
          clearInterval(session.quizState.timerId);
          session.quizState.isBuzzerActive = false;
        }
        broadcast({ type: 'TIMER_UPDATE', payload: getCleanQuizState() });
      }, 100);
    };

    const saveRoundScores = async () => {
      const db = await getDbConnection();
      const { scoringMode, roundScores, currentRound } = session.quizState;
      if (Object.keys(roundScores).length === 0) return;

      if (scoringMode === 'department') {
        for (const departmentName in roundScores) {
          const score = roundScores[departmentName];
          if (score > 0) {
            const [rows] = await db.execute('SELECT id FROM departments WHERE name = ?', [departmentName]);
            if (rows.length > 0) {
              const departmentId = rows[0].id;
              await retryDbOperation(async () => {
                await db.execute('INSERT INTO department_round_scores (session_id, department_id, round, score) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE score = VALUES(score)', [sessionId, departmentId, currentRound, score]);
              });
            }
          }
        }
      } else {
        for (const studentId in roundScores) {
          const score = roundScores[studentId];
          if (score > 0) {
            await retryDbOperation(async () => {
              await db.execute('INSERT INTO student_round_scores (session_id, student_id, round, score) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE score = VALUES(score)', [sessionId, studentId, currentRound, score]);
            });
          }
        }
      }
    };

    switch (type) {
      case 'REGISTER':
        session.clients.add(ws);
        if (payload.role === 'admin') {
          session.admin = ws;
        } else if (payload.role === 'student') {
          session.students.add(ws);
        }
        ws.send(JSON.stringify({ type: 'QUIZ_STATE', payload: getCleanQuizState() }));
        break;

      case 'SET_SCORING_MODE':
        session.quizState.scoringMode = payload.mode;
        session.quizState.scores = {}; // Reset scores when mode changes
        session.quizState.roundScores = {};
        broadcast({ type: 'QUIZ_STATE', payload: getCleanQuizState() });
        break;

      case 'START_QUIZ':
        session.quizState.isQuizStarted = true;
        session.quizState.isBuzzerActive = true;
        session.quizState.remainingTime = 10000;
        session.quizState.showAnswer = false;
        startTimer();
        broadcast({ type: 'QUIZ_STARTED', payload: getCleanQuizState() });
        break;

      case 'NEXT_QUESTION':
        const db = await getDbConnection();
        const [currentQuestionRows] = await db.execute('SELECT round FROM questions_bank WHERE id = ?', [payload.questionId]);
        const currentQuestion = currentQuestionRows[0];

        if (currentQuestion && currentQuestion.round > session.quizState.currentRound) {
            await saveRoundScores();
            session.quizState.roundScores = {}; // Reset for new round
            session.quizState.currentRound = currentQuestion.round;
        }

        clearInterval(session.quizState.timerId);
        session.quizState.currentQuestionIndex += 1;
        session.quizState.isBuzzerActive = true;
        session.quizState.activeStudent = null;
        session.quizState.remainingTime = 10000;
        session.quizState.ineligibleStudents = [];
        session.quizState.showAnswer = false;
        startTimer();
        broadcast({ type: 'NEW_QUESTION', payload: getCleanQuizState() });
        break;

      case 'BUZZ':
        if (session.quizState.isBuzzerActive && !session.quizState.ineligibleStudents.includes(payload.studentId)) {
          clearInterval(session.quizState.timerId);
          session.quizState.isBuzzerActive = false;
          session.quizState.activeStudent = payload.studentId;
          broadcast({ type: 'BUZZER_ACTIVATED', payload: getCleanQuizState() });
        }
        break;

      case 'JUDGE_ANSWER':
        if (payload.correct) {
          const timeTaken = 10000 - session.quizState.remainingTime;
          let points = 0;
          if (timeTaken <= 3333) points = 3;
          else if (timeTaken <= 6666) points = 2;
          else points = 1;

          const db = await getDbConnection();
          const currentQuestionId = payload.questionId;
          const studentId = session.quizState.activeStudent;

          if (session.quizState.scoringMode === 'individual') {
            // Analytics write
            await retryDbOperation(async () => {
              await db.execute('INSERT INTO student_question_scores (session_id, student_id, question_id, score) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE score = VALUES(score)', [sessionId, studentId, currentQuestionId, points]);
            });
            // Update in-memory scores
            session.quizState.scores[studentId] = (session.quizState.scores[studentId] || 0) + points;
            session.quizState.roundScores[studentId] = (session.quizState.roundScores[studentId] || 0) + points;

          } else { // department scoring
            const [rows] = await db.execute('SELECT d.id, d.name FROM students s JOIN departments d ON s.department_id = d.id WHERE s.student_id = ?', [studentId]);
            if (rows.length > 0) {
              const department = rows[0];
              
              // Analytics write for the individual student
              await retryDbOperation(async () => {
                await db.execute('INSERT INTO student_question_scores (session_id, student_id, question_id, score) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE score = VALUES(score)', [sessionId, studentId, currentQuestionId, points]);
              });

              // Update in-memory scores
              session.quizState.scores[department.name] = (session.quizState.scores[department.name] || 0) + points;
              session.quizState.roundScores[department.name] = (session.quizState.roundScores[department.name] || 0) + points;
            }
          }
          session.quizState.activeStudent = null;
          session.quizState.showAnswer = true;
          broadcast({ type: 'SCORES_UPDATED', payload: getCleanQuizState() });
        } else {
          session.quizState.ineligibleStudents.push(session.quizState.activeStudent);
          session.quizState.activeStudent = null;
          session.quizState.isBuzzerActive = true;
          startTimer();
          broadcast({ type: 'BUZZER_OPEN', payload: getCleanQuizState() });
        }
        break;

      case 'END_QUIZ':
        await saveRoundScores(); // Save the last round's scores
        clearInterval(session.quizState.timerId);
        const db_end = await getDbConnection();
        await db_end.execute('UPDATE sessions SET is_active = 0 WHERE id = ?', [sessionId]);

        let finalScores = {};
        if (session.quizState.scoringMode === 'individual') {
          const [studentTotalScores] = await db_end.execute('SELECT student_id, SUM(score) as total_score FROM student_round_scores WHERE session_id = ? GROUP BY student_id', [sessionId]);
          for (const row of studentTotalScores) {
            finalScores[row.student_id] = Number(row.total_score);
          }
        } else { // department scoring
          const [departmentTotalScores] = await db_end.execute('SELECT d.name, SUM(drs.score) as total_score FROM department_round_scores drs JOIN departments d ON drs.department_id = d.id WHERE drs.session_id = ? GROUP BY d.name', [sessionId]);
          for (const row of departmentTotalScores) {
            finalScores[row.name] = Number(row.total_score);
          }
        }
        session.quizState.isQuizStarted = false;
        session.quizState.isQuizEnded = true;
        session.quizState.scores = finalScores;
        broadcast({ type: 'QUIZ_ENDED', payload: { ...getCleanQuizState(), finalScores } });
        break;

      case 'START_NEW_ROUND':
        await saveRoundScores();
        session.quizState.roundScores = {}; // Reset for new round
        clearInterval(session.quizState.timerId);
        const db2 = await getDbConnection();
        await db2.execute('UPDATE sessions SET is_active = 1 WHERE id = ?', [sessionId]);

        session.quizState.isQuizStarted = true;
        session.quizState.isQuizEnded = false;
        session.quizState.isBuzzerActive = true;
        session.quizState.activeStudent = null;
        session.quizState.currentQuestionIndex = 0;
        session.quizState.currentRound += 1;
        session.quizState.remainingTime = 10000;
        session.quizState.ineligibleStudents = [];
        session.quizState.showAnswer = false;
        startTimer();
        broadcast({ type: 'QUIZ_STARTED', payload: getCleanQuizState() });
        break;

      default:
        console.log('Unknown message type:', type);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    for (const sessionId in sessions) {
      if (sessions[sessionId].clients.has(ws)) {
        sessions[sessionId].clients.delete(ws);
        if (sessions[sessionId].admin === ws) {
          sessions[sessionId].admin = null;
        }
        sessions[sessionId].students.delete(ws);
        break;
      }
    }
  });
});