'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'
import ThemeToggle from '@/components/ThemeToggle'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')
  const fileInputRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      const { data: sessions } = await supabase.from('sessions').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setProfile({ ...profile, email: user.email })
      setFullName(profile?.full_name || '')
      setSessions(sessions || [])
      setLoading(false)
    }
    loadData()
  }, [])

  async function handleSaveName() {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', profile.id)
    if (error) { setSaveMessage('Failed to save.') }
    else { setProfile(prev => ({ ...prev, full_name: fullName })); setSaveMessage('Name updated!'); setEditing(false) }
    setSaving(false)
  }

  async function handleResumeUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') { setUploadMessage('Only PDF files are allowed.'); return }
    if (file.size > 5 * 1024 * 1024) { setUploadMessage('File size must be under 5MB.'); return }
    setUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const filePath = `${user.id}/resume.pdf`
    const { error } = await supabase.storage.from('resumes').upload(filePath, file, { upsert: true })
    if (error) { setUploadMessage('Upload failed.'); setUploading(false); return }
    await supabase.from('profiles').update({ resume_url: filePath, resume_name: file.name }).eq('id', user.id)
    setProfile(prev => ({ ...prev, resume_url: filePath, resume_name: file.name }))
    setUploadMessage('Resume uploaded successfully!')
    setUploading(false)
  }

  async function handleResumeDelete() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.storage.from('resumes').remove([`${user.id}/resume.pdf`])
    await supabase.from('profiles').update({ resume_url: null, resume_name: null }).eq('id', user.id)
    setProfile(prev => ({ ...prev, resume_url: null, resume_name: null }))
    setUploadMessage('Resume removed.')
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  function getAverageScore() {
    const scored = sessions.filter(s => s.score !== null)
    if (scored.length === 0) return 'N/A'
    return `${Math.round(scored.reduce((a, b) => a + b.score, 0) / scored.length)}/10`
  }

  function getInitials(name) {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
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
        className="border-b border-gray-200 dark:border-white/5 px-6 py-4 flex items-center justify-between bg-white dark:bg-gray-950 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-black text-white">A</div>
          <span className="text-lg font-bold">Aptenza</span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">← Dashboard</button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={handleLogout}
            className="text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-1.5 rounded-lg transition">
            Logout
          </motion.button>
        </div>
      </motion.nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Profile header */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-white/5 mb-6 transition-colors"
        >
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0">
              {getInitials(profile?.full_name)}
            </div>
            <div className="flex-1">
              {editing ? (
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-2 border border-gray-200 dark:border-white/5 focus:outline-none focus:border-indigo-500 transition text-lg font-bold"
                    autoFocus
                  />
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }} onClick={handleSaveName} disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save'}
                  </motion.button>
                  <button onClick={() => { setEditing(false); setFullName(profile?.full_name || '') }}
                    className="text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-black">{profile?.full_name || 'No name set'}</h2>
                  <button onClick={() => setEditing(true)}
                    className="text-xs text-indigo-500 hover:text-indigo-400 border border-indigo-500/30 px-2 py-1 rounded-lg transition">
                    Edit
                  </button>
                </div>
              )}
              {saveMessage && <p className="text-green-500 text-xs mb-2">{saveMessage}</p>}
              <p className="text-gray-500 text-sm">{profile?.email}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  profile?.plan === 'premium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300' :
                  profile?.plan === 'pro' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300' :
                  'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                }`}>
                  {profile?.plan === 'free' ? '🆓 Free plan' : profile?.plan === 'pro' ? '⭐ Pro plan' : '🚀 Premium plan'}
                </span>
                <span className="text-xs text-gray-400">
                  Member since {new Date(profile?.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Interviews done', value: sessions.length },
            { label: 'Average score', value: getAverageScore() },
            { label: 'Interviews left', value: profile?.plan === 'free' ? 3 - (profile?.interviews_used || 0) : '∞' },
          ].map((stat, i) => (
            <motion.div key={i} variants={fadeUp} initial="hidden" animate="visible"
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-white/5 text-center transition-colors"
            >
              <p className="text-3xl font-black">{stat.value}</p>
              <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Resume */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-white/5 mb-6 transition-colors"
        >
          <h3 className="text-lg font-bold mb-1">Resume</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">Used by AI to personalize your interview questions.</p>

          {profile?.resume_url ? (
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="text-sm font-medium">{profile.resume_name}</p>
                  <p className="text-xs text-gray-400">PDF · Uploaded</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => fileInputRef.current?.click()} className="text-xs text-indigo-500 hover:text-indigo-400 transition">Replace</button>
                <button onClick={handleResumeDelete} className="text-xs text-red-500 hover:text-red-400 transition">Remove</button>
              </div>
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.01 }} onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-indigo-500 rounded-xl px-6 py-8 text-center cursor-pointer transition-colors"
            >
              <p className="text-3xl mb-2">📂</p>
              <p className="font-medium text-sm">Click to upload your resume</p>
              <p className="text-gray-400 text-xs mt-1">PDF only · Max 5MB</p>
            </motion.div>
          )}

          <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />

          {uploading && (
            <div className="flex items-center gap-2 mt-3">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full" />
              <p className="text-indigo-500 text-sm">Uploading...</p>
            </div>
          )}
          {uploadMessage && !uploading && (
            <p className={`text-sm mt-3 ${uploadMessage.includes('success') ? 'text-green-500' : uploadMessage.includes('removed') ? 'text-gray-400' : 'text-red-500'}`}>
              {uploadMessage}
            </p>
          )}
        </motion.div>

        {/* Referral */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-white/5 mb-6 transition-colors"
        >
          <h3 className="text-lg font-bold mb-1">Refer & Earn 🎁</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Refer friends and get bonus interviews. You have <span className="text-indigo-500 font-bold">{profile?.referral_count || 0} referrals</span> so far.
          </p>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => router.push('/referral')}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition">
            View referral page →
          </motion.button>
        </motion.div>

        {/* Upgrade */}
        {profile?.plan === 'free' && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible"
            className="bg-indigo-50 dark:bg-indigo-950/50 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-500/30 mb-6 transition-colors"
          >
            <h3 className="text-lg font-bold mb-1">Upgrade your plan</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Unlock unlimited interviews, detailed feedback, and more.</p>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => router.push('/pricing')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition">
              View plans →
            </motion.button>
          </motion.div>
        )}

        {/* Sign out */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible"
          className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-red-100 dark:border-red-500/10 transition-colors"
        >
          <h3 className="text-lg font-bold mb-1 text-red-500">Account</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Sign out of your Aptenza account.</p>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleLogout}
            className="border border-red-300 dark:border-red-500/30 hover:border-red-500 text-red-500 hover:text-red-400 px-6 py-2.5 rounded-xl text-sm font-medium transition">
            Sign out
          </motion.button>
        </motion.div>

      </div>
    </main>
  )
}