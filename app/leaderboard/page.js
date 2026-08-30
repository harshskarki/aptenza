'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { MaxHeap } from '@/utils/heap'
import { motion } from 'framer-motion'
import ThemeToggle from '@/components/ThemeToggle'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}

export default function LeaderboardPage() {
  const [topScores, setTopScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [currentUserId, setCurrentUserId] = useState(null)
  const router = useRouter()

  useEffect(() => { loadLeaderboard() }, [filterType])

  async function loadLeaderboard() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setCurrentUserId(user.id)

    let query = supabase.from('leaderboard_view').select('*')
    if (filterType !== 'all') query = query.eq('type', filterType)
    const { data } = await query

    const heap = new MaxHeap()
    const userBest = {}
    data?.forEach(row => {
      if (!userBest[row.id] || row.best_score > userBest[row.id].score) {
        userBest[row.id] = { score: row.best_score, name: row.full_name, interviews: row.total_interviews, userId: row.id }
      }
    })
    Object.values(userBest).forEach(item => heap.insert(item))
    setTopScores(heap.getTopN(10))
    setLoading(false)
  }

  const typeFilters = [
    { value: 'all', label: 'All types' },
    { value: 'dsa', label: '💻 DSA' },
    { value: 'behavioral', label: '🧠 Behavioral' },
    { value: 'system_design', label: '⚙️ System Design' },
  ]

  const medals = ['🥇', '🥈', '🥉']

  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-gray-200 dark:border-white/5 px-6 py-4 flex items-center justify-between bg-white dark:bg-gray-950 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-black text-white">A</div>
          <span className="text-lg font-bold">Aptenza</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
            ← Dashboard
          </button>
        </div>
      </motion.nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h2 className="text-3xl font-black mb-2">Leaderboard 🏆</h2>
          <p className="text-gray-500 dark:text-gray-400">Top scores ranked using a Max Heap. See where you stand.</p>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mb-6 overflow-x-auto"
        >
          {typeFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterType(filter.value)}
              className={`text-sm px-4 py-2 rounded-xl whitespace-nowrap transition ${
                filterType === filter.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/5'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </motion.div>

        {/* Leaderboard */}
        {topScores.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/5"
          >
            <p className="text-5xl mb-4">🏆</p>
            <p className="text-gray-400">No scores yet for this category.</p>
            <p className="text-gray-400 text-sm mt-1">Complete an interview to appear on the leaderboard!</p>
          </motion.div>
        ) : (
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden transition-colors"
          >
            {topScores.map((item, i) => (
              <motion.div
                key={item.userId}
                variants={fadeUp}
                whileHover={{ backgroundColor: 'rgba(99,102,241,0.05)' }}
                className={`flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5 last:border-0 ${
                  item.userId === currentUserId ? 'bg-indigo-50 dark:bg-indigo-950/30' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl w-8 text-center">{medals[i] || `#${i + 1}`}</span>
                  <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {item.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                  </div>
                  <div>
                    <p className="font-medium">
                      {item.name || 'Anonymous'}
                      {item.userId === currentUserId && <span className="text-indigo-500 text-xs ml-2">(You)</span>}
                    </p>
                    <p className="text-gray-400 text-xs">{item.interviews} interviews</p>
                  </div>
                </div>
                <span className="text-xl font-black text-indigo-500">{item.score}/10</span>
              </motion.div>
            ))}
          </motion.div>
        )}

      </div>
    </main>
  )
}