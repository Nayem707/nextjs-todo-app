import { ProjectRepository } from '@/repositories/ProjectRepository';
import { MemberRepository } from '@/repositories/MemberRepository';
import { ActivityRepository } from '@/repositories/ActivityRepository';
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from '@/types';

export class ProjectService {
  constructor() {
    this.projectRepo = new ProjectRepository();
    this.memberRepo = new MemberRepository();
    this.activityRepo = new ActivityRepository();
  }

  /**
   * Get project by ID with access check
   */
  async getProject(projectId, userId) {
    const project = await this.projectRepo.findByIdWithDetails(projectId);

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Check if user has access
    const hasAccess =
      project.owner.id === userId ||
      (await this.memberRepo.isMember(projectId, userId));

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this project');
    }

    return project;
  }

  /**
   * Create new project
   */
  async createProject(data, userId) {
    // Validate input
    if (!data.name?.trim()) {
      throw new ValidationError('Project name is required');
    }

    // Create project
    const project = await this.projectRepo.create({
      name: data.name.trim(),
      description: data.description?.trim() || null,
      status: data.status || 'active',
      ownerId: userId,
    });

    // Add creator as admin member
    await this.memberRepo.addMember({
      projectId: project.id,
      userId,
      role: 'admin',
    });

    // Log activity
    await this.activityRepo.logProjectActivity(
      project.id,
      userId,
      'project_created',
      `Created project "${project.name}"`
    );

    return project;
  }

  /**
   * Update project
   */
  async updateProject(projectId, data, userId) {
    // Check if user has admin access
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const isOwner = project.ownerId === userId;
    const hasAdminAccess = await this.memberRepo.hasAdminAccess(
      projectId,
      userId
    );

    if (!isOwner && !hasAdminAccess) {
      throw new ForbiddenError(
        'Only project owner or admins can update the project'
      );
    }

    // Update project
    const updated = await this.projectRepo.update(projectId, data);

    // Log activity
    const changes = [];
    if (data.name) changes.push('name');
    if (data.description !== undefined) changes.push('description');
    if (data.status) changes.push('status');

    await this.activityRepo.logProjectActivity(
      projectId,
      userId,
      'project_updated',
      `Updated project (${changes.join(', ')})`,
      { changes: data }
    );

    return updated;
  }

  /**
   * Delete project
   */
  async deleteProject(projectId, userId) {
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Only owner can delete
    if (project.ownerId !== userId) {
      throw new ForbiddenError('Only the project owner can delete the project');
    }

    // Log activity before deletion
    await this.activityRepo.logProjectActivity(
      projectId,
      userId,
      'project_deleted',
      `Deleted project "${project.name}"`
    );

    await this.projectRepo.delete(projectId);
  }

  /**
   * Get user's projects
   */
  async getUserProjects(userId, filters = {}, pagination = {}) {
    return this.projectRepo.findMany(
      { ...filters, ownerId: userId },
      pagination
    );
  }

  /**
   * Add member to project
   */
  async addMember(projectId, userIdToAdd, role, currentUserId) {
    // Check if current user has admin access
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const isOwner = project.ownerId === currentUserId;
    const hasAdminAccess = await this.memberRepo.hasAdminAccess(
      projectId,
      currentUserId
    );

    if (!isOwner && !hasAdminAccess) {
      throw new ForbiddenError('Only project owner or admins can add members');
    }

    // Add member
    const member = await this.memberRepo.addMember({
      projectId,
      userId,
      role,
    });

    // Log activity
    await this.activityRepo.logProjectActivity(
      projectId,
      currentUserId,
      'member_added',
      `Added member with role "${role}"`,
      { userId, role }
    );

    return member;
  }

  /**
   * Remove member from project
   */
  async removeMember(projectId, userIdToRemove, currentUserId) {
    // Check if current user has admin access
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Can't remove the owner
    if (project.ownerId === userIdToRemove) {
      throw new ForbiddenError('Cannot remove the project owner');
    }

    const isOwner = project.ownerId === currentUserId;
    const hasAdminAccess = await this.memberRepo.hasAdminAccess(
      projectId,
      currentUserId
    );

    if (!isOwner && !hasAdminAccess) {
      throw new ForbiddenError(
        'Only project owner or admins can remove members'
      );
    }

    // Remove member
    await this.memberRepo.removeMember(projectId, userIdToRemove);

    // Log activity
    await this.activityRepo.logProjectActivity(
      projectId,
      currentUserId,
      'member_removed',
      'Removed member from project',
      { userId: userIdToRemove }
    );
  }

  /**
   * Update member role
   */
  async updateMemberRole(projectId, userIdToUpdate, newRole, currentUserId) {
    // Check if current user has admin access
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const isOwner = project.ownerId === currentUserId;
    const hasAdminAccess = await this.memberRepo.hasAdminAccess(
      projectId,
      currentUserId
    );

    if (!isOwner && !hasAdminAccess) {
      throw new ForbiddenError(
        'Only project owner or admins can update member roles'
      );
    }

    // Update role
    const member = await this.memberRepo.updateRole(
      projectId,
      userIdToUpdate,
      newRole
    );

    // Log activity
    await this.activityRepo.logProjectActivity(
      projectId,
      currentUserId,
      'member_added',
      `Updated member role to "${newRole}"`,
      { userId, newRole }
    );

    return member;
  }
}
