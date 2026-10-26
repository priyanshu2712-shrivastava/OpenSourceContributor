# Autonomous Open-Source Contribution Matcher & Onboarding Coach 🚀

> An AI-agentic developer tool that analyzes a developer's real code depth via Abstract Syntax Tree (AST) profiling, evaluates open-source projects using the mathematically grounded Repository Welcomingness Index (RWI &ge; 0.60), and provides an executive upper-view summary with step-by-step onboarding roadmaps.

---

## 🌟 The Core Problem
Beginner and intermediate developers want to contribute to open-source software (OSS) to boost their careers and technical skills, but **over 80% quit** because:
1. They cannot find issues matching their real skill level.
2. They get ignored by maintainers of abandoned or slow repositories.
3. They get overwhelmed by large codebases and don't know where to start.

---

## 🤖 The 3 Autonomous AI Agents

```
                        ┌────────────────────────────────────────────────────────┐
                        │              AGENT 1: DEVELOPER PROFILER               │
                        │   Ingests public repos & parses AST code depth:        │
                        │   Level 1: Syntax & Flow | Level 2: OOP | Level 3: Concurrency & Testing
                        └──────────────────────────┬─────────────────────────────┘
                                                   │
                                                   ▼
┌──────────────────────────────────────────────────┴──────────────────────────────────────────────────┐
│                             AGENT 2: REPO SCOUT & WELCOMINGNESS                                     │
│  Computes Repository Welcomingness Index (RWI):                                                     │
│  RWI = 0.35*(PR Merge Rate) + 0.30*(Maintainer Speed) + 0.20*(Docs & Templates) - 0.15*(Stale)      │
│  • Discards repositories with RWI < 0.60 (dead repos)                                               │
│  • Categorizes open issues in target repos into: 🟢 Easy, 🟡 Medium, 🟣 Hard                        │
└──────────────────────────────────────────────────┬──────────────────────────────────────────────────┘
                                                   │
                                                   ▼
                        ┌────────────────────────────────────────────────────────┐
                        │             AGENT 3: CODEBASE ONBOARDING COACH         │
                        │  • Plain English Executive Problem Summary             │
                        │  • Target Codebase File & Function Localization        │
                        │  • Step-by-Step Fix Checklist with Runnable Commands   │
                        │  • 1-Click Drafted Maintainer Assignment Comment       │
                        └────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features & User Journey

1. **High-Conversion Showcase Landing Page:**
   - Explains the product, why beginners quit OSS, and showcases the 3 autonomous AI agents.
   - Quick-access **"Sign In with GitHub"** button and 1-click test profile buttons.
2. **Developer Competency Profile:**
   - Instant AST profiling quantifying **Syntax**, **OOP**, **Async**, and **Testing** scores out of 10.
   - Verified code idioms, primary language distribution, and commit velocity.
3. **Target Open-Source Project Matcher:**
   - Paste **any** GitHub repository URL (e.g. `pallets/flask`, `facebook/react`, `tiangolo/fastapi`, `pandas-dev/pandas`).
   - Agent 2 fetches open issues, verifies the RWI maintainer health score, and categorizes problems into **Easy to Solve (Beginner)**, **Medium (Intermediate)**, and **Hard (Advanced)**.
4. **Interactive AI Onboarding Coach Drawer:**
   - Upper-level view of the problem in plain English.
   - Localizes exact files, classes, and functions to edit.
   - Step-by-step reproduction and fix blueprint with copyable shell commands and code diffs.
   - Ready-to-send polite maintainer assignment request.
   - Export roadmap as Markdown (`.md`).

---

## 🛠️ Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+

### 2. Backend Setup
```powershell
# Create venv and activate (if not already done)
python -m venv venv
.\venv\Scripts\activate

# Install requirements
pip install fastapi uvicorn pydantic httpx python-dotenv

# Run the FastAPI server
python -m uvicorn backend.app.main:app --reload --port 8000
```
Backend runs at `http://localhost:8000`. Swagger API docs at `http://localhost:8000/docs`.

### 3. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔑 Environment Configuration (Optional)
Copy `.env.example` to `.env`:
```env
GITHUB_TOKEN=ghp_your_github_token_here
GROQ_API_KEY=gsk_your_groq_api_key_here
```
> **Note:** API keys are completely optional. The app comes pre-configured with local SQLite caching and offline datasets for top open-source repositories and test profiles for instant viva demonstrations.
