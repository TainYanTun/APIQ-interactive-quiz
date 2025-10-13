
import { getConnection } from '@/utils/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  let connection;
  try {
    const { searchParams } = new URL(request.url);
    const isActiveParam = searchParams.get('is_active'); // '1', '0', or 'all'
    const departmentId = searchParams.get('departmentId');
    
    connection = await getConnection();
    let query = 'SELECT s.id, s.student_id, s.name, d.name as department, s.image_url, s.is_active FROM students s JOIN departments d ON s.department_id = d.id';
    const params: (string | number)[] = [];
    const whereClauses: string[] = [];

    if (isActiveParam === '1') {
      whereClauses.push('s.is_active = 1');
    } else if (isActiveParam === '0') {
      whereClauses.push('s.is_active = 0');
    }

    if (departmentId) {
      whereClauses.push('s.department_id = ?');
      params.push(departmentId);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ${whereClauses.join(' AND ')}`;
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
