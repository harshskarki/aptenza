'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'

const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then(mod => mod.Excalidraw),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Loading whiteboard...</p>
        </div>
      </div>
    )
  }
)

const TEMPLATES = {
  twitter: {
    elements: [
      { id: '1', type: 'rectangle', x: 40, y: 120, width: 100, height: 50, strokeColor: '#6366f1', backgroundColor: '#1e1b4b', fillStyle: 'solid', strokeWidth: 2, roughness: 0, opacity: 100, angle: 0, seed: 1, version: 1, versionNonce: 1, isDeleted: false, groupIds: [], frameId: null, boundElements: null, updated: 1, link: null, locked: false },
      { id: '2', type: 'rectangle', x: 200, y: 120, width: 120, height: 50, strokeColor: '#6366f1', backgroundColor: '#1e1b4b', fillStyle: 'solid', strokeWidth: 2, roughness: 0, opacity: 100, angle: 0, seed: 2, version: 1, versionNonce: 2, isDeleted: false, groupIds: [], frameId: null, boundElements: null, updated: 1, link: null, locked: false },
      { id: '3', type: 'rectangle', x: 390, y: 60, width: 110, height: 50, strokeColor: '#6366f1', backgroundColor: '#1e1b4b', fillStyle: 'solid', strokeWidth: 2, roughness: 0, opacity: 100, angle: 0, seed: 3, version: 1, versionNonce: 3, isDeleted: false, groupIds: [], frameId: null, boundElements: null, updated: 1, link: null, locked: false },
      { id: '4', type: 'rectangle', x: 390, y: 180, width: 110, height: 50, strokeColor: '#10b981', backgroundColor: '#064e3b', fillStyle: 'solid', strokeWidth: 2, roughness: 0, opacity: 100, angle: 0, seed: 4, version: 1, versionNonce: 4, isDeleted: false, groupIds: [], frameId: null, boundElements: null, updated: 1, link: null, locked: false },
      { id: '5', type: 'rectangle', x: 570, y: 120, width: 110, height: 50, strokeColor: '#f59e0b', backgroundColor: '#451a03', fillStyle: 'solid', strokeWidth: 2, roughness: 0, opacity: 100, angle: 0, seed: 5, version: 1, versionNonce: 5, isDeleted: false, groupIds: [], frameId: null, boundElements: null, updated: 1, link: null, locked: false },
      { id: '6', type: 'rectangle', x: 570, y: 240, width: 110, height: 50, strokeColor: '#8b5cf6', backgroundColor: '#2e1065', fillStyle: 'solid', strokeWidth: 2, roughness: 0, opacity: 100, angle: 0, seed: 6, version: 1, versionNonce: 6, isDeleted: false, groupIds: [], frameId: null, boundElements: null, updated: 1, link: null, locked: false },
      { id: 't1', type: 'text', x: 55, y: 138, width: 70, height: 20, text: 'Client', strokeColor: '#e2e8f0', backgroundColor: 'transparent', fillStyle: 'solid', strokeWidth: 1, roughness: 0, opacity: 100, angle: 0, seed: 11, version: 1, versionNonce: 11, isDeleted: false, groupIds: [], frameId: null, boundElements: null, updated: 1, link: null, locked: false, fontSize: 14, fontFamily: 1, textAlign: 'center', verticalAlign: 'middle', baseline: 14 },
      { id: 't2', type: 'text', x: 208, y: 138, width: 104, height: 20, text: 'Load Balancer', strokeColor: '#e2e8f0', backgroundColor: 'transparent', fillStyle: 'solid', strokeWidth: 1, roughness: 0, opacity: 100, angle: 0, seed: 12, version: 1, versionNonce: 12, isDeleted: false, groupIds: [], frameId: null, boundElements: null, updated: 1, link: null, locked: false, fontSize: 14, fontFamily: 1, textAlign: 'center', verticalAlign: 'middle', baseline: 14 },
      { id: 't3', type: 'text', x: 398, y: 78, width: 94, height: 20, text: 'API Server', strokeColor: '#e2e8f0', backgroundColor: 'transparent', fillStyle: 'solid', strokeWidth: 1, roughness: 0, opacity: 100, angle: 0, seed: 13, version: 1, versionNonce: 13, isDeleted: false, groupIds: [], frameId: null, boundElements: null, updated: 1, link: null, locked: false, fontSize: 14, fontFamily: 1, textAlign: 'center', verticalAlign: 'middle', baseline: 14 },
      { id: 't4', type: 'text', x: 398, y: 198, width: 94, height: 20, text: 'Database', strokeColor: '#e2e8f0', backgroundColor: 'transparent', fillStyle: 'solid', strokeWidth: 1, roughness: 0, opacity: 100, angle: 0, seed: 14, version: 1, versionNonce: 14, isDeleted: false, groupIds: [], frameId: null, boundElements: null, updated: 1, link: null, locked: false, fontSize: 14, fontFamily: 1, textAlign: 'center', verticalAlign: 'middle', baseline: 14 },
      { id: 't5', type: 'text', x: 575, y: 138, width: 100, height: 20, text: 'Cache (Redis)', strokeColor: '#e2e8f0', backgroundColor: 'transparent', fillStyle: 'solid', strokeWidth: 1, roughness: 0, opacity: 100, angle: 0, seed: 15, version: 1, versionNonce: 15, isDeleted: false, groupIds: [], frameId: null, boundElements: null, updated: 1, link: null, locked: false, fontSize: 14, fontFamily: 1, textAlign: 'center', verticalAlign: 'middle', baseline: 14 },
      { id: 't6', type: 'text', x: 575, y: 258, width: 100, height: 20, text: 'CDN', strokeColor: '#e2e8f0', backgroundColor: 'transparent', fillStyle: 'solid', strokeWidth: 1, roughness: 0, opacity: 100, angle: 0, seed: 16, version: 1, versionNonce: 16, isDeleted: false, groupIds: [], frameId: null, boundElements: null, updated: 1, link: null, locked: false, fontSize: 14, fontFamily: 1, textAlign: 'center', verticalAlign: 'middle', baseline: 14 },
    ],
    appState: { viewBackgroundColor: '#0f172a', zoom: { value: 1 } }
  }
}

