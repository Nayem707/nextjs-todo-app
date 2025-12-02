import { NextResponse } from 'next/server';
import { getTodos, createTodo } from '@/lib/actions';

export async function GET() {
  try {
    const todos = await getTodos();
    return NextResponse.json(todos);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { title } = await request.json();
    const todo = await createTodo(title);
    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}
