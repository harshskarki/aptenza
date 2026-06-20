'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Trie } from '@/utils/trie'
import { motion, AnimatePresence } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [allQuestions, setAllQuestions] = useState([])
  const [trie, setTrie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function loadQuestions() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: questions } = await supabase
        .from('questions')
        .select('*')

      const newTrie = new Trie()
      questions?.forEach(q => {
        newTrie.insert(q.title, q)
      })

      setTrie(newTrie)
      setAllQuestions(questions || [])
      setLoading(false)
    }
    loadQuestions()
  }, [])

  function handleSearch(value) {
    setQuery(value)
    setSelectedQuestion(null)

    if (!value.trim() || !trie) {
      setSuggestions([])
      return
    }

    const results = trie.autocomplete(value, 8)
    setSuggestions(results)
  }

  const typeColors = {
    dsa: 'bg-indigo-900 text-indigo-300',
    behavioral: 'bg-purple-900 text-purple-300',
    system_design: 'bg-amber-900 text-amber-300'
  }

  const difficultyColors = {
    easy: 'text-green-400',
    medium: 'text-yellow-400',
    hard: 'text-red-400'
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
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          ← Dashboard
        </button>
      </motion.nav>

      <div className="max-w-3xl mx-auto px-6 py-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-black mb-2">Question Bank 🔍</h2>
          <p className="text-gray-400">
            Search across {allQuestions.length} interview questions. Powered by a Trie for instant autocomplete.
          </p>
        </motion.div>

        {/* Search input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-6"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search questions... try 'two' or 'binary'"
            className="w-full bg-gray-900 text-white rounded-2xl px-5 py-4 border border-white/5 focus:outline-none focus:border-indigo-500 transition text-base"
          />
          <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600">⌘K</span>
        </motion.div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {suggestions.length > 0 && !selectedQuestion && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-gray-900 rounded-2xl border border-white/5 overflow-hidden mb-6"
            >
              {suggestions.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(99,102,241,0.1)' }}
                  onClick={() => setSelectedQuestion(s.data)}
                  className="px-5 py-4 cursor-pointer border-b border-white/5 last:border-0 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{s.data.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{s.data.body}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${typeColors[s.data.type] || 'bg-gray-800 text-gray-400'}`}>
                      {s.data.type}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected question detail */}
        <AnimatePresence>
          {selectedQuestion && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 rounded-2xl p-6 border border-indigo-500/30 mb-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs px-2 py-1 rounded-full ${typeColors[selectedQuestion.type] || 'bg-gray-800 text-gray-400'}`}>
                  {selectedQuestion.type}
                </span>
                <span className={`text-xs font-medium ${difficultyColors[selectedQuestion.difficulty]}`}>
                  {selectedQuestion.difficulty}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">{selectedQuestion.title}</h3>
              <p className="text-gray-400 mb-4">{selectedQuestion.body}</p>
              <div className="flex items-center gap-2 mb-5">
                {selectedQuestion.tags?.map((tag, i) => (
                  <span key={i} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
              <button
                onClick={() => router.push(`/interview?type=${selectedQuestion.type}`)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition"
              >
                Practice this in interview →
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!query && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center py-16"
          >
            <p className="text-5xl mb-4">🔎</p>
            <p className="text-gray-500">Start typing to search the question bank</p>
          </motion.div>
        )}

      </div>
    </main>
  )
}