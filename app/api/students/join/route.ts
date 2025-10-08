import { getConnection } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import { setSession } from "@/lib/session";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const { student_id, session_id } = await req.json();

  if (!student_id || !session_id) {
    return NextResponse.json(
      { message: "Student ID and session ID are required" },
      { status: 400 }
    );
  }

  try {
    const connection = await getConnection();

    // Check if session exists and is active
    const [sessionRows] = (await connection.execute(
      "SELECT * FROM sessions WHERE id = ? AND is_active = 1",
      [session_id]
    )) as [{ id: string; is_active: boolean }[], unknown];

    if (sessionRows.length === 0) {
      return NextResponse.json(
        { message: "Session not found or is not active" },
        { status: 404 }
      );
    }

    // Check if student exists
    const [studentRows] = (await connection.execute(
      "SELECT * FROM students WHERE student_id = ?",
      [student_id]
    )) as [{ id: number; student_id: string }[], unknown];

    if (studentRows.length === 0) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    // Add student to session_participants
    await connection.execute(
      "INSERT INTO session_participants (student_id, session_id) VALUES (?, ?)",
      [student_id, session_id]
    );

    // Create a new session for the student
    const newSessionId = randomUUID();
    await setSession({
      sessionId: newSessionId,
      studentId: student_id,
      quizSessionId: session_id,
    });

    return NextResponse.json({ message: "Joined session successfully" });
  } catch (error) {
    console.error(error);
    // Check for duplicate entry
    if ((error as any).code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { message: "Student already in session" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
