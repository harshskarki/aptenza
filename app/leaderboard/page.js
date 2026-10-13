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
  const [timeFilter, setTimeFilter] = useState('alltime')
  const [currentUserId, setCurrentUserId] = useState(null)
  const [currentUserRank, setCurrentUserRank] = useState(null)
  const [tab, setTab] = useState('global')
  const [friendsData, setFriendsData] = useState([])
  const [profile, setProfile] = useState(null)
  const router = useRouter()

  useEffect(() => { loadLeaderboard() }, [filterType, timeFilter, tab])

  async function loadLeaderboard() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setCurrentUserId(user.id)

    const { data: profile } = await supabase
      .from('profiles').select('*').eq('id', user.id).single()
    setProfile(profile)

    if (tab === 'friends') {
      // Get friends (people referred by this user)
      const { data: friends } = await supabase
        .from('profiles')
        .select('*')
        .eq('referred_by', profile?.referral_code)

      const friendIds = [user.id, ...(friends || []).map(f => f.id)]
      let query = supabase.from('leaderboard_view').select('*').in('id', friendIds)
      if (filterType !== 'all') query = query.eq('type', filterType)
      const { data } = await query
      processLeaderboard(data, user.id)
      setLoading(false)
      return
    }

    // Global leaderboard
    let query = supabase.from('leaderboard_view').select('*')
    if (filterType !== 'all') query = query.eq('type', filterType)
    const { data } = await query

    // Filter by time if weekly
    let filtered = data || []
    if (timeFilter === 'weekly') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      filtered = filtered.filter(row => row.created_at > weekAgo)
    }

    processLeaderboard(filtered, user.id)
    setLoading(false)
  }

  function processLeaderboard(data, userId) {
    const heap = new MaxHeap()
    const userBest = {}

    data?.forEach(row => {
      if (!userBest[row.id] || row.best_score > userBest[row.id].score) {
        userBest[row.id] = {
          score: row.best_score,
          name: row.full_name,
          interviews: row.total_interviews,
          userId: row.id
        }
      }
    })

    Object.values(userBest).forEach(item => heap.insert(item))
    const top10 = heap.getTopN(10)
    setTopScores(top10)

    const rank = top10.findIndex(item => item.userId === userId)
    setCurrentUserRank(rank !== -1 ? rank + 1 : null)
  }

  const typeFilters = [
    { value: 'all', label: 'All' },
    { value: 'dsa', label: '💻 DSA' },
    { value: 'behavioral', label: '🧠 Behavioral' },
    { value: 'system_design', label: '⚙️ System Design' },
    { value: 'domain', label: '🎯 Domain' },
  ]

  const medals = ['🥇', '🥈', '🥉']

  const getRankColor = (rank) => {
    if (rank === 0) return 'text-yellow-500'
    if (rank === 1) return 'text-gray-400'
    if (rank === 2) return 'text-amber-600'
    return 'text-gray-500 dark:text-gray-400'
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
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors duration-300">

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-gray-200 dark:border-white/5 px-4 sm:px-6 py-4 flex items-center justify-between bg-white dark:bg-gray-950 transition-colors"
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
          <h2 className="text-3xl font-black mb-2">Leaderboard 🏆</h2>
          <p className="text-gray-500 dark:text-gray-400">Top scores ranked using a Max Heap.</p>
        </motion.div>

        {/* Your rank banner */}
        {currentUserRank && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible"
            className="bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl p-4 border border-indigo-200 dark:border-indigo-500/20 mb-6 flex items-center justify-between transition-colors"
          >
            <p className="text-indigo-600 dark:text-indigo-400 font-medium text-sm">
              🎯 You're ranked <span className="font-black text-lg">#{currentUserRank}</span> on the leaderboard!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/interview')}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition font-medium"
            >
              Improve rank →
            </motion.button>
          </motion.div>
        )}

        {/* Tab switcher */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="flex gap-2 mb-4"
        >
          {[
            { id: 'global', label: '🌍 Global' },
            { id: 'friends', label: '👥 Friends' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`text-sm px-5 py-2 rounded-xl transition font-medium ${
                tab === t.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </motion.div>

        {/* Time filter — global only */}
        {tab === 'global' && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible"
            className="flex gap-2 mb-4"
          >
            {[
              { value: 'alltime', label: 'All Time' },
              { value: 'weekly', label: 'This Week' },
            ].map(t => (
              <button
                key={t.value}
                onClick={() => setTimeFilter(t.value)}
                className={`text-xs px-4 py-1.5 rounded-xl transition ${
                  timeFilter === t.value
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold'
                    : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5'
                }`}
              >
                {t.label}
              </button>
            ))}
          </motion.div>
        )}

        {/* Type filters */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="flex items-center gap-2 mb-6 overflow-x-auto pb-1"
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
            className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/5 transition-colors"
          >
            <p className="text-5xl mb-4">🏆</p>
            <p className="text-gray-500 font-medium">
              {tab === 'friends' ? 'No friends on the leaderboard yet.' : 'No scores yet for this category.'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {tab === 'friends' ? 'Refer friends to see them here!' : 'Complete an interview to appear!'}
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push(tab === 'friends' ? '/referral' : '/dashboard')}
              className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-6 py-2.5 rounded-xl transition font-bold"
            >
              {tab === 'friends' ? 'Refer friends →' : 'Start an interview →'}
            </motion.button>
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
                  <span className={`text-2xl w-8 text-center font-black ${getRankColor(i)}`}>
                    {medals[i] || `#${i + 1}`}
                  </span>
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {item.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'}
                  </div>
                  <div>
                    <p className="font-bold">
                      {item.name || 'Anonymous'}
                      {item.userId === currentUserId && (
                        <span className="text-indigo-500 text-xs ml-2 font-normal">(You)</span>
                      )}
                    </p>
                    <p className="text-gray-400 text-xs">{item.interviews} interviews completed</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black text-indigo-500">{item.score}/10</p>
                  <p className="text-xs text-gray-400">best score</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Referral CTA for friends tab */}
        {tab === 'friends' && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible"
            className="mt-6 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl p-5 border border-indigo-200 dark:border-indigo-500/20 text-center transition-colors"
          >
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Compete with friends! Share your referral link to add them to your friends leaderboard.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/referral')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-6 py-2.5 rounded-xl transition font-bold"
            >
              🎁 Invite friends →
            </motion.button>
          </motion.div>
        )}

      </div>
    </main>
  )
}