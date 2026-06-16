# Pour Decisions — Product Requirements Document

**Mind Palace LLC | Agent Build Series**
**Version 1.0 | June 2026**

---

## Overview

Pour Decisions is a Kentucky bourbon recommendation agent built as a portfolio project to develop AI agent skills across data architecture, RAG patterns, React frontend development, and PWA deployment.

The agent persona is **Higgins** — a knowledgeable, dry-witted bourbon butler in the Alfred (Batman) tradition. Serious, capable, occasionally funny. Never condescending.

**This PRD is the complete handoff document for Claude Code. All decisions are final. Build exactly what is described here.**

---

## Goals

- Build a working RAG-based recommendation agent using Claude API
- Get reps in React, Tailwind, shadcn/ui, Vite, PWA config, and Vercel deployment
- Produce a portfolio-ready deployed application with a live URL
- Establish a foundation upgradeable to vector RAG (Phase 5) and Expo native mobile (Phase 6) without rebuilding

---

## App Identity

| Field | Value |
|---|---|
| App name | Pour Decisions |
| Tagline | Your Kentucky bourbon butler |
| Agent name | Higgins |
| Agent persona | Alfred from Batman — dry wit, serious capability, occasional humor |
| Scope | Kentucky bourbon only |
| Primary user | Developer/portfolio (Brandon, Mind Palace LLC) |

---

## Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| Framework | React 18 + Vite | `npm create vite@latest`, React template |
| Styling | Tailwind CSS | Utility-first, mobile-first |
| Components | shadcn/ui | Copy-paste components, Tailwind-based |
| Charts | Recharts | Flavor profile radar/bar visualization |
| PWA | vite-plugin-pwa | Installable on iOS + Android from browser |
| LLM | Claude API (claude-sonnet-4-6) | Via Anthropic SDK |
| API Proxy | Vercel Serverless Function | Keeps API key off client |
| Data | bourbons.json | Flat file, imported at build time |
| Persistence | localStorage | User profile, tried bottles, ratings |
| Hosting | Vercel | Free tier, GitHub connected |
| Version Control | GitHub | Public repo for portfolio |

---

## Project Structure

```
pour-decisions/
├── public/
│   ├── icons/              # PWA icons (512x512, 192x192)
│   └── manifest.json       # PWA manifest
├── src/
│   ├── components/
│   │   ├── ChatInterface.jsx       # Main chat UI
│   │   ├── MessageBubble.jsx       # Individual chat message
│   │   ├── BourbonCard.jsx         # Recommendation card
│   │   ├── FlavorProfile.jsx       # Recharts radar chart
│   │   ├── TriedBadge.jsx          # Flags tried/rated bottles
│   │   └── CabinetView.jsx         # Tried / Want to Try shelf
│   ├── data/
│   │   └── bourbons.json           # Bourbon knowledge base
│   ├── hooks/
│   │   └── useUserProfile.js       # localStorage read/write hook
│   ├── lib/
│   │   ├── buildPrompt.js          # Assembles full prompt (system + context + user)
│   │   └── profileManager.js       # localStorage profile logic
│   ├── App.jsx
│   └── main.jsx
├── api/
│   └── chat.js                     # Vercel serverless function (API proxy)
├── vite.config.js                  # Includes vite-plugin-pwa
├── tailwind.config.js
└── package.json
```

---

## Data Architecture

### bourbons.json Schema

Every bourbon record must include all fields below. No nulls on numeric scales.

```json
{
  "id": "buffalo-trace-001",
  "name": "Buffalo Trace",
  "distillery": "Buffalo Trace Distillery",
  "type": "Kentucky Straight Bourbon",
  "age": 8,
  "age_stated": false,
  "proof": 90,
  "mashbill": {
    "corn": 75,
    "rye": 10,
    "barley": 15,
    "type": "low-rye"
  },
  "price_usd": 30,
  "price_tier": "budget",
  "availability": "national",
  "flavor_tags": ["vanilla", "caramel", "oak", "brown-sugar", "mint"],
  "tasting_notes": {
    "nose": "vanilla, mint, and molasses with a hint of anise",
    "palate": "brown sugar, spice, and oak with caramel sweetness",
    "finish": "long, dry, and spicy with lingering oak"
  },
  "finish_length": "long",
  "body": "medium",
  "sweetness": 7,
  "spice": 5,
  "smoke": 1,
  "fruit": 3,
  "oak": 6,
  "proof_category": "standard",
  "data_source": "apify_distiller",
  "last_updated": "2026-06-01",
  "verified": true
}
```

