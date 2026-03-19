import { db, projectMembers, users, projects } from '@/db';
import { eq, and, count } from 'drizzle-orm';
import { NotFoundError, UnauthorizedError } from '@/types';

export class MemberRepository {
  /**
   * Find member by ID
   */
  async findById(id) {
    const [member] = await db
      .select()
      .from(projectMembers)
      .where(eq(projectMembers.id, id))
      .limit(1);

    return member || null;
  }

  /**
   * Find all members of a project
   */
  async findByProject(projectId) {
    const members = await db
      .select({
        id: projectMembers.id,
        role: projectMembers.role,
        joinedAt: projectMembers.joinedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
        },
      })
      .from(projectMembers)
      .innerJoin(users, eq(projectMembers.userId, users.id))
      .where(eq(projectMembers.projectId, projectId));

    return members;
  }

  /**
   * Find all projects a user is a member of
   */
  async findByUser(userId) {
    const memberships = await db
      .select({
        id: projectMembers.id,
        role: projectMembers.role,
        joinedAt: projectMembers.joinedAt,
        project: {
          id: projects.id,
          name: projects.name,
          description: projects.description,
          status: projects.status,
        },
      })
      .from(projectMembers)
      .innerJoin(projects, eq(projectMembers.projectId, projects.id))
      .where(eq(projectMembers.userId, userId));

    return memberships;
  }

  /**
   * Check if user is a member of a project
   */
  async isMember(projectId, userId) {
    const [member] = await db
      .select()
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, userId)
        )
      )
      .limit(1);

    return !!member;
  }

  /**
   * Get member's role in project
   */
  async getMemberRole(projectId, userId) {
    const [member] = await db
      .select({ role: projectMembers.role })
      .from(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, userId)
        )
      )
      .limit(1);

    return member?.role || null;
  }

  /**
   * Add member to project
   */
  async addMember(data) {
    // Check if member already exists
    const existing = await this.isMember(data.projectId, data.userId);
    if (existing) {
      throw new Error('User is already a member of this project');
    }

    const [member] = await db.insert(projectMembers).values(data).returning();

    return member;
  }

  /**
   * Update member role
   */
  async updateRole(projectId, userId, role) {
    const [member] = await db
      .update(projectMembers)
      .set({ role })
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, userId)
        )
      )
      .returning();

    if (!member) {
      throw new NotFoundError('Member not found');
    }

    return member;
  }

  /**
   * Remove member from project
   */
  async removeMember(projectId, userId) {
    const result = await db
      .delete(projectMembers)
      .where(
        and(
          eq(projectMembers.projectId, projectId),
          eq(projectMembers.userId, userId)
        )
      )
      .returning();

    if (!result.length) {
      throw new NotFoundError('Member not found');
    }
  }

  /**
   * Get member count for a project
   */
  async getMemberCount(projectId) {
    const [{ total }] = await db
      .select({ total: count() })
      .from(projectMembers)
      .where(eq(projectMembers.projectId, projectId));

    return Number(total);
  }

  /**
   * Check if user has sufficient role (admin/owner)
   */
  async hasAdminAccess(projectId, userId) {
    const role = await this.getMemberRole(projectId, userId);
    return role === 'admin';
  }
}
