
# AI-POWERED PERSONALIZED INTERVIEW MENTOR
## Project Report

---

| | |
|---|---|
| **Name** | Rohit R |
| **College** | Sri Krishna College of Technology |
| **Department** | Computer Science and Engineering |
| **Project Title** | AI-Powered Personalized Interview Mentor |
| **Academic Year** | 2025–2026 |

---

## Abstract

The AI-Powered Personalized Interview Mentor is an intelligent, full-stack SaaS application designed to help students and professionals prepare for technical and HR interviews in a structured, adaptive, and data-driven manner. The system leverages large language models (LLMs), Retrieval-Augmented Generation (RAG), resume parsing, and real-time feedback to simulate realistic mock interview sessions tailored to the individual's background, target company, and chosen interview mode.

---

## 1. Introduction

Job interviews remain one of the most challenging milestones in a professional's career. Despite the availability of general-purpose preparation resources—books, YouTube videos, and static question banks—candidates frequently struggle to receive personalized, contextual feedback that adapts to their unique experience and skill set.

The **AI-Powered Personalized Interview Mentor** bridges this gap by building an intelligent mentoring platform that:

- **Parses the candidate's resume** to understand their skills, projects, and technologies.
- **Generates adaptive, context-aware interview questions** based on the resume, target company, and selected mode (HR, Technical, Coding, System Design).
- **Evaluates candidate responses** in real time using LLM-powered feedback, scoring answers across dimensions such as technical accuracy, communication, confidence, and clarity.
- **Provides actionable analytics** showing performance trends and weak areas over time.
- **Supports coding rounds** with in-browser code execution and automated evaluation.
- **Incorporates voice and emotion signals** for a holistic interview simulation experience.

The application is built as a modern full-stack system using **React + TypeScript** for the frontend, **FastAPI (Python)** for the backend, **SQLite / PostgreSQL** for relational data, **ChromaDB** as the vector database, and optionally **MongoDB Atlas** for cloud persistence.

---

## 2. Existing System

### 2.1 Overview of Current Approaches

Before this project, candidates relied on the following conventional preparation strategies:

| Method | Description | Limitation |
|---|---|---|
| **Static Question Banks** | Websites like LeetCode, InterviewBit, GeeksforGeeks offer curated questions | No personalization; no feedback on verbal answers |
| **Mock Interview Platforms** | Services like Pramp, Interviewing.io connect peers for mock interviews | Dependent on human availability; inconsistent feedback quality |
| **YouTube / Blog Resources** | Video tutorials and blog posts on interview topics | One-way content; no interactive, adaptive learning |
| **Resume Review Services** | Manual review by mentors or career counsellors | Expensive, slow, and not scalable |
| **Generic AI Chatbots** | ChatGPT and similar tools used informally | No session continuity, no analytics, no resume-awareness |

### 2.2 Drawbacks of the Existing System

1. **Lack of Personalization** — Questions are not tailored to the candidate's resume, domain, or target company.
2. **No Real-Time Feedback** — Candidates receive no immediate scoring or suggestions during practice.
3. **No Progress Tracking** — Performance over multiple sessions is not recorded or visualized.
4. **Human Dependency** — Peer-based mock interviews require scheduling and are inconsistent.
5. **Mode Rigidity** — Existing tools do not switch seamlessly between HR, Technical, Coding, and System Design modes.
6. **No Resume Integration** — Questions are generic and not derived from the candidate's own experience.
7. **No Coding Evaluation** — Verbal answer tools don't include integrated code editors or code correctness checks.

---

## 3. Proposed Approach

The proposed system introduces an **AI-driven, resume-aware, adaptive interview coaching platform** that resolves all the limitations above.

### 3.1 Core Design Principles

- **Personalization First** — The system reads the candidate's resume and extracts skills, technologies, and project topics to generate relevant, resume-grounded questions.
- **Adaptive Questioning** — Follow-up questions are generated dynamically based on the quality and content of the candidate's previous answer using LLM intelligence.
- **Multi-Modal Interview Support** — The platform supports four distinct interview modes: HR, Technical, Coding, and System Design.
- **Real-Time Scoring & Feedback** — Every answer is scored on four axes (technical accuracy, communication, confidence, clarity) with specific improvement suggestions.
- **RAG-Enhanced Knowledge** — A ChromaDB vector store seeded with a curated interview knowledge base ensures company-specific and topic-specific question diversity beyond the resume alone.
- **Analytics Dashboard** — A dedicated analytics module tracks performance trends, highlights weak areas, and recommends daily practice topics.
- **Coding Environment** — A Monaco editor-based coding round allows candidates to write, submit, and receive evaluated feedback on code solutions.
- **Voice & Emotion Hooks** — Backend-ready endpoints for voice analysis and facial emotion detection to simulate a realistic interview atmosphere.

