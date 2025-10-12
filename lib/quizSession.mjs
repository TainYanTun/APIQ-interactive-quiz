// quizSession.mjs

import WebSocket from 'ws';
import mysql from 'mysql2/promise'; // Will be used for DB operations within the class

// This should ideally be passed in or managed by a singleton pattern
// to avoid multiple connections. For now, we'll keep it simple.
let dbConnectionPool;

async function getDbConnection() {
  if (!dbConnectionPool) {
    dbConnectionPool = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
  }
  return dbConnectionPool;
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

class QuizSession {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.clients = new Set(); // All connected clients for this session
    this.admin = null;        // The admin client for this session
    this.students = new Set(); // All student clients for this session
    this.quizState = {
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
      timerId: null, // Will be a reference to setInterval
      ineligibleStudents: [],
      showAnswer: false,
    };
  }

  // Helper to get a clean state for broadcasting (without timerId)
  getCleanQuizState() {
    const cleanState = { ...this.quizState };
    delete cleanState.timerId; // Don't send timerId to clients
    return cleanState;
  }

  // Method to broadcast data to all clients in this session
  broadcast(data) {
    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    }
  }

  // Method to register a client
  registerClient(ws, role, studentId) {
    this.clients.add(ws);
    if (role === 'admin') {
      this.admin = ws;
    } else if (role === 'student') {
      this.students.add(ws);
      // Potentially initialize student-specific state if needed
    }
    ws.send(JSON.stringify({ type: 'QUIZ_STATE', payload: this.getCleanQuizState() }));
  }

  // Method to remove a client
  removeClient(ws) {
    this.clients.delete(ws);
    if (this.admin === ws) {
      this.admin = null;
    }
    this.students.delete(ws);
    // Potentially clean up student-specific state
  }

  // Method to start the timer
  startTimer() {
    clearInterval(this.quizState.timerId);
    this.quizState.timerId = setInterval(() => {
      this.quizState.remainingTime -= 100;
      if (this.quizState.remainingTime <= 0) {
        clearInterval(this.quizState.timerId);
        this.quizState.isBuzzerActive = false;
      }
      this.broadcast({ type: 'TIMER_UPDATE', payload: this.getCleanQuizState() });
    }, 100);
  }

  // Method to save round scores (will interact with DB)
  async saveRoundScores() {
    const db = await getDbConnection();
    const { scoringMode, roundScores, currentRound } = this.quizState;
    if (Object.keys(roundScores).length === 0) return;

    if (scoringMode === 'department') {
      for (const departmentName in roundScores) {
        const score = roundScores[departmentName];
        if (score > 0) {
          const [rows] = await db.execute('SELECT id FROM departments WHERE name = ?', [departmentName]);
          if (rows.length > 0) {
            const departmentId = rows[0].id;
            await retryDbOperation(async () => {
              await db.execute('INSERT INTO department_round_scores (session_id, department_id, round, score) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE score = VALUES(score)', [this.sessionId, departmentId, currentRound, score]);
            });
          }
        }
      }
    } else { // individual scoring
      for (const studentId in roundScores) {
        const score = roundScores[studentId];
        if (score > 0) {
          await retryDbOperation(async () => {
            await db.execute('INSERT INTO student_round_scores (session_id, student_id, round, score) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE score = VALUES(score)', [this.sessionId, studentId, currentRound, score]);
          });
        }
      }
    }
  }

  // --- Methods for handling specific message types ---

  // Handles the 'SET_SCORING_MODE' message
  setScoringMode(mode) {
    this.quizState.scoringMode = mode;
    this.quizState.scores = {};
    this.quizState.roundScores = {};
    this.broadcast({ type: 'QUIZ_STATE', payload: this.getCleanQuizState() });
  }

  // Handles the 'START_QUIZ' message
  startQuiz() {
    this.quizState.isQuizStarted = true;
    this.quizState.isBuzzerActive = true;
    this.quizState.remainingTime = 10000;
    this.quizState.showAnswer = false;
    this.startTimer();
    this.broadcast({ type: 'QUIZ_STARTED', payload: this.getCleanQuizState() });
  }

  // Handles the 'NEXT_QUESTION' message
  async nextQuestion(questionId) {
    const db = await getDbConnection();
    const [currentQuestionRows] = await db.execute('SELECT round FROM questions_bank WHERE id = ?', [questionId]);
    const currentQuestion = currentQuestionRows[0];

    if (currentQuestion && currentQuestion.round > this.quizState.currentRound) {
        await this.saveRoundScores();
        this.quizState.roundScores = {}; // Reset for new round
        this.quizState.currentRound = currentQuestion.round;
    }

    clearInterval(this.quizState.timerId);
    this.quizState.currentQuestionIndex += 1;
    this.quizState.isBuzzerActive = true;
    this.quizState.activeStudent = null;
    this.quizState.remainingTime = 10000;
    this.quizState.ineligibleStudents = [];
    this.quizState.showAnswer = false;
    this.startTimer();
    this.broadcast({ type: 'NEW_QUESTION', payload: this.getCleanQuizState() });
  }

  // Handles the 'BUZZ' message
  buzz(studentId) {
    if (this.quizState.isBuzzerActive && !this.quizState.ineligibleStudents.includes(studentId)) {
      clearInterval(this.quizState.timerId);
      this.quizState.isBuzzerActive = false;
      this.quizState.activeStudent = studentId;
      this.broadcast({ type: 'BUZZER_ACTIVATED', payload: this.getCleanQuizState() });
    }
  }

  // Handles the 'JUDGE_ANSWER' message
  async judgeAnswer(payload) {
    if (payload.correct) {
      const timeTaken = 10000 - this.quizState.remainingTime;
      let points = 0;
      if (timeTaken <= 3333) points = 3;
      else if (timeTaken <= 6666) points = 2;
      else points = 1;

      const db = await getDbConnection();
      const currentQuestionId = payload.questionId;
      const studentId = this.quizState.activeStudent;

      if (this.quizState.scoringMode === 'individual') {
        // Analytics write
        await retryDbOperation(async () => {
          await db.execute('INSERT INTO student_question_scores (session_id, student_id, question_id, score) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE score = VALUES(score)', [this.sessionId, studentId, currentQuestionId, points]);
        });
        // Update in-memory scores
        this.quizState.scores[studentId] = (this.quizState.scores[studentId] || 0) + points;
        this.quizState.roundScores[studentId] = (this.quizState.roundScores[studentId] || 0) + points;

      } else { // department scoring
        const [rows] = await db.execute('SELECT d.id, d.name FROM students s JOIN departments d ON s.department_id = d.id WHERE s.student_id = ?', [studentId]);
        if (rows.length > 0) {
          const department = rows[0];
          
          // Analytics write for the individual student
          await retryDbOperation(async () => {
            await db.execute('INSERT INTO student_question_scores (session_id, student_id, question_id, score) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE score = VALUES(score)', [this.sessionId, studentId, currentQuestionId, points]);
          });

          // Update in-memory scores
          this.quizState.scores[department.name] = (this.quizState.scores[department.name] || 0) + points;
          this.quizState.roundScores[department.name] = (this.quizState.roundScores[department.name] || 0) + points;
        }
      }
      this.quizState.activeStudent = null;
      this.quizState.showAnswer = true;
      this.broadcast({ type: 'SCORES_UPDATED', payload: this.getCleanQuizState() });
    } else {
      this.quizState.ineligibleStudents.push(this.quizState.activeStudent);
      this.quizState.activeStudent = null;
      this.quizState.isBuzzerActive = true;
      this.startTimer();
      this.broadcast({ type: 'BUZZER_OPEN', payload: this.getCleanQuizState() });
    }
  }

  // Handles the 'END_QUIZ' message
  async endQuiz() {
    await this.saveRoundScores(); // Save the last round's scores
    clearInterval(this.quizState.timerId);
    const db = await getDbConnection();
    await db.execute('UPDATE sessions SET is_active = 0 WHERE id = ?', [this.sessionId]);

    let finalScores = {};
    if (this.quizState.scoringMode === 'individual') {
      const [studentTotalScores] = await db.execute('SELECT student_id, SUM(score) as total_score FROM student_round_scores WHERE session_id = ? GROUP BY student_id', [this.sessionId]);
      for (const row of studentTotalScores) {
        finalScores[row.student_id] = Number(row.total_score);
      }
    } else { // department scoring
      const [departmentTotalScores] = await db.execute('SELECT d.name, SUM(drs.score) as total_score FROM department_round_scores drs JOIN departments d ON drs.department_id = d.id WHERE drs.session_id = ? GROUP BY d.name', [this.sessionId]);
      for (const row of departmentTotalScores) {
        finalScores[row.name] = Number(row.total_score);
      }
    }
    this.quizState.isQuizStarted = false;
    this.quizState.isQuizEnded = true;
    this.quizState.scores = finalScores;
    this.broadcast({ type: 'QUIZ_ENDED', payload: { ...this.getCleanQuizState(), finalScores } });
  }

  // Handles the 'START_NEW_ROUND' message
  async startNewRound() {
    await this.saveRoundScores();
    this.quizState.roundScores = {}; // Reset for new round
    clearInterval(this.quizState.timerId);
    const db = await getDbConnection();
    await db.execute('UPDATE sessions SET is_active = 1 WHERE id = ?', [this.sessionId]);

    this.quizState.isQuizStarted = true;
    this.quizState.isQuizEnded = false;
    this.quizState.isBuzzerActive = true;
    this.quizState.activeStudent = null;
    this.quizState.currentQuestionIndex = 0;
    this.quizState.currentRound += 1;
    this.quizState.remainingTime = 10000;
    this.quizState.ineligibleStudents = [];
    this.quizState.showAnswer = false;
    this.startTimer();
    this.broadcast({ type: 'QUIZ_STARTED', payload: this.getCleanQuizState() });
  }
}

export default QuizSession;