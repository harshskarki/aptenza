'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

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
      .update({
        resume_url: filePath,
        resume_name: file.name
      })
      .eq('id', user.id)

    if (updateError) {
      setUploadMessage('Failed to save resume info.')
      setUploading(false)
      return
    }

    setProfile(prev => ({
      ...prev,
      resume_url: filePath,
      resume_name: file.name
    }))

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
        <p className="text-gray-400">Loading...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Aptenza</h1>
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push('/analytics')}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Analytics
          </button>
          <span className="text-gray-400 text-sm">
            {profile?.full_name || profile?.email}
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Welcome */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'there'} 👋
          </h2>
          <p className="text-gray-400 mt-2">Ready for your next mock interview?</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Interviews done</p>
            <p className="text-3xl font-bold mt-1">{profile?.interviews_used || 0}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Current plan</p>
            <p className="text-3xl font-bold mt-1 capitalize">{profile?.plan || 'Free'}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Interviews left</p>
            <p className="text-3xl font-bold mt-1">
              {profile?.plan === 'free' ? 3 - (profile?.interviews_used || 0) : '∞'}
            </p>
          </div>
        </div>

        {/* Resume upload */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-10">
          <h3 className="text-lg font-semibold mb-1">Your Resume</h3>
          <p className="text-gray-400 text-sm mb-5">
            Upload your resume so AI can tailor interview questions to your background.
          </p>

          {profile?.resume_url ? (
            <div className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
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
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-700 hover:border-indigo-500 rounded-xl px-6 py-10 text-center cursor-pointer transition"
            >
              <p className="text-4xl mb-3">📂</p>
              <p className="text-white font-medium">Click to upload your resume</p>
              <p className="text-gray-400 text-sm mt-1">PDF only · Max 5MB</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleResumeUpload}
            className="hidden"
          />

          {uploading && (
            <p className="text-indigo-400 text-sm mt-3">Uploading...</p>
          )}

          {uploadMessage && !uploading && (
            <p className={`text-sm mt-3 ${uploadMessage.includes('success') ? 'text-green-400' : uploadMessage.includes('removed') ? 'text-gray-400' : 'text-red-400'}`}>
              {uploadMessage}
            </p>
          )}
        </div>

        {/* Interview types */}
        <h3 className="text-lg font-semibold mb-4">Start a mock interview</h3>
        <div className="grid grid-cols-2 gap-4">

          <div
            onClick={() => router.push('/interview?type=dsa')}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-indigo-500 transition cursor-pointer"
          >
            <div className="text-2xl mb-3">💻</div>
            <h4 className="font-semibold text-white">DSA Interview</h4>
            <p className="text-gray-400 text-sm mt-1">Data structures, algorithms, problem solving</p>
            <span className="inline-block mt-3 text-xs bg-indigo-900 text-indigo-300 px-2 py-1 rounded-full">Free</span>
          </div>

          <div
            onClick={() => router.push('/interview?type=behavioral')}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-indigo-500 transition cursor-pointer"
          >
            <div className="text-2xl mb-3">🧠</div>
            <h4 className="font-semibold text-white">Behavioral Interview</h4>
            <p className="text-gray-400 text-sm mt-1">HR questions, situational, STAR method</p>
            <span className="inline-block mt-3 text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">Pro</span>
          </div>

          <div
            onClick={() => router.push('/interview?type=system_design')}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-indigo-500 transition cursor-pointer"
          >
            <div className="text-2xl mb-3">⚙️</div>
            <h4 className="font-semibold text-white">System Design</h4>
            <p className="text-gray-400 text-sm mt-1">Architecture, scalability, design patterns</p>
            <span className="inline-block mt-3 text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">Pro</span>
          </div>

          <div
            onClick={() => router.push('/interview?type=domain')}
            className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-indigo-500 transition cursor-pointer"
          >
            <div className="text-2xl mb-3">🎯</div>
            <h4 className="font-semibold text-white">Domain Specific</h4>
            <p className="text-gray-400 text-sm mt-1">ML, Finance, Frontend, Backend and more</p>
            <span className="inline-block mt-3 text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">Premium</span>
          </div>

        </div>
      </div>
    </main>
  )
}