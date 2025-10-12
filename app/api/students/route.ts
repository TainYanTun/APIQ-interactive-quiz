
import { getConnection } from '@/utils/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const isActiveParam = searchParams.get('is_active'); // '1', '0', or 'all'
    
    connection = await getConnection();
    let query = 'SELECT s.id, s.student_id, s.name, d.name as department, s.image_url, s.is_active FROM students s JOIN departments d ON s.department_id = d.id';
    const params: (string | number)[] = [];
    
    if (isActiveParam === '1') {
      query += ' WHERE s.is_active = 1';
    } else if (isActiveParam === '0') {
      query += ' WHERE s.is_active = 0';
    } else if (isActiveParam === 'all') {
      // No WHERE clause for is_active, fetch all students
    }
    
    query += ' ORDER BY s.id DESC';
    
    const [rows] = await connection.execute(query, params);
    return successResponse(rows, 'Students fetched successfully');
  } catch (error) {
    console.error('Error fetching students:', error);
    return errorResponse('Internal server error', 500);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
