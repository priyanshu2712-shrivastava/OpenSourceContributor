from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any

from .models.schemas import (
    AnalyzeProfileRequest,
    DeveloperProfile,
    IssueMatchRequest,
    MatchedIssue,
    CoachRequest,
    CoachResponse,
    LoginRequest,
    LoginResponse,
    TargetRepoMatchRequest,
    TargetRepoMatchResponse,
)
from .agents.profile_agent import ProfileAgent
from .agents.scout_agent import ScoutAgent
from .agents.coach_agent import CoachAgent
from .data.mock_data import DEMO_PROFILES

app = FastAPI(
    title="Open-Source Contribution Matcher & Onboarding Coach API",
    description="Autonomous Agentic Developer Tool for AST Code Profiling, Repository Welcomingness, and Codebase Coaching",
    version="1.1.0",
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Open-Source Contribution Matcher API",
        "version": "1.1.0"
    }


@app.get("/api/demo/profiles", response_model=Dict[str, DeveloperProfile])
async def get_demo_profiles():
    """
    Returns pre-computed test profiles (Beginner Python, Intermediate Full-Stack JS, Systems Go/Rust, Torvalds)
    for instant zero-token viva demonstrations.
    """
    return DEMO_PROFILES


@app.post("/api/auth/login", response_model=LoginResponse)
async def login_user(
    payload: LoginRequest,
    x_github_token: Optional[str] = Header(None, alias="X-GitHub-Token"),
):
    """
    Login by username. Analyzes developer's repositories using AST Code Profiler (Agent 1)
    and stores/caches the profile for the session.
    """
    username = payload.username.strip()
    if not username:
        raise HTTPException(status_code=400, detail="Username is required")

    agent = ProfileAgent(token=x_github_token)
    profile = await agent.analyze(username, use_cached=True)
    return LoginResponse(
        profile=profile,
        message=f"Successfully authenticated and profiled @{username}"
    )


@app.post("/api/profile/analyze", response_model=DeveloperProfile)
async def analyze_profile(
    payload: AnalyzeProfileRequest,
    x_github_token: Optional[str] = Header(None, alias="X-GitHub-Token"),
):
    """
    Agent 1: Profiles a developer's GitHub account using AST code analysis
    to quantify skill depth across Level 1, Level 2, and Level 3.
    """
    if not payload.username or not payload.username.strip():
        raise HTTPException(status_code=400, detail="Username is required")

    agent = ProfileAgent(token=x_github_token)
    profile = await agent.analyze(payload.username, use_cached=payload.use_cached)
    return profile


@app.post("/api/issues/match", response_model=List[MatchedIssue])
async def match_issues(
    payload: IssueMatchRequest,
    x_github_token: Optional[str] = Header(None, alias="X-GitHub-Token"),
):
    """
    Agent 2 (Global Mode): Queries active open-source projects, evaluates the Repository Welcomingness Index (RWI),
    filters out repos with RWI < 0.60, and ranks best-fit issues based on developer skill similarity.
    """
    scout = ScoutAgent(token=x_github_token)

    developer_skills = []
    if payload.username:
        try:
            profile_agent = ProfileAgent(token=x_github_token)
            prof = await profile_agent.analyze(payload.username)
            developer_skills = prof.strengths + prof.preferred_issue_types
            if not payload.languages and prof.languages:
                payload.languages = [l.language for l in prof.languages[:3]]
        except Exception as e:
            print(f"[match_issues] Error extracting user context: {e}")

    issues = await scout.match_issues(
        languages=payload.languages,
        difficulty=payload.difficulty,
        developer_skills=developer_skills,
        limit=payload.limit or 5,
    )
    return issues


@app.post("/api/repo/analyze-and-match", response_model=TargetRepoMatchResponse)
async def analyze_target_repo(
    payload: TargetRepoMatchRequest,
    x_github_token: Optional[str] = Header(None, alias="X-GitHub-Token"),
):
    """
    Agent 2 (Target Mode): Analyzes ANY specific repository URL pasted by the user,
    computes its Welcomingness Index (RWI), fetches its open issues, and categorizes
    them into Easy, Medium, and Hard ranked for the user's AST skill profile.
    """
    if not payload.repo_url or not payload.repo_url.strip():
        raise HTTPException(status_code=400, detail="Repository URL is required")

    username = payload.username.strip() or "beginner-python-dev"

    try:
        profile_agent = ProfileAgent(token=x_github_token)
        profile = await profile_agent.analyze(username)
    except Exception:
        profile = DEMO_PROFILES["beginner-python-dev"]

    scout = ScoutAgent(token=x_github_token)
    try:
        response = await scout.match_target_repository(
            repo_url=payload.repo_url,
            profile=profile,
            difficulty_filter=payload.difficulty_filter,
        )
        return response
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze repository: {str(e)}")


@app.post("/api/issues/coach", response_model=CoachResponse)
async def coach_issue(
    payload: CoachRequest,
    x_github_token: Optional[str] = Header(None, alias="X-GitHub-Token"),
    x_groq_key: Optional[str] = Header(None, alias="X-Groq-Key"),
):
    """
    Agent 3: Identifies responsible codebase files/modules, formulates a 5-step onboarding roadmap,
    and drafts a polite maintainer intro comment using Groq LPU or deterministic fallback.
    """
    if not payload.issue_url:
        raise HTTPException(status_code=400, detail="Issue URL is required")

    coach = CoachAgent(token=x_github_token, groq_key=x_groq_key)

    user_skills = []
    if payload.username:
        try:
            profile_agent = ProfileAgent(token=x_github_token)
            prof = await profile_agent.analyze(payload.username)
            user_skills = prof.strengths
        except Exception:
            pass

    plan = await coach.guide(
        issue_url=payload.issue_url,
        developer_level=payload.developer_level or "intermediate",
        user_skills=user_skills,
        issue_title=payload.issue_title,
        issue_body=payload.issue_body,
        repo_name=payload.repo_name,
    )
    return plan


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
