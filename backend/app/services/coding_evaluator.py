def evaluate_code(language: str, code: str, problem: str) -> dict:
    lower = code.lower()
    has_hash = any(token in lower for token in ["dict", "map", "unordered_map", "hashmap", "{}"])
    has_loop = any(token in lower for token in ["for", "while"])
    correctness = 88 if has_hash and has_loop else 62 if has_loop else 38
    return {
        "problem": problem,
        "language": language,
        "correctness": correctness,
        "time_complexity": "O(n)" if has_hash else "O(n^2) or unclear",
        "space_complexity": "O(n)" if has_hash else "O(1) or unclear",
        "edge_cases": ["empty array", "duplicate numbers", "negative values", "no valid pair"],
        "optimization": "Use a hash map to store complements in one pass and return as soon as a match is found.",
    }
