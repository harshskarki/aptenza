'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >

        {/* Logo */}
        <motion.div variants={fadeUp} className="text-center mb-8">
          <div
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 cursor-pointer mb-4"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm font-black">A</div>
            <span className="text-xl font-bold tracking-tight">Aptenza</span>
          </div>
          <h1 className="text-3xl font-black">Create your account</h1>
          <p className="text-gray-400 mt-2">Start your interview prep journey for free.</p>
        </motion.div>

        {/* Card */}
        <motion.div
          variants={fadeUp}
          className="bg-gray-900 rounded-2xl p-8 border border-white/5 shadow-2xl"
        >
          <form onSubmit={handleSignup} className="space-y-5">

            <motion.div variants={fadeUp}>
              <label className="text-sm text-gray-400 mb-1.5 block font-medium">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-indigo-500 transition placeholder-gray-600"
                placeholder="Harshvardhan"
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className="text-sm text-gray-400 mb-1.5 block font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-indigo-500 transition placeholder-gray-600"
                placeholder="you@example.com"
              />
            </motion.div>

            <motion.div variants={fadeUp}>
              <label className="text-sm text-gray-400 mb-1.5 block font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-white/5 focus:outline-none focus:border-indigo-500 transition placeholder-gray-600"
                placeholder="••••••••"
              />
              <p className="text-gray-600 text-xs mt-1.5">Minimum 6 characters</p>
            </motion.div>

            {error && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              variants={fadeUp}
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition disabled:opacity-50 text-base"
            >
              {loading ? 'Creating account...' : 'Create account →'}
            </motion.button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/5"></div>
            <span className="text-gray-600 text-xs">or</span>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>

          <p className="text-gray-500 text-sm text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition">
              Sign in
            </Link>
          </p>
        </motion.div>

        {/* Trust note */}
        <motion.p variants={fadeUp} className="text-center text-gray-600 text-xs mt-6">
          ✓ Free forever · ✓ No credit card · ✓ 3 interviews/month
        </motion.p>

      </motion.div>
    </main>
  )
}