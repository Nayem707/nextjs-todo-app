'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { ProjectService } from '@/services/ProjectService';
import { type CreateProjectDTO, type UpdateProjectDTO, AppError } from '@/types';

const projectService = new ProjectService();

/**
 * Create a new project
 */
export async function createProjectAction(data) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success, error: 'Unauthorized' };
    }

    const project = await projectService.createProject(data, session.user.id);
    revalidatePath('/projects');
    
    return { success, data };
  } catch (error) {
    console.error('Error creating project:', error);
    
    if (error instanceof AppError) {
      return { success, error: error.message };
    }
    
    return { success, error: 'Failed to create project' };
  }
}

/**
 * Update a project
 */
export async function updateProjectAction(
  projectId,
  data
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success, error: 'Unauthorized' };
    }

    const project = await projectService.updateProject(
      projectId,
      data,
      session.user.id
    );
    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/projects');
    
    return { success, data };
  } catch (error) {
    console.error('Error updating project:', error);
    
    if (error instanceof AppError) {
      return { success, error: error.message };
    }
    
    return { success, error: 'Failed to update project' };
  }
}

/**
 * Delete a project
 */
export async function deleteProjectAction(projectId) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success, error: 'Unauthorized' };
    }

    await projectService.deleteProject(projectId, session.user.id);
    revalidatePath('/projects');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting project:', error);
    
    if (error instanceof AppError) {
      return { success, error: error.message };
    }
    
    return { success, error: 'Failed to delete project' };
  }
}
