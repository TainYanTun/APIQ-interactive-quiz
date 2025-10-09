import { getConnection } from "@/utils/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const connection = await getConnection();
    const [rows] = (await connection.execute(
      "SELECT COUNT(*) as total_students FROM students"
    )) as any[];
    const total_students = rows[0].total_students;
    return NextResponse.json({ total_students });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
