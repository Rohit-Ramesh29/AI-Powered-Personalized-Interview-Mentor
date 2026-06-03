import json
from uuid import uuid4

from app.core.config import get_settings
from app.rag.vector_store import vector_store
from app.services.llm_service import llm_service


def _resume_summary(resume_context: dict | None) -> dict:
    """Extract useful fields from resume analysis dict."""
    if not resume_context:
        return {}
    return {
        "skills": resume_context.get("skills") or [],
        "technologies": resume_context.get("technologies") or [],
        "projects": resume_context.get("projects") or [],
        "experience": resume_context.get("experience") or [],
        "topics": resume_context.get("topics") or [],
    }


async def first_question(mode: str, company: str, topics: list[str], resume_context: dict | None = None) -> str:
    r = _resume_summary(resume_context)

    if mode == "HR":
        if r.get("projects") or r.get("experience"):
            highlight = (r["projects"] or r["experience"])[0]
            return (
                f"Welcome! Let's start with an introduction. "
                f"I can see you've worked on projects like '{highlight}'. "
                f"Tell me about yourself — walk me through your background, what drives you, "
                f"and what you consider your most significant achievement so far."
            )
        return (
            "Welcome to the HR interview! Tell me about yourself. "
            "Walk me through your professional journey, what excites you about this opportunity, "
            "and what makes you the right fit."
        )

    if mode == "Coding":
        techs = r.get("technologies") or r.get("skills") or topics
        tech_hint = techs[0] if techs else "arrays"
        return (
            f"Let's begin with a coding question related to your experience with {tech_hint}. "
            f"Problem: Given an array of integers and a target sum, find all unique pairs that add up to the target. "
            f"Walk me through your approach, state the time and space complexity, and discuss any edge cases."
        )

    # Technical / System Design — use resume topics if available
    effective_topics = topics or r.get("topics") or r.get("technologies") or []
    if effective_topics:
        topic = effective_topics[0]
        return (
            f"Question 1 — {topic}: Based on your background, tell me about your hands-on experience with {topic}. "
            f"Describe the project context, your specific role, the technical decisions you made, and the measurable outcome."
        )

    query = f"{company} {mode} {' '.join(effective_topics)} interview question"
    contexts = vector_store.search(query, k=3)
    context_text = "\n".join(item["text"] for item in contexts)
    prompt = f"Generate the first interview question for a {mode} interview at {company}.\nContext:\n{context_text}"
    return await llm_service.complete(prompt)


