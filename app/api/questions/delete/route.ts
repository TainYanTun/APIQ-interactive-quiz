import { getConnection } from '@/utils/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { id } = await req.json();
    const connection = await getConnection();
    
    // Soft delete by setting is_active to 0
    await connection.execute('UPDATE questions_bank SET is_active = 0 WHERE id = ?', [id]);
    
    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}