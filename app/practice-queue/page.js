'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Queue } from '@/utils/queue'
import { motion, AnimatePresence } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}

export default function PracticeQueuePage() {
  const [queueItems, setQueueItems] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Keep a Queue instance in memory, synced with state for rendering
  const [queue] = useState(new Queue())

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      
      // Restore queue from sessionStorage if it exists
      const saved = sessionStorage.getItem('practiceQueue')
      if (saved) {
        const items = JSON.parse(saved)
        items.forEach(item => queue.enqueue(item))
        setQueueItems(queue.toArray())
      }
      
      setLoading(false)
    }
    checkUser()
  }, [])

  const interviewOptions = [
    { type: 'dsa', icon: '💻', label: 'DSA Interview', color: 'bg-indigo-900 text-indigo-300' },
    { type: 'behavioral', icon: '🧠', label: 'Behavioral Interview', color: 'bg-purple-900 text-purple-300' },
    { type: 'system_design', icon: '⚙️', label: 'System Design', color: 'bg-amber-900 text-amber-300' },
    { type: 'domain', icon: '🎯', label: 'Domain Specific', color: 'bg-green-900 text-green-300' },
  ]

  function addToQueue(option) {
    const item = {
      id: Date.now() + Math.random(),
      type: option.type,
      icon: option.icon,
      label: option.label,
      color: option.color
    }
    queue.enqueue(item)
    setQueueItems(queue.toArray())
  }

  function removeFromQueue(id) {
    queue.remove(id)
    setQueueItems(queue.toArray())
  }

  function startNext() {
    const next = queue.dequeue()
    if (!next) return
    setQueueItems(queue.toArray())
    
    // Save remaining queue to sessionStorage so it survives the redirect
    sessionStorage.setItem('practiceQueue', JSON.stringify(queue.toArray()))
    
    router.push(`/interview?type=${next.type}&fromQueue=true`)
  }

  function clearQueue() {
    queue.clear()
    setQueueItems([])
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

      <div className="max-w-2xl mx-auto px-6 py-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-black mb-2">Practice Queue 📋</h2>
          <p className="text-gray-400">
            Queue up multiple interviews and go through them in order — powered by a FIFO Queue.
          </p>
        </motion.div>

        {/* Add to queue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-900 rounded-2xl p-6 border border-white/5 mb-6"
        >
          <h3 className="text-sm font-bold text-gray-400 mb-4">Add to queue</h3>
          <div className="grid grid-cols-2 gap-3">
            {interviewOptions.map((option) => (
              <motion.button
                key={option.type}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => addToQueue(option)}
                className="flex items-center gap-3 bg-gray-800 hover:bg-gray-700 rounded-xl px-4 py-3 transition text-left"
              >
                <span className="text-xl">{option.icon}</span>
                <span className="text-sm font-medium">{option.label}</span>
                <span className="ml-auto text-indigo-400 text-lg">+</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Queue display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900 rounded-2xl p-6 border border-white/5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-400">
              Your queue ({queueItems.length})
            </h3>
            {queueItems.length > 0 && (
              <button
                onClick={clearQueue}
                className="text-xs text-red-400 hover:text-red-300 transition"
              >
                Clear all
              </button>
            )}
          </div>

          {queueItems.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-500 text-sm">Your queue is empty. Add interviews above.</p>
            </div>
          ) : (
            <div className="space-y-2 mb-5">
              <AnimatePresence>
                {queueItems.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500 text-xs font-mono w-6">
                        {i === 0 ? '👉' : `#${i + 1}`}
                      </span>
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-sm font-medium">{item.label}</span>
                      {i === 0 && (
                        <span className="text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                          Next
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromQueue(item.id)}
                      className="text-gray-500 hover:text-red-400 transition text-sm"
                    >
                      ✕
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          <motion.button
            whileHover={queueItems.length > 0 ? { scale: 1.02 } : {}}
            whileTap={queueItems.length > 0 ? { scale: 0.98 } : {}}
            onClick={startNext}
            disabled={queueItems.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {queueItems.length > 0
              ? `Start next: ${queueItems[0].label} →`
              : 'Queue is empty'}
          </motion.button>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-gray-600 text-xs">
            FIFO Queue: First interview added is the first one you'll take. Just like a real queue.
          </p>
        </motion.div>

      </div>
    </main>
  )
}