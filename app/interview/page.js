'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from '@/components/ThemeToggle'

function InterviewContent() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [interviewType, setInterviewType] = useState('dsa')
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const bottomRef = useRef(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const [timeLimit, setTimeLimit] = useState(30) // minutes
  const [timeLeft, setTimeLeft] = useState(null)
  const [timerActive, setTimerActive] = useState(false)
  const [pressureMode, setPressureMode] = useState(false)
  const [timeWarning, setTimeWarning] = useState(false) 

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profileData)
      const type = searchParams.get('type')
      if (type) setInterviewType(type)
    }
    checkUser()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!timerActive || timeLeft === null) return
    if (timeLeft <= 0) {
      setTimerActive(false)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⏰ Time's up! Your ${timeLimit}-minute interview session has ended.\n\nGreat job practicing under pressure! This is exactly what real interviews feel like. Review your answers and identify areas to improve.`
      }])
      return
    }
    if (timeLeft === 300) setTimeWarning(true) // 5 min warning
    const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [timerActive, timeLeft])

  async function startInterview() {
  // Check plan gating
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: freshProfile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()

  const typeAccess = {
    dsa: ['free', 'pro', 'premium'],
    behavioral: ['pro', 'premium'],
    system_design: ['pro', 'premium'],
    domain: ['premium']
  }

  if (!typeAccess[interviewType]?.includes(freshProfile.plan)) {
    const required = interviewType === 'domain' ? 'Premium' : 'Pro'
    alert(`This interview type requires the ${required} plan. Upgrade on the pricing page!`)
    router.push('/pricing')
    return
  }

  const credits = freshProfile.interview_credits || 0
  if (credits > 0) {
    await supabase.from('profiles').update({ interview_credits: credits - 1 }).eq('id', user.id)
  } else {
    const limits = { free: 3, pro: 15, premium: Infinity }
    const totalUsed = freshProfile.interviews_used || 0
    const bonusInterviews = freshProfile.bonus_interviews || 0
    const limit = limits[freshProfile.plan] + bonusInterviews
    if (totalUsed >= limit) {
      alert(`You've used all your interviews for this month. Buy credits or upgrade your plan!`)
      router.push('/credits')
      return
    }
  }

  setSessionStarted(true)
  setLoading(true)

  // Start timer if pressure mode
  if (pressureMode) {
    setTimeLeft(timeLimit * 60)
    setTimerActive(true)
  }

  const response = await fetch('/api/interview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: [], interviewType, isStart: true })
  })
  const data = await response.json()
  setMessages([{ role: 'assistant', content: data.message }])
  setLoading(false)
}

  async function saveSession(messages, lastResponse) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const scoreMatch = lastResponse.match(/(\d+)\/10/)
    const score = scoreMatch ? parseInt(scoreMatch[1]) : null
    await supabase.from('sessions').insert({
      user_id: user.id, type: interviewType, status: 'completed',
      score, feedback: lastResponse, transcript: messages
    })
    await supabase.from('profiles').update({ interviews_used: (profile?.interviews_used || 0) + 1 }).eq('id', user.id)
  }

  async function sendMessage() {
    if (response.status === 429) {
      const data = await response.json()
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ You're sending messages too fast. Please wait ${data.resetInSeconds} seconds before continuing.`
      }])
      setLoading(false)
      return
    }

    const data = await response.json()
    const assistantMessage = { role: 'assistant', content: data.message }
    setMessages(prev => [...prev, assistantMessage])
    setLoading(false)
    if (data.message.includes('Overall Score')) {
      try {
        const { fireSchoolPride } = await import('@/utils/confetti')
        fireSchoolPride()
      } catch (e) {}
    }
    if (updatedMessages.length >= 6) {
      await saveSession(updatedMessages, data.message)
      const fromQueue = searchParams.get('fromQueue')
      if (fromQueue) {
        const saved = sessionStorage.getItem('practiceQueue')
        const remaining = saved ? JSON.parse(saved) : []
        setTimeout(() => {
          if (remaining.length > 0) { router.push('/practice-queue') }
          else { sessionStorage.removeItem('practiceQueue'); router.push('/dashboard') }
        }, 3000)
      }
    }
  }

  function handleEndInterview() {
    const fromQueue = searchParams.get('fromQueue')
    if (fromQueue) {
      const saved = sessionStorage.getItem('practiceQueue')
      const remaining = saved ? JSON.parse(saved) : []
      if (remaining.length > 0) { router.push('/practice-queue') }
      else { sessionStorage.removeItem('practiceQueue'); router.push('/dashboard') }
    } else {
      router.push('/dashboard')
    }
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const typeLabels = {
    dsa: '💻 DSA Interview',
    behavioral: '🧠 Behavioral Interview',
    system_design: '⚙️ System Design',
    domain: '🎯 Domain Specific'
  }

  if (!sessionStarted) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none hidden dark:block" />
        <div className="absolute top-4 right-4"><ThemeToggle /></div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md text-center relative z-10"
        >
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm font-black text-white">A</div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Aptenza</span>
          </div>

          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">Mock Interview</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-8">Select your type and start when ready.</p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-white/5 shadow-sm dark:shadow-2xl transition-colors"
          >
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block text-left font-medium">Interview type</label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 border border-gray-200 dark:border-white/5 focus:outline-none focus:border-indigo-500 mb-4 transition"
            >
              <option value="dsa">💻 DSA Interview</option>
              <option value="behavioral">🧠 Behavioral Interview</option>
              <option value="system_design">⚙️ System Design</option>
              <option value="domain">🎯 Domain Specific</option>
            </select>

            {/* Pressure mode toggle */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-white/5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-sm">⏱️ Pressure Mode</p>
                  <p className="text-xs text-gray-400 mt-0.5">Add a countdown timer to simulate real interviews</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPressureMode(!pressureMode)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${pressureMode ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                >
                  <motion.div
                    animate={{ x: pressureMode ? 24 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                  />
                </motion.button>
              </div>

              {pressureMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-2"
                >
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Time limit:</p>
                  <div className="flex gap-2">
                    {[15, 20, 30, 45].map(mins => (
                      <button
                        key={mins}
                        onClick={() => setTimeLimit(mins)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                          timeLimit === mins
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
              whileTap={{ scale: 0.97 }}
              onClick={startInterview}
              className={`w-full font-bold py-3.5 rounded-xl transition text-base text-white ${
                pressureMode
                  ? 'bg-orange-500 hover:bg-orange-400'
                  : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              {pressureMode ? `⏱️ Start ${timeLimit}min Challenge →` : 'Start Interview →'}
            </motion.button>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full mt-3 text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition py-2"
            >
              ← Back to dashboard
            </button>
          </motion.div>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 flex flex-col transition-colors duration-300">

      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-gray-200 dark:border-white/5 px-4 sm:px-6 py-4 flex items-center justify-between bg-white dark:bg-gray-950 sticky top-0 z-10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-black text-white">A</div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">Aptenza</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-500 dark:text-gray-400 text-sm hidden sm:block">{typeLabels[interviewType]}</span>
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-green-500 text-xs">Live</span>

          {/* Timer display */}
          {pressureMode && timeLeft !== null && (
            <motion.div
              animate={timeWarning ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1 }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-sm font-black ${
                timeLeft <= 300
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                  : timeLeft <= 600
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-500'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              ⏱️ {formatTime(timeLeft)}
            </motion.div>
          )}

          <ThemeToggle />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleEndInterview}
          className="text-sm bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-300 px-4 py-1.5 rounded-lg transition"
        >
          End interview
        </motion.button>
      </motion.nav>

      {/* Time warning */}
      <AnimatePresence>
        {timeWarning && timeLeft > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-500/30 px-6 py-2 text-center"
          >
            <p className="text-red-500 text-sm font-bold">⚠️ 5 minutes remaining! Wrap up your answers.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl mx-auto w-full">

        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-white mr-2 shrink-0 mt-1">AI</div>
              )}
              <div className={`max-w-[90%] sm:max-w-[80%] rounded-2xl px-3 sm:px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-white/5 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold ml-2 shrink-0 mt-1">U</div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start mb-4">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-white mr-2 shrink-0">AI</div>
            <div className="bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-white/5 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
              {[0, 1, 2].map(i => (
                <motion.div key={i} animate={{ y: [0, -6, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="border-t border-gray-200 dark:border-white/5 px-4 py-4 bg-white dark:bg-gray-950 transition-colors"
      >
        <div className="max-w-3xl mx-auto flex gap-2 sm:gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your answer..."
            className="flex-1 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white rounded-xl px-4 py-3 border border-gray-200 dark:border-white/5 focus:outline-none focus:border-indigo-500 transition text-sm placeholder-gray-400 dark:placeholder-gray-600"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl transition disabled:opacity-50 text-sm font-bold"
          >
            Send →
          </motion.button>
        </div>
      </motion.div>
    </main>
  )
}

export default function InterviewPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </main>
    }>
      <InterviewContent />
    </Suspense>
  )
}