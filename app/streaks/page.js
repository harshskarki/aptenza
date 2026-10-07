'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'
import ThemeToggle from '@/components/ThemeToggle'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

function generateHeatmapData(sessions) {
  const today = new Date()
  const days = []

  // Generate last 52 weeks (364 days)
  for (let i = 363; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const count = sessions.filter(s => {
      const sessionDate = new Date(s.created_at).toISOString().split('T')[0]
      return sessionDate === dateStr
    }).length

    days.push({ date: dateStr, count, day: date.getDay() })
  }

  return days
}

function getHeatmapColor(count, isDark) {
  if (count === 0) return isDark ? '#1f2937' : '#f3f4f6'
  if (count === 1) return '#818cf8'
  if (count === 2) return '#6366f1'
  if (count >= 3) return '#4338ca'
  return isDark ? '#1f2937' : '#f3f4f6'
}

function calculateStreak(sessions) {
  if (sessions.length === 0) return { current: 0, longest: 0 }

  const dates = [...new Set(sessions.map(s =>
    new Date(s.created_at).toISOString().split('T')[0]
  ))].sort().reverse()

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  let current = 0
  if (dates[0] === today || dates[0] === yesterday) {
    let checkDate = new Date(dates[0])
    for (const date of dates) {
      const d = new Date(date)
      const diff = Math.round((checkDate - d) / 86400000)
      if (diff === 0 || diff === 1) {
        current++
        checkDate = d
      } else break
    }
  }

  let longest = 0
  let tempStreak = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diff = Math.round((prev - curr) / 86400000)
    if (diff === 1) {
      tempStreak++
      longest = Math.max(longest, tempStreak)
    } else {
      tempStreak = 1
    }
  }
  longest = Math.max(longest, current)

  return { current, longest }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function StreaksPage() {
  const [profile, setProfile] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDark, setIsDark] = useState(true)
  const [tooltip, setTooltip] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
      const { data: sessions } = await supabase
        .from('sessions').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setProfile(profile)
      setSessions(sessions || [])

      // Update streak in DB
      const { current, longest } = calculateStreak(sessions || [])
      await supabase.from('profiles').update({
        current_streak: current,
        longest_streak: Math.max(longest, profile?.longest_streak || 0),
        last_practice_date: sessions?.[0]
          ? new Date(sessions[0].created_at).toISOString().split('T')[0]
          : null
      }).eq('id', user.id)

      setIsDark(document.documentElement.classList.contains('dark'))
      setLoading(false)
    }
    loadData()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full" />
      </main>
    )
  }

  const heatmapData = generateHeatmapData(sessions)
  const { current, longest } = calculateStreak(sessions)
  const totalDays = new Set(sessions.map(s => new Date(s.created_at).toISOString().split('T')[0])).size

  // Group by weeks for heatmap
  const weeks = []
  let week = []
  heatmapData.forEach((day, i) => {
    week.push(day)
    if (week.length === 7 || i === heatmapData.length - 1) {
      weeks.push(week)
      week = []
    }
  })

  // Get month labels
  const monthLabels = []
  weeks.forEach((week, wi) => {
    const firstDay = new Date(week[0].date)
    if (firstDay.getDate() <= 7) {
      monthLabels.push({ index: wi, label: MONTHS[firstDay.getMonth()] })
    }
  })

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
          <h2 className="text-3xl font-black mb-2">Practice Streaks 🔥</h2>
          <p className="text-gray-500 dark:text-gray-400">Track your daily practice consistency — just like GitHub contributions.</p>
        </motion.div>

        {/* Streak stats */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          {[
            { label: 'Current Streak', value: `${current} days`, icon: '🔥', color: current > 0 ? 'text-orange-500' : 'text-gray-400' },
            { label: 'Longest Streak', value: `${longest} days`, icon: '⚡', color: 'text-indigo-500' },
            { label: 'Total Active Days', value: `${totalDays} days`, icon: '📅', color: 'text-green-500' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-white/5 transition-colors text-center"
            >
              <p className="text-3xl mb-2">{stat.icon}</p>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Heatmap */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-white/5 mb-8 transition-colors"
        >
          <h3 className="text-lg font-bold mb-6">Activity Heatmap</h3>

          {/* Month labels */}
          <div className="flex gap-1 mb-1 ml-8 overflow-x-auto">
            {weeks.map((_, wi) => {
              const label = monthLabels.find(m => m.index === wi)
              return (
                <div key={wi} className="text-xs text-gray-400 w-3 shrink-0">
                  {label ? label.label : ''}
                </div>
              )
            })}
          </div>

          <div className="flex gap-1 overflow-x-auto pb-2">
            {/* Day labels */}
            <div className="flex flex-col gap-1 mr-1 shrink-0">
              {DAYS.map((day, i) => (
                <div key={day} className="text-xs text-gray-400 h-3 flex items-center">
                  {i % 2 === 1 ? day.slice(0, 1) : ''}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1 shrink-0">
                {week.map((day, di) => (
                  <div
                    key={di}
                    className="w-3 h-3 rounded-sm cursor-pointer transition-transform hover:scale-125 relative"
                    style={{ backgroundColor: getHeatmapColor(day.count, isDark) }}
                    onMouseEnter={() => setTooltip({ date: day.date, count: day.count })}
                    onMouseLeave={() => setTooltip(null)}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Tooltip */}
          {tooltip && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-xs text-gray-500 dark:text-gray-400"
            >
              {tooltip.date}: {tooltip.count === 0 ? 'No practice' : `${tooltip.count} interview${tooltip.count > 1 ? 's' : ''}`}
            </motion.div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs text-gray-400">Less</span>
            {[0, 1, 2, 3].map(count => (
              <div
                key={count}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: getHeatmapColor(count, isDark) }}
              />
            ))}
            <span className="text-xs text-gray-400">More</span>
          </div>
        </motion.div>

        {/* Motivation */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className={`rounded-2xl p-6 border transition-colors ${
            current >= 7
              ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-500/30'
              : current >= 3
              ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-500/30'
              : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-white/5'
          }`}
        >
          <h3 className="text-lg font-bold mb-2">
            {current >= 7 ? '🔥 You\'re on fire!' :
             current >= 3 ? '⚡ Keep it up!' :
             current >= 1 ? '🌱 Great start!' :
             '💪 Start your streak today!'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {current >= 7
              ? `${current} day streak! Consistency is your superpower. Keep going!`
              : current >= 3
              ? `${current} days in a row! You're building a great habit.`
              : current >= 1
              ? 'Practice daily to build your streak. Even one interview a day makes a difference!'
              : 'Complete at least one interview today to start your streak. Small steps, big results!'}
          </p>
          {current === 0 && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/dashboard')}
              className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition"
            >
              Practice now →
            </motion.button>
          )}
        </motion.div>

      </div>
    </main>
  )
}