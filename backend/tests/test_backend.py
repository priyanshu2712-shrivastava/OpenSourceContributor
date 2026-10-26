import unittest
import asyncio
from backend.app.services.ast_analyzer import AstAnalyzer
from backend.app.services.github_service import GitHubService
from backend.app.services.groq_service import GroqService
from backend.app.agents.profile_agent import ProfileAgent
from backend.app.agents.scout_agent import ScoutAgent
from backend.app.agents.coach_agent import CoachAgent
from backend.app.data.mock_data import DEMO_PROFILES, CURATED_ISSUES


class TestAstAnalyzer(unittest.TestCase):
    def test_python_level1_procedural(self):
        code = """
def calculate_sum(items):
    total = 0
    for x in items:
        total += x
    return total
"""
        res = AstAnalyzer.analyze_python_code(code)
        self.assertIn("syntax_score", res)
        self.assertEqual(res["tier"], "Beginner")
        self.assertLess(res["async_score"], 2.0)
        self.assertLess(res["testing_score"], 2.0)

    def test_python_level3_async_and_testing(self):
        code = """
import asyncio

class DataPipeline:
    def __init__(self):
        self.items = []

    async def fetch_item(self, item_id: int):
        await asyncio.sleep(0.01)
        return {"id": item_id}

def test_fetch_item():
    pipeline = DataPipeline()
    assert pipeline is not None
"""
        res = AstAnalyzer.analyze_python_code(code)
        self.assertGreater(res["oop_score"], 2.0)
        self.assertGreater(res["async_score"], 3.0)
        self.assertGreater(res["testing_score"], 2.5)
        self.assertIn("Asynchronous Coroutines (async/await)", res["detected_features"])

    def test_javascript_heuristics(self):
        js_code = """
class UserService {
    async fetchUsers() {
        try {
            const res = await fetch('/api/users');
            return await res.json();
        } catch (e) {
            console.error(e);
        }
    }
}
describe('UserService', () => {
    it('fetches users', async () => {
        expect(true).toBe(true);
    });
});
"""
        res = AstAnalyzer.analyze_code_heuristics(js_code, "JavaScript")
        self.assertGreater(res["oop_score"], 2.0)
        self.assertGreater(res["async_score"], 3.0)
        self.assertGreater(res["testing_score"], 3.0)


class TestRepositoryWelcomingnessIndex(unittest.IsolatedAsyncioTestCase):
    async def test_rwi_mathematical_formula(self):
        gh = GitHubService()
        rwi_score = await gh.compute_repository_welcomingness("pallets", "flask")
        self.assertGreaterEqual(rwi_score.overall_rwi, 0.60)
        self.assertTrue(rwi_score.is_welcoming)

        # Verify mathematical consistency
        computed = (
            0.35 * rwi_score.pr_merge_rate +
            0.30 * rwi_score.maintainer_response_speed_score +
            rwi_score.documentation_score -
            0.15 * rwi_score.stale_issue_ratio
        )
        self.assertAlmostEqual(rwi_score.overall_rwi, round(computed, 2), delta=0.05)

    async def test_scout_agent_filters_low_rwi(self):
        scout = ScoutAgent()
        issues = await scout.match_issues(languages=["Python"], limit=5)
        self.assertGreater(len(issues), 0)
        for iss in issues:
            self.assertGreaterEqual(iss.welcoming_score.overall_rwi, 0.60)
            self.assertTrue(iss.welcoming_score.is_welcoming)


class TestAgentsIntegration(unittest.IsolatedAsyncioTestCase):
    async def test_profile_agent_demo(self):
        agent = ProfileAgent()
        profile = await agent.analyze("beginner-python-dev")
        self.assertEqual(profile.username, "beginner-python-dev")
        self.assertEqual(profile.ast_metrics.tier, "Beginner")
        self.assertGreater(len(profile.languages), 0)
        self.assertGreater(len(profile.strengths), 0)

    async def test_coach_agent_blueprint(self):
        coach = CoachAgent()
        plan = await coach.guide(
            issue_url="https://github.com/pallets/flask/issues/5421",
            developer_level="beginner"
        )
        self.assertIn("flask", plan.repo_name.lower())
        self.assertGreater(len(plan.localized_files), 0)
        self.assertGreater(len(plan.roadmap), 0)
        self.assertIn("maintainer", plan.drafted_maintainer_comment.lower())
        self.assertTrue(len(plan.plain_english_summary) > 20)


if __name__ == "__main__":
    unittest.main()
