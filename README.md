# 🚀 Aptenza — AI-Powered Mock Interview Platform

> **Stop fumbling. Start cracking.** Practice DSA, behavioral, system design & domain interviews with an AI that asks tough questions, pushes back on weak answers, and tells you exactly how to improve.

🌐 **Live Website:** [aptenza.vercel.app](https://aptenza.vercel.app)  
📦 **GitHub Repo:** [github.com/harshskarki/aptenza](https://github.com/harshskarki/aptenza)

---

## ✨ What is Aptenza?

Aptenza is a full-stack SaaS platform that simulates real mock interviews across four categories:
- 💻 **DSA** — Data structures, algorithms, problem solving
- 🧠 **Behavioral** — HR rounds, STAR method, situational questions
- ⚙️ **System Design** — Architecture, scalability, design patterns
- 🎯 **Domain Specific** — ML, Finance, Frontend, Backend

Every session is scored, saved, and analyzed. Users get instant feedback, skill breakdowns, and personalized improvement plans.

---

## 🚀 Features

### 🎯 Core Interview Engine
- AI-powered mock interviews (5 questions per session)
- Instant per-question feedback and final score (out of 10)
- Full session transcript saved and reviewable
- ⏱️ **Pressure Mode** — timed interviews (15 / 20 / 30 / 45 min) to simulate real interview conditions
- Queue up multiple interview types with Practice Queue (FIFO)

### 📊 Deep Analytics
- Score tracking across all sessions
- Radar/spider charts for skill breakdown (DSA, Behavioral, System Design)
- Score progression line chart
- Industry benchmarking — compare your scores vs average candidates
- Personalized Action Plan based on weak areas
- Downloadable PDF Study Guides styled with structured notes and key concepts

### 🛠️ Built-in Tools
- 💻 **Monaco Code Editor** — VS Code-grade in-browser DSA coding environment (JS/Python/Java)
- ⚙️ **Excalidraw Whiteboard** — Interactive system design canvas with pre-built templates
- 🌟 **STAR Method Builder** — Structured behavioral answer builder with tips and preview mode
- 🔍 **Question Search** — Trie-powered instant autocomplete across 14+ interview questions
- 🏆 **Leaderboard** — Max Heap-powered global and friends leaderboard with time filters

### 🎮 Gamification
- 🔥 **Daily Streaks** — GitHub-style activity heatmap tracking consecutive practice days
- 🏅 **20 Achievement Badges** — Earn badges across Milestone, Performance, Streak, Specialty and Special categories
- 👥 **Friends Leaderboard** — Compete with people you've referred

### 💰 Monetization
- **Freemium model** — Free (3 interviews/month), Pro (₹299/month), Premium (₹799/month)
- 🔒 **Feature gating** — DSA free, behavioral/system design locked to Pro, domain to Premium
- 💳 **Pay-per-interview credits** — Buy 3 / 10 / 25 credits without a subscription
- 🎟️ **Promo codes** — Apply discount codes for bonus interviews or plan upgrades
- 🧾 **PDF invoices** — Downloadable invoices for all payments
- 💸 **Razorpay integration** — Full payment + webhook verification

### 👤 User System
- Email/password auth + Google OAuth
- Profile page with editable name, plan badge, stats, and resume upload
- 🎁 **Referral system** — Share a code, both users get a bonus interview
- WhatsApp and LinkedIn sharing built-in

### ⚙️ Infrastructure
- 🛡️ **Rate limiting** — In-memory rate limiter on all API routes
- 🪲 **Sentry error monitoring** — Client + server error tracking
- 🔔 **Razorpay webhooks** — Payment lifecycle event handling
- 🌙 **Light/Dark mode** — Full theme toggle across all 15+ pages
- 📱 **Mobile responsive** — Optimized for all screen sizes

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Styling** | Tailwind CSS v4 |
| **Animations** | Framer Motion |
| **Auth + DB** | Supabase (PostgreSQL + Auth + Storage) |
| **Payments** | Razorpay |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) |
| **Whiteboard** | Excalidraw |
| **Charts** | Recharts (Radar, Line, Bar) |
| **PDF Generation** | jsPDF |
| **Error Monitoring**| Sentry |
| **Deployment** | Vercel |
| **Auth Provider** | Google OAuth (via Supabase) |
| **Theme** | `next-themes` |

---

## 🧠 DSA Implementations

Aptenza uses real data structures under the hood — not just as a portfolio checkbox, but powering actual features:

| Structure | File | Powers |
|---|---|---|
| **Trie** | `utils/trie.js` | Question search autocomplete |
| **Max Heap** | `utils/heap.js` | Leaderboard ranking |
| **Hash Map + LRU Cache** | `utils/cache.js` | AI response caching |
| **Queue (FIFO)** | `utils/queue.js` | Practice queue scheduler |

---

## 🗄️ Database Schema

- `profiles` — user data, plan, streaks, credits, referral info
- `sessions` — interview sessions with transcript, score, feedback
- `questions` — seeded question bank (14 questions across 4 types)
- `promo_codes` — discount codes with type, value, usage limits
- `credit_transactions` — pay-per-interview purchase history
- `leaderboard_view` — aggregated best scores per user per type

---

## 📁 Project Structure

```text
aptenza/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (auth)/signup/         # Signup page
│   ├── api/
│   │   ├── interview/         # Mock AI interview engine
│   │   ├── create-order/      # Razorpay order creation
│   │   ├── verify-payment/    # Payment verification
│   │   ├── create-credit-order/
│   │   ├── verify-credit-payment/
│   │   └── webhook/razorpay/  # Payment webhooks
│   ├── analytics/             # Score tracking dashboard
│   ├── badges/                # Achievement badges
│   ├── code/                  # Monaco IDE
│   ├── credits/               # Buy interview credits
│   ├── dashboard/             # Main dashboard
│   ├── deep-analytics/        # Radar charts + benchmarks
│   ├── interview/             # Interview session
│   ├── invoice/               # PDF invoice downloads
│   ├── leaderboard/           # Global + friends leaderboard
│   ├── practice-queue/        # Queue-based scheduler
│   ├── pricing/               # Pricing page
│   ├── profile/               # User profile
│   ├── promo/                 # Promo code redemption
│   ├── referral/              # Refer & earn
│   ├── search/                # Trie-powered search
│   ├── star/                  # STAR method builder
│   ├── streaks/               # Activity heatmap
│   ├── study-guide/           # PDF study guide generator
│   ├── transcript/[id]/       # Session transcript review
│   └── whiteboard/            # Excalidraw system design canvas
├── components/
│   ├── ThemeToggle.js
│   └── ErrorBoundary.js
├── utils/
│   ├── trie.js                # Trie for search
│   ├── heap.js                # Max Heap for leaderboard
│   ├── cache.js               # LRU Cache
│   ├── queue.js               # FIFO Queue
│   ├── rateLimit.js           # Rate limiter
│   ├── generateInvoice.js     # PDF invoice generator
│   └── generateStudyGuide.js  # PDF study guide generator
└── lib/
    └── supabase.js            # Supabase client
```

---

## 🏃 Getting Started (Local Dev)

### Prerequisites
- Node.js 18+
- A Supabase project
- A Razorpay account (test mode works)

### 1. Clone the repo

```bash
git clone https://github.com/harshskarki/aptenza.git
cd aptenza
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### 3. Set up Supabase

Run the SQL from the project to create tables:
- `profiles` (with referral, streak, credits columns)
- `sessions`
- `questions` (seed 14 questions)
- `promo_codes`
- `credit_transactions`
- `leaderboard_view`

*Note: Make sure to enable Google OAuth in Supabase Auth settings.*

### 4. Run the dev server

```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

---

## 🗺️ Roadmap

### ✅ Completed (Phases 1–8)
- Auth (email + Google OAuth)
- 4 interview types with AI feedback
- Analytics, transcripts, deep analytics
- Monaco IDE, Excalidraw whiteboard, STAR builder
- Razorpay payments (subscription + credits)
- Feature gating, promo codes, referral system
- PDF invoices + study guides
- Gamification (streaks, badges, leaderboard)
- Rate limiting + Sentry monitoring + webhooks
- Light/dark mode + mobile responsive

### 🔜 Coming Next
- Real Claude API integration for dynamic AI interviews
- Resume vs JD matching engine
- Email notifications (welcome, reminders, weekly digest)
- Confetti, skeleton loaders, page transitions (Phase 12)
- Speech-to-text interviews (Phase 5)
- Strengths/weaknesses skill progression trees

---

## 👨‍💻 Built By
**Harshvardhan Singh Karki** — Final-year B.Tech CS student building full-stack SaaS products solo.
- 🐙 **GitHub:** [@harshskarki](https://github.com/harshskarki)
- 🌐 **Live Project:** [aptenza.vercel.app](https://aptenza.vercel.app)

---

## 📄 License
**MIT License** — feel free to fork and build on top of this.

> *Built to help candidates crack interviews. Every feature is intentional. Every DSA implementation is real.*