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

export default function PromoPage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [promoInput, setPromoInput] = useState('')
  const [applying, setApplying] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(profile)
      setLoading(false)
    }
    loadProfile()
  }, [])

  async function applyPromo() {
    if (!promoInput.trim()) return
    setApplying(true)
    setMessage('')
    setSuccess(false)

    const supabase = createClient()

    // Check if user already used a promo
    if (profile?.promo_used) {
      setMessage('❌ You have already used a promo code.')
      setApplying(false)
      return
    }

    // Find the promo code
    const { data: promo } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoInput.toUpperCase())
      .eq('is_active', true)
      .single()

    if (!promo) {
      setMessage('❌ Invalid or expired promo code.')
      setApplying(false)
      return
    }

    // Check if promo has uses left
    if (promo.uses_count >= promo.max_uses) {
      setMessage('❌ This promo code has expired.')
      setApplying(false)
      return
    }

    // Check expiry
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      setMessage('❌ This promo code has expired.')
      setApplying(false)
      return
    }

    // Apply the promo
    if (promo.discount_type === 'bonus_interviews') {
      const bonus = parseInt(promo.discount_value)
      await supabase
        .from('profiles')
        .update({
          bonus_interviews: (profile?.bonus_interviews || 0) + bonus,
          promo_used: promo.code
        })
        .eq('id', profile.id)

      setProfile(prev => ({
        ...prev,
        bonus_interviews: (prev?.bonus_interviews || 0) + bonus,
        promo_used: promo.code
      }))

      setMessage(`✅ Promo applied! You got ${bonus} bonus interviews added to your account.`)
      setSuccess(true)
    } else if (promo.discount_type === 'plan_upgrade') {
      await supabase
        .from('profiles')
        .update({
          plan: promo.discount_value,
          promo_used: promo.code
        })
        .eq('id', profile.id)

      setProfile(prev => ({
        ...prev,
        plan: promo.discount_value,
        promo_used: promo.code
      }))

      setMessage(`✅ Promo applied! Your plan has been upgraded to ${promo.discount_value.toUpperCase()}.`)
      setSuccess(true)
    }

    // Increment promo uses
    await supabase
      .from('promo_codes')
      .update({ uses_count: promo.uses_count + 1 })
      .eq('id', promo.id)

    setApplying(false)
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
          <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
            ← Dashboard
          </button>
        </div>
      </motion.nav>

      <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center mb-8">
          <div className="text-5xl mb-4">🎟️</div>
          <h2 className="text-3xl font-black mb-2">Promo Code</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Have a promo code? Apply it here to get bonus interviews or upgrade your plan.
          </p>
        </motion.div>

        {/* Current status */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-white/5 mb-6 transition-colors"
        >
          <h3 className="text-sm font-bold text-gray-400 mb-4">Your current status</h3>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Current plan', value: profile?.plan || 'Free', icon: '⭐' },
              { label: 'Bonus interviews', value: profile?.bonus_interviews || 0, icon: '🎯' },
              { label: 'Promo used', value: profile?.promo_used || 'None', icon: '🎟️' },
            ].map((stat, i) => (
              <div key={i} className="text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-xl mb-1">{stat.icon}</p>
                <p className="font-black text-sm capitalize">{stat.value}</p>
                <p className="text-gray-400 text-xs mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Promo input */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-white/5 mb-6 transition-colors"
        >
          {profile?.promo_used ? (
            <div className="text-center py-4">
              <p className="text-4xl mb-3">✅</p>
              <p className="font-bold text-green-500">Promo code already used</p>
              <p className="text-gray-400 text-sm mt-1">You used: <span className="font-mono font-bold">{profile.promo_used}</span></p>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-bold mb-1">Apply promo code</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
                Each account can use one promo code.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME10"
                  className="flex-1 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 border border-gray-200 dark:border-white/5 focus:outline-none focus:border-indigo-500 transition text-sm placeholder-gray-400 uppercase tracking-widest font-mono"
                  maxLength={20}
                  onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={applyPromo}
                  disabled={applying || !promoInput.trim()}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition disabled:opacity-50 shrink-0"
                >
                  {applying ? 'Applying...' : 'Apply'}
                </motion.button>
              </div>

              {message && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm mt-4 p-3 rounded-xl ${
                    success
                      ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/30'
                      : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30'
                  }`}
                >
                  {message}
                </motion.p>
              )}
            </>
          )}
        </motion.div>

        {/* Test codes hint */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-500/20 transition-colors"
        >
          <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-3">🧪 Test promo codes</h3>
          <div className="space-y-2">
            {[
              { code: 'WELCOME10', desc: '+5 bonus interviews' },
              { code: 'APTENZA2026', desc: '+3 bonus interviews' },
              { code: 'GETPRO', desc: 'Upgrade to Pro plan' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <code className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-300">{item.code}</code>
                <span className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </main>
  )
}