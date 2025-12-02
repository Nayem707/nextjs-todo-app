'use client';

import { useState, useMemo } from 'react';
import TodoItem from './TodoItem';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Filter, CheckCircle2, Clock, List, Sparkles } from 'lucide-react';

const FILTER_OPTIONS = [
  { key: 'all', label: 'All Tasks', icon: List, color: 'blue' },
  { key: 'active', label: 'Active', icon: Clock, color: 'amber' },
  { key: 'completed', label: 'Completed', icon: CheckCircle2, color: 'green' },
];

export default function TodoList({ todos, onTodoChanged }) {
  const [filter, setFilter] = useState('all');

  const { filteredTodos, stats } = useMemo(() => {
    const filtered = todos.filter((todo) => {
      if (filter === 'active') return !todo.completed;
      if (filter === 'completed') return todo.completed;
      return true;
    });

    const active = todos.filter((todo) => !todo.completed).length;
    const completed = todos.filter((todo) => todo.completed).length;

    return {
      filteredTodos: filtered,
      stats: { active, completed, total: todos.length },
    };
  }, [todos, filter]);

  const getEmptyStateMessage = () => {
    if (filter === 'all') return 'No tasks yet. Create your first task above!';
    if (filter === 'active') return 'All caught up! No active tasks.';
    return 'No completed tasks yet. Mark some tasks as done!';
  };

  const getEmptyStateIcon = () => {
    if (filter === 'all')
      return (
        <Sparkles className="h-16 w-16 text-gray-300 dark:text-gray-600" />
      );
    if (filter === 'active')
      return <Clock className="h-16 w-16 text-amber-400 dark:text-amber-500" />;
    return (
      <CheckCircle2 className="h-16 w-16 text-green-400 dark:text-green-500" />
    );
  };

  return (
    <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm dark:bg-gray-800/80">
      <CardContent className="space-y-6 p-6">
        {/* Progress Bar */}
        {stats.total > 0 && (
          <div className="rounded-lg border border-gray-200 px-8 py-4 pt-4 dark:border-gray-900">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="text-gray-600 dark:text-gray-400">
                {Math.round((stats.completed / stats.total) * 100)}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 ease-out"
                style={{ width: `${(stats.completed / stats.total) * 100}%` }}
              />
            </div>
          </div>
        )}
        {/* Header with Filter Controls */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
              Your Tasks
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stats.active} active • {stats.completed} completed •{' '}
              {stats.total} total
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-700">
              {FILTER_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isActive = filter === option.key;
                return (
                  <Button
                    key={option.key}
                    onClick={() => setFilter(option.key)}
                    variant="ghost"
                    size="sm"
                    className={`h-auto px-3 py-2 text-xs text-white transition-all duration-200 ${
                      isActive
                        ? `bg-${option.color}-500 text-white hover:bg-${option.color}-600 shadow-sm`
                        : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                    } `}
                  >
                    <Icon className="mr-1.5 h-3 w-3" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Todo Items or Empty State */}
        {filteredTodos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 flex items-center justify-center">
              {getEmptyStateIcon()}
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {filter === 'all' ? 'Ready to get organized?' : 'All clear!'}
              </h3>
              <p className="mx-auto max-w-md text-base leading-relaxed text-gray-600 dark:text-gray-400">
                {getEmptyStateMessage()}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTodos.map((todo, index) => (
              <div
                key={todo.id}
                className="animate-in slide-in-from-left duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TodoItem todo={todo} onTodoChanged={onTodoChanged} />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
