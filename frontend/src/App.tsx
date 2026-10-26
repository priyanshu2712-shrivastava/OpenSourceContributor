import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { CompetencyCard } from './components/CompetencyCard';
import { RepoUrlInput } from './components/RepoUrlInput';
import { RankedIssueGrid } from './components/RankedIssueGrid';
import { CoachDrawer } from './components/CoachDrawer';
import { LoginModal } from './components/LoginModal';
import {
  loginUser,
  analyzeTargetRepo,
  getCoachRoadmap,
  getStoredUser,
  setStoredUser,
} from './services/api';
import type {
  DeveloperProfile,
  MatchedIssue,
  CoachResponse,
  TargetRepoMatchResponse,
} from './types';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
  const [user, setUser] = useState<DeveloperProfile | null>(null);

  // Target Repository Analysis Data
  const [targetRepoData, setTargetRepoData] = useState<TargetRepoMatchResponse | null>(null);

  // Coach Data
  const [selectedIssue, setSelectedIssue] = useState<MatchedIssue | null>(null);
  const [coachData, setCoachData] = useState<CoachResponse | null>(null);

  // Loading States
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isScoutingRepo, setIsScoutingRepo] = useState(false);
  const [isCoaching, setIsCoaching] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  // Check stored active user on mount
  useEffect(() => {
    const existingUser = getStoredUser();
    if (existingUser) {
      setUser(existingUser);
      setCurrentView('dashboard');
      loadInitialTargetRepo(existingUser.username, 'pallets/flask');
    }
  }, []);

  const loadInitialTargetRepo = async (username: string, repoUrl: string) => {
    try {
      setIsScoutingRepo(true);
      const res = await analyzeTargetRepo(username, repoUrl);
      setTargetRepoData(res);
    } catch (err: any) {
      console.error('Initial repo match notice:', err);
    } finally {
      setIsScoutingRepo(false);
    }
  };

  const handleLogin = async (username: string) => {
    setIsLoggingIn(true);
    setErrorMsg(null);
    try {
      const prof = await loginUser(username);
      setUser(prof);
      setCurrentView('dashboard');
      await loadInitialTargetRepo(prof.username, 'pallets/flask');
    } catch (err: any) {
      console.error(err);
      throw err;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setStoredUser(null);
    setTargetRepoData(null);
    setCurrentView('landing');
  };

  const handleAnalyzeTargetRepo = async (repoUrl: string) => {
    if (!repoUrl.trim()) return;
    const currentUsername = user?.username || 'beginner-python-dev';
    setIsScoutingRepo(true);
    setErrorMsg(null);

    try {
      const res = await analyzeTargetRepo(currentUsername, repoUrl);
      setTargetRepoData(res);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to analyze target repository. Please verify URL.');
    } finally {
      setIsScoutingRepo(false);
    }
  };

  const handleDeployCoach = async (issue: MatchedIssue) => {
    setSelectedIssue(issue);
    setIsCoachOpen(true);
    setIsCoaching(true);
    setCoachData(null);

    try {
      const devLevel = user?.ast_metrics.tier.toLowerCase() || 'intermediate';
      const roadmap = await getCoachRoadmap(
        issue.url,
        devLevel,
        user?.username,
        issue.title,
        issue.body_snippet,
        issue.repo_name
      );
      setCoachData(roadmap);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to generate coach roadmap.');
    } finally {
      setIsCoaching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenLogin={() => setIsLoginOpen(true)}
        onSignOut={handleSignOut}
        user={user}
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
      />

      {/* Global Error Notification */}
      {errorMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
          <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-mono flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-zinc-400 hover:text-white text-xs cursor-pointer ml-4"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {currentView === 'landing' ? (
          <LandingPage
            onOpenLogin={() => setIsLoginOpen(true)}
            onExploreDemo={handleLogin}
          />
        ) : (
          <div className="pt-8 space-y-8 animate-in fade-in duration-200">
            {/* Developer Competency Card */}
            {user && (
              <section>
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
                  Verified Code Competency Profile
                </div>
                <CompetencyCard profile={user} />
              </section>
            )}

            {/* Target Open-Source Project URL Input Box */}
            <section>
              <RepoUrlInput
                onAnalyzeRepo={handleAnalyzeTargetRepo}
                isLoading={isScoutingRepo}
              />
            </section>

            {/* Scouting Indicator */}
            {isScoutingRepo && (
              <div className="p-8 rounded-xl bg-zinc-950 border border-zinc-800 text-center space-y-2 font-mono">
                <div className="text-sm text-zinc-200 font-semibold">
                  Scouting repository & evaluating Welcomingness Index (RWI)...
                </div>
                <p className="text-xs text-zinc-500">
                  Inspecting PR merge rates, maintainer response speed, and categorizing problems into Easy, Medium, and Hard
                </p>
              </div>
            )}

            {/* Ranked Issues Grid for Target Repo */}
            {targetRepoData && !isScoutingRepo && (
              <section className="animate-in fade-in duration-200">
                <RankedIssueGrid
                  repoData={targetRepoData}
                  onDeployCoach={handleDeployCoach}
                  isCoaching={isCoaching}
                  activeIssueId={selectedIssue?.id}
                />
              </section>
            )}
          </div>
        )}
      </main>

      {/* Interactive Coach Drawer */}
      <CoachDrawer
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        coachData={coachData}
        issue={selectedIssue}
        isLoading={isCoaching}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={handleLogin}
        isLoading={isLoggingIn}
      />

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-[#060608] py-8 text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>BUILDIT OSS MATCH // AST Code Profiling & Groq AI Engine</span>
          </div>
          <div className="text-zinc-600 text-[11px]">
            RWI Formula: 0.35&times;Merge + 0.30&times;Speed + 0.20&times;Docs - 0.15&times;Stale
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
