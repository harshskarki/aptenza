'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}

const typeLabels = {
  dsa: '💻 DSA Interview',
  behavioral: '🧠 Behavioral Interview',
  system_design: '⚙️ System Design',
  domain: '🎯 Domain Specific'
}

export default function TranscriptPage() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { id } = useParams()

  useEffect(() => {
    async function loadSession() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: session } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (!session) {
        router.push('/analytics')
        return
      }

      setSession(session)
      setLoading(false)
    }
    loadSession()
  }, [id])

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

  const transcript = session.transcript || []
  const scoreColor = session.score >= 8 ? 'text-green-400' :
    session.score >= 6 ? 'text-indigo-400' : 'text-yellow-400'

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-white/5 px-6 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-black">A</div>
          <span className="text-lg font-bold">Aptenza</span>
        </div>
        <button
          onClick={() => router.push('/analytics')}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          ← Back to analytics
        </button>
      </motion.nav>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-3">
            <span className="text-2xl">
              {session.type === 'dsa' ? '💻' :
               session.type === 'behavioral' ? '🧠' :
               session.type === 'system_design' ? '⚙️' : '🎯'}
            </span>
            <h2 className="text-3xl font-black">{typeLabels[session.type]}</h2>
          </motion.div>
          <motion.div variants={fadeUp} className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">
              {new Date(session.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </span>
            {session.score && (
              <span className={`font-black text-lg ${scoreColor}`}>
                {session.score}/10
              </span>
            )}
            <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full capitalize">
              {session.status}
            </span>
          </motion.div>
        </motion.div>

        {/* Score breakdown */}
        {session.score && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-gray-900 rounded-2xl p-6 border border-white/5 mb-6"
          >
            <h3 className="text-lg font-bold mb-4">Score Breakdown</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className={`text-5xl font-black ${scoreColor}`}>
                {session.score}/10
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-800 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(session.score / 10) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                    className={`h-3 rounded-full ${
                      session.score >= 8 ? 'bg-green-500' :
                      session.score >= 6 ? 'bg-indigo-500' : 'bg-yellow-500'
                    }`}
                  />
                </div>
                <p className="text-gray-400 text-xs mt-2">
                  {session.score >= 8 ? 'Excellent performance!' :
                   session.score >= 6 ? 'Good performance — keep it up!' :
                   'Room to improve — practice more!'}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Final feedback */}
        {session.feedback && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-indigo-950/50 rounded-2xl p-6 border border-indigo-500/20 mb-6"
          >
            <h3 className="text-lg font-bold mb-3">AI Feedback</h3>
            <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {session.feedback}
            </p>
          </motion.div>
        )}

        {/* Full transcript */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-gray-900 rounded-2xl p-6 border border-white/5"
        >
          <h3 className="text-lg font-bold mb-6">Full Transcript</h3>

          {transcript.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              No transcript available for this session.
            </p>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {transcript.map((msg, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-gray-800 text-gray-100 border border-white/5 rounded-tl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                      U
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-6 flex gap-3"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(`/interview?type=${session.type}`)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition"
          >
            Retry this interview →
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/analytics')}
            className="border border-gray-700 hover:border-gray-500 text-gray-300 px-6 py-3 rounded-xl text-sm font-medium transition"
          >
            Back to analytics
          </motion.button>
        </motion.div>

      </div>
    </main>
  )
}