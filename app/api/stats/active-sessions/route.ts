import { getConnection } from "@/utils/db";
import { NextResponse } from "next/server";

interface ActiveSessionsResult {
  active_sessions: number;
}

export async function GET() {
  try {
    const connection = await getConnection();
    const [rows] = (await connection.execute(
      "SELECT COUNT(*) as active_sessions FROM sessions WHERE is_active = 1"
    )) as ActiveSessionsResult[];
    const active_sessions = rows[0].active_sessions;
    return NextResponse.json({ active_sessions });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
