-- Initial setup script for PostgreSQL todo application

-- Create the database (run this as superuser)
-- CREATE DATABASE todoapp;

-- Connect to the todoapp database and run the following:

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at DESC);

-- Insert sample data (optional)
INSERT INTO todos (title, completed) VALUES 
    ('Welcome to your Todo App!', false),
    ('Try editing this todo by clicking the edit button', false),
    ('Mark todos as complete by clicking the checkbox', false),
    ('This is a completed todo', true),
    ('Delete todos you no longer need', false)
ON CONFLICT DO NOTHING;

-- Display success message
SELECT 'Database setup complete!' as message;