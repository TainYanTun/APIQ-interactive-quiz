
import { getConnection } from '@/utils/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT s.id, s.student_id, s.name, d.name as department, s.image_url FROM students s JOIN departments d ON s.department_id = d.id');
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
