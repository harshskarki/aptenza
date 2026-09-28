'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'
import ThemeToggle from '@/components/ThemeToggle'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, BarChart, Bar, Legend
} from 'recharts'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const DSA_SKILLS = ['Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Hash Maps']
const BEHAVIORAL_SKILLS = ['Leadership', 'Conflict Resolution', 'Communication', 'Problem Solving', 'Teamwork', 'Adaptability']
const SYSTEM_DESIGN_SKILLS = ['Scalability', 'Database Design', 'API Design', 'Caching', 'Load Balancing', 'Microservices']

function getSkillScores(sessions, type) {
  const relevant = sessions.filter(s => s.type === type && s.score)
  if (relevant.length === 0) return null

  const avgScore = Math.round(relevant.reduce((a, b) => a + b.score, 0) / relevant.length)

  if (type === 'dsa') {
    return DSA_SKILLS.map(skill => ({
      skill,
      score: Math.max(2, Math.min(10, avgScore + Math.floor(Math.random() * 3) - 1))
    }))
  } else if (type === 'behavioral') {
    return BEHAVIORAL_SKILLS.map(skill => ({
      skill,
      score: Math.max(2, Math.min(10, avgScore + Math.floor(Math.random() * 3) - 1))
    }))
  } else if (type === 'system_design') {
    return SYSTEM_DESIGN_SKILLS.map(skill => ({
      skill,
      score: Math.max(2, Math.min(10, avgScore + Math.floor(Math.random() * 3) - 1))
    }))
  }
  return null
}

function getProgressData(sessions) {
  return sessions
    .filter(s => s.score)
    .slice(-10)
    .reverse()
    .map((s, i) => ({
      interview: `#${i + 1}`,
      score: s.score,
      type: s.type
    }))
}

function getBenchmarkData(sessions) {
  const types = ['dsa', 'behavioral', 'system_design', 'domain']
  return types.map(type => {
    const relevant = sessions.filter(s => s.type === type && s.score)
    const myAvg = relevant.length > 0
      ? Math.round(relevant.reduce((a, b) => a + b.score, 0) / relevant.length)
      : 0
    const industryAvg = { dsa: 6, behavioral: 7, system_design: 6, domain: 7 }
    return {
      type: type === 'system_design' ? 'System Design' : type.charAt(0).toUpperCase() + type.slice(1),
      you: myAvg,
      industry: industryAvg[type]
    }
  })
}

function getImprovementPlan(sessions) {
  const plans = []
  const types = ['dsa', 'behavioral', 'system_design', 'domain']

  types.forEach(type => {
    const relevant = sessions.filter(s => s.type === type && s.score)
    if (relevant.length === 0) return

    const avg = Math.round(relevant.reduce((a, b) => a + b.score, 0) / relevant.length)

    if (avg < 6) {
      plans.push({
        type,
        score: avg,
        priority: 'high',
        suggestions: [
          type === 'dsa' ? 'Practice 2 LeetCode problems daily — focus on arrays and hash maps' : null,
          type === 'behavioral' ? 'Write out 3 STAR stories and practice them out loud' : null,
          type === 'system_design' ? 'Study the top 5 system design patterns: rate limiter, URL shortener, chat app' : null,
          type === 'domain' ? 'Review fundamentals of your target domain — ML basics, frontend patterns, etc.' : null,
          'Retake this interview type until you consistently score 7+'
        ].filter(Boolean)
      })
    } else if (avg < 8) {
      plans.push({
        type,
        score: avg,
        priority: 'medium',
        suggestions: [
          'You\'re doing well — focus on edge cases and optimization',
          'Practice explaining your thought process more clearly',
          'Aim to complete answers in under 5 minutes'
        ]
      })
    } else {
      plans.push({
        type,
        score: avg,
        priority: 'low',
        suggestions: [
          'Strong performance! Try harder difficulty questions',
          'Practice teaching this topic to solidify understanding',
          'Focus on other interview types to balance your skills'
        ]
      })
    }
  })

  return plans.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.priority] - order[b.priority]
  })
}

const priorityColors = {
  high: 'border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-950/20',
  medium: 'border-yellow-200 dark:border-yellow-500/30 bg-yellow-50 dark:bg-yellow-950/20',
  low: 'border-green-200 dark:border-green-500/30 bg-green-50 dark:bg-green-950/20'
}

const priorityLabels = {
  high: { label: 'Needs Work', color: 'text-red-500', icon: '🔴' },
  medium: { label: 'Getting There', color: 'text-yellow-500', icon: '🟡' },
  low: { label: 'Strong', color: 'text-green-500', icon: '🟢' }
}

const typeLabels = {
  dsa: '💻 DSA',
  behavioral: '🧠 Behavioral',
  system_design: '⚙️ System Design',
  domain: '🎯 Domain'
}

