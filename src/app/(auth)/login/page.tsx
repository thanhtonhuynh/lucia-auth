import Link from 'next/link';
import { LoginForm } from './LoginForm';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { GoogleSignInButton } from './google/GoogleSignInButton';

export default async function Page() {
  const { user } = await auth();
  if (user) redirect('/');

  return (
    <main className="flex h-[90vh] items-center justify-center">
      <div className="flex py-8 max-h-[40rem] w-full max-w-[32rem] bg-card rounded-xl shadow-xl flex-col items-center justify-center space-y-4">
        <h1 className="font-bold text-3xl">Login</h1>

        <div className="flex flex-col space-y-4 w-2/3">
          <GoogleSignInButton />

          <div className="flex items-center justify-center space-x-4">
            <hr className="w-1/3" />
            <span>or</span>
            <hr className="w-1/3" />
          </div>

          <LoginForm />

          <Link href={`/signup`} className="hover:underline text-center">
            Don&apos;t have an account? Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
