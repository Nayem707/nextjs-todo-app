import { db, activities, users } from '@/db';
import { eq, and, desc } from 'drizzle-orm';

export class ActivityRepository {
  /**
   * Create new activity log entry
   */
  async create(data) {
    const [activity] = await db.insert(activities).values(data).returning();

    return activity;
  }

  /**
   * Get recent activities for a project
   */
  async findByProject(projectId, pagination = {}) {
    const { page = 1, pageSize = 20 } = pagination;
    const offset = (page - 1) * pageSize;

    const items = await db
      .select({
        id: activities.id,
        type: activities.type,
        description: activities.description,
        metadata: activities.metadata,
        createdAt: activities.createdAt,
        user: {
          id: users.id,
          name: users.name,
          avatar: users.avatar,
        },
      })
      .from(activities)
      .innerJoin(users, eq(activities.userId, users.id))
      .where(eq(activities.projectId, projectId))
      .orderBy(desc(activities.createdAt))
      .limit(pageSize)
      .offset(offset);

    return items;
  }

  /**
   * Get recent activities for a task
   */
  async findByTask(taskId, pagination = {}) {
    const { page = 1, pageSize = 20 } = pagination;
    const offset = (page - 1) * pageSize;

    const items = await db
      .select({
        id: activities.id,
        type: activities.type,
        description: activities.description,
        metadata: activities.metadata,
        createdAt: activities.createdAt,
        user: {
          id: users.id,
          name: users.name,
          avatar: users.avatar,
        },
      })
      .from(activities)
      .innerJoin(users, eq(activities.userId, users.id))
      .where(eq(activities.taskId, taskId))
      .orderBy(desc(activities.createdAt))
      .limit(pageSize)
      .offset(offset);

    return items;
  }

  /**
   * Get user's recent activities across all projects
   */
  async findByUser(userId, pagination = {}) {
    const { page = 1, pageSize = 20 } = pagination;
    const offset = (page - 1) * pageSize;

    const items = await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.createdAt))
      .limit(pageSize)
      .offset(offset);

    return items;
  }

  /**
   * Helper method to log project activity
   */
  async logProjectActivity(projectId, userId, type, description, metadata) {
    return this.create({
      projectId,
      userId,
      type,
      description,
      metadata,
    });
  }

  /**
   * Helper method to log task activity
   */
  async logTaskActivity(
    projectId,
    taskId,
    userId,
    type,
    description,
    metadata
  ) {
    return this.create({
      projectId,
      taskId,
      userId,
      type,
      description,
      metadata,
    });
  }
}
