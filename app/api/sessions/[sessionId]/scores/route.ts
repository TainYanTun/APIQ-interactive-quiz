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
        `SELECT d.name, COALESCE(SUM(ds.points), 0) as score
         FROM departments d
         JOIN department_scores ds ON d.id = ds.department_id
         WHERE ds.session_id = ?
         GROUP BY d.name
         ORDER BY score DESC`,
        [sessionId]
      );
    } else { // individual mode or default
      [rows] = await connection.execute<ScoreResult[]>(
        `SELECT s.name, COALESCE(SUM(sqs.score), 0) as score
         FROM students s
         JOIN session_participants sp ON s.student_id = sp.student_id
         LEFT JOIN student_question_scores sqs ON s.student_id = sqs.student_id AND sp.session_id = sqs.session_id
         WHERE sp.session_id = ?
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