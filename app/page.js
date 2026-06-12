'use client'

import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="px-8 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight">Aptenza</h1>
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push('/pricing')}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Pricing
          </button>
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Sign in
          </button>
          <button
            onClick={() => router.push('/signup')}
            className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg transition font-medium"
          >
            Get started free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-28 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs px-4 py-1.5 rounded-full mb-8">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
          AI-powered mock interviews
        </div>

        <h2 className="text-6xl font-bold leading-tight mb-6 tracking-tight">
          Crack your next
          <br />
          <span className="text-indigo-400">interview with AI</span>
        </h2>

        <p className="text-gray-400 text-xl mb-12 max-w-xl mx-auto leading-relaxed">
          Practice with a real AI interviewer. Get honest feedback. Track your growth. Land the job.
        </p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => router.push('/signup')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl text-base transition"
          >
            Start for free →
          </button>
          <button
            onClick={() => router.push('/pricing')}
            className="text-gray-400 hover:text-white px-8 py-4 rounded-xl text-base transition border border-gray-800 hover:border-gray-600"
          >
            View pricing
          </button>
        </div>
        <p className="text-gray-600 text-sm mt-5">No credit card required · 3 free interviews every month</p>
      </section>

      {/* Stats bar */}
      <section className="border-y border-gray-800 py-10 mb-24">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-4xl font-bold text-white">4</p>
            <p className="text-gray-500 text-sm mt-1">Interview types</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-white">AI</p>
            <p className="text-gray-500 text-sm mt-1">Powered feedback</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-white">₹0</p>
            <p className="text-gray-500 text-sm mt-1">To get started</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold mb-4">Everything you need to prepare</h3>
          <p className="text-gray-400">Built for serious candidates who want real results.</p>
        </div>

        <div className="grid grid-cols-2 gap-6">

          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition">
            <div className="text-4xl mb-5">🤖</div>
            <h4 className="font-semibold text-xl mb-3">Real AI Interviewer</h4>
            <p className="text-gray-400 leading-relaxed">
              Not just random questions. A real AI conducts your interview, listens to your answers, asks intelligent follow-ups, and gives you honest feedback — just like a senior engineer would.
            </p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition">
            <div className="text-4xl mb-5">💻</div>
            <h4 className="font-semibold text-xl mb-3">All Interview Types</h4>
            <p className="text-gray-400 leading-relaxed">
              DSA, behavioral, system design, and domain-specific interviews. Whether you're targeting a FAANG or a startup, Aptenza prepares you for exactly what they ask.
            </p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition">
            <div className="text-4xl mb-5">📊</div>
            <h4 className="font-semibold text-xl mb-3">Track Your Progress</h4>
            <p className="text-gray-400 leading-relaxed">
              Every session is scored and saved. See your improvement over time, identify weak areas, and know exactly when you're ready for the real interview.
            </p>
          </div>

          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 hover:border-gray-700 transition">
            <div className="text-4xl mb-5">⚡</div>
            <h4 className="font-semibold text-xl mb-3">Instant Feedback</h4>
            <p className="text-gray-400 leading-relaxed">
              No waiting. Get detailed, actionable feedback after every answer — what you did well, what to improve, and how to think about it differently next time.
            </p>
          </div>

        </div>
      </section>
AV
      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h3 className="text-4xl font-bold mb-4">Ready to start preparing?</h3>
        <p className="text-gray-400 text-lg mb-10">
          3 free interviews every month. No credit card needed.
        </p>
        <button
          onClick={() => router.push('/signup')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-12 py-4 rounded-xl text-lg transition"
        >
          Create free account →
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <p className="text-gray-600 text-sm font-bold">Aptenza</p>
          <p className="text-gray-600 text-sm">© 2026 · Built to help you crack it.</p>
        </div>
      </footer>

    </main>
  )
}