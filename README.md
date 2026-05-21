# Smart Interview Preparation Mentor

A modern full-stack AI SaaS application for personalized interview preparation. It includes a React + Tailwind dashboard, FastAPI backend, JWT auth, resume parsing, RAG question retrieval, mock interview sessions, coding evaluation, analytics, recommendations, voice hooks, emotion hooks, Docker support, and a seed interview knowledge base.

## Architecture

```text
frontend/ React, TypeScript, Tailwind, Framer Motion, Recharts, Monaco
backend/  FastAPI, SQLAlchemy, JWT, document parsing, RAG, LLM adapter
database  SQLite locally by default, PostgreSQL via Docker
vector DB ChromaDB with Sentence Transformers, keyword fallback when unavailable
MongoDB   Optional Atlas persistence for resumes, sessions, chat, and feedback
LLM       OpenAI when configured, deterministic local mentor fallback otherwise
```

## Core API Routes

- `POST /api/auth/demo` and `POST /api/auth/register`
- `POST /api/resumes/analyze`
- `POST /api/rag/search`
- `POST /api/interviews/start`
- `POST /api/interviews/{session_id}/answer`
- `POST /api/coding/evaluate`
- `GET /api/analytics/me`
- `GET /api/recommendations/today`
- `POST /api/voice/analyze`
- `POST /api/emotion/analyze`
- `GET /api/database/status`

## Database Schema

- `users`: auth profile, password hash, optional Google id
- `resume_profiles`: uploaded resume text and extracted JSON analysis
- `interview_sessions`: mode, company, topics, conversation history
- `chat_messages`: stored chat turns for replay and summaries
- `feedback_events`: score history for weak area analytics

When `MONGODB_URI` is configured, the backend also writes these MongoDB Atlas collections in `smart_interview_ai`:

- `users`
- `resume_profiles`
- `interview_sessions`
- `chat_messages`
- `feedback_events`

## Local Setup

Backend:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
copy .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Connect MongoDB Atlas

The MongoDB Cloud page URL is only the web console. The backend needs the Atlas driver connection string:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/smart_interview_ai?retryWrites=true&w=majority
MONGODB_DB=smart_interview_ai
```

In Atlas, open **Database > Connect > Drivers**, copy the Python connection string, replace `<password>`, and paste it into `backend/.env`.

Then verify:

```bash
curl http://localhost:8000/api/database/status
```

You should see `"enabled": true`.

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. API docs are at `http://localhost:8000/docs`.

## Docker Setup

```bash
copy backend\.env.example backend\.env
docker compose up --build
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:8000/docs`

## RAG Pipeline

1. Upload PDF, DOCX, or TXT.
2. Backend extracts text with `pypdf`, `python-docx`, or text reader.
3. Text is chunked with overlap.
4. Embeddings are generated using Sentence Transformers.
5. Chunks are stored in ChromaDB with source metadata.
6. Interview and search routes retrieve relevant context by semantic similarity.
7. Retrieved context is passed into the LLM prompt.

The backend also seeds `backend/data/seed/interview_bank.md` at startup for company-specific and mode-specific interview content.

## AI Configuration

By default, `LLM_PROVIDER=local` returns deterministic mentor responses so the app works without paid keys. To use OpenAI:

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=your-key
```

## Deployment

1. Build frontend with `npm run build` and host `frontend/dist` on Vercel, Netlify, Cloudflare Pages, or Nginx.
2. Deploy backend Docker image to Render, Fly.io, Railway, AWS ECS, or GCP Cloud Run.
3. Use managed PostgreSQL and persistent storage for ChromaDB.
4. Set `SECRET_KEY`, `DATABASE_URL`, `MONGODB_URI`, `MONGODB_DB`, `OPENAI_API_KEY`, `CORS_ORIGINS`, and `CHROMA_PATH`.
5. Configure HTTPS and restrict CORS to production frontend domains.

## Notes

Voice and webcam emotion routes are backend-ready signal analyzers. The frontend includes entry controls; production browser capture can be added with the Web Speech API and MediaPipe/face-api.js while sending summarized signals to `/api/voice/analyze` and `/api/emotion/analyze`.
