'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}

const BEHAVIORAL_QUESTIONS = [
  'Tell me about a time you disagreed with a teammate.',
  'Describe a time you failed at something.',
  'Tell me about a time you had to convince someone.',
  'Describe a situation with limited resources or tight deadlines.',
  'Tell me about a time you received tough feedback.',
  'Describe a time you showed leadership.',
  'Tell me about a project you are most proud of.',
  'Describe a time you handled a conflict at work.',
  'Tell me about a time you went above and beyond.',
  'Describe a situation where you had to learn something quickly.',
]

const STAR_FIELDS = [
  {
    key: 'situation',
    label: 'S — Situation',
    color: 'indigo',
    icon: '🌍',
    placeholder: 'Set the scene. Where were you? What was the context? What was happening at the time?',
    tip: 'Keep it brief — 2-3 sentences. Just enough context for the interviewer to understand the setting.'
  },
  {
    key: 'task',
    label: 'T — Task',
    color: 'purple',
    icon: '🎯',
    placeholder: 'What was YOUR specific responsibility or challenge? What were you asked to do?',
    tip: 'Focus on YOUR role, not the team\'s. Use "I" not "we" here.'
  },
  {
    key: 'action',
    label: 'A — Action',
    color: 'amber',
    icon: '⚡',
    placeholder: 'What specific steps did YOU take? What decisions did you make? How did you approach it?',
    tip: 'This is the most important part. Be specific about what YOU did, not what happened.'
  },
  {
    key: 'result',
    label: 'R — Result',
    color: 'green',
    icon: '🏆',
    placeholder: 'What was the outcome? What did you achieve? Can you quantify it? What did you learn?',
    tip: 'Quantify wherever possible — "reduced by 30%", "saved 2 hours per week", "team grew by 3 people".'
  }
]

const colorMap = {
  indigo: {
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-950/30',
    label: 'text-indigo-400',
    tip: 'bg-indigo-950/50 border-indigo-500/20',
    focus: 'focus:border-indigo-500'
  },
  purple: {
    border: 'border-purple-500/30',
    bg: 'bg-purple-950/30',
    label: 'text-purple-400',
    tip: 'bg-purple-950/50 border-purple-500/20',
    focus: 'focus:border-purple-500'
  },
  amber: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-950/30',
    label: 'text-amber-400',
    tip: 'bg-amber-950/50 border-amber-500/20',
    focus: 'focus:border-amber-500'
  },
  green: {
    border: 'border-green-500/30',
    bg: 'bg-green-950/30',
    label: 'text-green-400',
    tip: 'bg-green-950/50 border-green-500/20',
    focus: 'focus:border-green-500'
  }
}

