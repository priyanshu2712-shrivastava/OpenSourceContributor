from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AstMetrics(BaseModel):
    syntax_score: float = Field(..., description="Level 1: Basic procedural syntax, loops, control flow (0-10)")
    oop_score: float = Field(..., description="Level 2: OOP, classes, inheritance, modular architecture (0-10)")
    async_score: float = Field(..., description="Level 3: Concurrency, async/await, coroutines, multithreading (0-10)")
    testing_score: float = Field(..., description="Level 3: Unit tests, assertions, mock suites (0-10)")
    overall_complexity: float = Field(..., description="Overall calculated code complexity score (1-10)")
    tier: str = Field(..., description="Tier: Beginner, Intermediate, or Advanced")
    detected_features: List[str] = Field(default_factory=list, description="Detected language and code idioms")


class LanguageStat(BaseModel):
    language: str
    percentage: float
    bytes: int = 0


class DeveloperProfile(BaseModel):
    username: str
    name: Optional[str] = None
    avatar_url: str
    bio: Optional[str] = None
    public_repos: int = 0
    followers: int = 0
    languages: List[LanguageStat] = Field(default_factory=list)
    ast_metrics: AstMetrics
    preferred_issue_types: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    commit_velocity: str = "Moderate"
    analyzed_repo_count: int = 0
    is_demo: bool = False


class AnalyzeProfileRequest(BaseModel):
    username: str
    use_cached: bool = True


class LoginRequest(BaseModel):
    username: str


class LoginResponse(BaseModel):
    profile: DeveloperProfile
    message: str = "Login successful"


class RepositoryWelcomingScore(BaseModel):
    overall_rwi: float = Field(..., description="Repository Welcomingness Index (0.00 to 1.00)")
    pr_merge_rate: float = Field(..., description="PR Merge Rate (weight: 0.35)")
    maintainer_response_speed_score: float = Field(..., description="Response speed score (weight: 0.30)")
    response_speed_human: str = Field(..., description="Human-readable response speed description")
    documentation_score: float = Field(..., description="CONTRIBUTING.md and Issue Template indicator (weight: 0.20)")
    has_contributing_guide: bool
    has_issue_templates: bool
    stale_issue_ratio: float = Field(..., description="Stale issue penalty ratio (weight: -0.15)")
    is_welcoming: bool = True
    formula_breakdown: str = ""


class MatchedIssue(BaseModel):
    id: str
    title: str
    url: str
    repo_name: str
    repo_owner: str
    repo_stars: int = 0
    repo_forks: int = 0
    repo_url: str
    language: str
    labels: List[str] = Field(default_factory=list)
    difficulty: str = "Beginner"  # "Beginner" (Easy) | "Intermediate" (Medium) | "Advanced" (Hard)
    estimated_hours: str = "2-4 hours"
    welcoming_score: RepositoryWelcomingScore
    match_score: float = 0.85
    match_reason: str = ""
    body_snippet: str = ""
    comments_count: int = 0
    created_at: Optional[str] = None


class IssueMatchRequest(BaseModel):
    username: Optional[str] = None
    languages: List[str] = Field(default_factory=list)
    difficulty: Optional[str] = "all"
    limit: int = 5


class TargetRepoMatchRequest(BaseModel):
    username: str
    repo_url: str
    difficulty_filter: Optional[str] = "all"


class CategorizedIssues(BaseModel):
    easy: List[MatchedIssue] = Field(default_factory=list)
    medium: List[MatchedIssue] = Field(default_factory=list)
    hard: List[MatchedIssue] = Field(default_factory=list)


class TargetRepoMatchResponse(BaseModel):
    repo_name: str
    repo_url: str
    repo_stars: int = 0
    repo_forks: int = 0
    language: str = "Unknown"
    welcoming_score: RepositoryWelcomingScore
    categorized_issues: CategorizedIssues
    total_issues: int = 0
    match_summary: str = ""


class LocalizedFile(BaseModel):
    path: str
    probable_function_or_class: str
    reason: str
    confidence: float = 0.85


class RoadmapStep(BaseModel):
    step_number: int
    title: str
    phase: str
    instructions: str
    shell_command: Optional[str] = None
    code_snippet: Optional[str] = None


class CoachRequest(BaseModel):
    issue_url: str
    developer_level: Optional[str] = "intermediate"
    username: Optional[str] = None
    issue_title: Optional[str] = None
    issue_body: Optional[str] = None
    repo_name: Optional[str] = None


class CoachResponse(BaseModel):
    issue_title: str
    issue_url: str
    repo_name: str
    developer_level: str
    plain_english_summary: str
    localized_files: List[LocalizedFile]
    roadmap: List[RoadmapStep]
    drafted_maintainer_comment: str
    engine_used: str