async def follow_up(
    mode: str,
    company: str,
    topics: list[str],
    answer: str,
    history: list[dict],
    resume_context: dict | None = None,
) -> tuple[str, dict]:
    settings = get_settings()
    if settings.llm_provider == "openai" and settings.openai_api_key:
        r = _resume_summary(resume_context)

        if mode == "HR":
            resume_blurb = ""
            if r:
                resume_blurb = (
                    f"Candidate resume — Projects: {r['projects'][:3]}; "
                    f"Experience: {r['experience'][:3]}; Skills: {r['skills'][:5]}."
                )
            prompt = f"""
You are an experienced HR interviewer. Ask ONLY behavioral/situational questions using the STAR framework.
Do NOT ask technical, coding, or system-design questions.
Focus on: communication, leadership, teamwork, conflict resolution, adaptability, problem-solving mindset.
{resume_blurb}

Interview History:
{history[-4:]}

Candidate's Latest Answer:
{answer}

Generate:
1. A single behavioral follow-up question that references the candidate's resume or their previous answer.
2. Structured feedback scores out of 100 for technical_accuracy, communication, confidence, clarity, plus 2 concise suggestions.

Respond ONLY with valid JSON:
{{
  "question": "behavioral question here",
  "feedback": {{
    "technical_accuracy": 75,
    "communication": 85,
    "confidence": 80,
    "clarity": 85,
    "suggestions": ["suggestion 1", "suggestion 2"]
  }}
}}"""

        elif mode == "Coding":
            techs = r.get("technologies") or r.get("skills") or topics
            tech_str = ", ".join(techs[:4]) if techs else "general algorithms"
            prompt = f"""
You are a coding interviewer. Ask ONLY algorithm/data-structure/coding questions.
The candidate has experience with: {tech_str}.
Do NOT ask behavioral or system-design questions.
Progress from easier to harder problems. Reference the candidate's tech stack.

Interview History:
{history[-4:]}

Candidate's Latest Answer:
{answer}

Generate:
1. A single coding question (describe the problem, expected I/O, complexity requirements).
2. Feedback scores out of 100 for technical_accuracy, communication, confidence, clarity, plus 2 suggestions.

Respond ONLY with valid JSON:
{{
  "question": "coding question here",
  "feedback": {{
    "technical_accuracy": 80,
    "communication": 75,
    "confidence": 78,
    "clarity": 80,
    "suggestions": ["suggestion 1", "suggestion 2"]
  }}
}}"""

        else:
            context = vector_store.search(f"{company} {mode} follow up {answer}", k=3)
            context_text = "\n".join(item["text"] for item in context)
            resume_blurb = ""
            if r:
                resume_blurb = (
                    f"Candidate resume — Technologies: {r['technologies'][:4]}; "
                    f"Projects: {r['projects'][:3]}; Topics: {r['topics'][:5]}."
                )
            prompt = f"""
You are an expert {mode} interviewer at {company}. Evaluate the candidate's answer and ask a contextual follow-up.
{resume_blurb}
Knowledge Context:
{context_text}

Interview History:
{history[-4:]}

Candidate's Answer:
{answer}

Generate:
1. One highly adaptive, contextual follow-up question.
2. Structured feedback scores out of 100 for technical_accuracy, communication, confidence, clarity, plus 2-3 specific suggestions.

Respond ONLY with valid JSON:
{{
  "question": "follow-up question here",
  "feedback": {{
    "technical_accuracy": 85,
    "communication": 90,
    "confidence": 80,
    "clarity": 85,
    "suggestions": ["suggestion 1", "suggestion 2"]
  }}
}}"""

        try:
            raw_response = await llm_service.complete(prompt)
            clean_response = raw_response.strip()
            if clean_response.startswith("```json"):
                clean_response = clean_response[7:]
            if clean_response.endswith("```"):
                clean_response = clean_response[:-3]
            clean_response = clean_response.strip()

            data = json.loads(clean_response)
            if "question" in data and "feedback" in data:
                fb = data["feedback"]
                validated_feedback = {
                    "technical_accuracy": int(fb.get("technical_accuracy", 75)),
                    "communication": int(fb.get("communication", 75)),
                    "confidence": int(fb.get("confidence", 75)),
                    "clarity": int(fb.get("clarity", 75)),
                    "suggestions": list(fb.get("suggestions", ["Structure with clear context.", "Focus on specific metrics."])),
                }
                return next_question(mode, company, topics, history, data["question"], resume_context), validated_feedback
        except Exception:
            pass

    # Fallback heuristic scoring
    base = 55 + min(35, len(answer.split()) // 3)
    feedback = {
        "technical_accuracy": min(95, base),
        "communication": min(92, base + (8 if any(w in answer.lower() for w in ["because", "therefore", "tradeoff"]) else 0)),
        "confidence": 74 if len(answer) > 80 else 58,
        "clarity": 82 if "." in answer else 65,
        "suggestions": [
            "Open with a direct answer before going into details.",
            "Use one concrete project metric or example.",
            "Mention edge cases and tradeoffs explicitly.",
        ],
    }
    return next_question(mode, company, topics, history, resume_context=resume_context), feedback


def next_question(
    mode: str,
    company: str,
    topics: list[str],
    history: list[dict],
    llm_question: str | None = None,
    resume_context: dict | None = None,
) -> str:
    interviewer_turns = [t for t in history if t.get("role") == "interviewer"]
    question_number = len(interviewer_turns) + 1
    r = _resume_summary(resume_context)

    effective_topics = topics or r.get("topics") or r.get("technologies") or []

    if mode == "HR":
        hr_prompts = [
            "Tell me about a time you faced a significant challenge in a team project. What was the situation, what did you do, and what was the result?",
            "Describe a situation where you had to adapt quickly to an unexpected change. How did you handle it?",
            "Give me an example of a time you showed leadership, even if you weren't the designated leader.",
            "Tell me about a conflict you experienced with a colleague. How did you resolve it?",
            "Describe a project where you had to balance multiple priorities under a tight deadline. What was your approach?",
        ]
        if r.get("projects"):
            project = r["projects"][(question_number - 1) % len(r["projects"])]
            return f"Question {question_number}: Thinking about your work on '{project}' — describe a challenge you encountered and how you overcame it. What did you learn from that experience?"
        return f"Question {question_number}: {hr_prompts[(question_number - 1) % len(hr_prompts)]}"

    if mode == "Coding":
        techs = r.get("technologies") or r.get("skills") or effective_topics
        tech = techs[(question_number - 1) % len(techs)] if techs else "linked lists"
        coding_prompts = [
            f"Given your experience with {tech}, implement a function to detect a cycle in a linked list. State time and space complexity.",
            f"Design an LRU cache using {tech} concepts. Explain the data structures you'd use and why.",
            f"How would you find the k-th largest element in an unsorted array efficiently? What's the optimal approach?",
            f"Implement a function to serialize and deserialize a binary tree. Discuss the trade-offs of your approach.",
            f"Given a string, find the longest substring without repeating characters. Walk through your solution step by step.",
        ]
        return f"Question {question_number}: {coding_prompts[(question_number - 1) % len(coding_prompts)]}"

    if effective_topics:
        topic = effective_topics[(question_number - 1) % len(effective_topics)]
        prompts_by_mode = {
            "Technical": f"Question {question_number} — {topic}: Go deeper on {topic}. How did you apply it in your resume project, what alternatives did you consider, and what would you improve now? (Context: {company} interview)",
            "System Design": f"Question {question_number} — {topic}: Design a scalable {company}-style component that uses {topic}. Cover the API contract, data model, bottlenecks, and trade-offs.",
        }
        return prompts_by_mode.get(mode, prompts_by_mode["Technical"])

    if llm_question:
        return llm_question

    return (
        f"Question {question_number}: Pick another project from your resume. "
        "Explain the problem, your contribution, the trade-offs you made, and a measurable outcome."
    )


def new_session_id() -> str:
    return uuid4().hex
