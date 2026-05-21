from app.core.config import get_settings


class LLMService:
    async def complete(self, prompt: str) -> str:
        settings = get_settings()
        if settings.llm_provider == "openai" and settings.openai_api_key:
            from openai import AsyncOpenAI

            client = AsyncOpenAI(api_key=settings.openai_api_key)
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "system", "content": "You are a precise, supportive interview mentor."}, {"role": "user", "content": prompt}],
            )
            return response.choices[0].message.content or ""
        return self._local_response(prompt)

    def _local_response(self, prompt: str) -> str:
        if "next interview question" in prompt.lower():
            return "Walk me through a project from your resume. Explain the architecture, one tradeoff you made, and how you measured success."
        if "feedback" in prompt.lower():
            return "Good structure. Improve by adding concrete metrics, naming edge cases, and closing with the result."
        return "Focus on fundamentals, state assumptions clearly, and support answers with examples from your projects."


llm_service = LLMService()
