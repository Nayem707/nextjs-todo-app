'use client';

import { useState, useCallback } from 'react';
import { createTodo } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Loader2, Sparkles } from 'lucide-react';

export default function TodoForm({ onTodoAdded }) {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const trimmedTitle = title.trim();

      if (!trimmedTitle) {
        setError('Please enter a task');
        return;
      }

      if (trimmedTitle.length > 100) {
        setError('Task is too long (max 100 characters)');
        return;
      }

      setIsSubmitting(true);
      setError('');

      try {
        await createTodo(trimmedTitle);
        setTitle('');
        onTodoAdded?.();
      } catch (error) {
        console.error('Error creating todo:', error);
        setError('Failed to create task. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [title, onTodoAdded]
  );

  const handleInputChange = useCallback(
    (e) => {
      setTitle(e.target.value);
      if (error) setError('');
    },
    [error]
  );

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 space-y-1">
          <Input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={handleInputChange}
            disabled={isSubmitting}
            className={`transition-all duration-200 ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                : 'focus:border-blue-500 focus:ring-blue-200'
            }`}
            maxLength={100}
          />
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="border-0 bg-gradient-to-r from-blue-500 to-blue-600 px-6 text-white shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Add Task
            </>
          )}
        </Button>
      </form>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        {title.length}/100 characters
      </div>
    </div>
  );
}
