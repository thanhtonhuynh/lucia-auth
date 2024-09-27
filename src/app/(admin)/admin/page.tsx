import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Page() {
  const { user } = await auth();

  if (!user) {
    redirect('/login');
  }

  if (user.role !== 'admin') {
    return (
      <main className="mx-auto my-10">
        <p className="text-center">You are not authorized to view this page.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto my-10 space-y-3">
      <h1 className="text-center text-xl font-bold">Admin Page</h1>
      <p className="text-center">Welcome, {user.name}!</p>
    </main>
  );
}
