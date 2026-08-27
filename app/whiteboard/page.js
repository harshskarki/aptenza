'use client'

import { useState, useEffect, } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import ThemeToggle from '@/components/ThemeToggle'
import { useTheme } from 'next-themes'

const Excalidraw = dynamic(
  () => import('@excalidraw/excalidraw').then(mod => mod.Excalidraw),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
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
    id: 'twitter', title: 'Design Twitter', icon: '🐦', timeLimit: 45,
    description: 'Design a scalable Twitter-like social media platform supporting millions of users.',
    components: ['Client', 'Load Balancer', 'API Server', 'Database', 'Cache', 'CDN', 'Message Queue'],
    hints: ['Start with core entities: Users, Tweets, Followers', 'Tweet feed generation — think fan-out on write vs read', 'Read-heavy system — caching is critical (Redis)', 'Media should go to CDN, not your database', 'Use a message queue for async operations'],
    hasTemplate: true
  },
  {
    id: 'url_shortener', title: 'URL Shortener', icon: '🔗', timeLimit: 30,
    description: 'Design a URL shortening service like bit.ly handling billions of redirects.',
    components: ['Client', 'API Server', 'Hash Generator', 'Database', 'Cache', 'Analytics Service'],
    hints: ['Base62 encoding of an auto-increment ID is the cleanest approach', 'Use a counter + encoding to avoid collisions', 'Cache hot URLs in Redis for O(1) lookup', 'Analytics tracking should be async', 'Consider 301 vs 302 redirect trade-off'],
    hasTemplate: false
  },
  {
    id: 'whatsapp', title: 'Design WhatsApp', icon: '💬', timeLimit: 45,
    description: 'Design a real-time messaging app supporting billions of messages per day.',
    components: ['Client', 'WebSocket Server', 'Message Queue', 'Database', 'Notification Service', 'Media Storage'],
    hints: ['WebSockets for real-time — HTTP polling won\'t scale', 'Store messages in Cassandra (write-heavy, time-series)', 'Offline delivery: store messages and push when user reconnects', 'End-to-end encryption happens on the client side', 'Group messages: fan-out to all group members via queue'],
    hasTemplate: false
  },
  {
    id: 'netflix', title: 'Design Netflix', icon: '🎬', timeLimit: 45,
    description: 'Design a video streaming platform serving millions of concurrent viewers.',
    components: ['Client', 'CDN', 'API Gateway', 'Video Processing', 'Database', 'Recommendation Engine'],
    hints: ['Video is pre-processed into multiple resolutions', 'CDN is the most critical component — 90% of traffic is video', 'Adaptive bitrate streaming: client switches quality based on bandwidth', 'Metadata goes in a relational DB', 'Recommendation system is a separate ML service'],
    hasTemplate: false
  },
  {
    id: 'uber', title: 'Design Uber', icon: '🚗', timeLimit: 45,
    description: 'Design a ride-sharing platform matching drivers and riders in real time.',
    components: ['Client App', 'API Gateway', 'Location Service', 'Matching Service', 'Database', 'Notification Service'],
    hints: ['Drivers send GPS coordinates every 5 seconds', 'Use a QuadTree or Google S2 for proximity search', 'Matching: find nearest available driver within X km', 'Surge pricing is a separate service', 'Use a message queue so location updates don\'t block the API'],
    hasTemplate: false
  }
]

