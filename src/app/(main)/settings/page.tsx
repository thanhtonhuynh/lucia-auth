import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import SettingsPage from './SettingsPage';

export default async function Page() {
  const { user } = await auth();
  if (!user) return redirect('/login');

  return <SettingsPage user={user} />;
}
