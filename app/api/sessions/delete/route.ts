import { getConnection } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { session_id } = await req.json();

  if (!session_id) {
    return NextResponse.json(
      { message: "Session ID is required" },
      { status: 400 }
    );
  }

  let connection;
  try {
    connection = await getConnection();
    // First, delete participants of the session
    await connection.execute(
      "DELETE FROM session_participants WHERE session_id = ?",
      [session_id]
    );
    // Then, delete the session itself
    await connection.execute("DELETE FROM sessions WHERE id = ?", [session_id]);

    return NextResponse.json({ message: "Session deleted successfully" });
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
