'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import ThemeToggle from '@/components/ThemeToggle'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export default function ReferralPage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [referralInput, setReferralInput] = useState('')
  const [applyMessage, setApplyMessage] = useState('')
  const [applying, setApplying] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // Generate referral code if missing
      if (!profile.referral_code) {
        const code = user.id.split('-')[0].toUpperCase()
        await supabase
          .from('profiles')
          .update({ referral_code: code })
          .eq('id', user.id)
        profile.referral_code = code
      }

      setProfile(profile)
      setLoading(false)
    }
    loadProfile()
  }, [])

  function getReferralLink() {
    return `${window.location.origin}/signup?ref=${profile?.referral_code}`
  }

  async function copyLink() {
    await navigator.clipboard.writeText(getReferralLink())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function applyReferralCode() {
    if (!referralInput.trim()) return
    if (profile?.referred_by) {
      setApplyMessage('❌ You have already used a referral code.')
      return
    }
    if (referralInput.toUpperCase() === profile?.referral_code) {
      setApplyMessage('❌ You cannot use your own referral code.')
      return
    }

    setApplying(true)
    setApplyMessage('')
    const supabase = createClient()

    // Find the referrer
    const { data: referrer } = await supabase
      .from('profiles')
      .select('*')
      .eq('referral_code', referralInput.toUpperCase())
      .single()

    if (!referrer) {
      setApplyMessage('❌ Invalid referral code. Please check and try again.')
      setApplying(false)
      return
    }

    // Update current user — mark as referred + give bonus
    await supabase
      .from('profiles')
      .update({
        referred_by: referralInput.toUpperCase(),
        bonus_interviews: (profile?.bonus_interviews || 0) + 1
      })
      .eq('id', profile.id)

    // Update referrer — increment count + give bonus
    await supabase
      .from('profiles')
      .update({
        referral_count: (referrer.referral_count || 0) + 1,
        bonus_interviews: (referrer.bonus_interviews || 0) + 1
      })
      .eq('id', referrer.id)

    setProfile(prev => ({
      ...prev,
      referred_by: referralInput.toUpperCase(),
      bonus_interviews: (prev?.bonus_interviews || 0) + 1
    }))

    setApplyMessage('✅ Referral code applied! You and your friend both get 1 bonus interview.')
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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="mb-8 text-center">
          <div className="text-5xl mb-4">🎁</div>
          <h2 className="text-3xl font-black mb-2">Refer & Earn</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Share Aptenza with friends. When they sign up, you both get <span className="text-indigo-500 font-bold">1 bonus interview</span> free.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {[
            { label: 'Friends referred', value: profile?.referral_count || 0, icon: '👥' },
            { label: 'Bonus interviews', value: profile?.bonus_interviews || 0, icon: '🎯' },
            { label: 'Your plan', value: profile?.plan || 'Free', icon: '⭐' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-white/5 text-center transition-colors"
            >
              <p className="text-2xl mb-1">{stat.icon}</p>
              <p className="text-2xl font-black capitalize">{stat.value}</p>
              <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Your referral link */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-white/5 mb-6 transition-colors"
        >
          <h3 className="text-lg font-bold mb-1">Your referral link</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
            Share this link with friends. When they sign up, you both get rewarded.
          </p>

          {/* Referral code badge */}
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-500/30 rounded-xl px-4 py-2">
              <p className="text-xs text-indigo-500 dark:text-indigo-400 mb-0.5">Your code</p>
              <p className="text-xl font-black text-indigo-600 dark:text-indigo-300 tracking-widest">{profile?.referral_code}</p>
            </div>
          </div>

          {/* Referral link */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-200 dark:border-white/5 text-sm text-gray-500 dark:text-gray-400 truncate">
              {typeof window !== 'undefined' ? getReferralLink() : ''}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyLink}
              className={`px-4 py-3 rounded-xl text-sm font-bold transition shrink-0 ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {copied ? '✅ Copied!' : '📋 Copy'}
            </motion.button>
          </div>

          {/* Share buttons */}
          <div className="flex gap-3 mt-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                const text = `I've been using Aptenza to prep for interviews with AI mock interviews. Try it free! ${typeof window !== 'undefined' ? getReferralLink() : ''}`
                window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
              }}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium transition"
            >
              📱 Share on WhatsApp
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                const text = `I've been using Aptenza to prep for interviews with AI mock interviews. Try it free!`
                window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== 'undefined' ? getReferralLink() : '')}`, '_blank')
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium transition"
            >
              💼 Share on LinkedIn
            </motion.button>
          </div>
        </motion.div>

        {/* Apply referral code */}
        {!profile?.referred_by && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible"
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-white/5 mb-6 transition-colors"
          >
            <h3 className="text-lg font-bold mb-1">Have a referral code?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
              Enter a friend's referral code to get 1 bonus interview.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={referralInput}
                onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                placeholder="Enter code e.g. ABC12345"
                className="flex-1 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-3 border border-gray-200 dark:border-white/5 focus:outline-none focus:border-indigo-500 transition text-sm placeholder-gray-400 uppercase tracking-widest"
                maxLength={8}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={applyReferralCode}
                disabled={applying || !referralInput.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition disabled:opacity-50 shrink-0"
              >
                {applying ? 'Applying...' : 'Apply'}
              </motion.button>
            </div>
            {applyMessage && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-sm mt-3 ${applyMessage.includes('✅') ? 'text-green-500' : 'text-red-500'}`}
              >
                {applyMessage}
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Already referred */}
        {profile?.referred_by && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible"
            className="bg-green-50 dark:bg-green-950/30 rounded-2xl p-6 border border-green-200 dark:border-green-500/30 mb-6 transition-colors"
          >
            <p className="text-green-600 dark:text-green-400 font-medium">
              ✅ You joined using referral code <span className="font-black">{profile.referred_by}</span> — your bonus interview has been added!
            </p>
          </motion.div>
        )}

        {/* How it works */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-white/5 transition-colors"
        >
          <h3 className="text-lg font-bold mb-4">How it works</h3>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Share your link', desc: 'Copy your referral link and share it with friends preparing for interviews.' },
              { step: '2', title: 'Friend signs up', desc: 'Your friend signs up on Aptenza using your referral link or code.' },
              { step: '3', title: 'Both get rewarded', desc: 'You both receive 1 bonus interview added to your account instantly.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </main>
  )
}