import ast
import re
from typing import Dict, Any, List
from ..models.schemas import AstMetrics


class AstAnalyzer:
    """
    Analyzes code snippets or file contents across languages using Python AST
    and robust syntax heuristics for JavaScript/TypeScript, Go, and Java.
    """

    @staticmethod
    def analyze_python_code(code: str) -> Dict[str, Any]:
        """
        Parses Python code using the official `ast` module.
        """
        metrics = {
            "syntax_nodes": 0,
            "classes": 0,
            "functions": 0,
            "async_functions": 0,
            "await_calls": 0,
            "test_functions": 0,
            "assertions": 0,
            "try_blocks": 0,
            "decorators": 0,
            "type_annotations": 0,
            "imports": 0,
            "detected_features": set(),
        }

        try:
            tree = ast.parse(code)
        except SyntaxError:
            # If partial code or invalid syntax, fallback to heuristic regex
            return AstAnalyzer.analyze_code_heuristics(code, "Python")

        for node in ast.walk(tree):
            metrics["syntax_nodes"] += 1

            if isinstance(node, (ast.FunctionDef,)):
                metrics["functions"] += 1
                if node.name.startswith("test_") or node.name.endswith("_test"):
                    metrics["test_functions"] += 1
                    metrics["detected_features"].add("Unit Test Functions")
                if len(node.decorator_list) > 0:
                    metrics["decorators"] += len(node.decorator_list)
                    metrics["detected_features"].add("Decorators")
                if node.returns:
                    metrics["type_annotations"] += 1

            elif isinstance(node, ast.AsyncFunctionDef):
                metrics["async_functions"] += 1
                metrics["detected_features"].add("Asynchronous Coroutines (async/await)")

            elif isinstance(node, (ast.Await, ast.AsyncWith, ast.AsyncFor)):
                metrics["await_calls"] += 1
                metrics["detected_features"].add("Async Control Flow")

            elif isinstance(node, ast.ClassDef):
                metrics["classes"] += 1
                metrics["detected_features"].add("Object-Oriented Architecture (Classes)")
                if len(node.bases) > 0:
                    metrics["detected_features"].add("Class Inheritance")

            elif isinstance(node, ast.Assert):
                metrics["assertions"] += 1
                metrics["detected_features"].add("Assertions & Invariants")

            elif isinstance(node, (ast.Try, ast.ExceptHandler)):
                metrics["try_blocks"] += 1
                metrics["detected_features"].add("Robust Exception Handling")

            elif isinstance(node, (ast.Import, ast.ImportFrom)):
                metrics["imports"] += 1

            elif isinstance(node, (ast.ListComp, ast.DictComp, ast.SetComp, ast.GeneratorExp)):
                metrics["detected_features"].add("Comprehensions & Generators")

        # Compute normalized scores (0 to 10)
        syntax_score = min(10.0, 3.0 + (metrics["syntax_nodes"] / 40.0) + (metrics["functions"] * 0.8))
        oop_score = min(10.0, (metrics["classes"] * 2.5) + (metrics["try_blocks"] * 0.7))
        async_score = min(10.0, (metrics["async_functions"] * 3.5) + (metrics["await_calls"] * 1.5))
        testing_score = min(10.0, (metrics["test_functions"] * 2.8) + (metrics["assertions"] * 1.2))

        # Overall complexity (1.0 to 10.0)
        overall = (
            0.25 * syntax_score +
            0.30 * oop_score +
            0.25 * async_score +
            0.20 * testing_score
        )
        overall = max(1.0, min(10.0, round(overall, 1)))

        tier = "Beginner"
        if overall >= 7.2:
            tier = "Advanced"
        elif overall >= 4.0:
            tier = "Intermediate"

        return {
            "syntax_score": round(syntax_score, 1),
            "oop_score": round(oop_score, 1),
            "async_score": round(async_score, 1),
            "testing_score": round(testing_score, 1),
            "overall_complexity": overall,
            "tier": tier,
            "detected_features": list(metrics["detected_features"]),
        }

    @staticmethod
    def analyze_code_heuristics(code: str, language: str = "JavaScript") -> Dict[str, Any]:
        """
        Regex-based AST heuristic parser for JS/TS, Go, Java, and other languages.
        """
        detected_features = set()

        # Level 1: Basic procedural
        func_matches = len(re.findall(r"\b(function|def|func|void|public|const\s+\w+\s*=)\b", code))
        loops = len(re.findall(r"\b(for|while|forEach|map|filter)\b", code))

        # Level 2: OOP & Modularity
        class_matches = len(re.findall(r"\b(class|struct|interface|implements|extends|type\s+\w+\s+struct)\b", code))
        exceptions = len(re.findall(r"\b(try|catch|throw|finally|panic|recover)\b", code))
        if class_matches > 0:
            detected_features.add("OOP / Structured Models")
        if exceptions > 0:
            detected_features.add("Error & Exception Handling")

        # Level 3: Concurrency & Async
        async_matches = len(re.findall(r"\b(async|await|Promise|Observable|go\s+\w+|chan\s+|goroutine|Thread|Executor)\b", code))
        if async_matches > 0:
            detected_features.add("Asynchronous & Concurrent Execution")

        # Level 3: Unit Testing
        test_matches = len(re.findall(r"\b(describe|it|test|expect|assert|assert\.\w+|Testing\.T|suite)\b", code))
        if test_matches > 0:
            detected_features.add("Automated Test Suites (Jest/Vitest/Go test)")

        # Additional idioms
        if re.search(r"\b(useState|useEffect|useContext|useMemo)\b", code):
            detected_features.add("React Hooks & Reactive State")
        if re.search(r"(\bRouter|FastAPI|express|gin|mux)\b", code):
            detected_features.add("REST API & Routing Architecture")

        syntax_score = min(10.0, 3.5 + (func_matches * 0.5) + (loops * 0.4))
        oop_score = min(10.0, (class_matches * 2.2) + (exceptions * 0.8))
        async_score = min(10.0, async_matches * 2.0)
        testing_score = min(10.0, test_matches * 2.0)

        overall = (
            0.25 * syntax_score +
            0.30 * oop_score +
            0.25 * async_score +
            0.20 * testing_score
        )
        overall = max(1.0, min(10.0, round(overall, 1)))

        tier = "Beginner"
        if overall >= 7.2:
            tier = "Advanced"
        elif overall >= 4.0:
            tier = "Intermediate"

        return {
            "syntax_score": round(syntax_score, 1),
            "oop_score": round(oop_score, 1),
            "async_score": round(async_score, 1),
            "testing_score": round(testing_score, 1),
            "overall_complexity": overall,
            "tier": tier,
            "detected_features": list(detected_features),
        }

    @classmethod
    def aggregate_metrics(cls, metrics_list: List[Dict[str, Any]]) -> AstMetrics:
        """
        Aggregates AST metrics across multiple analyzed repository files.
        """
        if not metrics_list:
            return AstMetrics(
                syntax_score=4.0,
                oop_score=3.0,
                async_score=2.0,
                testing_score=2.0,
                overall_complexity=3.2,
                tier="Beginner",
                detected_features=["Standard Syntax", "Control Flow"],
            )

        n = len(metrics_list)
        avg_syntax = sum(m["syntax_score"] for m in metrics_list) / n
        avg_oop = sum(m["oop_score"] for m in metrics_list) / n
        avg_async = sum(m["async_score"] for m in metrics_list) / n
        avg_testing = sum(m["testing_score"] for m in metrics_list) / n

        all_features = set()
        for m in metrics_list:
            for f in m.get("detected_features", []):
                all_features.add(f)

        overall = (
            0.25 * avg_syntax +
            0.30 * avg_oop +
            0.25 * avg_async +
            0.20 * avg_testing
        )
        overall = max(1.0, min(10.0, round(overall, 1)))

        tier = "Beginner"
        if overall >= 7.2:
            tier = "Advanced"
        elif overall >= 4.0:
            tier = "Intermediate"

        return AstMetrics(
            syntax_score=round(avg_syntax, 1),
            oop_score=round(avg_oop, 1),
            async_score=round(avg_async, 1),
            testing_score=round(avg_testing, 1),
            overall_complexity=overall,
            tier=tier,
            detected_features=sorted(list(all_features))[:8],
        )