### 3.2 Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts, Monaco Editor |
| **Backend** | FastAPI (Python), SQLAlchemy ORM, JWT Authentication |
| **Relational DB** | SQLite (development), PostgreSQL (production via Docker) |
| **Vector DB** | ChromaDB with Sentence Transformers embeddings |
| **Cloud DB** | MongoDB Atlas (optional, for distributed persistence) |
| **LLM** | OpenAI GPT-4o-mini (configurable); deterministic local fallback |
| **Document Parsing** | pypdf, python-docx for PDF and DOCX resume extraction |
| **Containerization** | Docker + Docker Compose |
| **Deployment** | Vercel / Netlify (frontend), Render / Fly.io / AWS ECS (backend) |

---

## 4. System Architecture

The system follows a **three-tier client-server architecture** augmented with an AI/ML intelligence layer.

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Browser)                        │
│  React + TypeScript + Vite                                       │
│  ┌──────────┐ ┌──────────────┐ ┌────────────┐ ┌─────────────┐  │
│  │ Landing  │ │  Auth Page   │ │ Dashboard  │ │  Analytics  │  │
│  └──────────┘ └──────────────┘ └────────────┘ └─────────────┘  │
│  ┌──────────────────┐ ┌──────────────┐ ┌──────────────────────┐ │
│  │ Interview Session│ │ Coding Round │ │    Resume Upload     │ │
│  └──────────────────┘ └──────────────┘ └──────────────────────┘ │
└────────────────────────────┬────────────────────────────────────┘
                             │ REST API (JSON over HTTPS)
┌────────────────────────────▼────────────────────────────────────┐
│                    BACKEND (FastAPI / Python)                     │
│                                                                   │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌──────────────────┐  │
│  │   Auth   │ │ Resumes  │ │ Interviews │ │     Coding       │  │
│  │  Routes  │ │  Routes  │ │   Routes   │ │     Routes       │  │
│  └──────────┘ └──────────┘ └────────────┘ └──────────────────┘  │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌──────────────────┐  │
│  │Analytics │ │   RAG    │ │   Voice    │ │    Emotion       │  │
│  │  Routes  │ │  Routes  │ │   Routes   │ │     Routes       │  │
│  └──────────┘ └──────────┘ └────────────┘ └──────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐    │
│                     SERVICE LAYER                                  │
│  │  LLM Service │ Interview Engine │ Resume Parser          │    │
│  │  Coding Evaluator │ RAG Vector Store │ Analytics Engine  │    │
│  └──────────────────────────────────────────────────────────┘    │
└────┬──────────────────────────────┬──────────────────────────────┘
     │                              │
┌────▼──────┐  ┌─────────────┐  ┌──▼────────────┐  ┌─────────────┐
│ SQLite /  │  │  ChromaDB   │  │  MongoDB Atlas│  │  OpenAI API │
│PostgreSQL │  │  (Vectors)  │  │  (Optional)   │  │  (GPT-4o)   │
└───────────┘  └─────────────┘  └───────────────┘  └─────────────┘
```

### 4.1 Component Descriptions

| Component | Role |
|---|---|
| **Auth Module** | JWT-based registration, login, demo login; password hashing via bcrypt |
| **Resume Parser** | Extracts text from PDF/DOCX; sends to LLM for skill/topic extraction |
| **RAG Pipeline** | Chunks documents → generates embeddings → stores in ChromaDB → retrieves semantically relevant context |
| **Interview Engine** | Generates first question from resume topics; follows up adaptively using LLM + conversation history |
| **LLM Service** | Abstraction layer — uses OpenAI GPT-4o-mini when configured, local deterministic mentor otherwise |
| **Coding Evaluator** | Evaluates submitted code for correctness, efficiency, and optimization using language-aware heuristics |
| **Analytics Engine** | Aggregates FeedbackEvent records into performance scores, trends, and topic-level breakdowns |
| **Voice/Emotion Routes** | Backend-ready signal analyzers; integrate with Web Speech API and MediaPipe on the frontend |

---

## 5. Workflow of the System

### 5.1 End-to-End User Journey

```
Step 1: REGISTRATION / LOGIN
       │
       ▼
   User creates an account (email + password) or uses Demo Login
   JWT access token is issued and stored in the browser

