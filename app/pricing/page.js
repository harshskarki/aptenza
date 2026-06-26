'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
}

export default function PricingPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loadingPlan, setLoadingPlan] = useState(null)

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profile)
      }
    }
    loadUser()
  }, [])

  async function handleUpgrade(plan) {
    // Not logged in — redirect to signup
    if (!user) {
      router.push('/signup')
      return
    }

    setLoadingPlan(plan)

    try {
      // Step 1: Create order on server
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      })
      const orderData = await orderRes.json()

      if (orderData.error) {
        alert('Something went wrong. Please try again.')
        setLoadingPlan(null)
        return
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Aptenza',
        description: `${plan === 'pro' ? 'Pro' : 'Premium'} Plan Subscription`,
        order_id: orderData.orderId,
        prefill: {
          name: profile?.full_name || '',
          email: user.email
        },
        theme: { color: '#4f46e5' },
        handler: async function (response) {
          // Step 3: Verify payment on server
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: plan,
              userId: user.id
            })
          })
          const verifyData = await verifyRes.json()

          if (verifyData.success) {
            router.push('/dashboard?upgraded=true')
          } else {
            alert('Payment verification failed. Please contact support.')
          }
          setLoadingPlan(null)
        },
        modal: {
          ondismiss: function () {
            setLoadingPlan(null)
          }
        }
      }

      const razorpayInstance = new window.Razorpay(options)
      razorpayInstance.open()

    } catch (error) {
      alert('Something went wrong. Please try again.')
      setLoadingPlan(null)
    }
  }

  const isCurrentPlan = (plan) => profile?.plan === plan

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="px-8 py-5 flex items-center justify-between max-w-6xl mx-auto"
      >
        <div
          onClick={() => router.push('/')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-black">A</div>
          <span className="text-lg font-bold tracking-tight">Aptenza</span>
        </div>
        <div className="flex items-center gap-6">
          {user ? (
            <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-400 hover:text-white transition">Dashboard</button>
          ) : (
            <button onClick={() => router.push('/login')} className="text-sm text-gray-400 hover:text-white transition">Sign in</button>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push(user ? '/dashboard' : '/signup')}
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg transition font-medium"
          >
            {user ? 'Go to dashboard' : 'Get started free'}
          </motion.button>
        </div>
      </motion.nav>

      {/* Header */}
      <motion.section
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto px-6 pt-16 pb-16 text-center"
      >
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs px-4 py-2 rounded-full mb-6 font-medium">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
          Simple, honest pricing
        </motion.div>
        <motion.h2 variants={fadeUp} className="text-5xl font-black mb-4">
          Pay for what
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent"> you need</span>
        </motion.h2>
        <motion.p variants={fadeUp} className="text-gray-400 text-lg">
          Start free. Upgrade when you need more. Cancel anytime.
        </motion.p>
      </motion.section>

      {/* Pricing cards */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="max-w-5xl mx-auto px-6 pb-24"
      >
        <div className="grid grid-cols-3 gap-6">

          {/* Free */}
          <motion.div
            variants={fadeUp}
            whileHover={{ scale: 1.02, borderColor: 'rgba(99,102,241,0.4)' }}
            className="bg-gray-900 rounded-2xl p-8 border border-white/5 flex flex-col transition-colors"
          >
            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-1">Free</h4>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-black">₹0</span>
              </div>
              <p className="text-gray-500 text-sm">Forever free</p>
            </div>
            <ul className="space-y-4 text-sm mb-8 flex-1">
              {[
                { text: '3 interviews per month', active: true },
                { text: 'DSA interviews', active: true },
                { text: 'Basic AI feedback', active: true },
                { text: '7-day analytics history', active: true },
                { text: 'Behavioral interviews', active: false },
                { text: 'System design', active: false },
                { text: 'Resume analysis', active: false },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className={item.active ? 'text-green-400' : 'text-gray-600'}>
                    {item.active ? '✓' : '✗'}
                  </span>
                  <span className={item.active ? 'text-gray-300' : 'text-gray-600'}>{item.text}</span>
                </li>
              ))}
            </ul>
            {isCurrentPlan('free') ? (
              <div className="w-full text-center border border-green-500/30 text-green-400 py-3 rounded-xl text-sm font-semibold">
                ✓ Current plan
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push(user ? '/dashboard' : '/signup')}
                className="w-full border border-gray-700 hover:border-indigo-500 text-white py-3 rounded-xl transition text-sm font-semibold"
              >
                Get started free
              </motion.button>
            )}
          </motion.div>

          {/* Pro */}
          <motion.div
            variants={fadeUp}
            whileHover={{ scale: 1.02 }}
            className="bg-indigo-950 rounded-2xl p-8 border border-indigo-700 flex flex-col relative"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs px-4 py-1.5 rounded-full font-medium">
              Most popular
            </div>
            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-1">Pro</h4>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-black">₹299</span>
                <span className="text-gray-400 mb-1">/month</span>
              </div>
              <p className="text-gray-500 text-sm">Billed monthly</p>
            </div>
            <ul className="space-y-4 text-sm mb-8 flex-1">
              {[
                { text: '15 interviews per month', active: true },
                { text: 'DSA + Behavioral', active: true },
                { text: 'Detailed AI feedback', active: true },
                { text: '3-month analytics history', active: true },
                { text: 'Resume analysis', active: true },
                { text: 'System design interviews', active: true },
                { text: 'Domain specific', active: false },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className={item.active ? 'text-green-400' : 'text-gray-600'}>
                    {item.active ? '✓' : '✗'}
                  </span>
                  <span className={item.active ? 'text-gray-300' : 'text-gray-600'}>{item.text}</span>
                </li>
              ))}
            </ul>
            {isCurrentPlan('pro') ? (
              <div className="w-full text-center border border-green-500/30 text-green-400 py-3 rounded-xl text-sm font-semibold">
                ✓ Current plan
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleUpgrade('pro')}
                disabled={loadingPlan === 'pro'}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl transition text-sm font-semibold disabled:opacity-50"
              >
                {loadingPlan === 'pro' ? 'Processing...' : 'Get Pro'}
              </motion.button>
            )}
          </motion.div>

          {/* Premium */}
          <motion.div
            variants={fadeUp}
            whileHover={{ scale: 1.02, borderColor: 'rgba(99,102,241,0.4)' }}
            className="bg-gray-900 rounded-2xl p-8 border border-white/5 flex flex-col transition-colors"
          >
            <div className="mb-6">
              <h4 className="font-semibold text-lg mb-1">Premium</h4>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-black">₹799</span>
                <span className="text-gray-400 mb-1">/month</span>
              </div>
              <p className="text-gray-500 text-sm">Billed monthly</p>
            </div>
            <ul className="space-y-4 text-sm mb-8 flex-1">
              {[
                { text: 'Unlimited interviews', active: true },
                { text: 'All interview types', active: true },
                { text: 'Detailed AI feedback', active: true },
                { text: 'Lifetime analytics history', active: true },
                { text: 'Resume analysis', active: true },
                { text: 'Domain specific interviews', active: true },
                { text: 'Priority support', active: true },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <span className={item.active ? 'text-green-400' : 'text-gray-600'}>
                    {item.active ? '✓' : '✗'}
                  </span>
                  <span className={item.active ? 'text-gray-300' : 'text-gray-600'}>{item.text}</span>
                </li>
              ))}
            </ul>
            {isCurrentPlan('premium') ? (
              <div className="w-full text-center border border-green-500/30 text-green-400 py-3 rounded-xl text-sm font-semibold">
                ✓ Current plan
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleUpgrade('premium')}
                disabled={loadingPlan === 'premium'}
                className="w-full border border-gray-700 hover:border-indigo-500 text-white py-3 rounded-xl transition text-sm font-semibold disabled:opacity-50"
              >
                {loadingPlan === 'premium' ? 'Processing...' : 'Get Premium'}
              </motion.button>
            )}
          </motion.div>

        </div>

        {/* FAQ */}
        <motion.div
          variants={fadeUp}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 text-sm">
            Questions? Email us at{' '}
            <span className="text-indigo-400">support@aptenza.io</span>
          </p>
          <p className="text-gray-600 text-xs mt-2">
            🔒 Payments secured by Razorpay · Test mode active
          </p>
        </motion.div>

      </motion.section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center text-xs font-black">A</div>
            <span className="text-sm font-bold text-gray-400">Aptenza</span>
          </div>
          <p className="text-xs text-gray-600">© 2026 Aptenza · Built to help you crack it.</p>
        </div>
      </footer>

    </main>
  )
}