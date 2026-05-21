import re

KNOWN_SKILLS = [
    "python", "java", "c++", "javascript", "typescript", "react", "node", "fastapi",
    "django", "sql", "postgresql", "mongodb", "aws", "docker", "kubernetes", "git",
    "machine learning", "nlp", "langchain", "system design", "data structures", "algorithms",
]


def _find_lines(text: str, *keywords: str) -> list[str]:
    lines = [line.strip(" -•\t") for line in text.splitlines() if line.strip()]
    return [line for line in lines if any(key in line.lower() for key in keywords)][:6]


def analyze_resume(text: str) -> dict:
    lower = text.lower()
    skills = sorted({skill.title() for skill in KNOWN_SKILLS if skill in lower})
    technologies = [item for item in skills if item.lower() not in {"data structures", "algorithms"}]
    project_lines = _find_lines(text, "project", "built", "developed", "implemented")
    experience = _find_lines(text, "intern", "engineer", "experience", "worked")
    certifications = _find_lines(text, "certified", "certification", "certificate")
    years = re.findall(r"(\d+)\+?\s+years?", lower)
    topics = sorted(set(skills + ["Behavioral STAR answers", "Resume deep dive", "Complexity analysis"]))
    ats_score = min(95, 45 + len(skills) * 4 + len(project_lines) * 5 + len(certifications) * 3 + (8 if years else 0))
    return {
        "skills": skills or ["Python", "SQL", "Problem Solving"],
        "technologies": technologies or ["FastAPI", "React"],
        "projects": project_lines or ["Project details not explicit. Prepare a concise architecture walkthrough."],
        "experience": experience or ["No explicit experience section found."],
        "certifications": certifications or ["No certifications detected."],
        "topics": topics,
        "ats_score": ats_score,
    }
