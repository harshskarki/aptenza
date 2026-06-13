'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

export default function AnalyticsPage() {
  const [profile, setProfile] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      const { data: sessions } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setProfile(profile)
      setSessions(sessions || [])
      setLoading(false)
    }
    loadData()
  }, [])

  function getAverageScore() {
    const scored = sessions.filter(s => s.score !== null)
    if (scored.length === 0) return 0
    return Math.round(scored.reduce((a, b) => a + b.score, 0) / scored.length)
  }

  function getTypeCount(type) {
    return sessions.filter(s => s.type === type).length
  }

  const typeLabels = {
    dsa: '💻 DSA',
    behavioral: '🧠 Behavioral',
    system_design: '⚙️ System Design',
    domain: '🎯 Domain'
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
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="border-b border-white/5 px-6 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-black">A</div>
          <span className="text-lg font-bold">Aptenza</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/dashboard')}
          className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-1.5 rounded-lg transition"
        >
          ← Back to dashboard
        </motion.button>
      </motion.nav>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="mb-10"
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-black">
            Your Analytics 📊
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 mt-2">
            Track your interview performance over time.
          </motion.p>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-4 gap-4 mb-10"
        >
          {[
            { label: 'Total interviews', value: sessions.length },
            { label: 'Average score', value: getAverageScore() > 0 ? `${getAverageScore()}/10` : 'N/A' },
            { label: 'Current plan', value: profile?.plan || 'Free' },
            { label: 'Interviews left', value: profile?.plan === 'free' ? 3 - (profile?.interviews_used || 0) : '∞' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ scale: 1.02, borderColor: 'rgba(99,102,241,0.4)' }}
              className="bg-gray-900 rounded-xl p-6 border border-white/5 transition-colors"
            >
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className="text-3xl font-black mt-1 capitalize">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Interview type breakdown */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-gray-900 rounded-xl p-6 border border-white/5 mb-8"
        >
          <h3 className="text-lg font-bold mb-6">Interviews by type</h3>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(typeLabels).map(([type, label], i) => (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                className="text-center bg-gray-800 rounded-xl p-4 cursor-default"
              >
                <p className="text-3xl font-black">{getTypeCount(type)}</p>
                <p className="text-gray-400 text-sm mt-1">{label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Score bar if sessions exist */}
        {sessions.filter(s => s.score).length > 0 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-gray-900 rounded-xl p-6 border border-white/5 mb-8"
          >
            <h3 className="text-lg font-bold mb-6">Score breakdown</h3>
            <div className="space-y-3">
              {sessions.filter(s => s.score).map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <span className="text-xs text-gray-400 w-24 flex-shrink-0">
                    {typeLabels[session.type] || session.type}
                  </span>
                  <div className="flex-1 bg-gray-800 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(session.score / 10) * 100}%` }}
                      transition={{ delay: i * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
                      className="bg-indigo-600 h-2 rounded-full"
                    />
                  </div>
                  <span className="text-sm font-bold text-indigo-400 w-12 text-right">
                    {session.score}/10
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent sessions */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-gray-900 rounded-xl p-6 border border-white/5"
        >
          <h3 className="text-lg font-bold mb-6">Recent sessions</h3>

          {sessions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-5xl mb-4">🎯</p>
              <p className="text-gray-400 text-sm">No interviews yet.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/dashboard')}
                className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-6 py-2.5 rounded-lg transition font-medium"
              >
                Start your first interview →
              </motion.button>
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {sessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  variants={fadeUp}
                  whileHover={{ scale: 1.01, borderColor: 'rgba(99,102,241,0.3)' }}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-xl border border-transparent transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-900 rounded-xl flex items-center justify-center text-lg">
                      {session.type === 'dsa' ? '💻' :
                       session.type === 'behavioral' ? '🧠' :
                       session.type === 'system_design' ? '⚙️' : '🎯'}
                    </div>
                    <div>
                      <p className="font-medium">{typeLabels[session.type] || session.type}</p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {new Date(session.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {session.score ? (
                      <span className="text-indigo-400 font-black text-lg">{session.score}/10</span>
                    ) : (
                      <span className="text-gray-500 text-sm">No score</span>
                    )}
                    <p className="text-xs mt-0.5 capitalize text-gray-500">{session.status}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

      </div>
    </main>
  )
}