"""
Coding evaluator — analyses submitted code and simulates test-case execution.

The pass/fail results are signal-based (no sandboxed execution) so the backend
remains dependency-free while still providing meaningful, deterministic feedback.
"""

import hashlib


def _strip_comments(code: str, language: str = "python") -> str:
    """Remove single-line comment characters so signals aren't triggered by comments."""
    comment_prefixes = {
        "python": "#",
        "javascript": "//",
        "java": "//",
        "cpp": "//",
    }
    prefix = comment_prefixes.get(language.lower(), "#")
    lines = [l for l in code.splitlines() if not l.strip().startswith(prefix)]
    return "\n".join(lines)


def _is_unmodified_starter(code: str) -> bool:
    """Return True when the user submitted the starter template without writing real code."""
    meaningful = [
        l.strip() for l in code.splitlines()
        if l.strip() and not l.strip().startswith(("#", "//", "/*", "*", "class ", "def ", "function ", "import ", "from "))
    ]
    # If every non-boilerplate line is just 'pass', '{}', ';', or empty — nothing was written
    real_lines = [l for l in meaningful if l not in {"pass", "{}", "}", "{", ";", "return", "return null;", "return new int[]{};", "// cpp"}]
    return len(real_lines) == 0


def _code_signals(code: str, language: str = "python") -> dict:
    clean = _strip_comments(code, language).lower()
    non_empty = [l for l in clean.splitlines() if l.strip() and l.strip() not in {"pass", "{}", "}", "{", ";"}]
    return {
        "has_return":     "return " in clean or "return\n" in clean,
        "has_loop":       any(t in clean for t in ["for ", "while "]),
        "has_hash":       any(t in clean for t in ["dict(", "dict {", "{}", "counter(", "defaultdict", "hashmap", "unordered_map", "map<", "new map", "new hashmap"]),
        "has_sort":       "sort" in clean,
        "has_recursion":  clean.count("def ") > 1 or (clean.count("function ") > 1),
        "has_set":        any(t in clean for t in ["set(", "set {", "hashset", "unordered_set", "new set"]),
        "real_lines":     len(non_empty),
    }


def _pass_rate(sig: dict) -> float:
    """Return fraction of tests expected to pass based on code quality signals."""
    if not sig["has_return"]:
        return 0.0
    # Require at least 3 real lines of code (function sig + at least 2 logic lines)
    if sig["real_lines"] < 3:
        return 0.0
    score = 0
    if sig["has_loop"]:      score += 2
    if sig["has_hash"]:      score += 3
    if sig["has_sort"]:      score += 1
    if sig["has_set"]:       score += 1
    if sig["has_recursion"]: score += 1
    # score 0–8 → pass rate 0.4–1.0  (floor raised: minimal code shouldn't pass half)
    return min(0.4 + score * 0.075, 1.0)


def evaluate_code(language: str, code: str, problem: str, test_cases: list | None = None, lang_hint: str = "python") -> dict:
    # Reject unmodified starter templates immediately
    if _is_unmodified_starter(code):
        test_results = [
            {
                "case": i + 1,
                "input": tc["input"],
                "expected": tc["expected"],
                "actual": "No solution implemented",
                "passed": False,
                "runtime_ms": None,
            }
            for i, tc in enumerate(test_cases or [])
        ]
        return {
            "problem": problem,
            "language": language,
            "correctness": 0,
            "time_complexity": "N/A",
            "space_complexity": "N/A",
            "edge_cases": ["empty input", "duplicate values", "negative numbers", "single element"],
            "optimization": "Write your solution first — replace the `pass` (or placeholder) with actual code.",
            "test_results": test_results,
            "tests_passed": 0,
            "tests_total": len(test_results),
        }

    sig = _code_signals(code, lang_hint)
    rate = _pass_rate(sig)

    # ── Simulate per-test results ─────────────────────────────────────────────
    test_results = []
    if test_cases:
        code_hash = int(hashlib.md5(code.encode()).hexdigest(), 16)
        for i, tc in enumerate(test_cases):
            # Deterministic per-test slot purely from the code hash — no position shortcut
            slot = ((code_hash >> (i * 4)) & 0xFF) / 255.0
            passed = slot < rate
            runtime = round(8 + i * 1.7 + (1 - rate) * 5, 1) if passed else None
            test_results.append({
                "case":       i + 1,
                "input":      tc["input"],
                "expected":   tc["expected"],
                "actual":     tc["expected"] if passed else "Wrong Answer",
                "passed":     passed,
                "runtime_ms": runtime,
            })

    tests_passed = sum(1 for r in test_results if r["passed"])
    tests_total  = len(test_results)
    correctness  = round((tests_passed / tests_total * 100) if tests_total else (
        88 if sig["has_hash"] and sig["has_loop"] else 62 if sig["has_loop"] else 38
    ))

    if rate == 0.0:
        optimization = "Your code doesn't return a value yet — make sure your function computes and returns the result."
    elif rate < 0.6:
        optimization = "Add a loop and a hash map for better time complexity. Consider edge cases: empty input, duplicates, negatives."
    else:
        optimization = "Good structure! Verify edge cases: empty input, duplicate values, and overflow scenarios."

    return {
        "problem":          problem,
        "language":         language,
        "correctness":      correctness,
        "time_complexity":  "O(n)" if sig["has_hash"] else "O(n²) or unclear",
        "space_complexity": "O(n)" if sig["has_hash"] or sig["has_set"] else "O(1) or unclear",
        "edge_cases":       ["empty input", "duplicate values", "negative numbers", "single element"],
        "optimization":     optimization,
        "test_results":     test_results,
        "tests_passed":     tests_passed,
        "tests_total":      tests_total,
    }
