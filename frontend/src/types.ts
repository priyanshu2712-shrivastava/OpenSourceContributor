export interface AstMetrics {
  syntax_score: number;
  oop_score: number;
  async_score: number;
  testing_score: number;
  overall_complexity: number;
  tier: 'Beginner' | 'Intermediate' | 'Advanced';
  detected_features: string[];
}

export interface LanguageStat {
  language: string;
  percentage: number;
  bytes: number;
}

export interface DeveloperProfile {
  username: string;
  name?: string;
  avatar_url: string;
  bio?: string;
  public_repos: number;
  followers: number;
  languages: LanguageStat[];
  ast_metrics: AstMetrics;
  preferred_issue_types: string[];
  strengths: string[];
  commit_velocity: string;
  analyzed_repo_count: number;
  is_demo: boolean;
}

export interface RepositoryWelcomingScore {
  overall_rwi: number;
  pr_merge_rate: number;
  maintainer_response_speed_score: number;
  response_speed_human: string;
  documentation_score: number;
  has_contributing_guide: boolean;
  has_issue_templates: boolean;
  stale_issue_ratio: number;
  is_welcoming: boolean;
  formula_breakdown: string;
}

export interface MatchedIssue {
  id: string;
  title: string;
  url: string;
  repo_name: string;
  repo_owner: string;
  repo_stars: number;
  repo_forks: number;
  repo_url: string;
  language: string;
  labels: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimated_hours: string;
  welcoming_score: RepositoryWelcomingScore;
  match_score: number;
  match_reason: string;
  body_snippet: string;
  comments_count: number;
  created_at?: string;
}

export interface CategorizedIssues {
  easy: MatchedIssue[];
  medium: MatchedIssue[];
  hard: MatchedIssue[];
}

export interface TargetRepoMatchResponse {
  repo_name: string;
  repo_url: string;
  repo_stars: number;
  repo_forks: number;
  language: string;
  welcoming_score: RepositoryWelcomingScore;
  categorized_issues: CategorizedIssues;
  total_issues: number;
  match_summary: string;
}

export interface LocalizedFile {
  path: string;
  probable_function_or_class: string;
  reason: string;
  confidence: number;
}

export interface RoadmapStep {
  step_number: number;
  title: string;
  phase: string;
  instructions: string;
  shell_command?: string;
  code_snippet?: string;
}

export interface CoachResponse {
  issue_title: string;
  issue_url: string;
  repo_name: string;
  developer_level: string;
  plain_english_summary: string;
  localized_files: LocalizedFile[];
  roadmap: RoadmapStep[];
  drafted_maintainer_comment: string;
  engine_used: string;
}
