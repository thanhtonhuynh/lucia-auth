import { redirect } from 'next/navigation';
import { VerifyEmailForm } from './VerifyEmailForm';
import { SuccessMessage } from '@/components/Message';
import { getUserByEmail } from '@/data/users';

type PageProps = {
  searchParams: {
    email: string;
    redirectFrom?: string;
  };
};

export default async function Page({
  searchParams: { email, redirectFrom },
}: PageProps) {
  const user = await getUserByEmail(email);
  if (!user || user.email !== email || user.emailVerified) {
    redirect('/');
  }

  return (
    <main className="flex h-[90vh] items-center justify-center">
      <div className="flex h-full p-4 py-8 max-h-[30rem] w-full max-w-[40rem] bg-card rounded-xl shadow-xl flex-col items-center justify-center space-y-4">
        <h1 className="font-bold text-3xl">Verify Email</h1>

        {redirectFrom === 'signup' && (
          <SuccessMessage
            className="w-2/3"
            title="Account created!"
            message="We just sent a verification code to your email."
          />
        )}

        <VerifyEmailForm user={user} />
      </div>
    </main>
  );
}
