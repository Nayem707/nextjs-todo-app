import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProjectService } from '@/services/ProjectService';
import ProjectList from '@/components/projects/ProjectList';

const projectService = new ProjectService();

export default async function ProjectsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  const { items: projects } = await projectService.getUserProjects(
    session.user.id,
    {},
    { page: 1, pageSize: 50 }
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Projects
          </h1>
          <a
            href="/projects/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            New Project
          </a>
        </div>

        <ProjectList projects={projects} userId={session.user.id} />
      </div>
    </div>
  );
}
