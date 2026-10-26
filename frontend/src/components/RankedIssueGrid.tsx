import React, { useState } from 'react';
import type { TargetRepoMatchResponse, MatchedIssue } from '../types';
import { IssueCard } from './IssueCard';

interface RankedIssueGridProps {
  repoData: TargetRepoMatchResponse;
  onDeployCoach: (issue: MatchedIssue) => void;
  isCoaching: boolean;
  activeIssueId?: string;
}

export const RankedIssueGrid: React.FC<RankedIssueGridProps> = ({
  repoData,
  onDeployCoach,
  isCoaching,
  activeIssueId,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');
  const [showFormula, setShowFormula] = useState(false);

  const { categorized_issues, welcoming_score } = repoData;

  const getIssuesForTab = (): MatchedIssue[] => {
    switch (activeTab) {
      case 'easy':
        return categorized_issues.easy;
      case 'medium':
        return categorized_issues.medium;
      case 'hard':
        return categorized_issues.hard;
      default:
        return [
          ...categorized_issues.easy,
          ...categorized_issues.medium,
          ...categorized_issues.hard,
        ];
    }
  };

  const displayedIssues = getIssuesForTab();

  return (
    <div className="space-y-6">
      {/* Target Repo Header */}
      <div className="p-5 rounded-xl bg-zinc-950 border border-zinc-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <a
                href={repoData.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-bold text-white hover:underline font-mono"
              >
                {repoData.repo_name}
              </a>
              <span className="px-2 py-0.5 rounded bg-zinc-900 text-xs font-mono text-zinc-400 border border-zinc-800">
                {repoData.language}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 text-xs font-mono font-semibold border border-emerald-800/40">
                {repoData.total_issues} Matched Problems
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">{repoData.match_summary}</p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
            <span>{repoData.repo_stars.toLocaleString()} stars</span>
            <span>•</span>
            <span>{repoData.repo_forks.toLocaleString()} forks</span>
          </div>
        </div>

        {/* Welcoming Index Banner */}
        <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-zinc-400">Repository Welcomingness (RWI):</span>
              <span className="text-emerald-400 font-bold">
                {Math.round(welcoming_score.overall_rwi * 100)}% Welcoming
              </span>
              <span className="text-zinc-500 text-[11px]">
                (Response: {welcoming_score.response_speed_human})
              </span>
            </div>

            <button
              onClick={() => setShowFormula(!showFormula)}
              className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer font-mono underline underline-offset-4"
            >
              {showFormula ? 'Hide RWI calculation' : 'View RWI calculation'}
            </button>
          </div>

          {showFormula && (
            <div className="pt-2 border-t border-zinc-800 space-y-2 text-[11px] font-mono text-zinc-400">
              <div className="p-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-300 break-all">
                RWI = 0.35&times;({welcoming_score.pr_merge_rate}) + 0.30&times;({welcoming_score.maintainer_response_speed_score}) + 0.20&times;({(welcoming_score.documentation_score / 0.2).toFixed(1)}) - 0.15&times;({welcoming_score.stale_issue_ratio}) = {welcoming_score.overall_rwi}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-zinc-500 text-[10px]">
                <div>Merge Rate: <span className="text-zinc-300 font-bold">{Math.round(welcoming_score.pr_merge_rate * 100)}%</span></div>
                <div>Maintainer Speed: <span className="text-zinc-300 font-bold">{Math.round(welcoming_score.maintainer_response_speed_score * 100)}%</span></div>
                <div>Docs Score: <span className="text-zinc-300 font-bold">{welcoming_score.documentation_score}</span></div>
                <div className="text-rose-400">Stale Ratio: <span>{welcoming_score.stale_issue_ratio}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Categorized Tabs: All / Easy / Medium / Hard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800">
        <h4 className="text-sm font-bold uppercase font-mono tracking-wider text-white">
          Ranked Problems
        </h4>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All ({repoData.total_issues})
          </button>
          <button
            onClick={() => setActiveTab('easy')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'easy'
                ? 'bg-zinc-800 text-emerald-400 font-semibold'
                : 'text-zinc-400 hover:text-emerald-400'
            }`}
          >
            Easy ({categorized_issues.easy.length})
          </button>
          <button
            onClick={() => setActiveTab('medium')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'medium'
                ? 'bg-zinc-800 text-zinc-200 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Medium ({categorized_issues.medium.length})
          </button>
          <button
            onClick={() => setActiveTab('hard')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'hard'
                ? 'bg-zinc-800 text-purple-300 font-semibold'
                : 'text-zinc-400 hover:text-purple-300'
            }`}
          >
            Hard ({categorized_issues.hard.length})
          </button>
        </div>
      </div>

      {/* Issues Grid */}
      {displayedIssues.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedIssues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onSelectCoach={onDeployCoach}
              isCoaching={isCoaching && activeIssueId === issue.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-zinc-950 border border-zinc-800 rounded-xl p-8 space-y-2 font-mono">
          <h4 className="text-sm font-bold text-zinc-300">No issues found in this difficulty tier</h4>
          <p className="text-xs text-zinc-500">
            Switch to 'All' or explore another difficulty tab.
          </p>
        </div>
      )}
    </div>
  );
};
