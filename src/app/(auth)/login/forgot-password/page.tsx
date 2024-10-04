import { auth } from '@/auth';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { redirect } from 'next/navigation';

export default async function Page() {
  const { user } = await auth();
  if (user) redirect('/');

  return (
    <main className="flex h-[90vh] items-center justify-center">
      <div className="flex p-4 py-8 h-full max-h-[35rem] w-full max-w-[40rem] bg-card rounded-xl shadow-xl flex-col items-center justify-center space-y-4">
        <h1 className="font-bold text-3xl">Reset your password</h1>

        <p className="text-gray-500 text-sm">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>

        <div className="flex flex-col space-y-4 w-1/2">
          <ForgotPasswordForm />
        </div>
      </div>
    </main>
  );
}
