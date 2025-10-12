import { getConnection } from '@/utils/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';

export async function GET() {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute('SELECT DISTINCT category FROM questions_bank ORDER BY category');
    const categories = (rows as { category: string }[]).map(row => row.category);
    return successResponse(categories, 'Categories fetched successfully');
  } catch (error) {
    console.error('Error fetching categories:', error);
    return errorResponse('Internal server error', 500);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
