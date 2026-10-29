'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from '@/components/ThemeToggle'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const ALL_BADGES = [
  // Interview count badges
  { id: 'first_interview', icon: '🎯', name: 'First Step', desc: 'Complete your first interview', category: 'Milestone', check: (s, p) => s.length >= 1 },
  { id: 'five_interviews', icon: '🌟', name: 'Getting Serious', desc: 'Complete 5 interviews', category: 'Milestone', check: (s, p) => s.length >= 5 },
  { id: 'ten_interviews', icon: '💪', name: 'Dedicated', desc: 'Complete 10 interviews', category: 'Milestone', check: (s, p) => s.length >= 10 },
  { id: 'twenty_five_interviews', icon: '🏆', name: 'Interview Pro', desc: 'Complete 25 interviews', category: 'Milestone', check: (s, p) => s.length >= 25 },
  { id: 'fifty_interviews', icon: '👑', name: 'Legend', desc: 'Complete 50 interviews', category: 'Milestone', check: (s, p) => s.length >= 50 },

  // Score badges
  { id: 'score_six', icon: '⭐', name: 'Solid Start', desc: 'Score 6 or above in any interview', category: 'Performance', check: (s) => s.some(i => i.score >= 6) },
  { id: 'score_eight', icon: '🌠', name: 'High Achiever', desc: 'Score 8 or above in any interview', category: 'Performance', check: (s) => s.some(i => i.score >= 8) },
  { id: 'score_ten', icon: '💎', name: 'Perfect Score', desc: 'Score 10/10 in any interview', category: 'Performance', check: (s) => s.some(i => i.score >= 10) },
  { id: 'avg_seven', icon: '📈', name: 'Consistent', desc: 'Maintain 7+ average across 5 interviews', category: 'Performance', check: (s) => { const scored = s.filter(i => i.score); return scored.length >= 5 && scored.reduce((a, b) => a + b.score, 0) / scored.length >= 7 } },

  // Streak badges
  { id: 'streak_three', icon: '🔥', name: 'On Fire', desc: 'Maintain a 3-day streak', category: 'Streak', check: (s, p) => (p?.current_streak || 0) >= 3 },
  { id: 'streak_seven', icon: '⚡', name: 'Week Warrior', desc: 'Maintain a 7-day streak', category: 'Streak', check: (s, p) => (p?.current_streak || 0) >= 7 },
  { id: 'streak_thirty', icon: '🚀', name: 'Monthly Master', desc: 'Maintain a 30-day streak', category: 'Streak', check: (s, p) => (p?.current_streak || 0) >= 30 },

  // Type badges
  { id: 'dsa_master', icon: '💻', name: 'DSA Master', desc: 'Complete 5 DSA interviews', category: 'Specialty', check: (s) => s.filter(i => i.type === 'dsa').length >= 5 },
  { id: 'behavioral_pro', icon: '🧠', name: 'People Person', desc: 'Complete 5 behavioral interviews', category: 'Specialty', check: (s) => s.filter(i => i.type === 'behavioral').length >= 5 },
  { id: 'system_architect', icon: '⚙️', name: 'Architect', desc: 'Complete 5 system design interviews', category: 'Specialty', check: (s) => s.filter(i => i.type === 'system_design').length >= 5 },
  { id: 'all_rounder', icon: '🎭', name: 'All Rounder', desc: 'Complete all 4 interview types', category: 'Specialty', check: (s) => ['dsa', 'behavioral', 'system_design', 'domain'].every(t => s.some(i => i.type === t)) },

  // Special badges
  { id: 'referral_first', icon: '🎁', name: 'Ambassador', desc: 'Refer your first friend', category: 'Special', check: (s, p) => (p?.referral_count || 0) >= 1 },
  { id: 'pro_member', icon: '💜', name: 'Pro Member', desc: 'Upgrade to Pro plan', category: 'Special', check: (s, p) => p?.plan === 'pro' || p?.plan === 'premium' },
  { id: 'premium_member', icon: '👑', name: 'Premium Elite', desc: 'Upgrade to Premium plan', category: 'Special', check: (s, p) => p?.plan === 'premium' },
]

const CATEGORY_COLORS = {
  Milestone: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-500/20',
  Performance: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-500/20',
  Streak: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-500/20',
  Specialty: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-500/20',
  Special: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-500/20',
}

export default function BadgesPage() {
  const [profile, setProfile] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBadge, setSelectedBadge] = useState(null)
  const [filter, setFilter] = useState('all')
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      const { data: sessions } = await supabase.from('sessions').select('*').eq('user_id', user.id)
      setProfile(profile)
      setSessions(sessions || [])
      setLoading(false)
    }
    loadData()
  }, [])

  function isEarned(badge) {
    return badge.check(sessions, profile)
  }

  const earned = ALL_BADGES.filter(b => isEarned(b))
  const categories = ['all', 'Milestone', 'Performance', 'Streak', 'Specialty', 'Special']

  const filteredBadges = filter === 'all'
    ? ALL_BADGES
    : ALL_BADGES.filter(b => b.category === filter)

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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
          <h2 className="text-3xl font-black mb-2">Achievements 🏅</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Earn badges by practicing consistently and hitting milestones.
          </p>
        </motion.div>

        {/* Progress overview */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-white/5 mb-8 transition-colors"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Your Progress</h3>
            <span className="text-indigo-500 font-black">{earned.length}/{ALL_BADGES.length} earned</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(earned.length / ALL_BADGES.length) * 100}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="bg-indigo-600 h-3 rounded-full"
            />
          </div>
          <div className="flex gap-4 mt-4 overflow-x-auto pb-1">
            {['Milestone', 'Performance', 'Streak', 'Specialty', 'Special'].map(cat => {
              const catBadges = ALL_BADGES.filter(b => b.category === cat)
              const catEarned = catBadges.filter(b => isEarned(b))
              return (
                <div key={cat} className="text-center shrink-0">
                  <p className="text-sm font-bold">{catEarned.length}/{catBadges.length}</p>
                  <p className="text-xs text-gray-400">{cat}</p>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Filter tabs */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="flex gap-2 mb-6 overflow-x-auto pb-1"
        >
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-sm px-4 py-2 rounded-xl whitespace-nowrap transition font-medium capitalize ${
                filter === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Badges grid */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
        >
          {filteredBadges.map((badge, i) => {
            const earned = isEarned(badge)
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedBadge(badge)
                  if (isEarned(badge)) {
                    import('@/utils/confetti').then(({ fireStars }) => fireStars())
                  }
                }}
                className={`rounded-2xl p-4 border cursor-pointer text-center transition-all ${
                  earned
                    ? CATEGORY_COLORS[badge.category]
                    : 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-white/5 opacity-50 grayscale'
                }`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <p className="font-bold text-sm">{badge.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{badge.category}</p>
                {earned && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-2 text-xs text-green-500 font-bold"
                  >
                    ✓ Earned
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </motion.div>

        {/* Badge detail modal */}
        <AnimatePresence>
          {selectedBadge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
              onClick={() => setSelectedBadge(null)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-white/5 max-w-sm w-full text-center shadow-2xl"
              >
                <div className="text-6xl mb-4">{selectedBadge.icon}</div>
                <h3 className="text-2xl font-black mb-2">{selectedBadge.name}</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{selectedBadge.desc}</p>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  isEarned(selectedBadge)
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}>
                  {isEarned(selectedBadge) ? '✓ Earned' : '🔒 Not yet earned'}
                </span>
                <p className="text-xs text-gray-400 mt-4">{selectedBadge.category} badge</p>
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="mt-6 text-sm text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  )
}