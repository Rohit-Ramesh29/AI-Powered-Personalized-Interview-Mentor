# 🤖 AI-Powered Personalized Interview Mentor

A modern full-stack AI SaaS platform that helps users prepare for technical, HR, and system design interviews using adaptive AI-driven mock sessions. The platform analyzes resumes, generates personalized questions, evaluates answers in real time, and provides performance analytics to improve interview readiness.

---

## ✨ Features

- **📄 Resume Parsing & Skill Extraction**: Upload PDF, DOCX, or TXT resumes to extract key skills and build tailored questions.
- **🎯 Personalized AI Mock Interviews**: Dynamic chat-based sessions tailored to your target company, role, and skills.
- **💼 Comprehensive Interview Rounds**: Covers HR behavioral questions, deep technical challenges, and system design.
- **⚡ Real-Time Feedback & Scoring**: Automatic evaluation of replies with actionable scores and suggestions.
- **🧠 RAG-Based Question Generation**: Context-aware retrieval of technical questions from a local seed knowledge base and chroma vector DB.
- **📊 Performance Analytics Dashboard**: High-fidelity UI charting your progress, strengths, and areas for improvement.
- **💻 Monaco Code Playground**: Write and run code solutions directly inside the browser with AI evaluation.
- **🔐 JWT Authentication**: Secure register/login flow using JSON Web Tokens.
- **☁️ Hybrid DB Integration**: Support for SQLite/PostgreSQL, optional MongoDB Atlas persistence, and ChromaDB vector search.

---

## 🏗️ Architecture

```text
frontend/ React, TypeScript, Tailwind, Framer Motion, Recharts, Monaco
backend/  FastAPI, SQLAlchemy, JWT, document parsing, RAG, LLM adapter
database  SQLite locally by default, PostgreSQL via Docker
vector DB ChromaDB with Sentence Transformers, keyword fallback when unavailable
MongoDB   Optional Atlas persistence for resumes, sessions, chat, and feedback
LLM       OpenAI when configured, deterministic local mentor fallback otherwise
```

The system follows a three-tier architecture:
1. **Frontend Layer**: Handles interactive UI, coding environment, dashboards, and interview sessions.
2. **Backend Layer**: Multi-route REST API, authentication, JWT tokens, resume processing, and AI connector.
3. **Database & Vector DB Layer**: Persists local configurations, seeds, vectorized question indices, and session telemetry.

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Monaco Editor, Framer Motion, Recharts
- **Backend**: FastAPI, Python, Uvicorn, SQLAlchemy
- **AI & Vector Search**: OpenAI API, ChromaDB, Sentence Transformers, `pypdf`, `python-docx`
- **Database**: SQLite (default local), MongoDB Atlas (optional cloud persistence)

---

## 🔄 Workflow

1. **User Registration & Login**: Authenticate securely to track your history.
2. **Resume Upload**: Upload your professional profile.
3. **AI Skill Analysis**: Extracted text compiles into a structured candidate profile.
4. **Mock Interview Selection**: Select round types (Technical, HR, System Design) and company focus.
5. **Interactive Evaluation**: Real-time adaptive AI follow-up questions and evaluation.
6. **Analytics & Recommendations**: Receive feedback, study recommendations, and performance metrics.

---

## 🚀 Local Setup

### ⚙️ Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On Unix/macOS:
   source .venv/bin/activate
   ```
3. Copy the environment template:
   ```bash
   copy .env.example .env
   # Or on Unix: cp .env.example .env
   ```
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *API documentation will be available at `http://localhost:8000/docs`.*

### 💻 Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser.*

---

## 🔑 Environment Variables & AI Configuration

By default, the backend runs with `LLM_PROVIDER=local` which returns deterministic mentor responses (ideal for testing without a paid OpenAI subscription).

To enable OpenAI integration and MongoDB Atlas cloud storage, update the variables inside your `backend/.env` file:

```env
# AI Config
LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key

# MongoDB Cloud Database (Optional)
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/smart_interview_ai?retryWrites=true&w=majority
MONGODB_DB=smart_interview_ai
```

Verify your database status using:
```bash
curl http://localhost:8000/api/database/status
```

---

## 🐳 Docker Setup

You can run the entire stack (Frontend + Backend + DB) containerized:

1. Copy the backend template env to the final backend env:
   ```bash
   copy backend\.env.example backend\.env
   ```
2. Launch Docker compose:
   ```bash
   docker compose up --build
   ```
3. Access:
   - Frontend: `http://localhost:5173`
   - Backend Docs: `http://localhost:8000/docs`

---

## 🧠 RAG Pipeline & Knowledge Base

1. **Upload**: Resumes (PDF, DOCX, TXT) are read and extracted.
2. **Chunking**: Extracted texts are split into overlapping chunks.
3. **Embedding**: Sentence Transformers index the segments into ChromaDB.
4. **Retrieval**: When interviewing, matching contexts are fetched by semantic similarity.
5. **Seeding**: The backend automatically seeds `backend/data/seed/interview_bank.md` to populate standard question sets at first startup.

---

## 🌟 Future Enhancements

- 🎤 **Voice-Based Interview Analysis**: Speech-to-text with conversational emotion hooks.
- 😊 **Webcam Emotion Detection**: Real-time face expression telemetry.
- 📄 **AI Resume Builder**: Context-aware optimization recommendation systems.
- 🌍 **Multi-Language Support**: Interactive evaluation in Spanish, French, German, etc.
