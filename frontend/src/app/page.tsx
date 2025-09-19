'use client';

import { useState, useEffect } from 'react';
import Game from '@/components/Game';
import Login from '@/components/Login';
import { PrivyProvider } from '@privy-io/react-auth';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#676FFF',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
        {!isAuthenticated ? (
          <Login onLogin={() => setIsAuthenticated(true)} />
        ) : (
          <Game />
        )}
      </main>
    </PrivyProvider>
  );
}