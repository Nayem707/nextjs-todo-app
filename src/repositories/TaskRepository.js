import { db, tasks, users, projects, comments, type Task, type NewTask } from '@/db';
import { eq, and, or, like, desc, count, sql } from 'drizzle-orm';
import { NotFoundError, type TaskFilters, type PaginationParams, type TaskWithDetails } from '@/types';

export class TaskRepository {
  /**
   * Find task by ID
   */
  async findById(id) {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id))
      .limit(1);
    
    return task || null;
  }

  /**
   * Find task with full details
   */
  async findByIdWithDetails(id) {
    const [result] = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        progress: tasks.progress,
        dueDate: tasks.dueDate,
        completedAt: tasks.completedAt,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        project: {
          id: projects.id,
          name: projects.name,
        },
        creator: {
          id: sql<string>`${users.id}`.as('creator_id'),
          name: sql<string>`${users.name}`.as('creator_name'),
        },
      })
      .from(tasks)
      .innerJoin(projects, eq(tasks.projectId, projects.id))
      .innerJoin(users, eq(tasks.createdBy, users.id))
      .where(eq(tasks.id, id))
      .limit(1);

    if (!result) return null;

    // Get assigned user if exists
    let assignedUser = null;
    if (tasks.assignedTo) {
      const [user] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          avatar: users.avatar,
        })
        .from(users)
        .where(eq(users.id, tasks.assignedTo))
        .limit(1);
      
      assignedUser = user || null;
    }

    // Get comment count
    const [{ commentCount }] = await db
      .select({ commentCount: count() })
      .from(comments)
      .where(eq(comments.taskId, id));

    return {
      ...result,
      assignedUser,
      commentCount(commentCount),
    };
  }

  /**
   * Find tasks with filters and pagination
   */
  async findMany(
    filters = {},
    pagination = {}
  ) {
    const { projectId, status, priority, assignedTo, createdBy, search } = filters;
    const { page = 1, pageSize = 10 } = pagination;
    const offset = (page - 1) * pageSize;

    // Build where conditions
    const conditions = [];
    if (projectId) conditions.push(eq(tasks.projectId, projectId));
    if (status) conditions.push(eq(tasks.status, status));
    if (priority) conditions.push(eq(tasks.priority, priority));
    if (assignedTo) conditions.push(eq(tasks.assignedTo, assignedTo));
    if (createdBy) conditions.push(eq(tasks.createdBy, createdBy));
    if (search) conditions.push(like(tasks.title, `%${search}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ total }] = await db
      .select({ total: count() })
      .from(tasks)
      .where(whereClause);

    // Get tasks
    const items = await db
      .select()
      .from(tasks)
      .where(whereClause)
      .orderBy(desc(tasks.createdAt))
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
   * Create new task
   */
  async create(data) {
    const [task] = await db
      .insert(tasks)
      .values(data)
      .returning();
    
    return task;
  }

  /**
   * Update task
   */
  async update(id, data) {
    const updateData = { ...data, updatedAt: new Date() };
    
    // If status is being set to completed, set completedAt
    if (data.status === 'completed' && !data.completedAt) {
      updateData.completedAt = new Date();
    }

    const [task] = await db
      .update(tasks)
      .set(updateData)
      .where(eq(tasks.id, id))
      .returning();
    
    if (!task) {
      throw new NotFoundError('Task not found');
    }
    
    return task;
  }

  /**
   * Delete task
   */
  async delete(id) {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  /**
   * Get task statistics for a project
   */
  async getProjectStats(projectId) {
    const [stats] = await db
      .select({
        total: count(),
        todo: sql<number>`count(*) filter (where ${tasks.status} = 'todo')`,
        inProgress: sql<number>`count(*) filter (where ${tasks.status} = 'in_progress')`,
        review: sql<number>`count(*) filter (where ${tasks.status} = 'review')`,
        completed: sql<number>`count(*) filter (where ${tasks.status} = 'completed')`,
        blocked: sql<number>`count(*) filter (where ${tasks.status} = 'blocked')`,
      })
      .from(tasks)
      .where(eq(tasks.projectId, projectId));

    return {
      total(stats.total),
      todo(stats.todo),
      inProgress(stats.inProgress),
      review(stats.review),
      completed(stats.completed),
      blocked(stats.blocked),
    };
  }
}
