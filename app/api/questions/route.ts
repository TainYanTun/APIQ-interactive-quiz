import { getConnection } from '@/utils/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    const connection = await getConnection();
    let query = 'SELECT * FROM questions_bank WHERE is_active = 1';
    const params: string[] = [];
    
    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await connection.execute(query, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { text, answer, category, difficulty, round, topic, question_type, options } = await req.json();
    
    // Handle options field - ensure it's either null or valid JSON
    let processedOptions = null;
    if (options && options.trim() !== '') {
      try {
        // Try to parse as JSON to validate
        JSON.parse(options);
        processedOptions = options;
      } catch {
        // If not valid JSON, set to null
        processedOptions = null;
      }
    }
    
    const connection = await getConnection();
    const [result] = await connection.execute(
      'INSERT INTO questions_bank (text, answer, category, difficulty, round, topic, question_type, options) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [text, answer, category, difficulty || 1, round || 1, topic || 'General', question_type || 'text', processedOptions]
    );
    
    return NextResponse.json({ message: 'Question added successfully', result });
  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}