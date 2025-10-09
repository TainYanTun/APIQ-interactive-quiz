import { getConnection } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = params;
  const { student_id } = await req.json();

  if (!sessionId || !student_id) {
    return NextResponse.json(
      { message: "Session ID and Student ID are required" },
      { status: 400 }
    );
  }

  try {
    const connection = await getConnection();
    await connection.execute(
      "DELETE FROM session_participants WHERE session_id = ? AND student_id = ?",
      [sessionId, student_id]
    );

    return NextResponse.json({ message: "Participant removed successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
