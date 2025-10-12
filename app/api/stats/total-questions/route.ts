import { getConnection } from "@/utils/db";
import { NextResponse } from "next/server";

interface TotalQuestionsResult {
  total_questions: number;
}

export async function GET() {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = (await connection.execute(
      "SELECT COUNT(*) as total_questions FROM questions_bank"
    )) as TotalQuestionsResult[];
    const total_questions = rows[0].total_questions;
    return NextResponse.json({ total_questions });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
