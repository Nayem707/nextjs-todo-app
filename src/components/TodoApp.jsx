'use client';

import { useMemo } from 'react';
import { getTodos } from '@/lib/actions';

import TodoForm from './TodoForm';
import TodoList from './TodoList';

import ErrorBoundary from './ErrorBoundary';
import { Card, CardContent } from '@/components/ui/card';
import { CheckSquare2, Loader2, AlertTriangle } from 'lucide-react';
import useSWR from 'swr';

const fetcher = async () => getTodos();

export default function TodoApp() {
  const {
    data: todos = [],
    error,
    mutate,
    isLoading,
  } = useSWR('todos', fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: false,
    dedupingInterval: 2000,
  });

  const todoStats = useMemo(() => {
    if (!todos.length) return { total: 0, active: 0, completed: 0 };
    return {
      total: todos.length,
      active: todos.filter((todo) => !todo.completed).length,
      completed: todos.filter((todo) => todo.completed).length,
    };
  }, [todos]);

  const handleTodoChanged = () => mutate();

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
        <Card className="w-full max-w-md border-red-200 text-center dark:border-red-800">
          <CardContent className="pt-6">
            <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Failed to Load Todos
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Something went wrong while loading your todos.
            </p>
            <button
              onClick={() => mutate()}
              className="w-full rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-xl bg-blue-500 p-2 shadow-lg">
              <CheckSquare2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold`}>Todo Manager</h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Stay organized and productive
              </p>
            </div>
          </div>
        </header>

        {/* Stats Cards */}
        {todoStats.total > 0 && (
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card className="border-0 bg-gradient-to-r from-blue-400 to-blue-500 text-white">
              <CardContent className="p-4 text-center">
                <h3 className="text-2xl font-bold text-white">
                  {todoStats.total}
                </h3>
                <p className="text-sm text-blue-100">Total Tasks</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <CardContent className="p-4 text-center">
                <h3 className="text-2xl font-bold text-white">
                  {todoStats.active}
                </h3>
                <p className="text-sm text-amber-100">Active</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <CardContent className="p-4 text-center">
                <h3 className="text-2xl font-bold text-white">
                  {todoStats.completed}
                </h3>
                <p className="text-sm text-green-100">Completed</p>
              </CardContent>
            </Card>
            <Card className="border-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-4 text-center">
                <h3 className="text-2xl font-bold text-white">
                  {todoStats.completed}
                </h3>
                <p className="text-sm text-green-100">Completed</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-6">
          {/* Add Todo Form */}
          <Card className="rounded-2xl border border-gray-200 shadow-md">
            <CardContent className="p-6">
              <h2 className="mb-4 text-lg font-semibold">Add New Task</h2>
              <TodoForm onTodoAdded={handleTodoChanged} />
            </CardContent>
          </Card>

          {/* Todo List */}
          <ErrorBoundary>
            {isLoading ? (
              <Card className="rounded-2xl border border-gray-200 shadow-md">
                <CardContent className="p-8 text-center">
                  <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-500" />
                  <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                </CardContent>
              </Card>
            ) : (
              <TodoList todos={todos} onTodoChanged={handleTodoChanged} />
            )}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
