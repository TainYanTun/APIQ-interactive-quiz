import { getConnection } from "@/utils/db";
import { NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { setSession } from "@/lib/session";
import { randomBytes } from "crypto";
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { z } from 'zod';

// Define a schema for the expected login input
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate the request body against the schema
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return errorResponse(
        'Validation Error',
        400,
        validationResult.error.flatten().fieldErrors
      );
    }

    const { username, password } = validationResult.data;

    const connection = await getConnection();
    const [rows] = (await connection.execute(
      "SELECT id, username, password FROM admins WHERE username = ?",
      [username]
    )) as [{ id: number; username: string; password: string }[], unknown];

    if (rows.length === 0) {
      return errorResponse("Invalid username or password", 401);
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return errorResponse("Invalid username or password", 401);
    }

    const sessionId = randomBytes(16).toString("hex");
    await setSession({ sessionId, isAdmin: true });

    return successResponse({ message: "Login successful" }, "Login successful");
  } catch (error) {
    console.error("Error during login:", error);
    return errorResponse("Internal server error", 500);
  }
}