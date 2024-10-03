import Link from 'next/link';
import { SignUpForm } from './SignUpForm';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function Page() {
  const { user } = await auth();
  if (user) redirect('/');

  return (
    <main className="flex h-[90vh] items-center justify-center">
      <div className="flex p-4 py-8 h-full max-h-[35rem] w-full max-w-[40rem] bg-card rounded-xl shadow-xl flex-col items-center justify-center space-y-4">
        <h1 className="font-bold text-3xl">Sign Up</h1>

        <SignUpForm />

        <Link href={`/login`} className="hover:underline text-center">
          Already have an account? Log in
        </Link>
      </div>
    </main>
  );
}
