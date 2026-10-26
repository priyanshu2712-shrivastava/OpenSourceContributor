import React from 'react';
import type { DeveloperProfile } from '../types';

interface NavbarProps {
  onOpenLogin: () => void;
  onSignOut: () => void;
  user: DeveloperProfile | null;
  currentView: 'landing' | 'dashboard';
  onNavigate: (view: 'landing' | 'dashboard') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLogin,
  onSignOut,
  user,
  currentView,
  onNavigate,
}) => {
  return (
    <header className="border-b border-zinc-800 bg-[#09090b]/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <span className="font-mono font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span className="text-zinc-500 font-normal"></span> <span className="text-zinc-300">OSS MATCH</span>
            </span>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                currentView === 'landing'
                  ? 'bg-zinc-800 text-white font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Platform
            </button>
            {user && (
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'bg-zinc-800 text-white font-medium'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Workspace & Matcher
              </button>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
            <span className="text-emerald-400">●</span> 3 Agents Active
          </div>

          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-zinc-800">
              <button
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 text-xs text-zinc-200 hover:text-white cursor-pointer"
              >
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-7 h-7 rounded-full border border-zinc-700 object-cover"
                />
                <span className="font-mono text-xs">@{user.username}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                  {user.ast_metrics.tier}
                </span>
              </button>
              <button
                onClick={onSignOut}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer font-mono"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 rounded-md bg-white hover:bg-zinc-200 text-black font-medium text-xs transition-colors cursor-pointer"
            >
              Sign In with GitHub
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
