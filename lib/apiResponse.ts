import { NextResponse } from 'next/server';

interface ValidationErrors {
  [key: string]: string[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationErrors | string | string[];
}

export function successResponse<T>(data: T, message: string = 'Success', status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function errorResponse(message: string = 'Internal Server Error', status: number = 500, errors?: ValidationErrors | string | string[]): NextResponse<ApiResponse<unknown>> {
  return NextResponse.json({ success: false, message, errors }, { status });
}
