import re
from typing import Optional, List, Dict, Any
from ..services.groq_service import GroqService
from ..services.github_service import GitHubService
from ..data.mock_data import CURATED_ISSUES
from ..models.schemas import CoachResponse


class CoachAgent:
    """
    Agent 3: Onboarding & Codebase Coach Agent
    - Reads repository README to extract real clone, install, and testing setup commands.
    - Inspects the open issue body, stack traces, and comments.
    - Scans the repository file tree to localize the EXACT file and function responsible.
    - Synthesizes an issue-specific solution diff and tailored maintainer comment via LLaMA 3.3 70B (or dynamic parser).
    """

    def __init__(self, token: Optional[str] = None, groq_key: Optional[str] = None):
        self.github_service = GitHubService(token=token)
        self.groq_service = GroqService(api_key=groq_key)

    async def guide(
        self,
        issue_url: str,
        developer_level: str = "intermediate",
        user_skills: Optional[List[str]] = None,
        issue_title: Optional[str] = None,
        issue_body: Optional[str] = None,
        repo_name: Optional[str] = None,
    ) -> CoachResponse:
        # Extract owner, repo, and issue number
        owner, repo, issue_num = self.github_service.extract_repo_and_issue_number(issue_url)
        full_repo_name = repo_name or f"{owner}/{repo}"

        # 1. Fetch Repository README for authentic clone & install instructions
        readme_text = await self.github_service.get_repo_readme(owner, repo)

        # 2. Fetch Repository Directory Tree for authentic file localization
        file_tree = await self.github_service.get_repo_file_tree(owner, repo)

        # 3. Fetch Full Issue Details & Comments if live issue
        full_issue_data = {}
        if issue_num:
            full_issue_data = await self.github_service.get_issue_full(owner, repo, issue_num)

        # Fallback to curated match if live fetch was rate-limited or offline
        curated_match = None
        for item in CURATED_ISSUES:
            if item["url"].lower() == issue_url.lower() or str(item.get("id")) in issue_url:
                curated_match = item
                break

        title = (
            issue_title or
            full_issue_data.get("title") or
            (curated_match["title"] if curated_match else "Open-Source Issue Fix")
        )
        body = (
            issue_body or
            full_issue_data.get("body") or
            (curated_match["body_snippet"] if curated_match else "")
        )
        comments = full_issue_data.get("comments", "")

        if curated_match and not file_tree:
            file_tree = curated_match.get("file_tree")

        # Call Groq LPU (llama-3.3-70b-versatile) or Dynamic Code Parser Engine
        response = await self.groq_service.generate_coach_plan(
            issue_title=title,
            issue_body=body,
            issue_url=issue_url,
            repo_name=full_repo_name,
            developer_level=developer_level,
            user_skills=user_skills,
            file_tree=file_tree,
            readme_context=readme_text,
            comments_context=comments,
        )

        return response
