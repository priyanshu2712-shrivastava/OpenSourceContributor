import type {
  DeveloperProfile,
  MatchedIssue,
  CoachResponse,
  TargetRepoMatchResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${String(import.meta.env.VITE_API_URL).replace(/\/$/, '')}/api`
  : '/api';

export const getStoredKeys = () => {
  return {
    githubToken: localStorage.getItem('oss_coach_github_token') || '',
    groqApiKey: localStorage.getItem('oss_coach_groq_key') || '',
  };
};

export const setStoredKeys = (githubToken: string, groqApiKey: string) => {
  localStorage.setItem('oss_coach_github_token', githubToken.trim());
  localStorage.setItem('oss_coach_groq_key', groqApiKey.trim());
};

export const getStoredUser = (): DeveloperProfile | null => {
  const data = localStorage.getItem('oss_coach_active_user');
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return null;
};

export const setStoredUser = (profile: DeveloperProfile | null) => {
  if (profile) {
    localStorage.setItem('oss_coach_active_user', JSON.stringify(profile));
  } else {
    localStorage.removeItem('oss_coach_active_user');
  }
};

const getHeaders = () => {
  const { githubToken, groqApiKey } = getStoredKeys();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (githubToken) {
    headers['X-GitHub-Token'] = githubToken;
  }
  if (groqApiKey) {
    headers['X-Groq-Key'] = groqApiKey;
  }
  return headers;
};

export const fetchDemoProfiles = async (): Promise<Record<string, DeveloperProfile>> => {
  const res = await fetch(`${API_BASE}/demo/profiles`);
  if (!res.ok) {
    throw new Error('Failed to load demo profiles');
  }
  return res.json();
};

export const loginUser = async (username: string): Promise<DeveloperProfile> => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ username }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Authentication failed with status ${res.status}`);
  }

  const data = await res.json();
  setStoredUser(data.profile);
  return data.profile;
};

export const analyzeDeveloperProfile = async (
  username: string,
  useCached: boolean = true
): Promise<DeveloperProfile> => {
  const res = await fetch(`${API_BASE}/profile/analyze`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ username, use_cached: useCached }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Analysis failed with status ${res.status}`);
  }

  return res.json();
};

export const analyzeTargetRepo = async (
  username: string,
  repoUrl: string,
  difficultyFilter: string = 'all'
): Promise<TargetRepoMatchResponse> => {
  const res = await fetch(`${API_BASE}/repo/analyze-and-match`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      username,
      repo_url: repoUrl,
      difficulty_filter: difficultyFilter,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Analyzing target repository failed (${res.status})`);
  }

  return res.json();
};

export const matchIssuesForDeveloper = async (
  username?: string,
  languages?: string[],
  difficulty: string = 'all',
  limit: number = 6
): Promise<MatchedIssue[]> => {
  const res = await fetch(`${API_BASE}/issues/match`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      username,
      languages,
      difficulty,
      limit,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Matching issues failed with status ${res.status}`);
  }

  return res.json();
};

export const getCoachRoadmap = async (
  issueUrl: string,
  developerLevel: string = 'intermediate',
  username?: string,
  issueTitle?: string,
  issueBody?: string,
  repoName?: string
): Promise<CoachResponse> => {
  const res = await fetch(`${API_BASE}/issues/coach`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      issue_url: issueUrl,
      developer_level: developerLevel,
      username,
      issue_title: issueTitle,
      issue_body: issueBody,
      repo_name: repoName,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Coach agent failed with status ${res.status}`);
  }

  return res.json();
};
