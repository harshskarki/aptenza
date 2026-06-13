'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/10 dark:border-white/10 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:border-indigo-500 transition text-base"
      title="Toggle theme"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </motion.button>
  )
}