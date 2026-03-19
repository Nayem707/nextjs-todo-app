'use server';

import { signIn, signOut } from '@/lib/auth';
import { registerUser } from '@/services/AuthService';
import { AppError } from '@/types';

/**
 * Sign in with email and password
 */
export async function signInAction(email, password) {
  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: 'Invalid email or password' };
  }
}

/**
 * Sign out
 */
export async function signOutAction() {
  try {
    await signOut({ redirect: false });
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: 'Failed to sign out' };
  }
}

/**
 * Register new user
 */
export async function registerAction(name, email, password) {
  try {
    const user = await registerUser(name, email, password);
    return { success: true, data: user };
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof AppError) {
      return { success: false, error: error.message };
    }

    return { success: false, error: 'Failed to register' };
  }
}
