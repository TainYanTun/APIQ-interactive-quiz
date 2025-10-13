import { getConnection } from '@/utils/db';
import { successResponse, errorResponse } from '@/lib/apiResponse';
import { NextRequest } from 'next/server';

export async function GET() {
  let connection;
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(`
      SELECT d.id, d.name, COUNT(s.id) as student_count
      FROM departments d
      LEFT JOIN students s ON d.id = s.department_id
      GROUP BY d.id, d.name
    `);
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

export async function POST(request: NextRequest) {
  let connection;
  try {
    const { name } = await request.json();
    if (!name) {
      return errorResponse('Department name is required', 400);
    }

    connection = await getConnection();
    const [result] = await connection.execute('INSERT INTO departments (name) VALUES (?)', [name]);
    
    return successResponse(result, 'Department created successfully', 201);
  } catch (error) {
    console.error('Error creating department:', error);
    return errorResponse('Internal server error', 500);
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
