'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');

    if (!name.trim()) {
      setError('Project name is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Redirect to the new project
        router.push(`/projects/${result.data.id}`);
      } else {
        setError(result.message || 'Failed to create project');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white shadow-lg dark:bg-gray-800">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Project
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Start a new project and invite team members to collaborate.
            </p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-6 rounded border border-red-400 bg-red-50 px-4 py-3 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Project Name *
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter project name..."
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Describe your project..."
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
