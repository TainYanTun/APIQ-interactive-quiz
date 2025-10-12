import { getConnection } from "@/utils/db";
import { successResponse, errorResponse } from "@/lib/apiResponse";
import { RowDataPacket } from "mysql2";

interface ScoreResult extends RowDataPacket {
  name: string;
  score: number;
}

export async function GET(
  request: Request,
  context: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = await context.params;
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'individual'; // Default to individual

    if (!sessionId) {
      return errorResponse("Session ID is required", 400);
    }

    const connection = await getConnection();
    let rows: ScoreResult[];

    if (mode === 'department') {
      [rows] = await connection.execute<ScoreResult[]>(
        `SELECT d.name as name, COALESCE(SUM(srs.score), 0) as score
         FROM departments d
         JOIN students s ON d.id = s.department_id
         JOIN student_round_scores srs ON s.student_id = srs.student_id
         WHERE srs.session_id = ?
         GROUP BY d.name
         ORDER BY score DESC`,
        [sessionId]
      );
    } else { // individual mode or default
      [rows] = await connection.execute<ScoreResult[]>(
        `SELECT s.name as name, COALESCE(SUM(srs.score), 0) as score
         FROM students s
         JOIN student_round_scores srs ON s.student_id = srs.student_id
         WHERE srs.session_id = ?
         GROUP BY s.name
         ORDER BY score DESC`,
        [sessionId]
      );
    }

    return successResponse(rows, "Scores fetched successfully");
  } catch (error) {
    console.error("Error fetching scores:", error);
    return errorResponse("Internal server error", 500);
  }
}