Step 2: RESUME UPLOAD & ANALYSIS
       │
       ▼
   User uploads PDF / DOCX resume
   Backend extracts raw text (pypdf / python-docx)
   LLM (or local parser) extracts: skills, technologies, project topics
   Resume profile is stored in SQLite + optionally MongoDB Atlas

Step 3: DASHBOARD — CONFIGURE INTERVIEW
       │
       ▼
   User selects:
     • Interview Mode → HR / Technical / Coding / System Design
     • Target Company → Google, Amazon, Infosys, TCS, etc.
     • Topics → Auto-suggested from resume or manually added

Step 4: MOCK INTERVIEW SESSION
       │
       ▼
   Backend generates Question 1 from resume topics + RAG context
       │
       ▼
   Candidate types (or speaks) their answer
       │
       ▼
   Interview Engine evaluates the answer:
     • Retrieves semantically similar context from ChromaDB
     • Sends conversation history + answer to LLM
     • LLM returns: next adaptive follow-up question + structured feedback JSON
       │
       ▼
   Scores displayed: Technical Accuracy, Communication, Confidence, Clarity
   Specific improvement suggestions shown
       │
       ▼
   Repeat for N questions → Session ends → Summary saved

Step 5: CODING ROUND (Optional)
       │
       ▼
   User selects a coding problem (auto-picked from resume topics)
   Monaco Editor presented in-browser (Python / JavaScript / Java / C++)
   User submits code
   Backend evaluates: correctness, time complexity, optimization tip returned

Step 6: ANALYTICS & RECOMMENDATIONS
       │
       ▼
   Analytics dashboard shows:
     • Overall performance score over time (line/bar charts)
     • Per-topic weak areas radar chart
     • Feedback event history
   Daily recommendations generated for lowest-scoring topics
```

### 5.2 RAG Pipeline Detail

```
Document Ingested
      │
      ▼
Text Extracted (pypdf / python-docx)
      │
      ▼
Chunked with Overlap (sliding window)
      │
      ▼
Sentence Transformer Embeddings Generated
      │
      ▼
Stored in ChromaDB with Source Metadata
      │
      ▼
At Query Time:
  User Answer / Topic → Embedding Generated
      │
      ▼
  Semantic Similarity Search in ChromaDB (Top-K chunks)
      │
      ▼
  Context injected into LLM Prompt → Contextual Question / Feedback Generated
```

---

## 6. Advantages

### 6.1 For the Candidate

| Advantage | Description |
|---|---|
| **100% Personalized** | Questions are generated from the candidate's own resume, not generic banks |
| **Available 24/7** | No scheduling; practice any time with zero wait |
| **Instant Feedback** | Real-time scoring and suggestions after every answer |
| **Multi-Mode Coverage** | HR, Technical, Coding, and System Design modes in one platform |
| **Progress Tracking** | Historical analytics expose weak areas and improvement over sessions |
| **Coding Practice Integrated** | In-browser Monaco editor eliminates context-switching to separate platforms |
| **Cost-Effective** | Free local mode (no API key needed); low-cost OpenAI mode for premium intelligence |
| **Data Privacy** | All data stored locally by default; no third-party sharing |

### 6.2 Technical Advantages

| Advantage | Description |
|---|---|
| **RAG-Enhanced Accuracy** | Retrieval-Augmented Generation ensures questions are grounded in real knowledge, not hallucinations |
| **Adaptive Difficulty** | LLM-powered follow-ups dynamically increase or decrease depth based on the quality of answers |
| **LLM-Agnostic Design** | Swappable LLM backend (local fallback → OpenAI → any future provider) |
| **Scalable Architecture** | Docker containerization + PostgreSQL + ChromaDB enables production-grade scaling |
| **Dual Database Strategy** | SQLite for local dev; PostgreSQL + MongoDB Atlas for production ensures no vendor lock-in |
| **Structured Feedback JSON** | LLM output is validated and parsed into a strict schema ensuring consistent UI rendering |
| **Voice & Emotion Ready** | Infrastructure is prepared for advanced interview simulation with speech and facial analysis |
| **RESTful API Design** | Clean, documented FastAPI endpoints (Swagger UI at `/docs`) make the backend independently testable and extensible |

---

## 7. Conclusion

The **AI-Powered Personalized Interview Mentor** represents a significant leap forward from generic interview preparation tools. By combining modern NLP techniques (RAG, LLM-powered evaluation), resume-aware personalization, multi-modal interview support, and rich analytics, the system empowers candidates to prepare with precision and confidence. The modular, containerized architecture ensures the platform can scale from a personal tool to an enterprise-grade SaaS product with minimal engineering changes.

---

*Report prepared by Rohit R | Sri Krishna College of Technology | 2025–2026*
