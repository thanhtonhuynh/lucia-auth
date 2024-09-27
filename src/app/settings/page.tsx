import { validateRequest } from '@/auth';
import { redirect } from 'next/navigation';
import SettingsPage from './SettingsPage';

export default async function Page() {
  const { user } = await validateRequest();
  if (!user) redirect('/login');

  return <SettingsPage user={user} />;
}
