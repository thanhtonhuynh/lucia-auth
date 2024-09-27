export default async function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // If do auth checks here with redirect, it's okay
  // If render different components based on auth, it's not secure
  return <>{children}</>;
}
