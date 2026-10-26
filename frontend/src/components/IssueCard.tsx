import React from 'react';
import type { MatchedIssue } from '../types';

interface IssueCardProps {
  issue: MatchedIssue;
  onSelectCoach: (issue: MatchedIssue) => void;
  isCoaching: boolean;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onSelectCoach,
  isCoaching,
}) => {
  const getDifficultyPill = (diff: string) => {
    switch (diff) {
      case 'Advanced':
        return 'bg-purple-950/40 text-purple-300 border-purple-800/40';
      case 'Intermediate':
        return 'bg-zinc-800 text-zinc-300 border-zinc-700';
      default:
        return 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40';
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 shadow-sm transition-colors flex flex-col justify-between group">
      <div className="space-y-3">
        {/* Repo & Difficulty */}
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400 font-semibold">{issue.repo_name}</span>
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getDifficultyPill(issue.difficulty)}`}>
            {issue.difficulty === 'Beginner' ? 'Easy' : issue.difficulty === 'Intermediate' ? 'Medium' : 'Hard'}
          </span>
        </div>

        {/* Issue Title */}
        <h3 className="text-sm font-semibold text-white group-hover:text-zinc-200 transition-colors leading-snug">
          <a href={issue.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {issue.title}
          </a>
        </h3>

        {/* Labels & Est Time */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono text-zinc-400">
          <span className="text-zinc-500">{issue.estimated_hours}</span>
          <span>•</span>
          <span className="text-emerald-400 font-semibold">{Math.round(issue.match_score * 100)}% Match</span>
          {issue.labels.slice(0, 2).map((l, idx) => (
            <span
              key={idx}
              className="px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800 text-[10px]"
            >
              #{l}
            </span>
          ))}
        </div>

        {/* Snippet */}
        {issue.body_snippet && (
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {issue.body_snippet}
          </p>
        )}
      </div>

      {/* Card Action */}
      <div className="pt-4 mt-2 border-t border-zinc-900">
        <button
          onClick={() => onSelectCoach(issue)}
          disabled={isCoaching}
          className="w-full py-2 px-3 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-white font-mono text-xs transition-colors cursor-pointer disabled:opacity-50 text-center"
        >
          {isCoaching ? 'Analyzing Issue...' : 'View Fix & Onboarding Roadmap →'}
        </button>
      </div>
    </div>
  );
};
