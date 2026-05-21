DEFAULT_TOPICS = ["arrays", "hash maps", "strings", "recursion", "dynamic programming"]


QUESTION_TEMPLATES = [
    {
        "title": "{topic} Tracker",
        "description": "Given a list of events from a resume-style project, return the most frequent valid {topic} item and its count. Handle empty input, duplicate values, and ties by returning the lexicographically smallest item.",
        "starter_code": {
            "python": "def solve(items):\n    # Return (item, count)\n    pass\n",
            "javascript": "function solve(items) {\n  // Return [item, count]\n}\n",
            "java": "class Solution {\n    public String solve(String[] items) {\n        return \"\";\n    }\n}\n",
            "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\npair<string, int> solve(vector<string> items) {\n    return {\"\", 0};\n}\n",
        },
    },
    {
        "title": "{topic} Dependency Check",
        "description": "You are given project tasks and dependency pairs related to {topic}. Determine whether all tasks can be completed without a cycle. Explain the graph approach and complexity.",
        "starter_code": {
            "python": "def can_complete(tasks, dependencies):\n    # dependencies contains (before, after)\n    pass\n",
            "javascript": "function canComplete(tasks, dependencies) {\n  // dependencies contains [before, after]\n}\n",
            "java": "class Solution {\n    public boolean canComplete(String[] tasks, String[][] dependencies) {\n        return false;\n    }\n}\n",
            "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nbool canComplete(vector<string> tasks, vector<pair<string, string>> dependencies) {\n    return false;\n}\n",
        },
    },
    {
        "title": "{topic} Window Analysis",
        "description": "Given daily metric values from a {topic} feature, find the contiguous window with the maximum sum and return its start index, end index, and sum. Include negative numbers and single-day windows.",
        "starter_code": {
            "python": "def best_window(values):\n    # Return (start, end, total)\n    pass\n",
            "javascript": "function bestWindow(values) {\n  // Return [start, end, total]\n}\n",
            "java": "class Solution {\n    public int[] bestWindow(int[] values) {\n        return new int[]{};\n    }\n}\n",
            "cpp": "#include <bits/stdc++.h>\nusing namespace std;\n\nvector<int> bestWindow(vector<int> values) {\n    return {};\n}\n",
        },
    },
]


def coding_question(topics: list[str], index: int, language: str) -> dict:
    clean_topics = [topic.strip() for topic in topics if topic.strip()] or DEFAULT_TOPICS
    topic = clean_topics[index % len(clean_topics)]
    template = QUESTION_TEMPLATES[index % len(QUESTION_TEMPLATES)]
    starter_code = template["starter_code"].get(language, template["starter_code"]["python"])

    return {
        "index": index,
        "topic": topic,
        "title": template["title"].format(topic=topic),
        "description": template["description"].format(topic=topic),
        "starter_code": starter_code,
    }
