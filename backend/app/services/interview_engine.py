import json
from uuid import uuid4

from app.core.config import get_settings
from app.rag.vector_store import vector_store
from app.services.llm_service import llm_service


async def first_question(mode: str, company: str, topics: list[str]) -> str:
    if topics:
        topic = topics[0]
        return (
            f"Question 1 - {topic}: Tell me about your hands-on experience with {topic} from your resume. "
            f"Explain the project context, your role, the technical choices you made, and the result."
        )

    query = f"{company} {mode} {' '.join(topics)} interview question"
    contexts = vector_store.search(query, k=3)
    context_text = "\n".join(item["text"] for item in contexts)
    prompt = f"Generate the next interview question for a {mode} interview at {company}.\nContext:\n{context_text}\nTopics: {topics}"
    return await llm_service.complete(prompt)


async def follow_up(mode: str, company: str, topics: list[str], answer: str, history: list[dict]) -> tuple[str, dict]:
    settings = get_settings()
    if settings.llm_provider == "openai" and settings.openai_api_key:
        context = vector_store.search(f"{company} {mode} follow up {answer}", k=3)
        context_text = "\n".join(item["text"] for item in context)
        
        prompt = f"""
You are an expert interviewer. Evaluate the candidate's latest answer based on the interview history and context.
Interview Mode: {mode}
Company: {company}
Knowledge Context:
{context_text}

Interview History:
{history[-4:]}

Candidate's Answer:
{answer}

Generate:
1. The next single, highly adaptive, contextual follow-up question.
2. Structured score feedback out of 100 for technical accuracy, communication, confidence, and clarity, along with 2-3 brief, highly specific suggestions.

You MUST respond ONLY with a valid JSON object matching this schema exactly:
{{
  "question": "next adaptive follow-up question here",
  "feedback": {{
    "technical_accuracy": 85,
    "communication": 90,
    "confidence": 80,
    "clarity": 85,
    "suggestions": ["specific suggestion 1", "specific suggestion 2"]
  }}
}}
Do not write any other text, prefix, or explanation. Return ONLY the JSON block.
"""
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
                return next_question(mode, company, topics, history, data["question"]), validated_feedback
        except Exception:
            pass

    # Fallback to local heuristic logic
    base = 55 + min(35, len(answer.split()) // 3)
    feedback = {
        "technical_accuracy": min(95, base),
        "communication": min(92, base + (8 if any(word in answer.lower() for word in ["because", "therefore", "tradeoff"]) else 0)),
        "confidence": 74 if len(answer) > 80 else 58,
        "clarity": 82 if "." in answer else 65,
        "suggestions": [
            "Open with a direct answer before details.",
            "Use one concrete project metric or example.",
            "Mention edge cases and tradeoffs explicitly.",
        ],
    }
    return next_question(mode, company, topics, history), feedback


def next_question(mode: str, company: str, topics: list[str], history: list[dict], llm_question: str | None = None) -> str:
    interviewer_turns = [turn for turn in history if turn.get("role") == "interviewer"]
    question_number = len(interviewer_turns) + 1

    if topics:
        topic = topics[(question_number - 1) % len(topics)]
        prompts_by_mode = {
            "HR": f"Question {question_number} - {topic}: Share a situation from your resume where {topic} mattered. What was the challenge, what did you do, and what did you learn?",
            "Technical": f"Question {question_number} - {topic}: Go deeper on {topic}. How did you apply it in your resume project, what alternatives did you consider, and what would you improve now?",
            "Coding": f"Question {question_number} - {topic}: Design an algorithmic approach related to {topic}. State the input, output, edge cases, and time and space complexity.",
            "System Design": f"Question {question_number} - {topic}: Design a scalable component for a product that uses {topic}. Cover APIs, data model, bottlenecks, and tradeoffs.",
        }
        return prompts_by_mode.get(mode, prompts_by_mode["Technical"])

    if llm_question:
        return llm_question

    return (
        f"Question {question_number}: Pick another project from your resume. "
        "Explain the problem, your contribution, tradeoffs, and measurable outcome."
    )


def new_session_id() -> str:
    return uuid4().hex
