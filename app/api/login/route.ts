import { getConnection } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { setSession } from "@/lib/session";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json(
      { message: "Username and password are required" },
      { status: 400 }
    );
  }

  try {
    console.log("Login API: Attempting to get database connection.");
    const connection = await getConnection();
    console.log("Login API: Database connection established. Executing query.");
    const [rows] = (await connection.execute(
      "SELECT * FROM admins WHERE username = ?",
      [username]
    )) as [{ id: number; username: string; password: string }[], unknown];
    console.log("Login API: Query executed. Rows found:", rows.length);

    if (rows.length === 0) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }

    console.log("Login API: Password matched. Generating session ID.");
    const sessionId = randomBytes(16).toString("hex");
    console.log("Login API: Session ID generated. Setting session data.");

    await setSession({ sessionId, isAdmin: true });
    console.log("Login API: Session data set. Login successful.");

    return NextResponse.json({ message: "Login successful" });
  } catch (error) {
    console.error("Login API: An error occurred:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}