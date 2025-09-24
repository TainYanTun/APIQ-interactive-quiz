
import { getConnection } from '@/utils/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    const connection = await getConnection();
    await connection.execute('DELETE FROM students WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
