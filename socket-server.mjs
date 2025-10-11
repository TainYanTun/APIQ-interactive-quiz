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
          scoringMode: 'individual',
          isBuzzerActive: false,
          activeStudent: null,
          currentQuestionIndex: 0,
          scores: {},
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

    switch (type) {
      case 'REGISTER':
        session.clients.add(ws);
        if (payload.role === 'admin') {
          session.admin = ws;
        } else if (payload.role === 'student') {
          session.students.add(ws);
          if (session.quizState.scoringMode === 'individual' && !session.quizState.scores[payload.studentId]) {
            session.quizState.scores[payload.studentId] = 0;
          }
        }
        ws.send(JSON.stringify({ type: 'QUIZ_STATE', payload: getCleanQuizState() }));
        break;

      case 'SET_SCORING_MODE':
        session.quizState.scoringMode = payload.mode;
        session.quizState.scores = {}; // Reset scores when mode changes
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

          if (session.quizState.scoringMode === 'individual') {
            session.quizState.scores[session.quizState.activeStudent] += points;
          } else { // department scoring
            const db = await getDbConnection();
            const [rows] = await db.execute('SELECT d.id, d.name FROM students s JOIN departments d ON s.department_id = d.id WHERE s.student_id = ?', [session.quizState.activeStudent]);
            if (rows.length > 0) {
              const department = rows[0];
              await db.execute('INSERT INTO scores (session_id, department_id, points) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE points = points + VALUES(points)', [sessionId, department.id, points]);
              
              const [deptScores] = await db.execute('SELECT d.name, s.points FROM scores s JOIN departments d ON s.department_id = d.id WHERE s.session_id = ?', [sessionId]);
              const newScores = {};
              for (const row of deptScores) {
                newScores[row.name] = row.points;
              }
              session.quizState.scores = newScores;
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
