import { getConnection } from '@/utils/db';
import { NextResponse } from 'next/server';

export async function PUT(req: Request) {
  try {
    const { id, text, answer, category, difficulty, round, topic, question_type, options } = await req.json();
    
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
    await connection.execute(
      'UPDATE questions_bank SET text = ?, answer = ?, category = ?, difficulty = ?, round = ?, topic = ?, question_type = ?, options = ? WHERE id = ?',
      [text, answer, category, difficulty, round, topic, question_type, processedOptions, id]
    );
    
    return NextResponse.json({ message: 'Question updated successfully' });
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}