import { getConnection } from '@/utils/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  let connection;
  try {
    const { id } = await request.json();
    if (!id) {
      return errorResponse('Department ID is required', 400);
    }

    connection = await getConnection();
    await connection.execute('DELETE FROM departments WHERE id = ?', [id]);
    
    return successResponse({}, 'Department deleted successfully');
  } catch (error) {
    console.error('Error deleting department:', error);
    return errorResponse('Internal server error', 500);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
