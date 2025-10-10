import { getConnection } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

interface Participant {
  student_id: string;
  name: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const { sessionId } = await params;

  if (!sessionId) {
    return NextResponse.json(
      { message: "Session ID is required" },
      { status: 400 }
    );
  }

  try {
    const connection = await getConnection();
    const [participants] = (await connection.execute(
      `SELECT s.student_id, s.name
       FROM students s
       JOIN session_participants sp ON s.student_id = sp.student_id
       WHERE sp.session_id = ?`,
      [sessionId]
    )) as Participant[];

    return NextResponse.json(participants);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
