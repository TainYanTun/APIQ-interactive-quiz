import { getConnection } from '@/utils/db';
import { z } from 'zod';
import { successResponse, errorResponse } from '@/lib/apiResponse';

// Define a schema for the expected input
const studentSchema = z.object({
  student_id: z.string().min(1, "Student ID is required"),
  name: z.string().min(1, "Name is required"),
  department_id: z.number().int().positive("Department ID must be a positive integer"),
});

export async function POST(req: Request) {
  let connection;
  try {
    const body = await req.json();
    
    // Validate the request body against the schema
    const validationResult = studentSchema.safeParse(body);

    if (!validationResult.success) {
      // If validation fails, return a 400 Bad Request with validation errors
      return errorResponse(
        'Validation Error',
        400,
        validationResult.error.flatten().fieldErrors
      );
    }

    const { student_id, name, department_id } = validationResult.data;

    connection = await getConnection();
    const [result] = await connection.execute(
      'INSERT INTO students (student_id, name, department_id) VALUES (?, ?, ?)',
      [student_id, name, department_id]
    );
    
    return successResponse({ message: 'Student added successfully', result }, 'Student added successfully', 201);
  } catch (error) {
    console.error('Error adding student:', error); // More specific error logging
    return errorResponse('Internal server error', 500);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}