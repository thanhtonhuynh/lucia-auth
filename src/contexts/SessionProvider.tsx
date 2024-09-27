'use client';

import { Session, User } from 'lucia';
import { createContext, ReactNode, useContext } from 'react';

interface SessionContext {
  user: User | null;
  session: Session | null;
}

const SessionContext = createContext({} as SessionContext);

export function useSession() {
  return useContext(SessionContext);
}

interface SessionProviderProps {
  children: ReactNode;
  value: SessionContext;
}

export function SessionProvider({ children, value }: SessionProviderProps) {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}
