import { getConnection } from "@/utils/db";
import { NextResponse } from "next/server";

interface TotalStudentsResult {
  total_students: number;
}

export async function GET() {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = (await connection.execute(
      "SELECT COUNT(*) as total_students FROM students"
    )) as TotalStudentsResult[];
    const total_students = rows[0].total_students;
    return NextResponse.json({ total_students });
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
