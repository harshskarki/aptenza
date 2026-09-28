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

const GUIDE_OPTIONS = [
  { id: 'dsa', label: '💻 DSA Study Guide', desc: 'Arrays, linked lists, trees, dynamic programming', color: 'indigo' },
  { id: 'behavioral', label: '🧠 Behavioral Guide', desc: 'STAR method, common questions, anti-patterns', color: 'purple' },
  { id: 'system_design', label: '⚙️ System Design Guide', desc: 'Design framework, core concepts, database choices', color: 'amber' },
]

const colorMap = {
  indigo: 'border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-950/20',
  purple: 'border-purple-200 dark:border-purple-500/30 bg-purple-50 dark:bg-purple-950/20',
  amber: 'border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/20',
}

export default function StudyGuidePage() {
  const [profile, setProfile] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState([])
  const [generating, setGenerating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      const { data: sessions } = await supabase
        .from('sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setProfile(profile)
      setSessions(sessions || [])

      // Auto-select weak areas
      const weakAreas = []
      const types = ['dsa', 'behavioral', 'system_design']
      types.forEach(type => {
        const relevant = (sessions || []).filter(s => s.type === type && s.score)
        if (relevant.length > 0) {
          const avg = relevant.reduce((a, b) => a + b.score, 0) / relevant.length
          if (avg < 7.5) weakAreas.push(type)
        }
      })
      setSelected(weakAreas.length > 0 ? weakAreas : ['dsa'])
      setLoading(false)
    }
    loadData()
  }, [])

  function toggleSelection(id) {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  async function generateGuide() {
    if (selected.length === 0) {
      alert('Please select at least one topic.')
      return
    }
    setGenerating(true)
    try {
      const { generateStudyGuide } = await import('@/utils/generateStudyGuide')
      const doc = generateStudyGuide(selected, profile?.full_name || 'Student')
      doc.save(`aptenza-study-guide-${Date.now()}.pdf`)
    } catch (error) {
      console.error(error)
      alert('Failed to generate guide. Please try again.')
    }
    setGenerating(false)
  }

  function getWeakScore(type) {
    const relevant = sessions.filter(s => s.type === type && s.score)
    if (relevant.length === 0) return null
    return Math.round(relevant.reduce((a, b) => a + b.score, 0) / relevant.length)
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
          <button onClick={() => router.push('/deep-analytics')} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
            ← Deep Analytics
          </button>
        </div>
      </motion.nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center mb-8">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-3xl font-black mb-2">Study Guide Generator</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Get a personalized PDF study guide based on your weak areas. Styled with structured notes, key concepts, and tips.
          </p>
        </motion.div>

        {/* Auto-detected weak areas */}
        {sessions.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible"
            className="bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl p-4 border border-indigo-200 dark:border-indigo-500/20 mb-6 transition-colors"
          >
            <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">
              🎯 Based on your performance, we've auto-selected your weak areas. You can change the selection below.
            </p>
          </motion.div>
        )}

        {/* Topic selection */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-3 mb-8">
          <h3 className="text-lg font-bold mb-4">Select topics to include:</h3>
          {GUIDE_OPTIONS.map((option) => {
            const score = getWeakScore(option.id)
            const isSelected = selected.includes(option.id)
            return (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => toggleSelection(option.id)}
                className={`rounded-2xl p-5 border-2 cursor-pointer transition-all ${
                  isSelected
                    ? colorMap[option.color]
                    : 'border-gray-200 dark:border-white/5 bg-white dark:bg-gray-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                      isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {isSelected && <span className="text-white text-xs">✓</span>}
                    </div>
                    <div>
                      <p className="font-bold">{option.label}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{option.desc}</p>
                    </div>
                  </div>
                  {score !== null && (
                    <div className="text-right">
                      <p className={`text-lg font-black ${score < 6 ? 'text-red-500' : score < 8 ? 'text-yellow-500' : 'text-green-500'}`}>
                        {score}/10
                      </p>
                      <p className="text-xs text-gray-400">your avg</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Generate button */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
            whileTap={{ scale: 0.98 }}
            onClick={generateGuide}
            disabled={generating || selected.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl text-lg transition disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {generating ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                Generating your guide...
              </>
            ) : (
              <>📥 Download Study Guide PDF</>
            )}
          </motion.button>
          <p className="text-center text-gray-400 text-xs mt-3">
            {selected.length} topic{selected.length !== 1 ? 's' : ''} selected · Free to download
          </p>
        </motion.div>

        {/* What's inside */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-white/5 mt-8 transition-colors"
        >
          <h3 className="text-lg font-bold mb-4">What's inside the guide?</h3>
          <div className="space-y-3">
            {[
              { icon: '🎨', text: 'Styled cover page with your name and focus areas' },
              { icon: '📌', text: 'Key concepts and patterns for each topic' },
              { icon: '⚡', text: 'Time & space complexity references' },
              { icon: '🚫', text: 'Common mistakes and anti-patterns to avoid' },
              { icon: '🎯', text: 'Practice tips tailored to your weak areas' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </main>
  )
}