import React, { useState } from 'react';
import { Sparkles, Loader2, User, ArrowRight, Code2, ShieldAlert, Cpu } from 'lucide-react';

interface HeroSearchProps {
  onSearch: (username: string) => void;
  isLoading: boolean;
  currentAgentPhase: string;
}

const DEMO_CHIPS = [
  { id: 'beginner-python-dev', label: 'Beginner Python', color: 'hover:border-amber-500/50 hover:bg-amber-500/10 text-amber-300' },
  { id: 'fullstack-js-dev', label: 'Full-Stack JS/TS', color: 'hover:border-sky-500/50 hover:bg-sky-500/10 text-sky-300' },
  { id: 'systems-go-dev', label: 'Systems Go/Rust', color: 'hover:border-cyan-500/50 hover:bg-cyan-500/10 text-cyan-300' },
  { id: 'torvalds', label: 'Linus Torvalds', color: 'hover:border-purple-500/50 hover:bg-purple-500/10 text-purple-300' },
];

export const HeroSearch: React.FC<HeroSearchProps> = ({
  onSearch,
  isLoading,
  currentAgentPhase,
}) => {
  const [inputVal, setInputVal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onSearch(inputVal.trim());
    }
  };

  const handleChipClick = (username: string) => {
    setInputVal(username);
    onSearch(username);
  };

  return (
    <div className="relative pt-8 pb-10 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-emerald-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[250px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto text-center px-4">
        {/* Pitch badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-medium text-emerald-400 mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Stop Getting Ignored by Dead Repositories • Get Matched By Real AST Skill Depth</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Autonomous Open-Source Matcher <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            & AI Onboarding Coach
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Analyzes your public code repositories using <strong>Abstract Syntax Tree (AST)</strong> depth profiling,
          evaluates repositories with the mathematically grounded <strong>Repository Welcomingness Index (RWI &ge; 0.60)</strong>,
          and generates step-by-step onboarding roadmaps with localized files and maintainer intro comments.
        </p>

        {/* Omni Search Box */}
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-4">
          <div className="relative flex items-center">
            <div className="absolute left-4 text-slate-400 pointer-events-none">
              <User className="w-5 h-5 text-slate-500" />
            </div>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Enter GitHub username (e.g. octocat, or pick a demo below)..."
              disabled={isLoading}
              className="w-full pl-12 pr-32 py-3.5 text-sm rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-xl transition-all font-mono"
            />
            <button
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="absolute right-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-semibold text-xs rounded-lg transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Profile AST</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Demo Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400 mb-6">
          <span className="text-slate-500 font-mono text-[11px] uppercase tracking-wider">Zero-Token Demos:</span>
          {DEMO_CHIPS.map((chip) => (
            <button
              key={chip.id}
              onClick={() => handleChipClick(chip.id)}
              disabled={isLoading}
              className={`px-3 py-1 rounded-lg border border-slate-800 bg-slate-900/60 font-mono text-xs transition-all cursor-pointer ${chip.color}`}
            >
              @{chip.label}
            </button>
          ))}
        </div>

        {/* Autonomous Agents Pipeline Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto text-left">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 mt-0.5">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">1. Profiler Agent</div>
              <div className="text-[11px] text-slate-400 leading-snug">AST profiling: Syntax, OOP, Async & Test depth</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 mt-0.5">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">2. Scout Agent</div>
              <div className="text-[11px] text-slate-400 leading-snug">RWI &ge; 0.60 Filter: PR merge rate & maintainer speed</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 mt-0.5">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">3. Coach Agent</div>
              <div className="text-[11px] text-slate-400 leading-snug">Groq LPU Localizer: Codebase fix & maintainer intro</div>
            </div>
          </div>
        </div>

        {/* Active agent status pill when loading */}
        {isLoading && (
          <div className="mt-4 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            <span>{currentAgentPhase || 'Deploying autonomous agents...'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
