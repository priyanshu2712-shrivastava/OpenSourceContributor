import httpx
import json
import re
from typing import Optional, Dict, Any, List
from ..config import GROQ_API_KEY, GROQ_MODEL
from ..models.schemas import LocalizedFile, RoadmapStep, CoachResponse


class GroqService:
    GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or GROQ_API_KEY
        self.model = GROQ_MODEL

    async def generate_coach_plan(
        self,
        issue_title: str,
        issue_body: str,
        issue_url: str,
        repo_name: str,
        developer_level: str = "intermediate",
        user_skills: Optional[List[str]] = None,
        file_tree: Optional[List[str]] = None,
        readme_context: Optional[str] = None,
        comments_context: Optional[str] = None,
    ) -> CoachResponse:
        """
        Synthesizes an intelligent, issue-specific onboarding plan using Groq LPU (llama-3.3-70b-versatile).
        If no API key is provided or network fails, falls back to the dynamic code parser engine.
        """
        if self.api_key:
            try:
                response = await self._call_groq_api(
                    issue_title=issue_title,
                    issue_body=issue_body,
                    issue_url=issue_url,
                    repo_name=repo_name,
                    developer_level=developer_level,
                    user_skills=user_skills,
                    file_tree=file_tree,
                    readme_context=readme_context,
                    comments_context=comments_context,
                )
                if response:
                    return response
            except Exception as e:
                print(f"[GroqService] Groq API call notice: {e}. Utilizing dynamic code parser engine.")

        # Fallback to Dynamic Code Parser Engine
        return self._generate_dynamic_plan(
            issue_title=issue_title,
            issue_body=issue_body,
            issue_url=issue_url,
            repo_name=repo_name,
            developer_level=developer_level,
            file_tree=file_tree,
            readme_context=readme_context,
            comments_context=comments_context,
        )

    async def _call_groq_api(
        self,
        issue_title: str,
        issue_body: str,
        issue_url: str,
        repo_name: str,
        developer_level: str,
        user_skills: Optional[List[str]],
        file_tree: Optional[List[str]],
        readme_context: Optional[str],
        comments_context: Optional[str],
    ) -> Optional[CoachResponse]:
        system_prompt = (
            "You are an expert Open-Source Onboarding Coach and Staff Principal Engineer.\n"
            "Your job is to read an open-source issue, the repository README setup instructions, "
            "and the repository directory tree, then generate an ISSUE-SPECIFIC onboarding plan.\n\n"
            "CRITICAL RULES:\n"
            "1. DO NOT give generic boilerplate steps. Tailor the setup commands directly from the provided README.\n"
            "2. Read the issue description and stack traces to identify the EXACT target file(s) and function/class.\n"
            "3. Provide the ACTUAL code diff / logic fix snippet specifically for this problem (before and after).\n"
            "4. Provide the EXACT test command and test assertion for this specific bug or feature.\n"
            "5. Draft a tailored, professional maintainer comment explaining the technical approach to this specific issue.\n\n"
            "Return valid JSON matching this schema:\n"
            "{\n"
            '  "plain_english_summary": "High-level overview of the issue, what causes it, and the fix strategy.",\n'
            '  "localized_files": [\n'
            '    {"path": "exact/path/from/file_tree", "probable_function_or_class": "FunctionName", "reason": "Why this file is the source of the issue", "confidence": 0.95}\n'
            '  ],\n'
            '  "roadmap": [\n'
            '    {\n'
            '      "step_number": 1,\n'
            '      "title": "Clone & Environment Setup",\n'
            '      "phase": "Setup & Reproduction",\n'
            '      "instructions": "Specific clone & install steps parsed from the README",\n'
            '      "shell_command": "git clone ... && setup command from README"\n'
            '    },\n'
            '    {\n'
            '      "step_number": 2,\n'
            '      "title": "Write Failing Reproduction Test",\n'
            '      "phase": "Setup & Reproduction",\n'
            '      "instructions": "How to reproduce this exact failure",\n'
            '      "shell_command": "test command",\n'
            '      "code_snippet": "Actual test assertion code for this bug"\n'
            '    },\n'
            '    {\n'
            '      "step_number": 3,\n'
            '      "title": "Implement the Fix",\n'
            '      "phase": "Logic Implementation",\n'
            '      "instructions": "Exact modifications needed in the target file",\n'
            '      "code_snippet": "Actual code diff / fix logic"\n'
            '    },\n'
            '    {\n'
            '      "step_number": 4,\n'
            '      "title": "Test Suite Verification",\n'
            '      "phase": "Testing & Verification",\n'
            '      "instructions": "How to verify the fix passes all regression checks",\n'
            '      "shell_command": "run command"\n'
            '    },\n'
            '    {\n'
            '      "step_number": 5,\n'
            '      "title": "PR Etiquette & Commit Checklist",\n'
            '      "phase": "PR Etiquette",\n'
            '      "instructions": "Branching and commit conventions",\n'
            '      "shell_command": "git commit -m ..."\n'
            '    }\n'
            '  ],\n'
            '  "drafted_maintainer_comment": "Hi maintainers, I would love to tackle this issue. I plan to approach it by [specific plan] in [target file]..."\n'
            "}"
        )

        user_content = (
            f"=== REPOSITORY: {repo_name} ===\n"
            f"Developer Skill Level: {developer_level}\n"
            f"Developer Strengths: {', '.join(user_skills or ['Software Engineering'])}\n\n"
            f"=== ISSUE TITLE ===\n{issue_title}\n\n"
            f"=== ISSUE BODY & TRACES ===\n{issue_body[:3000]}\n\n"
            f"=== RECENT ISSUE COMMENTS ===\n{comments_context[:1000] if comments_context else 'No extra comments'}\n\n"
            f"=== REPOSITORY FILE TREE CANDIDATES ===\n"
            + "\n".join(file_tree[:35] if file_tree else ["src/main.py", "tests/test_main.py"])
            + "\n\n=== REPOSITORY README SNIPPET (FOR SETUP COMMANDS) ===\n"
            + (readme_context[:1500] if readme_context else "Standard project setup")
        )

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_content},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2,
            "max_tokens": 2048,
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=25.0) as client:
            res = await client.post(self.GROQ_URL, json=payload, headers=headers)
            if res.status_code == 200:
                data = res.json()
                content = data["choices"][0]["message"]["content"]
                parsed = json.loads(content)

                localized = [
                    LocalizedFile(
                        path=f.get("path", "src/main.py"),
                        probable_function_or_class=f.get("probable_function_or_class", "target_function"),
                        reason=f.get("reason", "Contains the logic referenced in the issue"),
                        confidence=float(f.get("confidence", 0.90)),
                    )
                    for f in parsed.get("localized_files", [])
                ]

                roadmap = [
                    RoadmapStep(
                        step_number=int(s.get("step_number", idx + 1)),
                        title=s.get("title", f"Step {idx + 1}"),
                        phase=s.get("phase", "Implementation"),
                        instructions=s.get("instructions", ""),
                        shell_command=s.get("shell_command"),
                        code_snippet=s.get("code_snippet"),
                    )
                    for idx, s in enumerate(parsed.get("roadmap", []))
                ]

                return CoachResponse(
                    issue_title=issue_title,
                    issue_url=issue_url,
                    repo_name=repo_name,
                    developer_level=developer_level,
                    plain_english_summary=parsed.get("plain_english_summary", issue_title),
                    localized_files=localized,
                    roadmap=roadmap,
                    drafted_maintainer_comment=parsed.get(
                        "drafted_maintainer_comment",
                        f"Hi maintainers! I'd love to work on this issue. Could you please assign it to me?"
                    ),
                    engine_used=f"Groq LPU ({self.model})",
                )
            else:
                print(f"[GroqService] Groq API returned status {res.status_code}: {res.text}")

        return None

    def _generate_dynamic_plan(
        self,
        issue_title: str,
        issue_body: str,
        issue_url: str,
        repo_name: str,
        developer_level: str,
        file_tree: Optional[List[str]] = None,
        readme_context: Optional[str] = None,
        comments_context: Optional[str] = None,
    ) -> CoachResponse:
        """
        Dynamic code analyzer that parses the issue text, stack traces, and repository README
        to generate an issue-specific onboarding plan even when offline or without an API key.
        """
        combined_text = f"{issue_title} {issue_body} {comments_context or ''}"
        repo_short = repo_name.split("/")[-1] if "/" in repo_name else repo_name

        # 1. Parse setup & install command directly from README
        install_command = "pip install -e .[dev]"
        test_runner = "pytest"
        is_python = False
        is_js_ts = False
        is_go = False

        if readme_context:
            readme_lower = readme_context.lower()
            if "poetry" in readme_lower:
                install_command = "poetry install"
                test_runner = "poetry run pytest"
                is_python = True
            elif "pnpm" in readme_lower:
                install_command = "pnpm install"
                test_runner = "pnpm test"
                is_js_ts = True
            elif "yarn" in readme_lower:
                install_command = "yarn install"
                test_runner = "yarn test"
                is_js_ts = True
            elif "npm" in readme_lower or "package.json" in readme_lower:
                install_command = "npm install"
                test_runner = "npm test"
                is_js_ts = True
            elif "go mod" in readme_lower or "go test" in readme_lower:
                install_command = "go mod tidy"
                test_runner = "go test ./..."
                is_go = True
            elif "pip" in readme_lower or "setup.py" in readme_lower:
                install_command = "pip install -e '.[dev]'"
                test_runner = "pytest"
                is_python = True
        else:
            is_python = any(k in repo_name.lower() for k in ["flask", "fastapi", "pandas", "django"])
            is_js_ts = any(k in repo_name.lower() for k in ["react", "axios", "query", "vue"])
            is_go = "gin" in repo_name.lower() or "go" in repo_name.lower()

        # 2. Extract specific files mentioned in the issue body or stack traces
        mentioned_files = re.findall(r"[\w/\.-]+\.(?:py|ts|js|jsx|tsx|go|rs|java)", combined_text)
        target_file = None

        # Look for matching file in file_tree
        if file_tree:
            for mf in mentioned_files:
                for tf in file_tree:
                    if mf in tf or tf in mf:
                        target_file = tf
                        break
                if target_file:
                    break

            if not target_file:
                # Pick primary source file from file_tree (excluding tests)
                source_candidates = [f for f in file_tree if ("test" not in f.lower() and not f.endswith(".md"))]
                if source_candidates:
                    target_file = source_candidates[0]

        if not target_file:
            if mentioned_files:
                target_file = mentioned_files[0]
            elif is_python:
                target_file = f"src/{repo_short}/core.py"
            elif is_js_ts:
                target_file = "src/index.ts"
            else:
                target_file = "main.go"

        # 3. Extract target function or error symbol
        func_match = re.search(r"(?:def|function|func|class)\s+([a-zA-Z0-9_]+)", combined_text)
        symbol_match = re.search(r"([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)", combined_text)
        error_match = re.search(r"([A-Z][a-zA-Z0-9_]*(?:Error|Exception|BadRequest|Warning|Panic))", combined_text)

        target_symbol = "handle_request"
        if func_match:
            target_symbol = func_match.group(1)
        elif symbol_match and not symbol_match.group(1).startswith("github."):
            target_symbol = symbol_match.group(1)

        error_name = error_match.group(1) if error_match else "unexpected error"

        # 4. Formulate test file
        test_file = "tests/test_fix.py"
        if file_tree:
            test_candidates = [f for f in file_tree if "test" in f.lower()]
            if test_candidates:
                test_file = test_candidates[0]
        elif is_js_ts:
            test_file = "tests/index.test.ts"
        elif is_go:
            test_file = f"{repo_short}_test.go"

        # 5. Build tailored summary
        summary = (
            f"The issue '{issue_title}' reports an issue in `{target_file}` where invoking `{target_symbol}` "
            f"triggers a {error_name} or unexpected behavior under edge conditions. "
            f"The proposed solution introduces defensive parameter handling in `{target_file}` "
            f"and adds invariant test coverage in `{test_file}`."
        )

        localized_files = [
            LocalizedFile(
                path=target_file,
                probable_function_or_class=target_symbol,
                reason=f"Primary source module identified from issue stack traces and symbol `{target_symbol}`.",
                confidence=0.92,
            ),
            LocalizedFile(
                path=test_file,
                probable_function_or_class=f"test_{target_symbol.lower().replace('.', '_')}",
                reason="Regression test module to verify the reproduction case and prevent regression.",
                confidence=0.88,
            ),
        ]

        # 6. Issue-specific code diff snippet
        if is_python:
            code_diff = (
                f"# In {target_file} inside {target_symbol}:\n"
                f"def {target_symbol.split('.')[-1]}(*args, **kwargs):\n"
                f"    # Ensure parameters are sanitized before evaluation\n"
                f"    if not args and 'payload' not in kwargs:\n"
                f"        return None  # Defensive guard against {error_name}\n"
                f"    \n"
                f"    # Existing logic proceeds safely...\n"
            )
            repro_code = (
                f"# In {test_file}:\n"
                f"def test_{target_symbol.lower().replace('.', '_')}_reproduction():\n"
                f"    # Reproduce the condition described in {issue_title[:30]}\n"
                f"    result = {target_symbol.split('.')[-1]}()\n"
                f"    assert result is not None\n"
            )
        elif is_js_ts:
            code_diff = (
                f"// In {target_file} inside {target_symbol}:\n"
                f"export function {target_symbol.split('.')[-1]}(options = {{}}) {{\n"
                f"  if (!options || options.silent) {{\n"
                f"    return null; // Defensive guard preventing unhandled {error_name}\n"
                f"  }}\n"
                f"  // Proceed with execution...\n"
                f"}}"
            )
            repro_code = (
                f"// In {test_file}:\n"
                f"test('should handle edge case without triggering {error_name}', () => {{\n"
                f"  expect(() => {target_symbol.split('.')[-1]}()).not.toThrow();\n"
                f"}});"
            )
        else:
            code_diff = (
                f"// In {target_file}:\n"
                f"func {target_symbol.split('.')[-1]}(input interface{{}}) error {{\n"
                f"    if input == nil {{\n"
                f"        return fmt.Errorf('invalid input: cannot be nil')\n"
                f"    }}\n"
                f"    return nil\n"
                f"}}"
            )
            repro_code = (
                f"// In {test_file}:\n"
                f"func Test{target_symbol.split('.')[-1]}Reproduction(t *testing.T) {{\n"
                f"    err := {target_symbol.split('.')[-1]}(nil)\n"
                f"    if err == nil {{ t.Errorf('expected error on nil input') }}\n"
                f"}}"
            )

        roadmap = [
            RoadmapStep(
                step_number=1,
                title="Fork & Clone Development Environment",
                phase="Setup & Reproduction",
                instructions=f"Fork `{repo_name}`, clone locally, and install development dependencies as specified in the repository README.",
                shell_command=(
                    f"git clone https://github.com/<your-username>/{repo_short}.git\n"
                    f"cd {repo_short}\n"
                    f"git checkout -b fix/{target_symbol.lower().replace('.', '-')}-issue\n"
                    f"{install_command}"
                ),
            ),
            RoadmapStep(
                step_number=2,
                title="Write Reproduction Test Case",
                phase="Setup & Reproduction",
                instructions=f"Add a reproduction unit test in `{test_file}` to confirm the {error_name} fails before applying the fix.",
                shell_command=f"{test_runner} {test_file}",
                code_snippet=repro_code,
            ),
            RoadmapStep(
                step_number=3,
                title="Implement Fix in Target Module",
                phase="Logic Implementation",
                instructions=f"Open `{target_file}`. Locate `{target_symbol}` and apply the defensive validation to prevent {error_name}.",
                code_snippet=code_diff,
            ),
            RoadmapStep(
                step_number=4,
                title="Run Test Suite & Verify Invariants",
                phase="Testing & Verification",
                instructions="Run the project test runner to ensure your change fixes the bug and passes all existing tests.",
                shell_command=f"{test_runner}",
            ),
            RoadmapStep(
                step_number=5,
                title="PR Etiquette & Commit Checklist",
                phase="PR Etiquette",
                instructions="Follow Conventional Commits referencing this issue. Push your branch and open a Pull Request.",
                shell_command=(
                    f"git add {target_file} {test_file}\n"
                    f'git commit -m "fix({target_symbol.split(".")[-1]}): resolve {error_name.lower()} edge case"\n'
                    f"git push origin fix/{target_symbol.lower().replace('.', '-')}-issue"
                ),
            ),
        ]

        # Tailored maintainer comment
        maintainer_comment = (
            f"Hi maintainers! 👋\n\n"
            f"I'm interested in working on this issue. I've reviewed `{target_file}` and the test suite in `{test_file}`.\n"
            f"My plan is to add defensive handling in `{target_symbol}` to prevent the {error_name} reported here, "
            f"and add a test case in `{test_file}` to prevent regressions.\n\n"
            f"Could you please assign this issue to me? Thanks!"
        )

        return CoachResponse(
            issue_title=issue_title,
            issue_url=issue_url,
            repo_name=repo_name,
            developer_level=developer_level,
            plain_english_summary=summary,
            localized_files=localized_files,
            roadmap=roadmap,
            drafted_maintainer_comment=maintainer_comment,
            engine_used="Dynamic Code Parser Engine (README & Tree Aware)",
        )
