'use server';

import { db, todos } from './db.js';
import { eq, desc, asc, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Input validation helpers
const validateTitle = (title) => {
  if (!title || typeof title !== 'string') {
    throw new Error('Title is required and must be a string');
  }
  const trimmed = title.trim();
  if (trimmed.length === 0) {
    throw new Error('Title cannot be empty');
  }
  if (trimmed.length > 100) {
    throw new Error('Title must be less than 100 characters');
  }
  return trimmed;
};

const validateId = (id) => {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid ID provided');
  }
  // Validate UUID format (36 characters with hyphens)
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw new Error('Invalid ID format - expected UUID');
  }
  return id;
};

export async function getTodos() {
  try {
    const allTodos = await db
      .select()
      .from(todos)
      .orderBy(asc(todos.completed), desc(todos.createdAt)); // Active todos first, then by creation date
    return allTodos;
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw new Error('Failed to fetch todos');
  }
}

export async function createTodo(title) {
  try {
    const validatedTitle = validateTitle(title);

    const [newTodo] = await db
      .insert(todos)
      .values({
        title: validatedTitle,
        completed: false,
      })
      .returning();

    revalidatePath('/');
    return newTodo;
  } catch (error) {
    console.error('Error creating todo:', error);
    throw error instanceof Error ? error : new Error('Failed to create todo');
  }
}

export async function toggleTodo(id) {
  try {
    const validatedId = validateId(id);

    // First get the current todo
    const [todo] = await db
      .select()
      .from(todos)
      .where(eq(todos.id, validatedId));

    if (!todo) {
      throw new Error('Todo not found');
    }

    // Then update with toggled completed status
    const [updatedTodo] = await db
      .update(todos)
      .set({
        completed: !todo.completed,
        updatedAt: new Date(),
      })
      .where(eq(todos.id, validatedId))
      .returning();

    revalidatePath('/');
    return updatedTodo;
  } catch (error) {
    console.error('Error toggling todo:', error);
    throw error instanceof Error ? error : new Error('Failed to toggle todo');
  }
}

export async function deleteTodo(id) {
  try {
    const validatedId = validateId(id);

    const result = await db
      .delete(todos)
      .where(eq(todos.id, validatedId))
      .returning({ id: todos.id });

    if (result.length === 0) {
      throw new Error('Todo not found');
    }

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error deleting todo:', error);
    throw error instanceof Error ? error : new Error('Failed to delete todo');
  }
}

export async function updateTodo(id, title) {
  try {
    const validatedId = validateId(id);
    const validatedTitle = validateTitle(title);

    const [updatedTodo] = await db
      .update(todos)
      .set({
        title: validatedTitle,
        updatedAt: new Date(),
      })
      .where(eq(todos.id, validatedId))
      .returning();

    if (!updatedTodo) {
      throw new Error('Todo not found');
    }

    revalidatePath('/');
    return updatedTodo;
  } catch (error) {
    console.error('Error updating todo:', error);
    throw error instanceof Error ? error : new Error('Failed to update todo');
  }
}

// Bulk operations for better performance
export async function bulkToggleTodos(ids, completed = true) {
  try {
    const validatedIds = ids.map(validateId);

    const updatedTodos = await db
      .update(todos)
      .set({
        completed,
        updatedAt: new Date(),
      })
      .where(inArray(todos.id, validatedIds))
      .returning();

    revalidatePath('/');
    return updatedTodos;
  } catch (error) {
    console.error('Error bulk toggling todos:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to bulk toggle todos');
  }
}

export async function clearCompletedTodos() {
  try {
    const deletedTodos = await db
      .delete(todos)
      .where(eq(todos.completed, true))
      .returning({ id: todos.id });

    revalidatePath('/');
    return { count: deletedTodos.length };
  } catch (error) {
    console.error('Error clearing completed todos:', error);
    throw error instanceof Error
      ? error
      : new Error('Failed to clear completed todos');
  }
}
