import { cookies } from 'next/headers';
import { ResetPasswordForm } from './ResetPasswordForm';

export default function Page() {
  const token = cookies().get('resetToken')?.value;

  return (
    <main className="flex h-[90vh] items-center justify-center">
      <div className="flex p-4 py-8 h-full max-h-[35rem] w-full max-w-[40rem] bg-card rounded-xl shadow-xl flex-col items-center justify-center space-y-4">
        <h1 className="font-bold text-3xl">Enter new password</h1>

        <div className="flex flex-col space-y-4 w-1/2">
          <ResetPasswordForm token={token || ''} />
        </div>
      </div>
    </main>
  );
}
