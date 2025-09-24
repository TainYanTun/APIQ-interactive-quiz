
import { getConnection } from '@/utils/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM departments');
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
