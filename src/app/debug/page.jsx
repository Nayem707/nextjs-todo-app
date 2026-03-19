'use server';

import { db, users } from '@/db';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

export default async function DatabaseDebugPage() {
  let allUsers = [];
  let error = null;

  try {
    // Get all users
    allUsers = await db.select().from(users).limit(5);
  } catch (err) {
    error = err.message;
  }

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Database Debug</h1>

      {error ? (
        <div className="rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          Error: {error}
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            Users in Database ({allUsers.length})
          </h2>

          {allUsers.length === 0 ? (
            <p className="text-gray-500">No users found in database.</p>
          ) : (
            <div className="space-y-2">
              {allUsers.map((user, index) => (
                <div key={user.id} className="rounded border p-4">
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Name:</strong> {user.name}
                  </p>
                  <p>
                    <strong>Password:</strong> {user.password?.substring(0, 20)}
                    ...
                  </p>
                  <p>
                    <strong>Is Hashed:</strong>{' '}
                    {user.password?.startsWith('$2')
                      ? '✅ YES'
                      : '❌ NO (Plain text)'}
                  </p>
                  <p>
                    <strong>Created:</strong> {user.createdAt?.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <a
          href="/auth/signin"
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Back to Sign In
        </a>
      </div>
    </div>
  );
}
