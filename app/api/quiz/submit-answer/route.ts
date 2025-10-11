
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

interface QuestionAnswer extends RowDataPacket {
  answer: string;
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

    // Get the correct answer
    const [answerRows] = await connection.execute<QuestionAnswer[]>(
      "SELECT answer FROM questions_bank WHERE id = ?",
      [questionId]
    );

    if (answerRows.length === 0) {
      return errorResponse("Question not found", 404);
    }

    const correctAnswer = answerRows[0].answer;
    const score = answer === correctAnswer ? 10 : 0;

    // Save the score
    await connection.execute(
      "INSERT INTO question_scores (student_id, session_id, question_id, score) VALUES (?, ?, ?, ?)",
      [studentId, sessionId, questionId, score]
    );

    return successResponse(
      { correct: score > 0, score },
      "Answer submitted successfully"
    );
  } catch (error) {
    console.error("Error submitting answer:", error);
    return errorResponse("Internal server error", 500);
  }
}
