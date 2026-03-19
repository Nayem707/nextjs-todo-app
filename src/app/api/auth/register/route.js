import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '@/services/AuthService';
import { ApiResponse, AppError } from '@/types';

/**
 * POST /api/auth/register
 * Register new user
 */
export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    
    const user = await registerUser(name, email, password);

    return NextResponse.json<ApiResponse<typeof user>>(
      { success: true, data: user },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering user:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
