import React from 'react';

interface LandingPageProps {
  onOpenLogin: () => void;
  onExploreDemo: (demoUser: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onOpenLogin,
  onExploreDemo,
}) => {
  return (
    <div className="space-y-20 py-12 max-w-5xl mx-auto px-4">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>PRECISION OPEN-SOURCE MATCHING & ONBOARDING</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white max-w-3xl mx-auto leading-tight">
          Analyze Any Repository. <br />
          <span className="text-zinc-400">Match Real Issues. Ship Code.</span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Over 80% of developers quit open-source due to dead repositories and mismatched issue difficulty.
          Our autonomous AI agents profile your actual code depth via Abstract Syntax Tree (AST) analysis,
          evaluate repository health (RWI &ge; 0.60), and generate step-by-step fix roadmaps.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onOpenLogin}
            className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-white hover:bg-zinc-200 text-black font-semibold text-xs transition-colors cursor-pointer"
          >
            Get Started with GitHub
          </button>
          <button
            onClick={() => onExploreDemo('beginner-python-dev')}
            className="w-full sm:w-auto px-6 py-2.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium text-xs transition-colors cursor-pointer"
          >
            Explore Live Demo Viva
          </button>
        </div>

        {/* Demo shortcuts */}
        <div className="flex items-center justify-center gap-2 text-xs text-zinc-500 font-mono pt-2">
          <span>Quick profiles:</span>
          <button
            onClick={() => onExploreDemo('beginner-python-dev')}
            className="text-zinc-400 hover:text-white underline underline-offset-4 cursor-pointer"
          >
            @beginner-python-dev
          </button>
          <span>•</span>
          <button
            onClick={() => onExploreDemo('fullstack-js-dev')}
            className="text-zinc-400 hover:text-white underline underline-offset-4 cursor-pointer"
          >
            @fullstack-js-dev
          </button>
          <span>•</span>
          <button
            onClick={() => onExploreDemo('systems-go-dev')}
            className="text-zinc-400 hover:text-white underline underline-offset-4 cursor-pointer"
          >
            @systems-go-dev
          </button>
        </div>
      </section>

      {/* Code / Workspace Preview (BuildIT-Style Distraction-Free Terminal/Code Mockup) */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-950/80 overflow-hidden shadow-2xl">
        <div className="px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-xs font-mono text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block"></span>
            <span className="ml-2 text-zinc-300">workspace // pallets/flask/issues/5421</span>
          </div>
          <span className="text-[11px] text-emerald-400">✓ RWI: 0.89 (Highly Welcoming)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800 font-mono text-xs">
          {/* Left Pane: Problem Context */}
          <div className="p-5 space-y-3 bg-[#0a0a0c]">
            <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Target Problem</div>
            <div className="text-zinc-200 font-semibold text-sm">
              Add helper method to inspect JSON request payload without raising BadRequest
            </div>
            <div className="text-zinc-400 leading-relaxed text-[11px]">
              Callers need a way to inspect raw JSON data without triggering unhandled abort(400) when headers are missing.
            </div>
            <div className="pt-2 text-[11px] text-zinc-500 space-y-1">
              <div>Target File: <span className="text-zinc-300">src/flask/wrappers.py</span></div>
              <div>Target Symbol: <span className="text-zinc-300">Request.get_json</span></div>
              <div>Difficulty: <span className="text-emerald-400">Easy / Beginner Friendly</span></div>
            </div>
          </div>

          {/* Right Pane: AI Coach Localization & Fix Blueprint */}
          <div className="p-5 space-y-3 bg-[#060608]">
            <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 flex items-center justify-between">
              <span>Coach Agent Blueprint</span>
              <span className="text-zinc-500">Groq LPU Engine</span>
            </div>
            <div className="rounded bg-zinc-900 p-3 text-[11px] text-zinc-300 space-y-1 overflow-x-auto border border-zinc-800">
              <div className="text-zinc-500"># src/flask/wrappers.py: add defensive parameter</div>
              <div className="text-zinc-200">def get_json(self, force=False, <span className="text-emerald-400">silent=False</span>):</div>
              <div className="pl-4 text-zinc-400">if not (force or self.is_json):</div>
              <div className="pl-8 text-emerald-400">if silent: return None</div>
              <div className="pl-8 text-zinc-400">raise UnsupportedMediaType()</div>
            </div>
            <div className="text-[11px] text-zinc-500">
              Reproduction command: <code className="text-zinc-300">pytest tests/test_request.py -k test_get_json</code>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Autonomous Agents Capabilities Grid */}
      <section className="space-y-6">
        <div className="border-b border-zinc-800 pb-3">
          <h2 className="text-xs uppercase font-mono font-bold tracking-wider text-zinc-400">
            System Architecture
          </h2>
          <p className="text-lg font-bold text-white">Three Specialized Autonomous Agents</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Agent 1 */}
          <div className="p-5 rounded-lg border border-zinc-800 bg-zinc-950 space-y-2.5">
            <div className="text-[10px] font-mono text-zinc-500">AGENT 01</div>
            <h3 className="text-sm font-bold text-white">AST Developer Profiler</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Parses your public code trees. Quantifies real technical depth across Syntax (Level 1), OOP & modularity (Level 2), and Async concurrency & testing (Level 3).
            </p>
          </div>

          {/* Agent 2 */}
          <div className="p-5 rounded-lg border border-zinc-800 bg-zinc-950 space-y-2.5">
            <div className="text-[10px] font-mono text-zinc-500">AGENT 02</div>
            <h3 className="text-sm font-bold text-white">Welcomingness Scout (RWI)</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Calculates the Repository Welcomingness Index: PR merge rates, maintainer response speed, and stale issue ratios. Automatically discards projects with RWI &lt; 0.60.
            </p>
          </div>

          {/* Agent 3 */}
          <div className="p-5 rounded-lg border border-zinc-800 bg-zinc-950 space-y-2.5">
            <div className="text-[10px] font-mono text-zinc-500">AGENT 03</div>
            <h3 className="text-sm font-bold text-white">Codebase Onboarding Coach</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Powered by Groq AI. Reads the repo's README, locates target source files, provides an exact code diff fix, and drafts a polite maintainer assignment request.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Steps */}
      <section className="border-t border-zinc-800 pt-10 space-y-6">
        <div className="text-xs uppercase font-mono font-bold tracking-wider text-zinc-400">
          User Flow
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-xs">
          <div className="space-y-1.5">
            <div className="text-zinc-500">01 / AUTHENTICATE</div>
            <div className="font-bold text-white">Sign In with GitHub</div>
            <div className="text-zinc-400 font-sans text-xs">
              Agent 1 evaluates your public repositories and generates your competency profile.
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="text-zinc-500">02 / TARGET REPO</div>
            <div className="font-bold text-white">Paste Any Project Link</div>
            <div className="text-zinc-400 font-sans text-xs">
              Agent 2 evaluates the repo health (RWI) and ranks open issues into Easy, Medium, and Hard.
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="text-zinc-500">03 / EXECUTE FIX</div>
            <div className="font-bold text-white">Get AI Onboarding Coach</div>
            <div className="text-zinc-400 font-sans text-xs">
              Agent 3 gives exact file locations, code diff snippets, and a ready-to-paste maintainer comment.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
