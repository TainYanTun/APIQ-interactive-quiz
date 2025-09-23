import { getConnection } from '@/utils/db';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  try {
    const connection = await getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM admins WHERE username = ?',
      [username]
    );

    // @ts-expect-error: Type check
    if (rows.length > 0) {
      // @ts-expect-error: Type check
      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json({ success: false, message: 'Invalid username or password' });
      }
    } else {
      return NextResponse.json({ success: false, message: 'Invalid username or password' });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: 'An error occurred' });
  }
}
