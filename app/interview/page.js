'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

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

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)
      const type = searchParams.get('type')
      if (type) setInterviewType(type)
    }
    checkUser()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function startInterview() {
    setSessionStarted(true)
    setLoading(true)
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
      user_id: user.id,
      type: interviewType,
      status: 'completed',
      score: score,
      feedback: lastResponse,
      transcript: messages
    })
    await supabase
      .from('profiles')
      .update({ interviews_used: (profile?.interviews_used || 0) + 1 })
      .eq('id', user.id)
  }

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMessage = { role: 'user', content: input }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)
    const response = await fetch('/api/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: updatedMessages, interviewType, isStart: false })
    })
    const data = await response.json()
    const assistantMessage = { role: 'assistant', content: data.message }
    setMessages(prev => [...prev, assistantMessage])
    setLoading(false)
    if (updatedMessages.length >= 6) {
      await saveSession(updatedMessages, data.message)
    }
  }

  const typeLabels = {
    dsa: '💻 DSA Interview',
    behavioral: '🧠 Behavioral Interview',
    system_design: '⚙️ System Design',
    domain: '🎯 Domain Specific'
  }

  if (!sessionStarted) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4 relative overflow-hidden">

        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md text-center relative z-10"
        >
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm font-black">A</div>
            <span className="text-xl font-bold">Aptenza</span>
          </div>

          <h1 className="text-4xl font-black text-white mb-2">Mock Interview</h1>
          <p className="text-gray-400 mb-8">Select your type and start when ready.</p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-gray-900 rounded-2xl p-8 border border-white/5 shadow-2xl"
          >
            <label className="text-sm text-gray-400 mb-2 block text-left font-medium">
              Interview type
            </label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-indigo-500 mb-6 transition"
            >
              <option value="dsa">💻 DSA Interview</option>
              <option value="behavioral">🧠 Behavioral Interview</option>
              <option value="system_design">⚙️ System Design</option>
              <option value="domain">🎯 Domain Specific</option>
            </select>

            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
              whileTap={{ scale: 0.97 }}
              onClick={startInterview}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition text-base"
            >
              Start Interview →
            </motion.button>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full mt-3 text-gray-500 hover:text-white text-sm transition py-2"
            >
              ← Back to dashboard
            </button>
          </motion.div>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col">

      {/* Header */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="border-b border-white/5 px-6 py-4 flex items-center justify-between bg-gray-950/80 backdrop-blur-md sticky top-0 z-10"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-black">A</div>
          <span className="text-lg font-bold">Aptenza</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-sm">{typeLabels[interviewType]}</span>
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-green-400 text-xs">Live</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/dashboard')}
          className="text-sm bg-gray-800 hover:bg-red-900 text-gray-300 hover:text-red-300 px-4 py-1.5 rounded-lg transition"
        >
          End interview
        </motion.button>
      </motion.nav>

      {/* Messages */}
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
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 mt-1">AI</div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-gray-900 text-gray-100 border border-white/5 rounded-tl-none'
                }`}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold ml-2 flex-shrink-0 mt-1">U</div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-4"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0">AI</div>
            <div className="bg-gray-900 border border-white/5 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="border-t border-white/5 px-4 py-4 bg-gray-950"
      >
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your answer..."
            className="flex-1 bg-gray-900 text-white rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-indigo-500 transition text-sm placeholder-gray-600"
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
      <main className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full"
        />
      </main>
    }>
      <InterviewContent />
    </Suspense>
  )
}