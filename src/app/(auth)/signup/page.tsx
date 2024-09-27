import Link from 'next/link';
import { SignUpForm } from './SignUpForm';

export default function Page() {
  return (
    <main className="flex h-[90vh] items-center justify-center">
      <div className="flex h-full max-h-[30rem] w-full max-w-[32rem] bg-card rounded-xl shadow-xl flex-col items-center justify-center space-y-4">
        <h1 className="font-bold text-3xl">Sign Up</h1>

        <div className="flex flex-col space-y-4">
          <SignUpForm />

          <Link href={`/login`} className="hover:underline">
            Already have an account? Log in
          </Link>
        </div>
      </div>
    </main>
  );
}
