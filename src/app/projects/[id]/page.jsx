'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id;

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);

      // Fetch project details
      const projectRes = await fetch(`/api/projects/${projectId}`);
      if (!projectRes.ok) {
        throw new Error('Failed to fetch project');
      }
      const projectData = await projectRes.json();
      setProject(projectData.data);

      // Fetch project tasks
      const tasksRes = await fetch(`/api/projects/${projectId}/tasks`);
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.data || []);
      }

      // Fetch project members
      const membersRes = await fetch(`/api/projects/${projectId}/members`);
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData.data || []);
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          Loading project...
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 text-lg text-red-600 dark:text-red-400">
            {error || 'Project not found'}
          </div>
          <button
            onClick={() => router.push('/projects')}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 rounded-lg bg-white shadow-lg dark:bg-gray-800">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {project.name}
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-medium ${
                    project.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : project.status === 'completed'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                        : project.status === 'on_hold'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}
                >
                  {project.status.replace('_', ' ').toUpperCase()}
                </span>
                <button
                  onClick={() => router.push('/projects')}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Back to Projects
                </button>
              </div>
            </div>
            {project.description && (
              <p className="mt-4 text-gray-700 dark:text-gray-300">
                {project.description}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Tasks Section */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white shadow-lg dark:bg-gray-800">
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Tasks ({tasks.length})
                  </h2>
                  <button className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                    Add Task
                  </button>
                </div>
              </div>
              <div className="p-6">
                {tasks.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      No tasks yet
                    </p>
                    <button className="mt-2 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
                      Create First Task
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-lg border p-4 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                {task.description}
                              </p>
                            )}
                          </div>
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${
                              task.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : task.status === 'in_progress'
                                  ? 'bg-blue-100 text-blue-800'
                                  : task.status === 'blocked'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {task.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Members Section */}
          <div>
            <div className="rounded-lg bg-white shadow-lg dark:bg-gray-800">
              <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Members ({members.length})
                  </h2>
                  <button className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700">
                    Add
                  </button>
                </div>
              </div>
              <div className="p-6">
                {members.length === 0 ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No members yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center space-x-3"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {member.user?.name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.user?.name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {member.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
