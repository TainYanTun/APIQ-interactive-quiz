import { getConnection } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { session_id, is_active } = await req.json();

  if (!session_id || is_active === undefined) {
    return NextResponse.json(
      { message: "Session ID and is_active status are required" },
      { status: 400 }
    );
  }

  try {
    const connection = await getConnection();
    await connection.execute(
      "UPDATE sessions SET is_active = ? WHERE id = ?",
      [is_active, session_id]
    );
    return NextResponse.json({ message: "Session updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
