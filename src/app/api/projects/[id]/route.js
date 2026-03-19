import { NextRequest, NextResponse } from 'next/server';
import { ProjectService } from '@/services/ProjectService';
import { auth } from '@/lib/auth';
import { AppError } from '@/types';

const projectService = new ProjectService();

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    console.log('Fetching project with ID:', id, 'for user:', session.user.id);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const project = await projectService.getProject(id, session.user.id);
    return NextResponse.json({ success: true, data: project }, { status: 200 });
  } catch (error) {
    console.error('Error fetching project:', error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const data = await request.json();
    const project = await projectService.updateProject(
      id,
      data,
      session.user.id
    );
    return NextResponse.json({ success: true, data: project }, { status: 200 });
  } catch (error) {
    console.error('Error updating project:', error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await projectService.deleteProject(id, session.user.id);
    return NextResponse.json({ success: true, data: null }, { status: 200 });
  } catch (error) {
    console.error('Error deleting project:', error);

    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
