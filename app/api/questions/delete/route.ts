import { getConnection } from '@/utils/db';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { ResultSetHeader } from 'mysql2';

// Define a schema for the expected input
const deleteQuestionSchema = z.object({
  id: z.number().int().positive("Question ID must be a positive integer"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate the request body against the schema
    const validationResult = deleteQuestionSchema.safeParse(body);

    if (!validationResult.success) {
      // If validation fails, return a 400 Bad Request with validation errors
      return errorResponse(
        'Validation Error',
        400,
        validationResult.error.flatten().fieldErrors
      );
    }

    const { id } = validationResult.data;

    const connection = await getConnection();
    
    // Soft delete by setting is_active to 0
    const [result] = await connection.execute('UPDATE questions_bank SET is_active = 0 WHERE id = ?', [id]);
    
    // Check if any row was actually updated
    if ((result as ResultSetHeader).affectedRows === 0) {
      return errorResponse('Question not found or already deleted', 404);
    }

    return successResponse({ message: 'Question deleted successfully' }, 'Question deleted successfully');
  } catch (error) {
    console.error('Error deleting question:', error);
    return errorResponse('Internal server error', 500);
  }
}