const SYSTEM_DESIGN_PROMPTS = [
  {
    id: 'twitter',
    title: 'Design Twitter',
    icon: '🐦',
    description: 'Design a scalable Twitter-like social media platform supporting millions of users.',
    timeLimit: 45,
    components: ['Client', 'Load Balancer', 'API Server', 'Database', 'Cache', 'CDN', 'Message Queue'],
    hints: [
      'Start with core entities: Users, Tweets, Followers',
      'Tweet feed generation is the hardest part — think fan-out on write vs read',
      'Read-heavy system — caching is critical (Redis)',
      'Media (images/videos) should go to CDN, not your database',
      'Consider a message queue for async operations like sending notifications'
    ],
    hasTemplate: true
  },
  {
    id: 'url_shortener',
    title: 'URL Shortener',
    icon: '🔗',
    description: 'Design a URL shortening service like bit.ly handling billions of redirects.',
    timeLimit: 30,
    components: ['Client', 'API Server', 'Hash Generator', 'Database', 'Cache', 'Analytics Service'],
    hints: [
      'Short code generation: Base62 encoding of an auto-increment ID is the cleanest approach',
      'Collisions: Use a counter + encoding to avoid them entirely',
      'Redirects are read-heavy — cache hot URLs in Redis for O(1) lookup',
      'Analytics tracking should be async (don\'t slow down the redirect)',
      'Consider a 301 (permanent) vs 302 (temporary) redirect trade-off'
    ],
    hasTemplate: false
  },
  {
    id: 'whatsapp',
    title: 'Design WhatsApp',
    icon: '💬',
    description: 'Design a real-time messaging app supporting billions of messages per day.',
    timeLimit: 45,
    components: ['Client', 'WebSocket Server', 'Message Queue', 'Database', 'Notification Service', 'Media Storage'],
    hints: [
      'WebSockets for real-time — HTTP polling won\'t scale',
      'Store messages in Cassandra (write-heavy, time-series data fits perfectly)',
      'Offline delivery: store messages and push when user reconnects',
      'End-to-end encryption happens on the client side, not the server',
      'Group messages: fan-out to all group members via a message queue'
    ],
    hasTemplate: false
  },
  {
    id: 'netflix',
    title: 'Design Netflix',
    icon: '🎬',
    description: 'Design a video streaming platform serving millions of concurrent viewers.',
    timeLimit: 45,
    components: ['Client', 'CDN', 'API Gateway', 'Video Processing', 'Database', 'Recommendation Engine'],
    hints: [
      'Video is pre-processed into multiple resolutions (360p, 720p, 1080p, 4K)',
      'CDN is the most critical component — 90% of traffic is video delivery',
      'Adaptive bitrate streaming: client switches quality based on bandwidth',
      'Metadata (titles, descriptions) goes in a relational DB',
      'Recommendation system is a separate ML service, not part of core flow'
    ],
    hasTemplate: false
  },
  {
    id: 'uber',
    title: 'Design Uber',
    icon: '🚗',
    description: 'Design a ride-sharing platform matching drivers and riders in real time.',
    timeLimit: 45,
    components: ['Client App', 'API Gateway', 'Location Service', 'Matching Service', 'Database', 'Notification Service'],
    hints: [
      'Location updates: drivers send GPS coordinates every 5 seconds',
      'Geospatial indexing: use a QuadTree or Google S2 for efficient proximity search',
      'Matching algorithm: find nearest available driver within X km radius',
      'Surge pricing is a separate service reading supply/demand data',
      'Use a message queue so location updates don\'t block the main API'
    ],
    hasTemplate: false
  }
]

