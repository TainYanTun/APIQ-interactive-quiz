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

    const connection = await getConnection();

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

    // Save the per-question score for analytics
    await connection.execute(
        "INSERT INTO student_question_scores (student_id, session_id, question_id, score) VALUES (?, ?, ?, ?)",
        [studentId, sessionId, questionId, score]
    );

    // Save the per-round score for efficient querying
    await connection.execute(
        'INSERT INTO student_round_scores (session_id, student_id, round, score) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE score = score + VALUES(score)',
        [sessionId, studentId, round, score]
    );

    return successResponse(
      { correct: score > 0, score },
      "Answer submitted successfully"
    );
  } catch (error) {
    console.error("Error submitting answer:", error);
    return errorResponse("Internal server error", 500);
  }