**Field reference:**
- `price_tier`: `budget` | `mid-shelf` | `premium` | `ultra-premium`
- `availability`: `national` | `regional` | `allocated` | `kentucky-only`
- `finish_length`: `short` | `medium` | `long`
- `body`: `light` | `medium` | `full`
- `proof_category`: `standard` | `high-proof` | `cask-strength`
- `mashbill.type`: `low-rye` | `high-rye` | `wheated`
- Numeric scales (`sweetness`, `spice`, `smoke`, `fruit`, `oak`): `1–10`

**Target volume:**
- ~40 mainstream Kentucky bottles (Apify sourced)
- ~15 craft Kentucky bottles (manual — Castle & Key, Wilderness Trail, Jeptha Creed, Town Branch, Bardstown Bourbon Company)
- ~5 BTAC / allocated bottles
- Total: ~60 records

---

## localStorage User Profile Schema

```json
{
  "tried": [
    {
      "id": "buffalo-trace-001",
      "rating": 4,
      "notes": "Great everyday pour, a little light for me",
      "date": "2026-06-01"
    }
  ],
  "want_to_try": ["weller-12-001"],
  "preferences": {
    "sweetness": "high",
    "spice": "low",
    "price_max": 60,
    "proof_preference": "standard"
  },
  "session_history": []
}
```

**Important:** Tried bottles are NOT filtered out of recommendations. They are flagged. The agent uses tried/rating data to inform recommendations, not exclude bottles. A highly-rated tried bottle may still be the best recommendation.

---

## RAG Pattern — Context Injection

Every Claude API call assembles three layers in order:

### Layer 1 — System Prompt (Higgins persona + rules)
Defines who Higgins is, how he behaves, output format, and hard rules.

### Layer 2 — Bourbon Knowledge Base
The full `bourbons.json` injected as structured context.

### Layer 3 — User Profile
The user's localStorage profile injected as structured context.

### Layer 4 — Conversation History
Prior turns in the session passed as message history for multi-turn continuity.

### Layer 5 — User Message
The current user input.

This is assembled in `src/lib/buildPrompt.js`.

---

## System Prompt (Higgins)

