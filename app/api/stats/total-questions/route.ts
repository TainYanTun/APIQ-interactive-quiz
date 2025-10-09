import { getConnection } from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const connection = await getConnection();
    const [rows] = (await connection.execute(
      "SELECT COUNT(*) as total_questions FROM questions_bank"
    )) as any[];
    const total_questions = rows[0].total_questions;
    return NextResponse.json({ total_questions });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
