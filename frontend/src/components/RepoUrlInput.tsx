import React, { useState } from 'react';

interface RepoUrlInputProps {
  onAnalyzeRepo: (repoUrl: string) => void;
  isLoading: boolean;
}

const POPULAR_REPOS = [
  { name: 'pallets/flask', lang: 'Python', url: 'https://github.com/pallets/flask' },
  { name: 'tiangolo/fastapi', lang: 'Python', url: 'https://github.com/tiangolo/fastapi' },
  { name: 'axios/axios', lang: 'JavaScript', url: 'https://github.com/axios/axios' },
  { name: 'TanStack/query', lang: 'TypeScript', url: 'https://github.com/TanStack/query' },
  { name: 'pandas-dev/pandas', lang: 'Python', url: 'https://github.com/pandas-dev/pandas' },
  { name: 'gin-gonic/gin', lang: 'Go', url: 'https://github.com/gin-gonic/gin' },
];

export const RepoUrlInput: React.FC<RepoUrlInputProps> = ({
  onAnalyzeRepo,
  isLoading,
}) => {
  const [repoInput, setRepoInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoInput.trim()) {
      onAnalyzeRepo(repoInput.trim());
    }
  };

  const handleSelectQuickRepo = (url: string) => {
    setRepoInput(url);
    onAnalyzeRepo(url);
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
            Target Open-Source Repository Matcher
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Paste any public GitHub repository link to compute its Welcomingness Index (RWI &ge; 0.60) and extract issues ranked for your skills.
          </p>
        </div>
      </div>

      {/* Target Repo Input Form */}
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <input
            type="text"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            placeholder="e.g. pallets/flask or https://github.com/facebook/react..."
            disabled={isLoading}
            className="w-full px-4 py-3 text-xs sm:text-sm rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500 font-mono"
          />
          <button
            type="submit"
            disabled={isLoading || !repoInput.trim()}
            className="absolute right-1.5 px-4 py-2 bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded-md transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Scouting...' : 'Analyze & Match'}
          </button>
        </div>
      </form>

      {/* Quick Select Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
        <span className="text-zinc-500 text-[11px] uppercase tracking-wider">Quick picks:</span>
        {POPULAR_REPOS.map((r) => (
          <button
            key={r.name}
            type="button"
            onClick={() => handleSelectQuickRepo(r.url)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors cursor-pointer text-[11px]"
          >
            {r.name} <span className="text-zinc-500">({r.lang})</span>
          </button>
        ))}
      </div>
    </div>
  );
};
