import { db, projects, projectMembers, tasks, users } from '@/db';
import { eq, and, or, like, desc, sql, count } from 'drizzle-orm';
import { NotFoundError } from '@/types';

export class ProjectRepository {
  /**
   * Find project by ID
   */
  async findById(id) {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);

    return project || null;
  }

  /**
   * Find project with full details
   */
  async findByIdWithDetails(id) {
    if (!id) {
      throw new Error('Project ID is required');
    }

    const [result] = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        progress: projects.progress,
        startDate: projects.startDate,
        endDate: projects.endDate,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        ownerId: projects.ownerId,
        owner: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
        },
      })
      .from(projects)
      .innerJoin(users, eq(projects.ownerId, users.id))
      .where(eq(projects.id, id))
      .limit(1);

    if (!result) return null;

    // Get counts with default fallbacks
    try {
      const [{ memberCount }] = await db
        .select({ memberCount: count() })
        .from(projectMembers)
        .where(eq(projectMembers.projectId, id));

      const [{ taskCount }] = await db
        .select({ taskCount: count() })
        .from(tasks)
        .where(eq(tasks.projectId, id));

      const [{ completedTaskCount }] = await db
        .select({ completedTaskCount: count() })
        .from(tasks)
        .where(and(eq(tasks.projectId, id), eq(tasks.status, 'completed')));

      return {
        ...result,
        memberCount: Number(memberCount || 0),
        taskCount: Number(taskCount || 0),
        completedTaskCount: Number(completedTaskCount || 0),
      };
    } catch (countError) {
      console.error('Error fetching counts for project:', id, countError);
      // Return project without counts if count queries fail
      return {
        ...result,
        memberCount: 0,
        taskCount: 0,
        completedTaskCount: 0,
      };
    }
  }

  /**
   * Find projects with filters and pagination
   */
  async findMany(filters = {}, pagination = {}) {
    const { status, ownerId, search } = filters;
    const { page = 1, pageSize = 10 } = pagination;
    const offset = (page - 1) * pageSize;

    // Build where conditions
    const conditions = [];
    if (status) conditions.push(eq(projects.status, status));
    if (ownerId) conditions.push(eq(projects.ownerId, ownerId));
    if (search) conditions.push(like(projects.name, `%${search}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(projects)
      .where(whereClause);

    // Get projects
    const items = await db
      .select()
      .from(projects)
      .where(whereClause)
      .orderBy(desc(projects.createdAt))
      .limit(pageSize)
      .offset(offset);

    return {
      items,
      total: Number(total),
      page,
      pageSize,
      totalPages: Math.ceil(Number(total) / pageSize),
    };
  }

  /**
   * Find projects where user is a member
   */
  async findByMemberId(userId, pagination = {}) {
    const { page = 1, pageSize = 10 } = pagination;
    const offset = (page - 1) * pageSize;

    const [{ total }] = await db
      .select({ total: count() })
      .from(projects)
      .innerJoin(projectMembers, eq(projects.id, projectMembers.projectId))
      .where(eq(projectMembers.userId, userId));

    const items = await db
      .select({
        id: projects.id,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        progress: projects.progress,
        ownerId: projects.ownerId,
        startDate: projects.startDate,
        endDate: projects.endDate,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .innerJoin(projectMembers, eq(projects.id, projectMembers.projectId))
      .where(eq(projectMembers.userId, userId))
      .orderBy(desc(projects.createdAt))
      .limit(pageSize)
      .offset(offset);

    return {
      items,
      total: Number(total),
      page,
      pageSize,
      totalPages: Math.ceil(Number(total) / pageSize),
    };
  }

  /**
   * Create new project
   */
  async create(data) {
    const [project] = await db.insert(projects).values(data).returning();

    return project;
  }

  /**
   * Update project
   */
  async update(id, data) {
    const [project] = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    return project;
  }

  /**
   * Delete project
   */
  async delete(id) {
    await db.delete(projects).where(eq(projects.id, id));
  }

  /**
   * Update project progress based on tasks
   */
  async updateProgress(projectId) {
    const [{ taskCount, completedCount }] = await db
      .select({
        taskCount: count(),
        completedCount:
          sql <
          number >
          `count(*) filter (where ${tasks.status} = 'completed')`,
      })
      .from(tasks)
      .where(eq(tasks.projectId, projectId));

    const progress =
      Number(taskCount) > 0
        ? Math.round((Number(completedCount) / Number(taskCount)) * 100)
        : 0;

    await db
      .update(projects)
      .set({ progress, updatedAt: new Date() })
      .where(eq(projects.id, projectId));
  }
}
