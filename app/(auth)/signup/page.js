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
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4 relative overflow-hidden">

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >

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

        <motion.div
          variants={fadeUp}
          className="bg-gray-900 rounded-2xl p-8 border border-white/5 shadow-2xl"
        >

          {/* Google button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 rounded-xl transition mb-6 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
              <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
            </svg>
            {googleLoading ? 'Redirecting...' : 'Continue with Google'}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/5"></div>
            <span className="text-gray-600 text-xs">or sign up with email</span>
            <div className="flex-1 h-px bg-white/5"></div>
          </div>

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

        <motion.p variants={fadeUp} className="text-center text-gray-600 text-xs mt-6">
          ✓ Free forever · ✓ No credit card · ✓ 3 interviews/month
        </motion.p>

      </motion.div>
    </main>
  )
}