```
You are Higgins, a distinguished Kentucky bourbon butler for the Pour Decisions app. 
Your personality is modeled after Alfred Pennyworth — serious, highly capable, 
occasionally dry and witty, never condescending. You have encyclopedic knowledge 
of Kentucky bourbon and genuine enthusiasm for helping people find the right pour.

PERSONA RULES:
- Speak with quiet confidence and dry wit. Never be sycophantic.
- Occasional humor is welcome but never at the user's expense.
- Address the user with subtle formality — "sir" or "madam" used sparingly and naturally.
- You are never snobby. All budgets and experience levels are equally welcome.

SCOPE RULES — HARD LIMITS:
- You discuss Kentucky bourbon ONLY.
- Bourbon-adjacent topics are acceptable: cocktails made with bourbon, 
  Kentucky history relevant to bourbon, food pairings with bourbon.
- Non-Kentucky whiskey (Scotch, Irish, Japanese, Tennessee) — redirect immediately.
- Any off-topic question (math, coding, current events, anything non-bourbon) — 
  redirect immediately with a brief in-character response. Do NOT answer the 
  off-topic question even partially. Return to bourbon.
- Off-topic redirect example: "I'm afraid that falls well outside my area of 
  expertise, sir. My talents are reserved exclusively for the noble pursuit of 
  Kentucky bourbon. Now — what are we looking for this evening?"

RECOMMENDATION RULES:
- Always return exactly 3 ranked recommendations unless the user explicitly asks for more or fewer.
- Rank 1 is your strongest match. Explain why each bottle fits the user's request.
- If a bottle in your recommendations has been tried by the user, flag it clearly 
  with their rating and note. Example: "You've tried this one and rated it 4/5 — 
  it remains your closest match for this profile."
- If a bottle has been tried and rated poorly (1-2), you may still recommend it 
  if it's genuinely the best match, but acknowledge the rating and explain why 
  you're recommending it anyway.
- Use the numeric flavor scales (sweetness, spice, smoke, fruit, oak) to reason 
  about matches. Show your reasoning.
- Always include price tier and availability in your recommendation.
- Never recommend a bottle not in the provided bourbon database.

OUTPUT FORMAT:
Return recommendations as a JSON object with this structure so the UI can render cards:

{
  "message": "Higgins's conversational response text here",
  "recommendations": [
    {
      "rank": 1,
      "id": "bourbon-id-from-database",
      "match_reason": "Why this bottle fits the request",
      "tried": true or false,
      "user_rating": 4 or null,
      "highlight": "One memorable sentence about this bottle"
    }
  ]
}

BOURBON DATABASE:
{{BOURBON_DATABASE}}

USER PROFILE:
{{USER_PROFILE}}
```

---

## Component Specifications

### `<ChatInterface />`
- Main app view
- Input field at bottom (mobile pattern)
- Message history scrolls above
- On submit: calls `/api/chat`, streams response, renders cards on completion
- Shows Higgins's text message above recommendation cards

### `<MessageBubble />`
- User messages: right-aligned, amber accent
- Higgins messages: left-aligned, with small Higgins avatar/initial
- Timestamps optional

### `<BourbonCard />`
- Displays one recommendation
- Shows: rank badge, bottle name, distillery, proof, price tier, availability
- Flavor tags as pills
- Match reason text
- `<TriedBadge />` if user has tried it
- `<FlavorProfile />` chart inline
- "Mark as Tried" button | "Add to Want to Try" button

### `<FlavorProfile />`
- Recharts RadarChart
- Axes: Sweetness, Spice, Smoke, Fruit, Oak
- Renders from bourbon's numeric scale values
- Small, compact — fits inside BourbonCard

### `<TriedBadge />`
- Renders if bottle exists in localStorage tried array
- Shows star rating and truncated user note
- Amber/warm color treatment

### `<CabinetView />`
- Separate view/tab from chat
- Two sections: "Tried" and "Want to Try"
- Tried bottles show rating + notes
- Want to Try shows bottle name + "I've tried this" button
- All data from localStorage

---

## User Flow

1. User opens Pour Decisions (PWA, installed on phone or browser)
2. Lands on chat interface — Higgins's greeting message is pre-loaded
3. User types freeform: "I like sweet bourbons, nothing too expensive"
4. App calls `/api/chat` with assembled prompt
5. Higgins responds with conversational message + 3 ranked BourbonCards
6. User can follow up: "What if I want something with more spice?"
7. Higgins reasons across conversation history + profile for follow-up
8. User can mark bottles as tried (with rating 1-5 + optional note) or add to want to try
9. Profile updates persist to localStorage immediately
10. Cabinet view shows full tried/want-to-try history

---

## Higgins's Opening Greeting

Pre-load this as Higgins's first message on app open:

```
"Good evening. I am Higgins, and I am at your service.

Tell me what you're looking for — perhaps a flavor profile, 
a bottle you've enjoyed before, a budget, or simply a mood — 
and I shall find you the perfect Kentucky pour.

What are we drinking tonight?"
```

---

## API Proxy — `/api/chat.js`

Vercel serverless function. Handles:
- Receives `{ messages, bourdonDb, userProfile }` from client
- Assembles full prompt via buildPrompt logic
- Calls Claude API with `ANTHROPIC_API_KEY` from Vercel env vars
- Returns streamed response to client
- API key never exposed to client

