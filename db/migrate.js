import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

async function runMigrations() {
  console.log('Starting database migration...');

  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql);

  try {
    await migrate(db, { migrationsFolder: './db/migrations' });
    console.log('✅ Migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }

  await sql.end();
}

runMigrations();
