'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

export default function DashboardPage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')
  const fileInputRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profile)
      setLoading(false)
    }
    loadProfile()
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function handleResumeUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setUploadMessage('Only PDF files are allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage('File size must be under 5MB.')
      return
    }
    setUploading(true)
    setUploadMessage('')
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const filePath = `${user.id}/resume.pdf`
    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, { upsert: true })
    if (uploadError) {
      setUploadMessage('Upload failed. Please try again.')
      setUploading(false)
      return
    }
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ resume_url: filePath, resume_name: file.name })
      .eq('id', user.id)
    if (updateError) {
      setUploadMessage('Failed to save resume info.')
      setUploading(false)
      return
    }
    setProfile(prev => ({ ...prev, resume_url: filePath, resume_name: file.name }))
    setUploadMessage('Resume uploaded successfully!')
    setUploading(false)
  }

  async function handleResumeDelete() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const filePath = `${user.id}/resume.pdf`
    await supabase.storage.from('resumes').remove([filePath])
    await supabase
      .from('profiles')
      .update({ resume_url: null, resume_name: null })
      .eq('id', user.id)
    setProfile(prev => ({ ...prev, resume_url: null, resume_name: null }))
    setUploadMessage('Resume removed.')
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

  const interviewTypes = [
    { type: 'dsa', icon: '💻', title: 'DSA Interview', desc: 'Data structures, algorithms, problem solving', badge: 'Free', badgeClass: 'bg-indigo-900 text-indigo-300' },
    { type: 'behavioral', icon: '🧠', title: 'Behavioral Interview', desc: 'HR questions, situational, STAR method', badge: 'Pro', badgeClass: 'bg-gray-800 text-gray-400' },
    { type: 'system_design', icon: '⚙️', title: 'System Design', desc: 'Architecture, scalability, design patterns', badge: 'Pro', badgeClass: 'bg-gray-800 text-gray-400' },
    { type: 'domain', icon: '🎯', title: 'Domain Specific', desc: 'ML, Finance, Frontend, Backend and more', badge: 'Premium', badgeClass: 'bg-gray-800 text-gray-400' },
  ]

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="border-b border-white/5 px-6 py-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-black">A</div>
          <span className="text-lg font-bold">Aptenza</span>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push('/analytics')}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Analytics
          </button>
          <span className="text-gray-400 text-sm">{profile?.full_name || profile?.email}</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-1.5 rounded-lg transition"
          >
            Logout
          </motion.button>
        </div>
      </motion.nav>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Welcome */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="mb-10"
        >
          <motion.h2 variants={fadeUp} className="text-3xl font-black">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'there'} 👋
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-400 mt-2">
            Ready for your next mock interview?
          </motion.p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-4 mb-10"
        >
          {[
            { label: 'Interviews done', value: profile?.interviews_used || 0 },
            { label: 'Current plan', value: profile?.plan || 'Free' },
            { label: 'Interviews left', value: profile?.plan === 'free' ? 3 - (profile?.interviews_used || 0) : '∞' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ scale: 1.02, borderColor: 'rgba(99,102,241,0.4)' }}
              className="bg-gray-900 rounded-xl p-6 border border-white/5 transition-colors"
            >
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <p className="text-3xl font-black mt-1 capitalize">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Resume upload */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="bg-gray-900 rounded-xl p-6 border border-white/5 mb-10"
        >
          <h3 className="text-lg font-bold mb-1">Your Resume</h3>
          <p className="text-gray-400 text-sm mb-5">
            Upload your resume so AI can tailor interview questions to your background.
          </p>

          {profile?.resume_url ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="text-sm font-medium text-white">{profile.resume_name}</p>
                  <p className="text-xs text-gray-400">PDF · Uploaded</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition"
                >
                  Replace
                </button>
                <button
                  onClick={handleResumeDelete}
                  className="text-xs text-red-400 hover:text-red-300 transition"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              whileHover={{ scale: 1.01, borderColor: 'rgba(99,102,241,0.5)' }}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-700 rounded-xl px-6 py-10 text-center cursor-pointer transition-colors"
            >
              <p className="text-4xl mb-3">📂</p>
              <p className="text-white font-medium">Click to upload your resume</p>
              <p className="text-gray-400 text-sm mt-1">PDF only · Max 5MB</p>
            </motion.div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleResumeUpload}
            className="hidden"
          />

          {uploading && (
            <div className="flex items-center gap-2 mt-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full"
              />
              <p className="text-indigo-400 text-sm">Uploading...</p>
            </div>
          )}

          {uploadMessage && !uploading && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-sm mt-3 ${
                uploadMessage.includes('success') ? 'text-green-400' :
                uploadMessage.includes('removed') ? 'text-gray-400' : 'text-red-400'
              }`}
            >
              {uploadMessage}
            </motion.p>
          )}
        </motion.div>

        {/* Interview types */}
        <motion.h3
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-lg font-bold mb-4"
        >
          Start a mock interview
        </motion.h3>

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-4"
        >
          {interviewTypes.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ scale: 1.03, borderColor: 'rgba(99,102,241,0.5)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(`/interview?type=${item.type}`)}
              className="bg-gray-900 rounded-xl p-6 border border-white/5 cursor-pointer transition-colors"
            >
              <div className="text-2xl mb-3">{item.icon}</div>
              <h4 className="font-bold text-white">{item.title}</h4>
              <p className="text-gray-400 text-sm mt-1">{item.desc}</p>
              <span className={`inline-block mt-3 text-xs ${item.badgeClass} px-2 py-1 rounded-full`}>
                {item.badge}
              </span>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </main>
  )
}