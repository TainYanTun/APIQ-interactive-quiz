import { getConnection } from '@/utils/db';
import { NextResponse } from 'next/server';

export async function GET() {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute('SELECT COUNT(*) as total_departments FROM departments');
    const totalDepartments = rows[0].total_departments;
    return NextResponse.json({ total_departments: totalDepartments });
  } catch (error) {
    console.error('Error fetching total departments:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
