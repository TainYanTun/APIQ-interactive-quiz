import { getConnection } from "@/utils/db";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { getSession } from "@/lib/session";
import { z } from "zod";
import { RowDataPacket } from "mysql2";

const submitAnswerSchema = z.object({
  sessionId: z.string(),
  questionId: z.number(),
  answer: z.string(),
});

interface QuestionInfo extends RowDataPacket {
  answer: string;
  round: number;
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

    const { sessionId, questionId, answer } = validationResult.data;
    const studentId = session.studentId;

    connection = await getConnection();

    // Get the correct answer and round
    const [questionRows] = await connection.execute<QuestionInfo[]>(
      "SELECT answer, round FROM questions_bank WHERE id = ?",
      [questionId]
    );

    if (questionRows.length === 0) {
      return errorResponse("Question not found", 404);
    }

    const { answer: correctAnswer, round } = questionRows[0];
    const score = answer === correctAnswer ? 10 : 0;
    const isCorrect = score > 0;

    // Store the student's answer
    await connection.execute(
      'INSERT INTO student_answers (student_id, session_id, question_id, answer, is_correct, submitted_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [studentId, sessionId, questionId, answer, isCorrect]
    );

    // Update or insert the student's score for the current question
    await connection.execute(
      `INSERT INTO student_question_scores (student_id, session_id, question_id, score)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE score = VALUES(score)`,
      [studentId, sessionId, questionId, score]
    );

    // Update or insert the student's score for the current round
    await connection.execute(
      `INSERT INTO student_round_scores (student_id, session_id, round, score)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE score = score + VALUES(score)`,
      [studentId, sessionId, round, score]
    );

    return successResponse(
      { correct: score > 0, score },
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