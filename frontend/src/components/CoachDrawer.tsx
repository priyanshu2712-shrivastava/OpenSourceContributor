import React, { useState } from 'react';
import type { CoachResponse, MatchedIssue } from '../types';

interface CoachDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  coachData: CoachResponse | null;
  issue?: MatchedIssue | null;
  isLoading: boolean;
}

export const CoachDrawer: React.FC<CoachDrawerProps> = ({
  isOpen,
  onClose,
  coachData,
  isLoading,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [copiedComment, setCopiedComment] = useState(false);
  const [copiedRoadmap, setCopiedRoadmap] = useState(false);

  if (!isOpen) return null;

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepNumber]: !prev[stepNumber],
    }));
  };

  const handleCopyComment = () => {
    if (coachData?.drafted_maintainer_comment) {
      navigator.clipboard.writeText(coachData.drafted_maintainer_comment);
      setCopiedComment(true);
      setTimeout(() => setCopiedComment(false), 2000);
    }
  };

  const handleCopyRoadmapMarkdown = () => {
    if (!coachData) return;
    let md = `# Open-Source Onboarding Roadmap: ${coachData.issue_title}\n\n`;
    md += `**Repository:** ${coachData.repo_name}\n`;
    md += `**Issue URL:** ${coachData.issue_url}\n`;
    md += `**Engine:** ${coachData.engine_used}\n\n`;
    md += `## Summary\n${coachData.plain_english_summary}\n\n`;
    md += `## Localized Files\n`;
    coachData.localized_files.forEach((f) => {
      md += `- \`${f.path}\` (Target: \`${f.probable_function_or_class}\`, Confidence: ${Math.round(f.confidence * 100)}%)\n  *Reason:* ${f.reason}\n`;
    });
    md += `\n## Step-by-Step Fix Roadmap\n`;
    coachData.roadmap.forEach((s) => {
      md += `### Step ${s.step_number}: ${s.title} (${s.phase})\n`;
      md += `${s.instructions}\n\n`;
      if (s.shell_command) {
        md += "```bash\n" + s.shell_command + "\n```\n\n";
      }
      if (s.code_snippet) {
        md += "```\n" + s.code_snippet + "\n```\n\n";
      }
    });
    md += `## Drafted Maintainer Assignment Comment\n\`\`\`markdown\n${coachData.drafted_maintainer_comment}\n\`\`\`\n`;

    navigator.clipboard.writeText(md);
    setCopiedRoadmap(true);
    setTimeout(() => setCopiedRoadmap(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    if (!coachData) return;
    let md = `# Open-Source Onboarding Roadmap: ${coachData.issue_title}\n\n`;
    md += `**Repository:** ${coachData.repo_name}\n`;
    md += `**Issue URL:** ${coachData.issue_url}\n`;
    md += `**Engine:** ${coachData.engine_used}\n\n`;
    md += `## Summary\n${coachData.plain_english_summary}\n\n`;
    md += `## Localized Files\n`;
    coachData.localized_files.forEach((f) => {
      md += `- \`${f.path}\` (Target: \`${f.probable_function_or_class}\`, Confidence: ${Math.round(f.confidence * 100)}%)\n  *Reason:* ${f.reason}\n`;
    });
    md += `\n## Step-by-Step Fix Roadmap\n`;
    coachData.roadmap.forEach((s) => {
      md += `### Step ${s.step_number}: ${s.title} (${s.phase})\n`;
      md += `${s.instructions}\n\n`;
      if (s.shell_command) {
        md += "```bash\n" + s.shell_command + "\n```\n\n";
      }
      if (s.code_snippet) {
        md += "```\n" + s.code_snippet + "\n```\n\n";
      }
    });
    md += `## Drafted Maintainer Assignment Comment\n\`\`\`markdown\n${coachData.drafted_maintainer_comment}\n\`\`\`\n`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Onboarding_Roadmap_${coachData.repo_name.replace('/', '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-[#09090b] border-l border-zinc-800 shadow-2xl h-full flex flex-col overflow-hidden">
        {/* Drawer Header */}
        <div className="px-6 py-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white uppercase tracking-wider">Coach Agent // Fix Blueprint</span>
            {coachData && (
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px]">
                {coachData.engine_used}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyRoadmapMarkdown}
              className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors cursor-pointer text-xs"
            >
              {copiedRoadmap ? 'Copied MD!' : 'Copy MD'}
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 transition-colors cursor-pointer text-xs"
            >
              Export
            </button>
            <button
              onClick={onClose}
              className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-xs">
          {isLoading ? (
            <div className="py-24 text-center space-y-3 font-mono">
              <div className="text-zinc-300 font-semibold">Running Agent 3: Localizing codebase & generating roadmap...</div>
              <p className="text-[11px] text-zinc-500">
                Inspecting repository README, AST directory tree, and issue stack traces via Groq AI
              </p>
            </div>
          ) : coachData ? (
            <>
              {/* Problem Context */}
              <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Repository: <strong className="text-zinc-300">{coachData.repo_name}</strong></span>
                  <a
                    href={coachData.issue_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:underline"
                  >
                    Open on GitHub ↗
                  </a>
                </div>
                <h3 className="text-sm font-bold text-white font-sans">{coachData.issue_title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans bg-zinc-900 p-3 rounded border border-zinc-800">
                  {coachData.plain_english_summary}
                </p>
              </div>

              {/* Localized Files */}
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  Target Codebase Localization
                </div>

                <div className="space-y-2">
                  {coachData.localized_files.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 font-bold">{file.path}</span>
                        <span className="text-[10px] text-zinc-500">
                          {Math.round(file.confidence * 100)}% match
                        </span>
                      </div>
                      <div className="text-zinc-300 text-[11px]">
                        Target symbol: <code className="text-white bg-zinc-900 px-1 rounded">{file.probable_function_or_class}</code>
                      </div>
                      <div className="text-zinc-500 text-[11px] font-sans">{file.reason}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Roadmap */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  <span>Step-by-Step Fix Blueprint</span>
                  <span className="font-normal">
                    {Object.values(completedSteps).filter(Boolean).length} / {coachData.roadmap.length} completed
                  </span>
                </div>

                <div className="space-y-3">
                  {coachData.roadmap.map((step) => {
                    const isDone = completedSteps[step.step_number];
                    return (
                      <div
                        key={step.step_number}
                        className={`p-4 rounded-lg border transition-colors ${
                          isDone
                            ? 'bg-zinc-950/40 border-zinc-900 opacity-60'
                            : 'bg-zinc-950 border-zinc-800'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={Boolean(isDone)}
                            onChange={() => toggleStep(step.step_number)}
                            className="mt-1 rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-0 cursor-pointer"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <h5 className={`text-xs font-bold ${isDone ? 'line-through text-zinc-500' : 'text-white'}`}>
                                Step {step.step_number}: {step.title}
                              </h5>
                              <span className="text-[10px] uppercase text-zinc-500">
                                {step.phase}
                              </span>
                            </div>

                            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                              {step.instructions}
                            </p>

                            {step.shell_command && (
                              <div className="mt-2 rounded bg-zinc-900 p-2.5 border border-zinc-800 relative text-zinc-300 text-[11px] font-mono">
                                <pre className="overflow-x-auto whitespace-pre-wrap">{step.shell_command}</pre>
                                <button
                                  onClick={() => navigator.clipboard.writeText(step.shell_command || '')}
                                  className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer text-[10px]"
                                >
                                  Copy
                                </button>
                              </div>
                            )}

                            {step.code_snippet && (
                              <div className="mt-2 rounded bg-zinc-900 p-2.5 border border-zinc-800 relative text-emerald-300 text-[11px] font-mono">
                                <pre className="overflow-x-auto whitespace-pre-wrap">{step.code_snippet}</pre>
                                <button
                                  onClick={() => navigator.clipboard.writeText(step.code_snippet || '')}
                                  className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer text-[10px]"
                                >
                                  Copy
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Maintainer Assignment Comment */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                  <span>Drafted Maintainer Intro Comment</span>
                  <button
                    onClick={handleCopyComment}
                    className="px-2.5 py-1 rounded bg-white hover:bg-zinc-200 text-black font-semibold transition-colors cursor-pointer text-[11px]"
                  >
                    {copiedComment ? 'Copied!' : 'Copy Comment'}
                  </button>
                </div>

                <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs whitespace-pre-wrap font-sans">
                  {coachData.drafted_maintainer_comment}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
