'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

// Excalidraw must be loaded dynamically (no SSR)
const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then(mod => mod.Excalidraw),
  { ssr: false, loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900">
      <div className="text-gray-400 text-sm">Loading whiteboard...</div>
    </div>
  )}
)

const SYSTEM_DESIGN_PROMPTS = [
  {
    id: 1,
    title: 'Design Twitter',
    description: 'Design a scalable Twitter-like social media platform.',
    hints: [
      'Start with core entities: Users, Tweets, Followers',
      'Think about the tweet feed — how do you generate it for millions of users?',
      'Consider read-heavy vs write-heavy operations',
      'Think about CDN for media storage'
    ]
  },
  {
    id: 2,
    title: 'Design a URL Shortener',
    description: 'Design a URL shortening service like bit.ly.',
    hints: [
      'How do you generate unique short codes?',
      'Think about hash collisions',
      'Consider caching frequently accessed URLs',
      'How do you handle redirects at scale?'
    ]
  },
  {
    id: 3,
    title: 'Design WhatsApp',
    description: 'Design a real-time messaging application.',
    hints: [
      'Think about WebSockets for real-time delivery',
      'How do you handle offline message delivery?',
      'Consider end-to-end encryption',
      'Think about group messaging vs 1:1'
    ]
  },
  {
    id: 4,
    title: 'Design Netflix',
    description: 'Design a video streaming platform.',
    hints: [
      'Think about video encoding and transcoding pipeline',
      'CDN is critical — how do you distribute globally?',
      'Consider adaptive bitrate streaming',
      'Think about recommendation system separately'
    ]
  },
  {
    id: 5,
    title: 'Design Uber',
    description: 'Design a ride-sharing platform.',
    hints: [
      'Think about real-time location tracking',
      'How do you match drivers and riders efficiently?',
      'Consider surge pricing logic',
      'Think about geospatial indexing (e.g. QuadTree)'
    ]
  }
]

export default function WhiteboardPage() {
  const [selectedPrompt, setSelectedPrompt] = useState(SYSTEM_DESIGN_PROMPTS[0])
  const [showHints, setShowHints] = useState(false)
  const [loading, setLoading] = useState(true)
  const [timer, setTimer] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  useEffect(() => {
    let interval
    if (timerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [timerRunning])

  function formatTimer(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  function handlePromptChange(prompt) {
    setSelectedPrompt(prompt)
    setShowHints(false)
    setTimer(0)
    setTimerRunning(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full"
        />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-white/5 px-6 py-3 flex items-center justify-between flex-shrink-0"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-black">A</div>
            <span className="text-lg font-bold">Aptenza</span>
          </div>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400 text-sm">System Design Whiteboard</span>
        </div>
        <div className="flex items-center gap-4">
          {/* Timer */}
          <div className="flex items-center gap-2">
            <span className="text-gray-300 font-mono text-sm">{formatTimer(timer)}</span>
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className={`text-xs px-3 py-1 rounded-lg transition ${
                timerRunning
                  ? 'bg-red-900 text-red-300 hover:bg-red-800'
                  : 'bg-green-900 text-green-300 hover:bg-green-800'
              }`}
            >
              {timerRunning ? '⏸ Pause' : '▶ Start'}
            </button>
            <button
              onClick={() => { setTimer(0); setTimerRunning(false) }}
              className="text-xs px-3 py-1 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition"
            >
              Reset
            </button>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            ← Dashboard
          </button>
        </div>
      </motion.nav>

      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar — prompts */}
        <div className="w-64 border-r border-white/5 flex-shrink-0 overflow-y-auto">
          <div className="p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">
              Design Problems
            </p>
            <div className="space-y-1">
              {SYSTEM_DESIGN_PROMPTS.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handlePromptChange(prompt)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition ${
                    selectedPrompt.id === prompt.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {prompt.title}
                </button>
              ))}
            </div>

            {/* Prompt description */}
            <div className="mt-6 p-4 bg-gray-900 rounded-xl border border-white/5">
              <h3 className="text-sm font-bold mb-2">{selectedPrompt.title}</h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-3">
                {selectedPrompt.description}
              </p>
              <button
                onClick={() => setShowHints(!showHints)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition"
              >
                {showHints ? 'Hide hints ↑' : 'Show hints ↓'}
              </button>
              {showHints && (
                <motion.ul
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 space-y-2"
                >
                  {selectedPrompt.hints.map((hint, i) => (
                    <li key={i} className="text-xs text-gray-400 flex gap-2">
                      <span className="text-indigo-400 flex-shrink-0">→</span>
                      {hint}
                    </li>
                  ))}
                </motion.ul>
              )}
            </div>
          </div>
        </div>

        {/* Whiteboard */}
        <div className="flex-1 overflow-hidden">
          <Excalidraw
            theme="dark"
            UIOptions={{
              canvasActions: {
                saveToActiveFile: false,
                loadScene: false,
                export: false,
                toggleTheme: false,
              }
            }}
          />
        </div>

      </div>
    </main>
  )
}