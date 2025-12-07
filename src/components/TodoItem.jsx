'use client';

import { useState, useTransition, useCallback } from 'react';
import { toggleTodo, deleteTodo, updateTodo } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Check,
  X,
  Edit2,
  Trash2,
  Loader2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

export default function TodoItem({ todo, onTodoChanged }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [isPending, startTransition] = useTransition();
  const [isHovered, setIsHovered] = useState(false);

  const handleToggle = useCallback(() => {
    startTransition(async () => {
      try {
        await toggleTodo(todo.id);
        onTodoChanged?.();
      } catch (error) {
        console.error('Error toggling todo:', error);
      }
    });
  }, [todo.id, onTodoChanged]);

  const handleDelete = useCallback(() => {
    startTransition(async () => {
      try {
        await deleteTodo(todo.id);
        onTodoChanged?.();
      } catch (error) {
        console.error('Error deleting todo:', error);
      }
    });
  }, [todo.id, onTodoChanged]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setEditTitle(todo.title);
  }, [todo.title]);

  const handleSaveEdit = useCallback(() => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle || trimmedTitle === todo.title) {
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      try {
        await updateTodo(todo.id, trimmedTitle);
        setIsEditing(false);
        onTodoChanged?.();
      } catch (error) {
        console.error('Error updating todo:', error);
      }
    });
  }, [editTitle, todo.id, todo.title, onTodoChanged]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditTitle(todo.title);
  }, [todo.title]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSaveEdit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancelEdit();
      }
    },
    [handleSaveEdit, handleCancelEdit]
  );

  return (
    <div
      className={cn(
        'group flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-all duration-200',
        todo.completed ? 'border-green-200 bg-green-50/60' : 'border-gray-200',
        isHovered && 'scale-[1.02] shadow-lg'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={cn(
          'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-200 hover:scale-110',
          todo.completed
            ? 'border-green-500 bg-green-600 text-white shadow-lg'
            : 'border border-gray-300 hover:border-green-400 hover:bg-green-100',
          isPending && 'animate-pulse'
        )}
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : todo.completed ? (
          <CheckCircle2 className="h-6 w-6" />
        ) : null}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1">
        {isEditing ? (
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className={cn(
              'border-2 text-sm font-medium focus:border-blue-400 focus:ring-blue-200',
              'bg-white dark:bg-gray-800'
            )}
            placeholder="Enter task title..."
            maxLength={100}
            autoFocus
            onFocus={(e) => e.target.select()}
          />
        ) : (
          <>
            <p
              className={cn(
                'text-sm leading-relaxed font-medium transition-all duration-200',
                todo.completed
                  ? 'text-gray-600 line-through dark:text-gray-400'
                  : 'text-gray-900'
              )}
            >
              {todo.title}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3" />
              <span>Created {formatDate(todo.createdAt)}</span>
              {todo.completed && (
                <>
                  <span>•</span>
                  <span className="text-green-600 dark:text-green-400">
                    Completed
                  </span>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div
        className={cn(
          'flex items-center gap-1 transition-all duration-200',
          !isEditing && 'opacity-0 group-hover:opacity-100'
        )}
      >
        {isEditing ? (
          <>
            <Button
              onClick={handleSaveEdit}
              disabled={
                isPending ||
                !editTitle.trim() ||
                editTitle.trim() === todo.title
              }
              size="sm"
              className="h-10 w-10 border-0 bg-green-500 p-0 shadow-md hover:bg-green-600"
            >
              {isPending ? (
                <Loader2 className="h-10 w-10 animate-spin" />
              ) : (
                <Check className="h-10 w-10" />
              )}
            </Button>
            <Button
              onClick={handleCancelEdit}
              disabled={isPending}
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 text-red-400 hover:bg-gray-100"
            >
              <X className="h-10 w-10" />
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleEdit}
              disabled={isPending || todo.completed}
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 transition-colors hover:bg-blue-100 hover:text-blue-600"
            >
              <Edit2 className="h-10 w-10" />
            </Button>
            <Button
              onClick={handleDelete}
              disabled={isPending}
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 transition-colors hover:bg-red-100 hover:text-red-600"
            >
              {isPending ? (
                <Loader2 className="h-10 w-10 animate-spin" />
              ) : (
                <Trash2 className="h-10 w-10" />
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
