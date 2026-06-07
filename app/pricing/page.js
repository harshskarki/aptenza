'use client'

import { useRouter } from 'next/navigation'

export default function PricingPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="px-8 py-5 flex items-center justify-between max-w-6xl mx-auto">
        <h1
          onClick={() => router.push('/')}
          className="text-2xl font-bold tracking-tight cursor-pointer"
        >
          Aptenza
        </h1>
        <div className="flex items-center gap-6">
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

      {/* Header */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <h2 className="text-4xl font-bold mb-4">Simple, honest pricing</h2>
        <p className="text-gray-400 text-lg">
          Start free. Upgrade when you need more. Cancel anytime.
        </p>
      </section>

      {/* Pricing cards */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-3 gap-6">

          {/* Free */}
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 flex flex-col">
            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-1">Free</h4>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-bold">₹0</span>
              </div>
              <p className="text-gray-500 text-sm">Forever free</p>
            </div>

            <ul className="space-y-4 text-sm mb-8 flex-1">
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">3 interviews per month</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">DSA interviews</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">Basic AI feedback</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">7-day analytics history</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-gray-600">✗</span>
                <span className="text-gray-600">Behavioral interviews</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-gray-600">✗</span>
                <span className="text-gray-600">System design</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-gray-600">✗</span>
                <span className="text-gray-600">Resume analysis</span>
              </li>
            </ul>

            <button
              onClick={() => router.push('/signup')}
              className="w-full border border-gray-700 hover:border-indigo-500 text-white py-3 rounded-xl transition text-sm font-semibold"
            >
              Get started free
            </button>
          </div>

          {/* Pro */}
          <div className="bg-indigo-950 rounded-2xl p-8 border border-indigo-700 flex flex-col relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs px-4 py-1.5 rounded-full font-medium">
              Most popular
            </div>

            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-1">Pro</h4>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-bold">₹299</span>
                <span className="text-gray-400 mb-1">/month</span>
              </div>
              <p className="text-gray-500 text-sm">Billed monthly</p>
            </div>

            <ul className="space-y-4 text-sm mb-8 flex-1">
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">15 interviews per month</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">DSA + Behavioral</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">Detailed AI feedback</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">3-month analytics history</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">Resume analysis</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">System design interviews</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-gray-600">✗</span>
                <span className="text-gray-600">Domain specific</span>
              </li>
            </ul>

            <button
              onClick={() => router.push('/signup')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition text-sm font-semibold"
            >
              Get Pro
            </button>
          </div>

          {/* Premium */}
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 flex flex-col">
            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-1">Premium</h4>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-bold">₹799</span>
                <span className="text-gray-400 mb-1">/month</span>
              </div>
              <p className="text-gray-500 text-sm">Billed monthly</p>
            </div>

            <ul className="space-y-4 text-sm mb-8 flex-1">
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">Unlimited interviews</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">All interview types</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">Detailed AI feedback</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">Lifetime analytics history</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">Resume analysis</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">Domain specific interviews</span>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-green-400">✓</span>
                <span className="text-gray-300">Priority support</span>
              </li>
            </ul>

            <button
              onClick={() => router.push('/signup')}
              className="w-full border border-gray-700 hover:border-indigo-500 text-white py-3 rounded-xl transition text-sm font-semibold"
            >
              Get Premium
            </button>
          </div>

        </div>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm">
            Questions? Email us at{' '}
            <span className="text-indigo-400">support@aptenza.io</span>
          </p>
        </div>

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