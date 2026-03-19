import { UserRepository } from '@/repositories/UserRepository';
import bcrypt from 'bcryptjs';
import { ValidationError } from '@/types';

const userRepo = new UserRepository();

/**
 * Register a new user
 */
export async function registerUser(name, email, password) {
  // Validate input
  if (!name?.trim()) {
    throw new ValidationError('Name is required');
  }
  if (!email?.trim()) {
    throw new ValidationError('Email is required');
  }
  if (!password || password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters');
  }

  // Check if email already exists
  const exists = await userRepo.emailExists(email.toLowerCase());
  if (exists) {
    throw new ValidationError('Email already in use');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await userRepo.create({
    name: name.trim(),
    email: email.toLowerCase(),
    password: hashedPassword,
  });

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
