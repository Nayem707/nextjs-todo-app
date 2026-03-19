import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { NotFoundError } from '@/types';

export class UserRepository {
  /**
   * Find user by ID
   */
  async findById(id) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user || null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user || null;
  }

  /**
   * Create new user
   */
  async create(data) {
    const [user] = await db.insert(users).values(data).returning();

    return user;
  }

  /**
   * Update user
   */
  async update(id, data) {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  /**
   * Delete user
   */
  async delete(id) {
    await db.delete(users).where(eq(users.id, id));
  }

  /**
   * Check if email exists
   */
  async emailExists(email) {
    const user = await this.findByEmail(email);
    return !!user;
  }
}
