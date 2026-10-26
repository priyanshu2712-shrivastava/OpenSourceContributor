import React, { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string) => Promise<void>;
  isLoading: boolean;
}

const DEMO_USERS = [
  { id: 'beginner-python-dev', label: 'Beginner Python' },
  { id: 'fullstack-js-dev', label: 'Full-Stack JS/TS' },
  { id: 'systems-go-dev', label: 'Systems Go/Rust' },
  { id: 'torvalds', label: 'Linus Torvalds' },
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  isLoading,
}) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    setError(null);
    try {
      await onLogin(username.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    }
  };

  const handleSelectDemo = async (demoId: string) => {
    setUsername(demoId);
    setError(null);
    try {
      await onLogin(demoId);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#09090b] border border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative font-mono text-xs">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors cursor-pointer"
        >
          ✕
        </button>

        <div className="space-y-1 mb-6">
          <h3 className="text-base font-bold text-white font-sans">Sign In with GitHub</h3>
          <p className="text-xs text-zinc-400 font-sans">Profile your skills via AST code analysis</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              GitHub Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. octocat, torvalds, your-username"
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono text-xs"
            />
            <p className="text-[11px] text-zinc-500 font-sans">
              Agent 1 will parse your public repositories to detect Syntax, OOP, and Async depth.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || !username.trim()}
            className="w-full py-2.5 px-4 rounded bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50 font-sans"
          >
            {isLoading ? 'Running AST Profiler...' : 'Sign In & Profile GitHub →'}
          </button>
        </form>

        {/* Demo Accounts */}
        <div className="mt-6 pt-5 border-t border-zinc-800 space-y-2">
          <div className="text-[11px] uppercase tracking-wider text-zinc-500">
            Or select test profile:
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_USERS.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleSelectDemo(user.id)}
                disabled={isLoading}
                className="p-2 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors text-left text-[11px] cursor-pointer"
              >
                @{user.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
