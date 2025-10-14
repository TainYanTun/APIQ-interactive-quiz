import { getConnection } from "@/utils/db";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { getSession } from "@/lib/session";
import { z } from "zod";
import { RowDataPacket } from "mysql2";

const submitAnswerSchema = z.object({
  sessionId: z.string(),
  questionId: z.number(),
  answer: z.string(),
  currentQuizRound: z.number(),
});

interface QuestionInfo extends RowDataPacket {
  answer: string;
  round: number;
}

interface StudentQuestionScore extends RowDataPacket {
  score: number;
}

export async function POST(request: Request) {
  let connection;
  try {
    const session = await getSession();
    if (!session || !session.studentId) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await request.json();
    const validationResult = submitAnswerSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponse(
        "Validation Error",
        400,
        validationResult.error.flatten().fieldErrors
      );
    }

    const { sessionId, questionId, answer, currentQuizRound } = validationResult.data;
    const studentId = session.studentId;

    connection = await getConnection();

    // Get the current round if not provided or invalid
    let effectiveRound = currentQuizRound;
    if (!effectiveRound || effectiveRound <= 0) {
      // Get the maximum round for this session and student
      const [maxRoundRows] = await connection.execute<RowDataPacket[]>(
        "SELECT MAX(round) as max_round FROM student_round_scores WHERE student_id = ? AND session_id = ?",
        [studentId, sessionId]
      );
      
      effectiveRound = (maxRoundRows[0]?.max_round || 0) + 1;
    }

    // Get the correct answer
    const [questionRows] = await connection.execute<QuestionInfo[]>(
      "SELECT answer FROM questions_bank WHERE id = ?",
      [questionId]
    );

    if (questionRows.length === 0) {
      return errorResponse("Question not found", 404);
    }

    const { answer: correctAnswer } = questionRows[0];
    const newScoreForQuestion = answer === correctAnswer ? 9 : 0; // Changed from 10 to 9

    // Update or insert the student's score for the current question
    await connection.execute(
      `INSERT INTO student_question_scores (student_id, session_id, question_id, round, score)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE score = VALUES(score)`,
      [studentId, sessionId, questionId, effectiveRound, newScoreForQuestion]
    );

    // Recalculate total score for the current round using effectiveRound
    const [roundScores] = await connection.execute<StudentQuestionScore[]>(
      "SELECT SUM(sqs.score) as score FROM student_question_scores sqs WHERE sqs.student_id = ? AND sqs.session_id = ? AND sqs.round = ?",
      [studentId, sessionId, effectiveRound]
    );

    const totalRoundScore = roundScores[0].score || 0;

    // Update or insert the student's score for the current round
    await connection.execute(
      `INSERT INTO student_round_scores (student_id, session_id, round, score)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE score = VALUES(score)`,
      [studentId, sessionId, effectiveRound, totalRoundScore]
    );

    return successResponse(
      { correct: newScoreForQuestion > 0, score: newScoreForQuestion },
      "Answer submitted successfully"
    );
  } catch (error) {
    console.error("Error submitting answer:", error);
    return errorResponse("Internal server error", 500);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}