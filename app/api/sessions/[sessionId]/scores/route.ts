import { getConnection } from "@/utils/db";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { RowDataPacket } from "mysql2";

interface ScoreResult extends RowDataPacket {
  student_id: string;
  name: string;
  score: number;
}

export async function GET(
  request: Request,
  context: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = await context.params;

    if (!sessionId) {
      return errorResponse("Session ID is required", 400);
    }

    const connection = await getConnection();
    const [rows] = await connection.execute<ScoreResult[]>(
      `SELECT s.student_id, s.name, COALESCE(SUM(qs.score), 0) as score
       FROM students s
       JOIN session_participants sp ON s.student_id = sp.student_id
       LEFT JOIN question_scores qs ON s.student_id = qs.student_id AND sp.session_id = qs.session_id
       WHERE sp.session_id = ?
       GROUP BY s.student_id, s.name
       ORDER BY score DESC`,
      [sessionId]
    );

    return successResponse(rows, "Scores fetched successfully");
  } catch (error) {
    console.error("Error fetching scores:", error);
    return errorResponse("Internal server error", 500);
  }
}