export default function StarPage() {
  const [selectedQuestion, setSelectedQuestion] = useState(BEHAVIORAL_QUESTIONS[0])
  const [customQuestion, setCustomQuestion] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [answers, setAnswers] = useState({ situation: '', task: '', action: '', result: '' })
  const [savedAnswers, setSavedAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [activeTip, setActiveTip] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      // Load saved answers from localStorage
      const saved = localStorage.getItem(`star_answers_${user.id}`)
      if (saved) setSavedAnswers(JSON.parse(saved))
      setLoading(false)
    }
    checkUser()
  }, [])

  function getWordCount(text) {
    return text.trim().split(/\s+/).filter(Boolean).length
  }

  function getTotalWordCount() {
    return Object.values(answers).reduce((total, val) => total + getWordCount(val), 0)
  }

  function getCompletionPercent() {
    const filled = Object.values(answers).filter(v => v.trim().length > 20).length
    return Math.round((filled / 4) * 100)
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const entry = {
      id: Date.now(),
      question: useCustom ? customQuestion : selectedQuestion,
      answers,
      savedAt: new Date().toISOString()
    }

    const updated = [entry, ...savedAnswers].slice(0, 10) // Keep last 10
    setSavedAnswers(updated)
    localStorage.setItem(`star_answers_${user.id}`, JSON.stringify(updated))

    setSaveMessage('✅ Saved!')
    setSaving(false)
    setTimeout(() => setSaveMessage(''), 2000)
  }

  function handleLoad(entry) {
    setAnswers(entry.answers)
    if (BEHAVIORAL_QUESTIONS.includes(entry.question)) {
      setSelectedQuestion(entry.question)
      setUseCustom(false)
    } else {
      setCustomQuestion(entry.question)
      setUseCustom(true)
    }
    setShowPreview(false)
  }

  function handleClear() {
    setAnswers({ situation: '', task: '', action: '', result: '' })
    setShowPreview(false)
    setSaveMessage('')
  }

  function generateFullAnswer() {
    const q = useCustom ? customQuestion : selectedQuestion
    return `**Question:** ${q}\n\n**Situation:** ${answers.situation}\n\n**Task:** ${answers.task}\n\n**Action:** ${answers.action}\n\n**Result:** ${answers.result}`
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
        className="border-b border-white/5 px-6 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-black">A</div>
          <span className="text-lg font-bold">Aptenza</span>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg transition"
          >
            {showPreview ? 'Edit mode' : '👁️ Preview answer'}
          </motion.button>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            ← Dashboard
          </button>
        </div>
      </motion.nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-black">STAR Method Builder 🌟</h2>
          </motion.div>
          <motion.p variants={fadeUp} className="text-gray-400">
            Structure your behavioral answers using Situation → Task → Action → Result.
          </motion.p>

          {/* Progress */}
          <motion.div variants={fadeUp} className="mt-4 flex items-center gap-4">
            <div className="flex-1 bg-gray-800 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getCompletionPercent()}%` }}
                transition={{ duration: 0.5 }}
                className="bg-indigo-600 h-2 rounded-full"
              />
            </div>
            <span className="text-sm text-gray-400">{getCompletionPercent()}% complete</span>
            <span className="text-sm text-gray-500">{getTotalWordCount()} words</span>
          </motion.div>
        </motion.div>

        {/* Question selector */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-gray-900 rounded-2xl p-6 border border-white/5 mb-6"
        >
          <h3 className="text-sm font-bold text-gray-400 mb-4">Select a question</h3>

          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setUseCustom(false)}
              className={`text-xs px-3 py-1.5 rounded-lg transition ${!useCustom ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              Common questions
            </button>
            <button
              onClick={() => setUseCustom(true)}
              className={`text-xs px-3 py-1.5 rounded-lg transition ${useCustom ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              Custom question
            </button>
          </div>

          {useCustom ? (
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="Type your own behavioral question..."
              className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-indigo-500 transition text-sm"
            />
          ) : (
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
              {BEHAVIORAL_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedQuestion(q)}
                  className={`text-left text-sm px-4 py-3 rounded-xl transition ${
                    selectedQuestion === q
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl">
            <p className="text-indigo-300 text-sm font-medium">
              📝 {useCustom ? customQuestion || 'Enter your question above' : selectedQuestion}
            </p>
          </div>
        </motion.div>

        {/* STAR fields or Preview */}
        <AnimatePresence mode="wait">
          {showPreview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gray-900 rounded-2xl p-6 border border-white/5 mb-6"
            >
              <h3 className="text-lg font-bold mb-4">Your full answer</h3>
              {Object.values(answers).some(v => v.trim()) ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800 rounded-xl">
                    <p className="text-indigo-300 text-sm font-bold mb-2">Question</p>
                    <p className="text-white text-sm">{useCustom ? customQuestion : selectedQuestion}</p>
                  </div>
                  {STAR_FIELDS.map((field) => (
                    answers[field.key].trim() && (
                      <div key={field.key} className={`p-4 rounded-xl border ${colorMap[field.color].bg} ${colorMap[field.color].border}`}>
                        <p className={`text-sm font-bold mb-2 ${colorMap[field.color].label}`}>{field.label}</p>
                        <p className="text-gray-200 text-sm leading-relaxed">{answers[field.key]}</p>
                      </div>
                    )
                  ))}
                  <div className="flex items-center gap-3 pt-2">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        navigator.clipboard.writeText(generateFullAnswer())
                        setSaveMessage('✅ Copied to clipboard!')
                        setTimeout(() => setSaveMessage(''), 2000)
                      }}
                      className="text-sm bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-xl transition"
                    >
                      📋 Copy answer
                    </motion.button>
                    {saveMessage && <span className="text-green-400 text-sm">{saveMessage}</span>}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No answer written yet. Go back to edit mode and fill in the STAR fields.</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 mb-6"
            >
              {STAR_FIELDS.map((field, i) => (
                <motion.div
                  key={field.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-2xl p-6 border ${colorMap[field.color].bg} ${colorMap[field.color].border}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{field.icon}</span>
                      <h3 className={`font-bold ${colorMap[field.color].label}`}>{field.label}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{getWordCount(answers[field.key])} words</span>
                      <button
                        onClick={() => setActiveTip(activeTip === field.key ? null : field.key)}
                        className="text-xs text-gray-500 hover:text-white transition px-2 py-0.5 rounded-lg border border-white/5"
                      >
                        💡 tip
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {activeTip === field.key && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className={`mb-3 p-3 rounded-xl border text-xs text-gray-300 leading-relaxed ${colorMap[field.color].tip}`}
                      >
                        💡 {field.tip}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <textarea
                    value={answers[field.key]}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    rows={4}
                    className={`w-full bg-gray-900/80 text-white rounded-xl px-4 py-3 border border-white/5 ${colorMap[field.color].focus} focus:outline-none transition text-sm leading-relaxed placeholder-gray-600 resize-none`}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-3 mb-10"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : '💾 Save answer'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleClear}
            className="border border-gray-700 hover:border-red-500/50 text-gray-400 hover:text-red-400 px-6 py-2.5 rounded-xl text-sm transition"
          >
            Clear
          </motion.button>
          {saveMessage && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-400 text-sm"
            >
              {saveMessage}
            </motion.span>
          )}
        </motion.div>

        {/* Saved answers */}
        {savedAnswers.length > 0 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-gray-900 rounded-2xl p-6 border border-white/5"
          >
            <h3 className="text-lg font-bold mb-4">Saved answers ({savedAnswers.length})</h3>
            <div className="space-y-2">
              {savedAnswers.map((entry) => (
                <motion.div
                  key={entry.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => handleLoad(entry)}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-700 transition"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{entry.question}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(entry.savedAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className="text-xs text-indigo-400">Load →</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </main>
  )
}