import { getConnection } from '@/utils/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET() {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute('SELECT COUNT(*) as total_students FROM students');
    const total_students = rows[0].total_students;
    return successResponse({ total_students }, 'Total students fetched successfully');
  } catch (error) {
    console.error(error);
    return errorResponse('Internal server error', 500);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
