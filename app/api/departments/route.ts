import { getConnection } from '@/utils/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET() {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute('SELECT * FROM departments');
    return successResponse(rows, 'Departments fetched successfully');
  } catch (error) {
    console.error('Error fetching departments:', error);
    return errorResponse('Internal server error', 500);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
