import { getConnection } from '@/utils/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { student_id, name, department_id } = await req.json();
    console.log('Received data:', { student_id, name, department_id });
    const connection = await getConnection();
    const [result] = await connection.execute('INSERT INTO students (student_id, name, department_id) VALUES (?, ?, ?)', [student_id, name, department_id]);
    console.log('Database insert result:', result);
    return NextResponse.json({ message: 'Student added successfully', result });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}