import math
from typing import List, Optional, Dict, Any
from ..services.github_service import GitHubService
from ..data.mock_data import CURATED_ISSUES
from ..models.schemas import (
    MatchedIssue,
    RepositoryWelcomingScore,
    TargetRepoMatchResponse,
    CategorizedIssues,
    DeveloperProfile,
)


class ScoutAgent:
    """
    Agent 2: Repo Scout & Welcomingness Agent
    - General matching: Filters across public OSS repos by RWI >= 0.60
    - Target Repo matching: Analyzes ANY specific repository URL pasted by the user,
      computes its RWI score, and categorizes its open problems into Easy, Medium, and Hard.
    """

    def __init__(self, token: Optional[str] = None):
        self.github_service = GitHubService(token=token)

    async def match_target_repository(
        self,
        repo_url: str,
        profile: DeveloperProfile,
        difficulty_filter: Optional[str] = "all",
    ) -> TargetRepoMatchResponse:
        """
        Analyzes a specific GitHub repository URL entered by the user,
        evaluates its Welcomingness Index (RWI), fetches its open issues,
        and categorizes them into Easy, Medium, and Hard ranked for the user.
        """
        owner, repo = self.github_service.parse_repo_url(repo_url)
        full_repo_name = f"{owner}/{repo}"

        # 1. Fetch Repository Metadata
        repo_meta = await self.github_service.get_repo_details(owner, repo)

        # 2. Compute Repository Welcomingness Index (RWI)
        welcoming_score = await self.github_service.compute_repository_welcomingness(owner, repo)

        # 3. Fetch Issues from that specific repo
        raw_issues = await self.github_service.get_repo_issues(owner, repo, limit=25)

        user_skills = profile.strengths + profile.preferred_issue_types
        user_langs = [l.language.lower() for l in profile.languages]

        easy_list: List[MatchedIssue] = []
        medium_list: List[MatchedIssue] = []
        hard_list: List[MatchedIssue] = []

        for item in raw_issues:
            # Normalize issue structure
            issue_id = str(item.get("id") or item.get("number", "101"))
            title = item.get("title", "Open Issue")
            url = item.get("html_url") or item.get("url") or f"https://github.com/{owner}/{repo}/issues/{issue_id}"
            body = (item.get("body") or item.get("body_snippet") or "")
            body_snippet = body[:280]

            raw_labels = item.get("labels", [])
            label_names: List[str] = []
            for l in raw_labels:
                if isinstance(l, dict):
                    label_names.append(l.get("name", ""))
                elif isinstance(l, str):
                    label_names.append(l)

            # Determine Difficulty (Easy / Medium / Hard)
            labels_str = " ".join(label_names).lower()
            title_lower = title.lower()

            difficulty = "Medium"
            estimated_hours = "3-5 hours"

            # Check Easy (Beginner)
            if any(k in labels_str or k in title_lower for k in [
                "good first issue", "beginner", "first-timers", "easy", "doc", "typo", "quick", "starter"
            ]):
                difficulty = "Beginner"
                estimated_hours = "1-3 hours"
            # Check Hard (Advanced)
            elif any(k in labels_str or k in title_lower for k in [
                "concurrency", "async", "performance", "architecture", "refactor", "complex", "kernel", "memory"
            ]) or len(body) > 1200:
                difficulty = "Advanced"
                estimated_hours = "6-12 hours"

            # Compute Match Affinity Score with user's AST profile
            match_score = self._compute_similarity_score(
                {
                    "language": repo_meta.get("language", "Python"),
                    "title": title,
                    "labels": label_names,
                    "body_snippet": body_snippet,
                },
                user_skills,
                user_langs,
            )

            # Match Reason
            if difficulty == "Beginner":
                match_reason = f"Excellent starter task matching your {profile.ast_metrics.tier} AST foundation."
            elif difficulty == "Advanced":
                match_reason = f"Challenging issue testing advanced concurrency, deep modules, and test fixtures."
            else:
                match_reason = f"Well-scoped feature or fix aligning with your object-oriented & procedural strengths."

            matched_obj = MatchedIssue(
                id=issue_id,
                title=title,
                url=url,
                repo_name=full_repo_name,
                repo_owner=owner,
                repo_stars=repo_meta.get("stars", 1000),
                repo_forks=repo_meta.get("forks", 200),
                repo_url=repo_meta.get("url", f"https://github.com/{owner}/{repo}"),
                language=repo_meta.get("language", "Python"),
                labels=label_names,
                difficulty=difficulty,
                estimated_hours=estimated_hours,
                welcoming_score=welcoming_score,
                match_score=round(match_score, 2),
                match_reason=match_reason,
                body_snippet=body_snippet,
                comments_count=item.get("comments", 0),
                created_at=str(item.get("created_at", "recently")),
            )

            if difficulty == "Beginner":
                easy_list.append(matched_obj)
            elif difficulty == "Advanced":
                hard_list.append(matched_obj)
            else:
                medium_list.append(matched_obj)

        # Sort each list by match score descending
        easy_list.sort(key=lambda x: x.match_score, reverse=True)
        medium_list.sort(key=lambda x: x.match_score, reverse=True)
        hard_list.sort(key=lambda x: x.match_score, reverse=True)

        total = len(easy_list) + len(medium_list) + len(hard_list)
        summary = (
            f"Analyzed {full_repo_name} (RWI: {welcoming_score.overall_rwi * 100:.0f}% Welcoming). "
            f"Categorized {total} open problems based on your {profile.ast_metrics.tier} AST skill profile."
        )

        return TargetRepoMatchResponse(
            repo_name=full_repo_name,
            repo_url=repo_meta.get("url", f"https://github.com/{owner}/{repo}"),
            repo_stars=repo_meta.get("stars", 1000),
            repo_forks=repo_meta.get("forks", 200),
            language=repo_meta.get("language", "Python"),
            welcoming_score=welcoming_score,
            categorized_issues=CategorizedIssues(
                easy=easy_list,
                medium=medium_list,
                hard=hard_list,
            ),
            total_issues=total,
            match_summary=summary,
        )

    async def match_issues(
        self,
        languages: List[str],
        difficulty: Optional[str] = "all",
        developer_skills: Optional[List[str]] = None,
        limit: int = 5,
    ) -> List[MatchedIssue]:
        matched: List[MatchedIssue] = []
        user_langs_lower = [l.lower() for l in languages] if languages else ["python", "javascript"]

        candidates = list(CURATED_ISSUES)

        try:
            live_items = await self.github_service.search_issues(
                languages=languages,
                labels=["good first issue", "help wanted"],
                limit=limit * 2,
            )
            for item in live_items:
                repo_url = item.get("repository_url", "")
                parts = repo_url.split("/")
                if len(parts) >= 2:
                    owner, repo = parts[-2], parts[-1]
                    welcoming_score = await self.github_service.compute_repository_welcomingness(owner, repo)

                    if welcoming_score.overall_rwi < 0.60:
                        continue

                    labels = [l.get("name", "") for l in item.get("labels", [])]
                    item_difficulty = "Beginner"
                    if any("hard" in l.lower() or "advanced" in l.lower() for l in labels):
                        item_difficulty = "Advanced"
                    elif any("intermediate" in l.lower() or "refactor" in l.lower() for l in labels):
                        item_difficulty = "Intermediate"

                    candidates.append({
                        "id": str(item.get("id", item.get("number"))),
                        "title": item.get("title", ""),
                        "url": item.get("html_url", ""),
                        "repo_name": f"{owner}/{repo}",
                        "repo_owner": owner,
                        "repo_stars": 1200,
                        "repo_forks": 350,
                        "repo_url": f"https://github.com/{owner}/{repo}",
                        "language": languages[0] if languages else "Python",
                        "labels": labels,
                        "difficulty": item_difficulty,
                        "estimated_hours": "2-4 hours",
                        "comments_count": item.get("comments", 0),
                        "created_at": item.get("created_at", "recently"),
                        "welcoming_score": welcoming_score.model_dump(),
                        "match_score": 0.88,
                        "match_reason": f"Matches your target language and welcoming criteria (RWI: {welcoming_score.overall_rwi}).",
                        "body_snippet": (item.get("body") or "")[:280],
                    })
        except Exception as e:
            print(f"[ScoutAgent] Live GitHub search notice: {e}. Utilizing curated pool.")

        filtered_candidates = []
        for c in candidates:
            c_lang = c.get("language", "").lower()
            lang_match = True
            if user_langs_lower:
                lang_match = any(ul in c_lang or c_lang in ul for ul in user_langs_lower)

            c_diff = c.get("difficulty", "Beginner").lower()
            diff_match = True
            if difficulty and difficulty.lower() != "all":
                diff_match = (difficulty.lower() == c_diff)

            rwi_data = c.get("welcoming_score", {})
            rwi_val = rwi_data.get("overall_rwi", 0.0)

            if rwi_val >= 0.60 and (lang_match or not user_langs_lower) and diff_match:
                filtered_candidates.append(c)

        if len(filtered_candidates) < limit:
            for c in candidates:
                if c not in filtered_candidates:
                    rwi_val = c.get("welcoming_score", {}).get("overall_rwi", 0.0)
                    if rwi_val >= 0.60:
                        filtered_candidates.append(c)
                if len(filtered_candidates) >= limit:
                    break

        for c in filtered_candidates:
            score = self._compute_similarity_score(c, developer_skills or [], user_langs_lower)
            c["calculated_match_score"] = score

        filtered_candidates.sort(key=lambda x: x.get("calculated_match_score", 0.8), reverse=True)

        for c in filtered_candidates[:limit]:
            ws = c["welcoming_score"]
            welcoming_score_obj = RepositoryWelcomingScore(
                overall_rwi=ws.get("overall_rwi", 0.85),
                pr_merge_rate=ws.get("pr_merge_rate", 0.80),
                maintainer_response_speed_score=ws.get("maintainer_response_speed_score", 0.85),
                response_speed_human=ws.get("response_speed_human", "< 24 hours average"),
                documentation_score=ws.get("documentation_score", 0.20),
                has_contributing_guide=ws.get("has_contributing_guide", True),
                has_issue_templates=ws.get("has_issue_templates", True),
                stale_issue_ratio=ws.get("stale_issue_ratio", 0.10),
                is_welcoming=ws.get("is_welcoming", True),
                formula_breakdown=ws.get("formula_breakdown", ""),
            )

            matched.append(
                MatchedIssue(
                    id=str(c["id"]),
                    title=c["title"],
                    url=c["url"],
                    repo_name=c["repo_name"],
                    repo_owner=c["repo_owner"],
                    repo_stars=c.get("repo_stars", 1000),
                    repo_forks=c.get("repo_forks", 200),
                    repo_url=c["repo_url"],
                    language=c["language"],
                    labels=c.get("labels", []),
                    difficulty=c.get("difficulty", "Beginner"),
                    estimated_hours=c.get("estimated_hours", "2-4 hours"),
                    welcoming_score=welcoming_score_obj,
                    match_score=round(c.get("calculated_match_score", 0.88), 2),
                    match_reason=c.get("match_reason", "High alignment with your detected skill profile."),
                    body_snippet=c.get("body_snippet", ""),
                    comments_count=c.get("comments_count", 0),
                    created_at=c.get("created_at"),
                )
            )

        return matched

    def _compute_similarity_score(
        self,
        candidate: Dict[str, Any],
        developer_skills: List[str],
        user_langs: List[str]
    ) -> float:
        base_score = 0.75
        c_lang = candidate.get("language", "").lower()
        if any(ul in c_lang or c_lang in ul for ul in user_langs):
            base_score += 0.12

        text_corpus = (
            candidate.get("title", "") + " " +
            " ".join(candidate.get("labels", [])) + " " +
            candidate.get("body_snippet", "")
        ).lower()

        overlap_count = 0
        for skill in developer_skills:
            words = [w.lower() for w in skill.split() if len(w) > 3]
            for w in words:
                if w in text_corpus:
                    overlap_count += 1
                    break

        if developer_skills:
            similarity = min(0.12, (overlap_count / len(developer_skills)) * 0.15)
            base_score += similarity

        return min(0.99, max(0.65, base_score))
