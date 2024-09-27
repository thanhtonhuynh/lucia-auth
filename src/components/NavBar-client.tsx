'use client';

import Link from 'next/link';
import UserButton from './UserButton';
import { Button } from './ui/button';
import { useSession } from '@/contexts/SessionProvider';

export default function NavBarClient() {
  const { user } = useSession();

  return (
    <header className="sticky top-0 bg-background px-3 shadow-sm">
      <nav className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3">
        <Link href="/" className="font-bold">
          Lucia Auth
        </Link>

        {user ? (
          <UserButton user={user} />
        ) : (
          <Button asChild>
            <Link href={`/login`}>Login</Link>
          </Button>
        )}
      </nav>
    </header>
  );
}
