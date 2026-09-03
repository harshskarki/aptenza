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

export default function InvoicePage() {
  const [profile, setProfile] = useState(null)
  const [user, setUser] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()

      const { data: transactions } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setProfile(profile)
      setTransactions(transactions || [])
      setLoading(false)
    }
    loadData()
  }, [])

  async function downloadInvoice(tx) {
    setGenerating(tx.id)
    try {
      const { generateInvoice } = await import('@/utils/generateInvoice')
      const doc = generateInvoice({
        userName: profile?.full_name || 'Customer',
        userEmail: user?.email || '',
        plan: 'Interview Credits',
        amount: tx.amount,
        paymentId: tx.payment_id || 'N/A',
        date: new Date(tx.created_at).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'long', year: 'numeric'
        })
      })
      doc.save(`aptenza-invoice-${tx.id.slice(0, 8)}.pdf`)
    } catch (error) {
      alert('Failed to generate invoice. Please try again.')
    }
    setGenerating(null)
  }

  async function downloadPlanInvoice() {
    setGenerating('plan')
    try {
      const { generateInvoice } = await import('@/utils/generateInvoice')
      const planPrices = { pro: 29900, premium: 79900 }
      const doc = generateInvoice({
        userName: profile?.full_name || 'Customer',
        userEmail: user?.email || '',
        plan: profile?.plan || 'free',
        amount: planPrices[profile?.plan] || 0,
        paymentId: 'Subscription',
        date: new Date().toLocaleDateString('en-IN', {
          day: 'numeric', month: 'long', year: 'numeric'
        })
      })
      doc.save(`aptenza-plan-invoice.pdf`)
    } catch (error) {
      alert('Failed to generate invoice. Please try again.')
    }
    setGenerating(null)
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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {/* Header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="text-center mb-8">
          <div className="text-5xl mb-4">🧾</div>
          <h2 className="text-3xl font-black mb-2">Invoices</h2>
          <p className="text-gray-500 dark:text-gray-400">Download PDF invoices for all your Aptenza payments.</p>
        </motion.div>

        {/* Current plan invoice */}
        {profile?.plan !== 'free' && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible"
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-white/5 mb-6 transition-colors"
          >
            <h3 className="text-lg font-bold mb-4">Current Plan</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div>
                <p className="font-medium capitalize">{profile?.plan} Plan Subscription</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {profile?.plan === 'pro' ? '₹299/month' : '₹799/month'}
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={downloadPlanInvoice}
                disabled={generating === 'plan'}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition disabled:opacity-50 flex items-center gap-2"
              >
                {generating === 'plan' ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="w-3 h-3 border border-white border-t-transparent rounded-full" />
                    Generating...
                  </>
                ) : '📥 Download PDF'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Credit purchase invoices */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-white/5 transition-colors"
        >
          <h3 className="text-lg font-bold mb-4">Credit Purchases</h3>

          {transactions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-4xl mb-3">🧾</p>
              <p className="text-gray-400 text-sm">No purchases yet.</p>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push('/credits')}
                className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-6 py-2.5 rounded-lg transition font-medium"
              >
                Buy interview credits →
              </motion.button>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <motion.div
                  key={tx.id}
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                >
                  <div>
                    <p className="font-medium">+{tx.credits} Interview Credits</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      {new Date(tx.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-green-500 font-bold text-sm">₹{tx.amount / 100}</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => downloadInvoice(tx)}
                      disabled={generating === tx.id}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50 flex items-center gap-1"
                    >
                      {generating === tx.id ? (
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          className="w-3 h-3 border border-white border-t-transparent rounded-full" />
                      ) : '📥 PDF'}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </main>
  )
}