# GSAT AI

AI-powered SAT preparation platform for Brazilian student-athletes targeting 1200+ scores for scholarships.

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Supabase** (PostgreSQL + Auth + RLS)
- **Tailwind CSS** + shadcn/ui
- **OpenAI API** (GPT-4o) for question generation
- **Stripe** for payments

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [OpenAI](https://platform.openai.com) API key
- A [Stripe](https://stripe.com) account

### Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Fill in your keys in `.env.local`

4. Run the database migrations in your Supabase SQL editor (files in `supabase/migrations/`)

5. Start the dev server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/           # Pages and API routes (Next.js App Router)
  components/    # React components (ui/, layout/, practice/, vocabulary/, etc.)
  lib/           # Shared utilities (supabase/, ai/, stripe/)
  types/         # TypeScript type definitions
  hooks/         # Custom React hooks
  middleware.ts  # Auth route protection
supabase/
  migrations/    # SQL migrations (run in order)
```

## Features

- **AI Question Generator** — Generates practice questions targeting student weaknesses
- **Vocabulary Builder** — Flashcards and quizzes with spaced repetition and PT translations
- **Practice Sessions** — 1000+ SAT questions by topic and difficulty
- **Progress Dashboard** — Estimated score, accuracy, streaks
- **Gamification** — Points, streaks, leaderboard
- **Stripe Payments** — Checkout → webhook → automatic account creation

## License

MIT
