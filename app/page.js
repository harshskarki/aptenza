'use client'

import ThemeToggle from '@/components/ThemeToggle'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

function AnimatedCounter({ target }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const step = Math.ceil(target / 60)
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev + step >= target) {
          clearInterval(timer)
          return target
        }
        return prev + step
      })
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
}

export default function LandingPage() {
  const router = useRouter()
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60])

  return (
    <main className="min-h-screen bg-gray-950 dark:bg-gray-950 light:bg-white text-white dark:text-white light:text-gray-900 overflow-x-hidden">

      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-indigo-600 z-[100] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0.5 left-0 right-0 z-50 border-b border-white/5 bg-gray-950/80 backdrop-blur-md"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-black">A</div>
            <span className="text-lg font-bold tracking-tight">Aptenza</span>
          </div>
          <div className="flex items-center gap-6">
          <button onClick={() => router.push('/pricing')} className="text-sm text-gray-400 hover:text-white transition">Pricing</button>
          <ThemeToggle />
          <button onClick={() => router.push('/login')} className="text-sm text-gray-400 hover:text-white transition">Sign in</button>
          <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/signup')}
              className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg transition font-medium"
            >
              Get started free →
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 relative">

        {/* Background glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"
        />

        <motion.div
          style={{ y: heroY }}
          className="relative z-10 text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs px-4 py-2 rounded-full mb-8 font-medium"
          >
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
            AI-powered mock interviews — practice smarter
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6"
          >
            Stop fumbling.
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Start cracking.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-gray-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Aptenza puts you in a real mock interview with an AI that asks tough questions, pushes back on weak answers, and tells you exactly how to improve.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/signup')}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-xl text-lg transition shadow-lg shadow-indigo-600/25"
            >
              Start for free — no card needed
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push('/pricing')}
              className="w-full sm:w-auto text-gray-400 hover:text-white px-8 py-4 rounded-xl text-base transition border border-white/10 hover:border-white/20"
            >
              View pricing →
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex items-center justify-center gap-6 text-sm text-gray-500"
          >
            <span>✓ 3 free interviews</span>
            <span>✓ No credit card</span>
            <span>✓ Instant feedback</span>
          </motion.div>
        </motion.div>

        {/* Mock interview preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 mt-16 w-full max-w-2xl mx-auto"
        >
          <div className="bg-gray-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/70"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
              <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
              <span className="ml-2 text-xs text-gray-500">DSA Interview · In progress</span>
            </div>
            <div className="p-6 space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0, duration: 0.5 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">AI</div>
                <div className="bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-gray-200 max-w-sm">
                  Given an array of integers, return indices of two numbers that add up to target. What's your approach?
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="flex gap-3 justify-end"
              >
                <div className="bg-indigo-600 rounded-2xl rounded-tr-none px-4 py-3 text-sm text-white max-w-sm">
                  I'd use a hash map to store values as I iterate — O(n) time complexity.
                </div>
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">U</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.4, duration: 0.5 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">AI</div>
                <div className="bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-gray-200 max-w-sm">
                  Good! Now what about space complexity, and can you handle duplicates?
                </div>
              </motion.div>
              <div className="flex items-center gap-2 pt-2">
                <div className="flex-1 bg-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-500">Type your answer...</div>
                <div className="bg-indigo-600 rounded-xl px-4 py-2.5 text-sm font-semibold">Send</div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="border-y border-white/5 py-12"
      >
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          <motion.div variants={fadeUp}>
            <p className="text-4xl font-black text-white"><AnimatedCounter target={1240} />+</p>
            <p className="text-gray-500 text-sm mt-1">Interviews practiced</p>
          </motion.div>
          <motion.div variants={fadeUp}>
            <p className="text-4xl font-black text-white">4</p>
            <p className="text-gray-500 text-sm mt-1">Interview types</p>
          </motion.div>
          <motion.div variants={fadeUp}>
            <p className="text-4xl font-black text-white">10/10</p>
            <p className="text-gray-500 text-sm mt-1">Max score possible</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-black mb-4">Built different.</h2>
          <p className="text-gray-400 text-lg">Not a question bank. A real interviewer.</p>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <motion.div
            variants={fadeUp}
            whileHover={{ scale: 1.02, borderColor: 'rgba(99,102,241,0.5)' }}
            className="bg-gradient-to-br from-indigo-950/50 to-gray-900 rounded-2xl p-8 border border-indigo-500/20 md:col-span-2 transition-colors"
          >
            <div className="flex items-start gap-6">
              <div className="text-5xl">🤖</div>
              <div>
                <h3 className="text-2xl font-bold mb-3">AI that actually interviews you</h3>
                <p className="text-gray-400 leading-relaxed text-lg">
                  Not a quiz. Not flashcards. Aptenza's AI asks real questions, listens to your answers, challenges weak spots, and gives you the kind of feedback only a senior engineer could give — instantly.
                </p>
              </div>
            </div>
          </motion.div>

          {[
            { icon: '💻', title: 'DSA · Behavioral · System Design', desc: 'Cover every round of the interview process. From arrays and trees to "tell me about yourself" to designing Twitter.' },
            { icon: '📊', title: 'Track every session', desc: 'Every interview is scored, saved, and analysed. Watch your scores climb over time and know exactly when you\'re ready.' },
            { icon: '⚡', title: 'Instant, brutal feedback', desc: 'No waiting for a human. Get honest, detailed feedback the second you finish — what you nailed, what you fumbled, and how to fix it.' },
            { icon: '🔒', title: 'Zero pressure environment', desc: 'Practice without fear. Mess up, learn, try again. No judgment, no embarrassment — just you getting better every single day.' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ scale: 1.02, borderColor: 'rgba(99,102,241,0.3)' }}
              className="bg-gray-900 rounded-2xl p-8 border border-white/5 transition-colors cursor-default"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-white/5 py-24 bg-gray-900/30">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black mb-4">What candidates say</h2>
            <p className="text-gray-400">Real feedback from real users.</p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { initial: 'R', name: 'Rahul M.', role: 'SDE · Bangalore', color: 'bg-indigo-700', border: 'border-white/5', text: '"I practiced DSA interviews on Aptenza for 3 weeks. Got an offer from a product company in Bangalore. The AI feedback was genuinely helpful."' },
              { initial: 'P', name: 'Priya S.', role: 'CS Final Year · Pune', color: 'bg-purple-700', border: 'border-indigo-500/30', text: '"Better than paying ₹5000 for mock interviews. The AI asks follow-up questions just like a real interviewer. Highly recommend for freshers."' },
              { initial: 'A', name: 'Arjun K.', role: 'MBA · Mumbai', color: 'bg-green-700', border: 'border-white/5', text: '"The behavioral interview practice helped me structure my answers using STAR. Cleared 3 HR rounds back to back after practicing here."' },
            ].map((t, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ scale: 1.03, y: -4 }}
                className={`bg-gray-900 rounded-2xl p-6 border ${t.border} transition-transform`}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-sm">★</span>)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 ${t.color} rounded-full flex items-center justify-center text-xs font-bold`}>{t.initial}</div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-24 text-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="relative z-10"
        >
          <h2 className="text-5xl font-black mb-4">Your offer is waiting.</h2>
          <p className="text-gray-400 text-xl mb-10">
            Start with 3 free interviews. No credit card. No excuses.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(99,102,241,0.5)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/signup')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-12 py-5 rounded-xl text-xl transition shadow-lg shadow-indigo-600/30"
          >
            Start cracking now →
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center text-xs font-black">A</div>
            <span className="text-sm font-bold text-gray-400">Aptenza</span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => router.push('/pricing')} className="text-xs text-gray-600 hover:text-gray-400 transition">Pricing</button>
            <button onClick={() => router.push('/login')} className="text-xs text-gray-600 hover:text-gray-400 transition">Sign in</button>
            <button onClick={() => router.push('/signup')} className="text-xs text-gray-600 hover:text-gray-400 transition">Sign up</button>
          </div>
          <p className="text-xs text-gray-600">© 2026 Aptenza · Built to help you crack it.</p>
        </div>
      </footer>

    </main>
  )
}