```javascript
// api/chat.js — Vercel serverless function
import Anthropic from "@anthropic-ai/sdk";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages, bourbonDb, userProfile } = req.body;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  // Build system prompt with injected context
  // Call Claude API
  // Stream response back to client
}
```

---

## PWA Configuration

`vite-plugin-pwa` setup in `vite.config.js`:

```javascript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Pour Decisions',
    short_name: 'Pour Decisions',
    description: 'Your Kentucky bourbon butler',
    theme_color: '#C8791A',
    background_color: '#FDFAF6',
    display: 'standalone',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  }
})
```

---

## Visual Design

**Theme:** Warm, light, approachable. Premium but not snobby.

| Token | Value | Usage |
|---|---|---|
| Primary accent | `#C8791A` (amber) | Buttons, badges, highlights |
| Amber light | `#E8A84C` | Hover states, secondary accents |
| Background | `#FDFAF6` (warm white) | App background |
| Surface | `#F5EFE6` (warm grain) | Cards, inputs |
| Text primary | `#1A1410` (near black) | Body text |
| Text muted | `#6B5E52` (smoke) | Secondary text, labels |
| Success | `#3D6B4F` (green) | Positive states |

**Typography:**
- Display / bottle names: Playfair Display (serif) — feels aged, premium
- Body / UI: Inter (sans-serif) — clean, readable
- Data / proof / price: JetBrains Mono (monospace) — technical details

**Layout:**
- Mobile-first
- Bottom input bar (thumb-friendly)
- Cards stack vertically in chat
- Touch targets minimum 44px

---

## Off-Topic Behavior — Hard Rules

| Topic | Higgins's behavior |
|---|---|
| Kentucky bourbon | Full engagement |
| Bourbon cocktails | Allow — bourbon adjacent |
| Kentucky history (bourbon related) | Allow briefly |
| Food pairings with bourbon | Allow |
| Non-Kentucky whiskey (Scotch, Irish, etc.) | Redirect immediately |
| Tennessee whiskey | Redirect — not bourbon by Kentucky definition |
| General alcohol questions | Redirect |
| Math, coding, current events, anything else | Redirect immediately, no partial answer |

Redirect tone: brief, in-character, returns to bourbon. Never rude. Never apologetic.

---

## Vercel Deployment

1. Push repo to GitHub (public)
2. Connect repo to Vercel
3. Add environment variable: `ANTHROPIC_API_KEY`
4. Deploy — Vercel auto-detects Vite
5. PWA served over HTTPS (required for service worker)
6. Live URL added to GitHub README and LinkedIn

---

## Phase Roadmap Reference

| Phase | Description | Status |
|---|---|---|
| 1 | Data — build bourbons.json (~60 records) | Planning complete |
| 2 | Agent — system prompt, context injection, API | Planning complete |
| 3 | Frontend — React + Tailwind + shadcn/ui + PWA | Planning complete |
| 4 | Deploy — Vercel, GitHub, portfolio | Planning complete |
| 5 | Stretch — Vector RAG (Pinecone/Chroma), scale to 200+ bottles | Future |
| 6 | Mobile — Expo (React Native), NativeWind, App Store | Future |

---

## What Claude Code Should Build First

Start with project scaffold in this order:

1. `npm create vite@latest pour-decisions -- --template react`
2. Install dependencies: Tailwind, shadcn/ui, Recharts, vite-plugin-pwa, Anthropic SDK
3. Configure Tailwind + shadcn/ui
4. Create folder structure as specified above
5. Create `bourbons.json` with 5 seed records matching schema exactly
6. Build `useUserProfile.js` hook (localStorage read/write)
7. Build `buildPrompt.js` (assembles system prompt + injected context)
8. Build `/api/chat.js` Vercel serverless function
9. Build `<BourbonCard />` and `<FlavorProfile />` components
10. Build `<ChatInterface />` wired to API
11. Add PWA config
12. Test locally, then deploy to Vercel

---

*Pour Decisions — Mind Palace LLC — PRD v1.0*
