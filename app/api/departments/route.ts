import { getConnection } from '@/utils/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET() {
  try {
    const connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM departments');
    return successResponse(rows, 'Departments fetched successfully');
  } catch (error) {
    console.error('Error fetching departments:', error);
    return errorResponse('Internal server error', 500);
  }
}
