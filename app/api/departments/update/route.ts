import { getConnection } from '@/utils/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { NextRequest } from 'next/server';

export async function PUT(request: NextRequest) {
  let connection;
  try {
    const { id, name } = await request.json();
    if (!id || !name) {
      return errorResponse('Department ID and name are required', 400);
    }

    connection = await getConnection();
    const [result] = await connection.execute('UPDATE departments SET name = ? WHERE id = ?', [name, id]);
    
    return successResponse(result, 'Department updated successfully');
  } catch (error) {
    console.error('Error updating department:', error);
    return errorResponse('Internal server error', 500);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
