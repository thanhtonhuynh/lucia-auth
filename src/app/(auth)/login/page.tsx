import Link from 'next/link';
import { LoginForm } from './LoginForm';

export default function Page() {
  return (
    <main className="flex h-[90vh] items-center justify-center">
      <div className="flex h-full max-h-[30rem] w-full max-w-[32rem] bg-card rounded-xl shadow-xl flex-col items-center justify-center space-y-4">
        <h1 className="font-bold text-3xl">Login</h1>

        <div className="flex flex-col space-y-4">
          <LoginForm />

          <Link href={`/signup`} className="hover:underline">
            Don&apos;t have an account? Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
