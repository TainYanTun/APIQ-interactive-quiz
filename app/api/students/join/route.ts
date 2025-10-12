import { getConnection } from "@/utils/db";
import { NextRequest } from "next/server";
import { setSession } from "@/lib/session";
import { randomUUID } from "crypto";
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { z } from 'zod';

// Define a schema for the expected join input
const joinSessionSchema = z.object({
  student_id: z.string().min(1, "Student ID is required"),
  session_id: z.string().min(1, "Session ID is required"),
});

export async function POST(req: NextRequest) {
  let connection;
  try {
    const body = await req.json();
    
    // Validate the request body against the schema
    const validationResult = joinSessionSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponse(
        'Validation Error',
        400,
        validationResult.error.flatten().fieldErrors
      );
    }

    const { student_id, session_id } = validationResult.data;

    connection = await getConnection();

    // Check if session exists and is active
    const [sessionRows] = (await connection.execute(
      "SELECT id, is_active FROM sessions WHERE id = ? AND is_active = 1",
      [session_id]
    )) as [{ id: string; is_active: boolean }[], unknown];

    if (sessionRows.length === 0) {
      return errorResponse("Session not found or is not active", 404);
    }

    // Check if student exists
    const [studentRows] = (await connection.execute(
      "SELECT id, student_id FROM students WHERE student_id = ? AND is_active = 1",
      [student_id]
    )) as [{ id: number; student_id: string }[], unknown];

    if (studentRows.length === 0) {
      return errorResponse("Student ID not recognized. Please contact your administrator.", 403);
    }

    // Check if student is already a participant
    const [participantRows] = (await connection.execute(
      "SELECT student_id, session_id FROM session_participants WHERE student_id = ? AND session_id = ?",
      [student_id, session_id]
    )) as [{ student_id: string; session_id: string }[], unknown];

    if (participantRows.length === 0) {
      // Add student to session_participants
      await connection.execute(
        "INSERT INTO session_participants (student_id, session_id) VALUES (?, ?)",
        [student_id, session_id]
      );
    }

    // Create a new session for the student
    const newSessionId = randomUUID();
    await setSession({
      sessionId: newSessionId,
      studentId: student_id,
      quizSessionId: session_id,
    });

    return successResponse({ message: "Joined session successfully" }, "Joined session successfully");
  } catch (error) {
    console.error("Error joining session:", error);
    return errorResponse("Internal server error", 500);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
