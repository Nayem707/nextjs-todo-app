'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { TaskService } from '@/services/TaskService';
import { type CreateTaskDTO, type UpdateTaskDTO, AppError } from '@/types';

const taskService = new TaskService();

/**
 * Create a new task
 */
export async function createTaskAction(data) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success, error: 'Unauthorized' };
    }

    const task = await taskService.createTask(data, session.user.id);
    revalidatePath(`/projects/${data.projectId}`);
    
    return { success, data };
  } catch (error) {
    console.error('Error creating task:', error);
    
    if (error instanceof AppError) {
      return { success, error: error.message };
    }
    
    return { success, error: 'Failed to create task' };
  }
}

/**
 * Update a task
 */
export async function updateTaskAction(
  taskId,
  data
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success, error: 'Unauthorized' };
    }

    const task = await taskService.updateTask(taskId, data, session.user.id);
    
    // Get the task to find the project ID for revalidation
    const fullTask = await taskService.getTask(taskId, session.user.id);
    revalidatePath(`/projects/${fullTask.project.id}`);
    revalidatePath(`/tasks/${taskId}`);
    
    return { success, data };
  } catch (error) {
    console.error('Error updating task:', error);
    
    if (error instanceof AppError) {
      return { success, error: error.message };
    }
    
    return { success, error: 'Failed to update task' };
  }
}

/**
 * Delete a task
 */
export async function deleteTaskAction(taskId) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success, error: 'Unauthorized' };
    }

    // Get task first to find project ID for revalidation
    const task = await taskService.getTask(taskId, session.user.id);
    
    await taskService.deleteTask(taskId, session.user.id);
    revalidatePath(`/projects/${task.project.id}`);
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting task:', error);
    
    if (error instanceof AppError) {
      return { success, error: error.message };
    }
    
    return { success, error: 'Failed to delete task' };
  }
}