export default function WhiteboardPage() {
  const [selectedPrompt, setSelectedPrompt] = useState(SYSTEM_DESIGN_PROMPTS[0])
  const [showHints, setShowHints] = useState(false)
  const [showComponents, setShowComponents] = useState(false)
  const [loading, setLoading] = useState(true)
  const [timer, setTimer] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [excalidrawAPI, setExcalidrawAPI] = useState(null)
  const [saved, setSaved] = useState(false)
  const router = useRouter()
  const { theme } = useTheme()

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setLoading(false)
    }
    checkUser()
  }, [])

  useEffect(() => {
    let interval
    if (timerRunning) interval = setInterval(() => setTimer(prev => prev + 1), 1000)
    return () => clearInterval(interval)
  }, [timerRunning])

  function formatTimer(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  function getTimerColor() {
    const ratio = timer / (selectedPrompt.timeLimit * 60)
    if (ratio < 0.6) return 'text-green-500'
    if (ratio < 0.85) return 'text-yellow-500'
    return 'text-red-500'
  }

  function handlePromptChange(prompt) {
    setSelectedPrompt(prompt)
    setShowHints(false)
    setShowComponents(false)
    setTimer(0)
    setTimerRunning(false)
    setSaved(false)
    if (excalidrawAPI) excalidrawAPI.resetScene()
  }

  function loadTemplate() {
    if (!excalidrawAPI || !TEMPLATES[selectedPrompt.id]) return
    excalidrawAPI.updateScene({ elements: TEMPLATES[selectedPrompt.id].elements, appState: TEMPLATES[selectedPrompt.id].appState })
  }

  async function saveDesign() {
    if (!excalidrawAPI) return
    const elements = excalidrawAPI.getSceneElements()
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    localStorage.setItem(`whiteboard_${user.id}_${selectedPrompt.id}`, JSON.stringify(elements))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white flex flex-col transition-colors duration-300">

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-gray-200 dark:border-white/5 px-6 py-3 flex items-center justify-between shrink-0 bg-white dark:bg-gray-950 z-10 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-black text-white">A</div>
            <span className="text-lg font-bold">Aptenza</span>
          </div>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="text-gray-500 dark:text-gray-400 text-sm">⚙️ System Design Whiteboard</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-white/5 rounded-xl px-4 py-1.5">
            <span className={`font-mono text-sm font-bold ${getTimerColor()}`}>{formatTimer(timer)}</span>
            <span className="text-gray-400 text-xs">/ {selectedPrompt.timeLimit}:00</span>
            <button onClick={() => setTimerRunning(!timerRunning)}
              className={`text-xs px-2 py-0.5 rounded-lg transition ml-1 ${timerRunning ? 'bg-red-100 dark:bg-red-900/50 text-red-500' : 'bg-green-100 dark:bg-green-900/50 text-green-500'}`}>
              {timerRunning ? '⏸' : '▶'}
            </button>
            <button onClick={() => { setTimer(0); setTimerRunning(false) }} className="text-xs text-gray-400 hover:text-gray-900 dark:hover:text-white transition">↺</button>
          </div>

          {selectedPrompt.hasTemplate && (
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={loadTemplate}
              className="text-xs bg-indigo-100 dark:bg-indigo-900 hover:bg-indigo-200 dark:hover:bg-indigo-800 text-indigo-600 dark:text-indigo-300 px-3 py-1.5 rounded-lg transition">
              📐 Load Template
            </motion.button>
          )}
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={saveDesign}
            className={`text-xs px-3 py-1.5 rounded-lg transition ${saved ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
            {saved ? '✅ Saved!' : '💾 Save'}
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => excalidrawAPI?.resetScene()}
            className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/50 text-gray-500 dark:text-gray-400 hover:text-red-500 px-3 py-1.5 rounded-lg transition">
            🗑️ Clear
          </motion.button>
          <ThemeToggle />
          <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
            ← Dashboard
          </button>
        </div>
      </motion.nav>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <div className="w-72 border-r border-gray-200 dark:border-white/5 shrink-0 overflow-y-auto bg-white dark:bg-gray-950 transition-colors">
          <div className="p-4 space-y-2">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">Design Problems</p>
            {SYSTEM_DESIGN_PROMPTS.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => handlePromptChange(prompt)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition ${
                  selectedPrompt.id === prompt.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white border border-transparent hover:border-gray-200 dark:hover:border-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{prompt.icon}</span>
                  <div>
                    <div className="font-medium">{prompt.title}</div>
                    <div className={`text-xs mt-0.5 ${selectedPrompt.id === prompt.id ? 'text-indigo-200' : 'text-gray-400'}`}>{prompt.timeLimit} min</div>
                  </div>
                </div>
              </button>
            ))}

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{selectedPrompt.icon}</span>
                  <h3 className="font-bold text-sm">{selectedPrompt.title}</h3>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mb-4">{selectedPrompt.description}</p>

                <button onClick={() => setShowComponents(!showComponents)} className="text-xs text-amber-500 hover:text-amber-400 transition mb-2 w-full text-left">
                  {showComponents ? '▼ Hide components' : '▶ Key components'}
                </button>
                <AnimatePresence>
                  {showComponents && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="flex flex-wrap gap-1 mb-3"
                    >
                      {selectedPrompt.components.map((comp, i) => (
                        <span key={i} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 px-2 py-0.5 rounded-full">{comp}</span>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <button onClick={() => setShowHints(!showHints)} className="text-xs text-indigo-500 hover:text-indigo-400 transition w-full text-left">
                  {showHints ? '▼ Hide hints' : '▶ Show hints'}
                </button>
                <AnimatePresence>
                  {showHints && (
                    <motion.ul initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2 space-y-2">
                      {selectedPrompt.hints.map((hint, i) => (
                        <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                          className="text-xs text-gray-500 dark:text-gray-400 flex gap-2"
                        >
                          <span className="text-indigo-500 shrink-0 mt-0.5">→</span>{hint}
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Whiteboard */}
        <div className="flex-1 overflow-hidden">
          <Excalidraw
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            theme={theme === 'dark' ? 'dark' : 'light'}
            initialData={{ appState: { viewBackgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff' } }}
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