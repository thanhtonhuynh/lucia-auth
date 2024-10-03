import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import NavBar from '@/components/NavBar';
import { auth } from '@/auth';
import { SessionProvider } from '@/contexts/SessionProvider';
import NavBarClient from '@/components/NavBar-client';
import { Toaster } from '@/components/ui/sonner';

const geistSans = localFont({
  src: '../../fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: '../../fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Lucia Auth',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session, user } = await auth();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider value={{ session, user }}>
          {/* <NavBar /> */}
          <NavBarClient />
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