export default function WhiteboardPage() {
  const [selectedPrompt, setSelectedPrompt] = useState(SYSTEM_DESIGN_PROMPTS[0])
  const [showHints, setShowHints] = useState(false)
  const [loading, setLoading] = useState(true)
  const [timer, setTimer] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [excalidrawAPI, setExcalidrawAPI] = useState(null)
  const [saved, setSaved] = useState(false)
  const [showComponents, setShowComponents] = useState(false)
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
      interval = setInterval(() => setTimer(prev => prev + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [timerRunning])

  function formatTimer(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  function getTimerColor() {
    const limit = selectedPrompt.timeLimit * 60
    const ratio = timer / limit
    if (ratio < 0.6) return 'text-green-400'
    if (ratio < 0.85) return 'text-yellow-400'
    return 'text-red-400'
  }

  function handlePromptChange(prompt) {
    setSelectedPrompt(prompt)
    setShowHints(false)
    setTimer(0)
    setTimerRunning(false)
    setSaved(false)
    setShowComponents(false)
    if (excalidrawAPI) {
      excalidrawAPI.resetScene()
    }
  }

  function loadTemplate() {
    if (!excalidrawAPI || !TEMPLATES[selectedPrompt.id]) return
    const template = TEMPLATES[selectedPrompt.id]
    excalidrawAPI.updateScene({
      elements: template.elements,
      appState: template.appState
    })
  }

  function clearCanvas() {
    if (excalidrawAPI) excalidrawAPI.resetScene()
    setSaved(false)
  }

  async function saveDesign() {
    if (!excalidrawAPI) return
    const elements = excalidrawAPI.getSceneElements()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Save as JSON in localStorage for now (DB storage in Phase 4)
    localStorage.setItem(`whiteboard_${user.id}_${selectedPrompt.id}`, JSON.stringify(elements))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
        className="border-b border-white/5 px-6 py-3 flex items-center justify-between flex-shrink-0 bg-gray-950 z-10"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-black">A</div>
            <span className="text-lg font-bold">Aptenza</span>
          </div>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400 text-sm">⚙️ System Design Whiteboard</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Timer */}
          <div className="flex items-center gap-2 bg-gray-900 border border-white/5 rounded-xl px-4 py-1.5">
            <span className={`font-mono text-sm font-bold ${getTimerColor()}`}>
              {formatTimer(timer)}
            </span>
            <span className="text-gray-600 text-xs">/ {selectedPrompt.timeLimit}:00</span>
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className={`text-xs px-2 py-0.5 rounded-lg transition ml-1 ${
                timerRunning
                  ? 'bg-red-900/50 text-red-300 hover:bg-red-900'
                  : 'bg-green-900/50 text-green-300 hover:bg-green-900'
              }`}
            >
              {timerRunning ? '⏸' : '▶'}
            </button>
            <button
              onClick={() => { setTimer(0); setTimerRunning(false) }}
              className="text-xs text-gray-600 hover:text-white transition"
            >
              ↺
            </button>
          </div>

          {/* Actions */}
          {selectedPrompt.hasTemplate && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadTemplate}
              className="text-xs bg-indigo-900 hover:bg-indigo-800 text-indigo-300 px-3 py-1.5 rounded-lg transition"
            >
              📐 Load Template
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveDesign}
            className={`text-xs px-3 py-1.5 rounded-lg transition ${
              saved
                ? 'bg-green-900 text-green-300'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
            }`}
          >
            {saved ? '✅ Saved!' : '💾 Save'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearCanvas}
            className="text-xs bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-300 px-3 py-1.5 rounded-lg transition"
          >
            🗑️ Clear
          </motion.button>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            ← Dashboard
          </button>
        </div>
      </motion.nav>

      <div className="flex flex-1 overflow-hidden">

        {/* Left sidebar */}
        <div className="w-72 border-r border-white/5 flex-shrink-0 overflow-y-auto bg-gray-950">
          <div className="p-4 space-y-2">

            {/* Problem list */}
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">
              Design Problems
            </p>
            {SYSTEM_DESIGN_PROMPTS.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => handlePromptChange(prompt)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition ${
                  selectedPrompt.id === prompt.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent hover:border-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{prompt.icon}</span>
                  <div>
                    <div className="font-medium">{prompt.title}</div>
                    <div className={`text-xs mt-0.5 ${selectedPrompt.id === prompt.id ? 'text-indigo-200' : 'text-gray-600'}`}>
                      {prompt.timeLimit} min
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {/* Selected problem details */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <div className="bg-gray-900 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{selectedPrompt.icon}</span>
                  <h3 className="font-bold text-sm">{selectedPrompt.title}</h3>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed mb-4">
                  {selectedPrompt.description}
                </p>

                {/* Key components */}
                <button
                  onClick={() => setShowComponents(!showComponents)}
                  className="text-xs text-amber-400 hover:text-amber-300 transition mb-2 w-full text-left"
                >
                  {showComponents ? '▼ Hide components' : '▶ Key components'}
                </button>
                <AnimatePresence>
                  {showComponents && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-wrap gap-1 mb-3"
                    >
                      {selectedPrompt.components.map((comp, i) => (
                        <span key={i} className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">
                          {comp}
                        </span>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hints */}
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition w-full text-left"
                >
                  {showHints ? '▼ Hide hints' : '▶ Show hints'}
                </button>
                <AnimatePresence>
                  {showHints && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 space-y-2"
                    >
                      {selectedPrompt.hints.map((hint, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="text-xs text-gray-400 flex gap-2"
                        >
                          <span className="text-indigo-400 flex-shrink-0 mt-0.5">→</span>
                          {hint}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>

        {/* Whiteboard canvas */}
        <div className="flex-1 overflow-hidden">
          <Excalidraw
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            theme="dark"
            initialData={{
              appState: {
                viewBackgroundColor: '#0f172a',
                currentItemStrokeColor: '#6366f1',
                currentItemFontSize: 16,
                gridSize: null,
              }
            }}
            UIOptions={{
              canvasActions: {
                saveToActiveFile: false,
                loadScene: false,
                export: false,
                toggleTheme: false,
                changeViewBackgroundColor: false,
              }
            }}
          />
        </div>

      </div>
    </main>
  )
}