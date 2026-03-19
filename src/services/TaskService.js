import { TaskRepository } from '@/repositories/TaskRepository';
import { ProjectRepository } from '@/repositories/ProjectRepository';
import { MemberRepository } from '@/repositories/MemberRepository';
import { ActivityRepository } from '@/repositories/ActivityRepository';
import {
  type CreateTaskDTO,
  type UpdateTaskDTO,
  ValidationError,
  NotFoundError,
  ForbiddenError,
} from '@/types';

export class TaskService {
  private taskRepo: TaskRepository;
  private projectRepo: ProjectRepository;
  private memberRepo: MemberRepository;
  private activityRepo: ActivityRepository;

  constructor() {
    this.taskRepo = new TaskRepository();
    this.projectRepo = new ProjectRepository();
    this.memberRepo = new MemberRepository();
    this.activityRepo = new ActivityRepository();
  }

  /**
   * Get task with access check
   */
  async getTask(taskId, userId) {
    const task = await this.taskRepo.findByIdWithDetails(taskId);
    
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Check if user has access to the project
    const project = await this.projectRepo.findById(task.project.id);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const hasAccess = 
      project.ownerId === userId || 
      await this.memberRepo.isMember(task.project.id, userId);

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this task');
    }

    return task;
  }

  /**
   * Create new task
   */
  async createTask(data, userId) {
    // Validate input
    if (!data.title?.trim()) {
      throw new ValidationError('Task title is required');
    }
    if (!data.projectId) {
      throw new ValidationError('Project ID is required');
    }

    // Check if user has access to the project
    const project = await this.projectRepo.findById(data.projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const hasAccess = 
      project.ownerId === userId || 
      await this.memberRepo.isMember(data.projectId, userId);

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this project');
    }

    // Validate assignee if provided
    if (data.assignedTo) {
      const assigneeHasAccess = await this.memberRepo.isMember(data.projectId, data.assignedTo);
      if (!assigneeHasAccess) {
        throw new ValidationError('Assigned user is not a member of this project');
      }
    }

    // Create task
    const task = await this.taskRepo.create({
      title: data.title.trim(),
      description: data.description?.trim() || null,
      projectId: data.projectId,
      status: data.status || 'todo',
      priority: data.priority || 'medium',
      assignedTo: data.assignedTo || null,
      dueDate: data.dueDate || null,
      createdBy,
    });

    // Log activity
    await this.activityRepo.logTaskActivity(
      data.projectId,
      task.id,
      userId,
      'task_created',
      `Created task "${task.title}"`,
      { taskId: task.id }
    );

    // If task was assigned, log assignment activity
    if (data.assignedTo) {
      await this.activityRepo.logTaskActivity(
        data.projectId,
        task.id,
        userId,
        'task_assigned',
        `Assigned task to user`,
        { assignedTo: data.assignedTo }
      );
    }

    return task;
  }

  /**
   * Update task
   */
  async updateTask(
    taskId,
    data,
    userId
  ) {
    // Get current task
    const task = await this.taskRepo.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Check if user has access
    const project = await this.projectRepo.findById(task.projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const hasAccess = 
      project.ownerId === userId || 
      await this.memberRepo.isMember(task.projectId, userId);

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this task');
    }

    // Validate assignee if being changed
    if (data.assignedTo) {
      const assigneeHasAccess = await this.memberRepo.isMember(task.projectId, data.assignedTo);
      if (!assigneeHasAccess) {
        throw new ValidationError('Assigned user is not a member of this project');
      }
    }

    // Track changes for activity log
    const changes = [];
    if (data.title) changes.push('title');
    if (data.description !== undefined) changes.push('description');
    if (data.status && data.status !== task.status) changes.push('status');
    if (data.priority && data.priority !== task.priority) changes.push('priority');
    if (data.assignedTo !== undefined && data.assignedTo !== task.assignedTo) changes.push('assignee');
    if (data.dueDate !== undefined) changes.push('due date');

    // Update task
    const updated = await this.taskRepo.update(taskId, data);

    // Update project progress if status changed
    if (data.status && data.status !== task.status) {
      await this.projectRepo.updateProgress(task.projectId);
    }

    // Log activity
    await this.activityRepo.logTaskActivity(
      task.projectId,
      taskId,
      userId,
      'task_updated',
      `Updated task (${changes.join(', ')})`,
      { changes: data }
    );

    // Log assignment change specifically
    if (data.assignedTo !== undefined && data.assignedTo !== task.assignedTo) {
      await this.activityRepo.logTaskActivity(
        task.projectId,
        taskId,
        userId,
        'task_assigned',
        data.assignedTo ? 'Assigned task to user' : 'Unassigned task',
        { assignedTo: data.assignedTo }
      );
    }

    return updated;
  }

  /**
   * Delete task
   */
  async deleteTask(taskId, userId) {
    const task = await this.taskRepo.findById(taskId);
    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Check if user has access
    const project = await this.projectRepo.findById(task.projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const isOwner = project.ownerId === userId;
    const hasAdminAccess = await this.memberRepo.hasAdminAccess(task.projectId, userId);
    const isCreator = task.createdBy === userId;

    if (!isOwner && !hasAdminAccess && !isCreator) {
      throw new ForbiddenError('Only project owner, admins, or task creator can delete tasks');
    }

    // Log activity before deletion
    await this.activityRepo.logTaskActivity(
      task.projectId,
      taskId,
      userId,
      'task_deleted',
      `Deleted task "${task.title}"`
    );

    await this.taskRepo.delete(taskId);

    // Update project progress
    await this.projectRepo.updateProgress(task.projectId);
  }

  /**
   * Get tasks for a project
   */
  async getProjectTasks(projectId, userId, filters = {}, pagination = {}) {
    // Check if user has access
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const hasAccess = 
      project.ownerId === userId || 
      await this.memberRepo.isMember(projectId, userId);

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this project');
    }

    return this.taskRepo.findMany(
      { ...filters, projectId },
      pagination
    );
  }

  /**
   * Get tasks assigned to a user
   */
  async getAssignedTasks(userId, filters = {}, pagination = {}) {
    return this.taskRepo.findMany(
      { ...filters, assignedTo: userId },
      pagination
    );
  }

  /**
   * Get task statistics for a project
   */
  async getProjectStats(projectId, userId) {
    // Check if user has access
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const hasAccess = 
      project.ownerId === userId || 
      await this.memberRepo.isMember(projectId, userId);

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this project');
    }

    return this.taskRepo.getProjectStats(projectId);
  }
}
