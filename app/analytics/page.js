'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AnalyticsPage() {
  const [profile, setProfile] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
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

      const { data: sessions } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setProfile(profile)
      setSessions(sessions || [])
      setLoading(false)
    }

    loadData()
  }, [])

  function getAverageScore() {
    const scored = sessions.filter(s => s.score !== null)
    if (scored.length === 0) return 0
    return Math.round(scored.reduce((a, b) => a + b.score, 0) / scored.length)
  }

  function getTypeCount(type) {
    return sessions.filter(s => s.type === type).length
  }

  const typeLabels = {
    dsa: '💻 DSA',
    behavioral: '🧠 Behavioral',
    system_design: '⚙️ System Design',
    domain: '🎯 Domain'
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
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          ← Back to dashboard
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold">Your Analytics</h2>
          <p className="text-gray-400 mt-2">Track your interview performance over time.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-10">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Total interviews</p>
            <p className="text-3xl font-bold mt-1">{sessions.length}</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm">Average score</p>
            <p className="text-3xl font-bold mt-1">
              {getAverageScore() > 0 ? `${getAverageScore()}/10` : 'N/A'}
            </p>
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

        {/* Interview type breakdown */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-8">
          <h3 className="text-lg font-semibold mb-6">Interviews by type</h3>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(typeLabels).map(([type, label]) => (
              <div key={type} className="text-center">
                <p className="text-3xl font-bold">{getTypeCount(type)}</p>
                <p className="text-gray-400 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent sessions */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-6">Recent sessions</h3>

          {sessions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-400 text-sm">No interviews yet.</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-6 py-2 rounded-lg transition"
              >
                Start your first interview
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-xl"
                >
                  <div>
                    <p className="font-medium">{typeLabels[session.type] || session.type}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(session.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    {session.score ? (
                      <span className="text-indigo-400 font-bold">{session.score}/10</span>
                    ) : (
                      <span className="text-gray-500 text-sm">No score</span>
                    )}
                    <p className="text-xs mt-1 capitalize text-gray-400">{session.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}