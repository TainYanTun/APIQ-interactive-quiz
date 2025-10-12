import { getConnection } from "@/utils/db";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const sessionData = await getSession();
  const isAdmin = sessionData?.isAdmin;

  if (!isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(
      `SELECT 
        s.id, 
        s.name, 
        s.created_at, 
        s.is_active,
        COUNT(DISTINCT sp.student_id) AS participant_count,
        COUNT(DISTINCT sq.question_id) AS question_count
       FROM sessions s
       LEFT JOIN session_participants sp ON s.id = sp.session_id
       LEFT JOIN session_questions sq ON s.id = sq.session_id
       GROUP BY s.id, s.name, s.created_at, s.is_active
       ORDER BY s.created_at DESC`
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}