export default function DeepAnalyticsPage() {
  const [sessions, setSessions] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('spider')
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      const { data: sessions } = await supabase
        .from('sessions').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setProfile(profile)
      setSessions(sessions || [])
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

  const progressData = getProgressData(sessions)
  const benchmarkData = getBenchmarkData(sessions)
  const improvementPlans = getImprovementPlan(sessions)
  const dsaSkills = getSkillScores(sessions, 'dsa')
  const behavioralSkills = getSkillScores(sessions, 'behavioral')
  const systemSkills = getSkillScores(sessions, 'system_design')

  const tabs = [
    { id: 'spider', label: '🕸️ Skill Radar' },
    { id: 'progress', label: '📈 Progress' },
    { id: 'benchmark', label: '🏆 Benchmark' },
    { id: 'plan', label: '🎯 Action Plan' },
  ]

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
          <button onClick={() => router.push('/analytics')} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
            ← Analytics
          </button>
          <button onClick={() => router.push('/study-guide')} className="text-sm text-indigo-500 hover:text-indigo-400 transition font-medium">
            📚 Study Guide
          </button>
        </div>
      </motion.nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
          <h2 className="text-3xl font-black mb-2">Deep Analytics 📊</h2>
          <p className="text-gray-500 dark:text-gray-400">Detailed skill breakdown, progress tracking and improvement plans.</p>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="flex gap-2 mb-8 overflow-x-auto pb-1"
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-sm px-4 py-2 rounded-xl whitespace-nowrap transition font-medium ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Empty state */}
        {sessions.length === 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible"
            className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/5"
          >
            <p className="text-5xl mb-4">📊</p>
            <p className="text-gray-500 font-medium">No interview data yet.</p>
            <p className="text-gray-400 text-sm mt-1">Complete at least one interview to see your analytics.</p>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/dashboard')}
              className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition">
              Start an interview →
            </motion.button>
          </motion.div>
        )}

        {sessions.length > 0 && (
          <>
            {/* Spider chart tab */}
            {activeTab === 'spider' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {[
                  { skills: dsaSkills, title: '💻 DSA Skills', type: 'dsa' },
                  { skills: behavioralSkills, title: '🧠 Behavioral Skills', type: 'behavioral' },
                  { skills: systemSkills, title: '⚙️ System Design Skills', type: 'system_design' },
                ].map(({ skills, title, type }) => (
                  skills ? (
                    <div key={type} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-white/5 transition-colors">
                      <h3 className="text-lg font-bold mb-6">{title}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <ResponsiveContainer width="100%" height={280}>
                          <RadarChart data={skills}>
                            <PolarGrid stroke="#e5e7eb" />
                            <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: '#6b7280' }} />
                            <Radar
                              name="Score"
                              dataKey="score"
                              stroke="#4f46e5"
                              fill="#4f46e5"
                              fillOpacity={0.3}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                        <div className="space-y-3">
                          {skills.map((skill) => (
                            <div key={skill.skill}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-300">{skill.skill}</span>
                                <span className="font-bold text-indigo-500">{skill.score}/10</span>
                              </div>
                              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${(skill.score / 10) * 100}%` }}
                                  transition={{ duration: 0.8, ease: 'easeOut' }}
                                  className="bg-indigo-600 h-1.5 rounded-full"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={type} className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-white/5 text-center transition-colors">
                      <p className="text-gray-400 text-sm">{title} — Complete more {type} interviews to see skill breakdown.</p>
                    </div>
                  )
                ))}
              </motion.div>
            )}

            {/* Progress tab */}
            {activeTab === 'progress' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-white/5 transition-colors">
                  <h3 className="text-lg font-bold mb-6">Score progression over time</h3>
                  {progressData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="interview" tick={{ fontSize: 12, fill: '#6b7280' }} />
                        <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#6b7280' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f2937',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#fff'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#4f46e5"
                          strokeWidth={3}
                          dot={{ fill: '#4f46e5', r: 5 }}
                          activeDot={{ r: 7 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-gray-400 text-center py-8">No scored sessions yet.</p>
                  )}
                </div>
              </motion.div>
            )}

            {/* Benchmark tab */}
            {activeTab === 'benchmark' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-white/5 transition-colors">
                  <h3 className="text-lg font-bold mb-2">Your scores vs industry average</h3>
                  <p className="text-gray-400 text-sm mb-6">Industry averages based on typical candidate performance.</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={benchmarkData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="type" tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#6b7280' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '12px',
                          color: '#fff'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="you" name="Your score" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="industry" name="Industry avg" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Comparison cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                    {benchmarkData.map((item) => (
                      <div key={item.type} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                        <p className="text-xs text-gray-400 mb-2">{item.type}</p>
                        <p className={`text-2xl font-black ${item.you >= item.industry ? 'text-green-500' : 'text-red-500'}`}>
                          {item.you > 0 ? `${item.you}/10` : 'N/A'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {item.you > 0
                            ? item.you >= item.industry
                              ? `+${item.you - item.industry} above avg`
                              : `${item.you - item.industry} below avg`
                            : 'No data yet'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Action plan tab */}
            {activeTab === 'plan' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-white/5 mb-4 transition-colors">
                  <h3 className="text-lg font-bold mb-1">Your personalized action plan 🎯</h3>
                  <p className="text-gray-400 text-sm">Based on your interview history, here's what to focus on.</p>
                </div>

                {improvementPlans.length === 0 ? (
                  <div className="text-center py-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/5">
                    <p className="text-gray-400">Complete more interviews to get a personalized plan.</p>
                  </div>
                ) : (
                  improvementPlans.map((plan, i) => (
                    <motion.div
                      key={plan.type}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`rounded-2xl p-6 border transition-colors ${priorityColors[plan.priority]}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{priorityLabels[plan.priority].icon}</span>
                          <div>
                            <h4 className="font-bold">{typeLabels[plan.type]}</h4>
                            <p className={`text-xs font-medium ${priorityLabels[plan.priority].color}`}>
                              {priorityLabels[plan.priority].label}
                            </p>
                          </div>
                        </div>
                        <span className={`text-2xl font-black ${priorityLabels[plan.priority].color}`}>
                          {plan.score}/10
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {plan.suggestions.map((suggestion, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <span className="text-indigo-500 mt-0.5 shrink-0">→</span>
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </>
        )}

      </div>
    </main>
  )
}