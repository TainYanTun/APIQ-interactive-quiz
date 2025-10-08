import { getConnection } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const sessionData = await getSession();
  const isAdmin = sessionData?.isAdmin;

  if (!isAdmin) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const connection = await getConnection();
    const sessionId = randomBytes(16).toString("hex");
    await connection.execute("INSERT INTO sessions (id) VALUES (?)", [
      sessionId,
    ]);

    return NextResponse.json({ sessionId });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}