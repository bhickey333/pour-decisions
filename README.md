# Pour Decisions

**Your Kentucky bourbon butler.**

A conversational AI recommendation agent powered by Claude, built as a Progressive Web App. Ask it anything about Kentucky bourbon — Higgins handles the rest.

**Live:** [pour-decisions-app.vercel.app](https://pour-decisions-app.vercel.app)

---

## What It Is

Pour Decisions is a bourbon recommendation chatbot with a persona: **Higgins**, a dry-witted, encyclopedic bourbon butler modeled after Alfred Pennyworth — serious, quietly funny, never snobby. He knows every bottle in the database, remembers what you've tried, and reasons across your flavor preferences to return ranked, explained recommendations.

This is not a search interface with filters. It is a multi-turn conversational agent with structured context injection, a curated knowledge base, and stateful user preferences — all operating within a strict domain scope (Kentucky bourbon only).

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| **Framework** | React 18 + Vite | Fast dev iteration, clean SPA output, minimal config. No SSR needed — all context is client-side. |
| **Styling** | Tailwind CSS | Utility-first lets you move fast on layout without fighting a component library's opinion about spacing. |
| **Components** | shadcn/ui | Copy-paste components built on Radix + Tailwind. Owned, not imported — no version lock-in, no style override hell. |
| **Charts** | Recharts | Radar chart for flavor profiles. Lightweight, composable, plays well with React state. |
| **PWA** | vite-plugin-pwa | Installable on iOS and Android from the browser. Service worker + manifest handled by the plugin. |
| **LLM** | Claude (`claude-sonnet-4-6`) | Anthropic's SDK, running through a serverless proxy so the API key never touches the client. |
| **API Proxy** | Vercel Serverless Functions | Single `api/chat.js` function handles key management, prompt assembly, and the Anthropic call. |
| **Data** | `bourbons.json` (flat file) | ~60 curated bourbon records, imported at build time. See architecture notes below. |
| **Persistence** | `localStorage` | User profile: tried bottles, ratings, notes, flavor preferences. No auth required, no backend state. |
| **Hosting** | Vercel | GitHub-connected, auto-deploys on push, serves the service worker over HTTPS (required for PWA). |

---

## Architecture Decisions

### Why a JSON flat file instead of a vector database

The standard advice for RAG applications is to reach for a vector store — Pinecone, Chroma, Weaviate. That advice assumes a corpus too large to fit in a prompt window. At ~60 bourbon records, the entire knowledge base fits comfortably in a single context injection with tokens to spare.

Choosing a vector DB at this scale would introduce:
- An external dependency and API key to manage
- An embedding pipeline to maintain
- Chunking decisions that fragment bourbon records (each record is a single coherent unit — splitting it is actively harmful)
- Latency from a round-trip embedding + similarity search before every LLM call

The flat file wins on every axis: zero infrastructure, zero latency overhead, deterministic retrieval (all records always present), and trivial data updates (edit a JSON file). The architecture is explicitly designed to swap in Pinecone or Chroma in Phase 5 when the corpus scales past 200 bottles — the `buildPrompt.js` injection layer abstracts retrieval behind a clean interface.

### Why Vercel serverless for the API proxy

The Anthropic API key cannot live in client-side JavaScript — any bundler will expose it. A serverless function solves this with no operational overhead: no servers to manage, no containers to size, scales to zero when idle, and deploys alongside the frontend in the same Vercel project.

The function (`api/chat.js`) is intentionally thin — it receives the assembled context from the client, calls the Claude API, and streams the response back. Business logic (prompt assembly, context formatting) stays in the client-side `buildPrompt.js` where it's testable and visible. The function is a security boundary, not a logic layer.

### RAG context injection pattern

Every call to the Claude API assembles five layers in order:

```
Layer 1 — System prompt     Higgins's persona, behavior rules, output format spec
Layer 2 — Bourbon database  Full bourbons.json injected as structured JSON context
Layer 3 — User profile      localStorage profile: tried bottles, ratings, preferences
Layer 4 — Conversation      Prior turns in the session for multi-turn continuity
Layer 5 — User message      The current input
```

This is assembled in `src/lib/buildPrompt.js` before the API call is made. The LLM never queries the database itself — context is selected and injected by the application layer. This keeps retrieval logic deterministic, debuggable, and easy to extend.

The output format is enforced in the system prompt: Higgins always returns a JSON object with a conversational `message` field and a structured `recommendations` array. The UI parses the JSON and renders cards — no regex parsing, no brittle text extraction.

### User profile as implicit context

The user profile (stored in `localStorage`) is not used to filter recommendations — it is used to inform them. A bottle the user has tried and rated highly might still be the best match; Higgins acknowledges the rating and explains the recommendation. This is an intentional product decision: filtering out tried bottles would reduce the quality of recommendations rather than improve the experience.

---

## Running Locally

**Prerequisites:** Node.js 18+, a Vercel account, an Anthropic API key.

```bash
# Clone and install
git clone https://github.com/bhickey333/pour-decisions
cd pour-decisions
npm install
```

**Environment setup:**

The app requires one environment variable: your Anthropic API key. Copy `.env.example` to `.env.local` and fill it in:

```bash
cp .env.example .env.local
```

```
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
```

The key is read server-side by the Vercel function. It is never bundled into the client.

**Start the dev server:**

```bash
npx vercel dev
```

`vercel dev` is required (not `npm run dev`) because it emulates the Vercel serverless runtime locally, which is how `api/chat.js` gets served. Running plain Vite dev will work for the frontend but the chat endpoint will 404.

The app runs at `http://localhost:3000`.

---

## Roadmap

| Phase | Description | Status |
|---|---|---|
| **Phase 1** | **Data** — Build `bourbons.json` with ~60 curated Kentucky records: mainstream, craft, and allocated. Schema includes flavor scales (1–10), mashbill, tasting notes, price tier, and availability. | Complete |
| **Phase 2** | **Agent** — Higgins system prompt, multi-layer RAG context injection, Vercel serverless API proxy, conversation history management. | Complete |
| **Phase 3** | **Frontend** — React + Tailwind + shadcn/ui chat interface, `<BourbonCard />` with inline flavor radar charts, `<CabinetView />` for tried/want-to-try shelf, PWA manifest and service worker. | Complete |
| **Phase 4** | **Deploy** — Vercel production deployment, GitHub public repo, live URL, portfolio documentation. | Complete |
| **Phase 5** | **Vector RAG** — Migrate knowledge base to Pinecone or Chroma when corpus scales past 200 bottles. The `buildPrompt.js` retrieval interface is designed for this swap without changes to the agent or UI layer. | Planned |
| **Phase 6** | **Mobile** — Expo (React Native) with NativeWind, sharing the same API and data layer. App Store and Google Play distribution. | Planned |

---

## Portfolio Context

Pour Decisions is part of the **Mind Palace LLC Agent Build Series** — a structured program for developing production AI agent skills across the full stack: data architecture, RAG patterns, React, PWA, and Vercel deployment.

The goal is not to build demo apps. It is to build real, deployed applications that exercise the decisions that matter in production: data retrieval strategy, prompt engineering, security boundaries, user state management, and upgrade paths.

This project specifically targeted:
- Designing a RAG system at a scale where JSON beats a vector DB — and knowing when that changes
- Building a serverless API proxy with proper secret management
- Enforcing structured LLM output and parsing it reliably in the UI
- Establishing a clean upgrade path to vector RAG and native mobile without a rewrite

**Built by:** Brandon Hickey / [Mind Palace LLC](https://github.com/bhickey333)

---

*Pour Decisions — Mind Palace LLC — June 2026*
