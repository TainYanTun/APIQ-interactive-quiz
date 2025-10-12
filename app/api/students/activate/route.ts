import { getConnection } from '@/utils/db';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { ResultSetHeader } from 'mysql2';

// Define a schema for the expected input
const activateStudentSchema = z.object({
  id: z.number().int().positive("Student ID must be a positive integer"),
});

export async function POST(req: Request) {
  let connection;
  try {
    const body = await req.json();
    
    // Validate the request body against the schema
    const validationResult = activateStudentSchema.safeParse(body);

    if (!validationResult.success) {
      // If validation fails, return a 400 Bad Request with validation errors
      return errorResponse(
        'Validation Error',
        400,
        validationResult.error.flatten().fieldErrors
      );
    }

    const { id } = validationResult.data;

    connection = await getConnection();
    
    const [result] = await connection.execute('UPDATE students SET is_active = 1 WHERE id = ?', [id]);
    
    // Check if any row was actually updated
    if ((result as ResultSetHeader).affectedRows === 0) {
      return errorResponse('Student not found or already active', 404);
    }

    return successResponse({ message: 'Student activated successfully' }, 'Student activated successfully');
  } catch (error) {
    console.error('Error activating student:', error);
    return errorResponse('Internal server error', 500);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

