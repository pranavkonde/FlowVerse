'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const { ready, authenticated, login } = usePrivy();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login();
      onLogin();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Free Flow</h1>
          <p className="text-slate-300">NYC Virtual Environment</p>
          <p className="text-sm text-slate-400 mt-2">
            Interactive 2D multiplayer with DeFi integration
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 
                     text-white font-semibold py-3 px-6 rounded-lg transition-colors
                     flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Connecting...
              </>
            ) : (
              'Enter Free Flow'
            )}
          </button>
          
          <div className="text-center text-sm text-slate-400">
            Connect your wallet to start exploring
          </div>
        </div>
      </div>
    </div>
  );
}
