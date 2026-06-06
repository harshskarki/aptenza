'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function DashboardPage() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
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
        <div className="flex items-center gap-4">
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

        {/* Interview types */}
        <h3 className="text-lg font-semibold mb-4">Start a mock interview</h3>
        <div className="grid grid-cols-2 gap-4">

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-indigo-500 transition cursor-pointer">
            <div className="text-2xl mb-3">💻</div>
            <h4 className="font-semibold text-white">DSA Interview</h4>
            <p className="text-gray-400 text-sm mt-1">Data structures, algorithms, problem solving</p>
            <span className="inline-block mt-3 text-xs bg-indigo-900 text-indigo-300 px-2 py-1 rounded-full">Free</span>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-indigo-500 transition cursor-pointer">
            <div className="text-2xl mb-3">🧠</div>
            <h4 className="font-semibold text-white">Behavioral Interview</h4>
            <p className="text-gray-400 text-sm mt-1">HR questions, situational, STAR method</p>
            <span className="inline-block mt-3 text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">Pro</span>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-indigo-500 transition cursor-pointer">
            <div className="text-2xl mb-3">⚙️</div>
            <h4 className="font-semibold text-white">System Design</h4>
            <p className="text-gray-400 text-sm mt-1">Architecture, scalability, design patterns</p>
            <span className="inline-block mt-3 text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded-full">Pro</span>
          </div>

          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-indigo-500 transition cursor-pointer">
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