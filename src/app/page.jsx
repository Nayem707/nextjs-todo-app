import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to projects page (main dashboard)
  redirect('/projects');
}
