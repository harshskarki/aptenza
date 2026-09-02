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

const PACKAGES = [
  { id: 'starter', credits: 3, price: '₹49', pricePerInterview: '₹16/interview', icon: '🌱', label: 'Starter', desc: 'Perfect for trying out', popular: false },
  { id: 'popular', credits: 10, price: '₹149', pricePerInterview: '₹14.9/interview', icon: '⭐', label: 'Popular', desc: 'Best value for most users', popular: true },
  { id: 'pro', credits: 25, price: '₹299', pricePerInterview: '₹11.9/interview', icon: '🚀', label: 'Pro Pack', desc: 'Maximum savings', popular: false },
]

export default function CreditsPage() {
  const [profile, setProfile] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingPackage, setLoadingPackage] = useState(null)
  const [transactions, setTransactions] = useState([])
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      const { data: transactions } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setProfile(profile)
      setTransactions(transactions || [])
      setLoading(false)
    }
    loadData()
  }, [])

  async function handlePurchase(pkg) {
    setLoadingPackage(pkg.id)
    try {
      const orderRes = await fetch('/api/create-credit-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package: pkg.id })
      })
      const orderData = await orderRes.json()

      if (orderData.error) {
        alert('Something went wrong. Please try again.')
        setLoadingPackage(null)
        return
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Aptenza',
        description: `${orderData.credits} Interview Credits`,
        order_id: orderData.orderId,
        prefill: { name: profile?.full_name || '', email: user.email },
        theme: { color: '#4f46e5' },
        handler: async function(response) {
          const verifyRes = await fetch('/api/verify-credit-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              credits: orderData.credits,
              userId: user.id,
              amount: orderData.amount
            })
          })
          const verifyData = await verifyRes.json()
          if (verifyData.success) {
            setProfile(prev => ({
              ...prev,
              interview_credits: (prev?.interview_credits || 0) + orderData.credits
            }))
            alert(`✅ ${orderData.credits} interview credits added to your account!`)
          } else {
            alert('Payment verification failed. Please contact support.')
          }
          setLoadingPackage(null)
        },
        modal: { ondismiss: () => setLoadingPackage(null) }
      }

      const razorpayInstance = new window.Razorpay(options)
      razorpayInstance.open()
    } catch (error) {
      alert('Something went wrong. Please try again.')
      setLoadingPackage(null)
    }
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

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center mb-8">
          <div className="text-5xl mb-4">💳</div>
          <h2 className="text-3xl font-black mb-2">Buy Interview Credits</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Pay only for what you use. No subscription needed.
          </p>
        </motion.div>

        {/* Current credits */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-500/20 mb-8 text-center transition-colors"
        >
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Your current credits</p>
          <p className="text-5xl font-black text-indigo-600 dark:text-indigo-400">{profile?.interview_credits || 0}</p>
          <p className="text-gray-400 text-sm mt-1">interview credits remaining</p>
        </motion.div>

        {/* Packages */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {PACKAGES.map((pkg) => (
            <motion.div
              key={pkg.id}
              whileHover={{ scale: 1.02 }}
              className={`rounded-2xl p-6 border flex flex-col relative transition-colors ${
                pkg.popular
                  ? 'bg-indigo-950 border-indigo-700'
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-white/5'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                  Best value
                </div>
              )}
              <div className="text-3xl mb-3">{pkg.icon}</div>
              <h3 className="font-black text-lg mb-1">{pkg.label}</h3>
              <p className={`text-xs mb-3 ${pkg.popular ? 'text-indigo-300' : 'text-gray-400'}`}>{pkg.desc}</p>
              <div className="mb-1">
                <span className="text-3xl font-black">{pkg.price}</span>
              </div>
              <p className={`text-xs mb-4 ${pkg.popular ? 'text-indigo-300' : 'text-gray-400'}`}>{pkg.pricePerInterview}</p>
              <div className={`text-sm font-bold mb-6 ${pkg.popular ? 'text-indigo-200' : 'text-gray-600 dark:text-gray-300'}`}>
                {pkg.credits} interviews
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handlePurchase(pkg)}
                disabled={loadingPackage === pkg.id}
                className={`w-full py-3 rounded-xl text-sm font-bold transition disabled:opacity-50 mt-auto ${
                  pkg.popular
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    : 'border border-gray-200 dark:border-gray-700 hover:border-indigo-500 text-gray-900 dark:text-white'
                }`}
              >
                {loadingPackage === pkg.id ? 'Processing...' : `Buy ${pkg.credits} credits`}
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {/* How credits work */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-white/5 mb-6 transition-colors"
        >
          <h3 className="text-lg font-bold mb-4">How credits work</h3>
          <div className="space-y-3">
            {[
              { icon: '💳', text: 'Each credit = 1 mock interview session' },
              { icon: '♾️', text: 'Credits never expire — use them anytime' },
              { icon: '🔓', text: 'Credits unlock all interview types regardless of plan' },
              { icon: '➕', text: 'Credits stack with your plan\'s monthly allowance' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Transaction history */}
        {transactions.length > 0 && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible"
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-white/5 transition-colors"
          >
            <h3 className="text-lg font-bold mb-4">Recent purchases</h3>
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div>
                    <p className="text-sm font-medium">+{tx.credits} interview credits</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-green-500">₹{tx.amount / 100}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </div>
    </main>
  )
}