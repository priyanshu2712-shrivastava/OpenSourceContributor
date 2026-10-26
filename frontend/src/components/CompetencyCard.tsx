import React from 'react';
import type { DeveloperProfile } from '../types';

interface CompetencyCardProps {
  profile: DeveloperProfile;
}

// Official GitHub Language Colors
const GITHUB_LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572a5',
  'C#': '#178600',
  'C++': '#f34b7d',
  C: '#555555',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Ruby: '#701516',
  PHP: '#4F5D95',
  'Jupyter Notebook': '#DA5B0B',
  Shell: '#89e051',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
  Dart: '#00B4AB',
  Vue: '#41b883',
  Markdown: '#083fa1',
  Dockerfile: '#384d54',
  Scala: '#c22d40',
  R: '#198CE7',
  Lua: '#000080',
  Perl: '#0298c3',
  Elixir: '#6e4a7e',
  Clojure: '#db5855',
  Haskell: '#5e5086',
};

const getLanguageColor = (lang: string): string => {
  if (GITHUB_LANG_COLORS[lang]) {
    return GITHUB_LANG_COLORS[lang];
  }
  // Case-insensitive fallback check
  const lower = lang.toLowerCase();
  for (const [key, val] of Object.entries(GITHUB_LANG_COLORS)) {
    if (key.toLowerCase() === lower) {
      return val;
    }
  }
  return '#10b981'; // default emerald
};

export const CompetencyCard: React.FC<CompetencyCardProps> = ({ profile }) => {
  const { ast_metrics, languages, preferred_issue_types, strengths } = profile;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
      {/* Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="w-14 h-14 rounded-full border border-zinc-700 object-cover"
          />
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-white tracking-tight">{profile.name || profile.username}</h2>
              <span className="text-xs font-mono text-zinc-400">@{profile.username}</span>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                Tier: {ast_metrics.tier}
              </span>
              {profile.is_demo && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500 border border-zinc-800">
                  Demo
                </span>
              )}
            </div>
            {profile.bio && <p className="text-xs text-zinc-400 mt-1 max-w-xl">{profile.bio}</p>}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
          <div>
            <div className="text-[10px] text-zinc-500 uppercase">Velocity</div>
            <div className="text-zinc-200 font-semibold">{profile.commit_velocity}</div>
          </div>
          <div className="w-px h-6 bg-zinc-800" />
          <div>
            <div className="text-[10px] text-zinc-500 uppercase">Analyzed Repos</div>
            <div className="text-zinc-200 font-semibold">{profile.analyzed_repo_count} public</div>
          </div>
        </div>
      </div>

      {/* Grid: AST Depth & Language Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: 4 Dimension AST Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-zinc-400">
              AST Code Depth Profiling
            </h3>
            <div className="text-xs font-mono text-zinc-300">
              Overall Complexity: <strong className="text-white text-sm">{ast_metrics.overall_complexity}</strong> / 10
            </div>
          </div>

          <div className="space-y-3 bg-zinc-900/60 p-4 rounded-lg border border-zinc-800 font-mono text-xs">
            {/* Level 1: Syntax & Flow */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-zinc-300">Level 1: Syntax, Control Flow & Procedural</span>
                <span className="text-zinc-400">{ast_metrics.syntax_score} / 10</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-zinc-300"
                  style={{ width: `${(ast_metrics.syntax_score / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Level 2: OOP & Modularity */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-zinc-300">Level 2: OOP, Class Design & Modularity</span>
                <span className="text-zinc-400">{ast_metrics.oop_score} / 10</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-zinc-300"
                  style={{ width: `${(ast_metrics.oop_score / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Level 3: Concurrency */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-zinc-300">Level 3: Concurrency & Async Flow Control</span>
                <span className="text-zinc-400">{ast_metrics.async_score} / 10</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-zinc-300"
                  style={{ width: `${(ast_metrics.async_score / 10) * 100}%` }}
                />
              </div>
            </div>

            {/* Level 3: Unit Testing */}
            <div>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-zinc-300">Level 3: Automated Unit Testing & Invariants</span>
                <span className="text-zinc-400">{ast_metrics.testing_score} / 10</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-zinc-300"
                  style={{ width: `${(ast_metrics.testing_score / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Detected Features */}
          <div>
            <div className="text-[11px] font-mono text-zinc-500 mb-2">Detected AST Code Idioms:</div>
            <div className="flex flex-wrap gap-1.5">
              {ast_metrics.detected_features.map((feature, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Languages & Strengths */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs uppercase font-mono font-bold tracking-wider text-zinc-400">
            Language Distribution
          </h3>

          <div className="bg-zinc-900/60 p-4 rounded-lg border border-zinc-800 space-y-3 font-mono text-xs">
            {/* Multi-segment official GitHub colored bar */}
            <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-zinc-800 gap-[1px]">
              {languages.map((l) => (
                <div
                  key={l.language}
                  title={`${l.language}: ${l.percentage}%`}
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${l.percentage}%`,
                    backgroundColor: getLanguageColor(l.language),
                  }}
                />
              ))}
            </div>

            {/* Language Breakdown with official GitHub dots */}
            <div className="space-y-2 text-xs pt-1">
              {languages.map((l) => {
                const color = getLanguageColor(l.language);
                return (
                  <div key={l.language} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-sm"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-zinc-200 font-medium">{l.language}</span>
                    </div>
                    <span className="text-zinc-400 font-mono text-[11px]">{l.percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verified Strengths */}
          <div className="space-y-3">
            <div>
              <div className="text-[11px] font-mono text-zinc-500 mb-1.5">Verified Strengths:</div>
              <div className="flex flex-wrap gap-1.5">
                {strengths.map((s, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-mono text-zinc-500 mb-1.5">Target Issue Types:</div>
              <div className="flex flex-wrap gap-1.5">
                {preferred_issue_types.map((type, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800"
                  >
                    #{type}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
