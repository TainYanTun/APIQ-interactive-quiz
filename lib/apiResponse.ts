import { NextResponse } from 'next/server';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
}

export function successResponse<T>(data: T, message: string = 'Success', status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function errorResponse(message: string = 'Internal Server Error', status: number = 500, errors?: any): NextResponse<ApiResponse<any>> {
  return NextResponse.json({ success: false, message, errors }, { status });
}
