'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html>
      <body>
        <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-black text-white mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-6">We've been notified. Please try again.</p>
            <button
              onClick={reset}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}