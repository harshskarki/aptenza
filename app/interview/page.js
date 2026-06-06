'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function InterviewPage() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [interviewType, setInterviewType] = useState('dsa')
  const [user, setUser] = useState(null)
  const bottomRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
    }
    checkUser()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function startInterview() {
    setSessionStarted(true)
    setLoading(true)

    const systemPrompt = getSystemPrompt(interviewType)

    const response = await fetch('/api/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [],
        systemPrompt,
        isStart: true
      })
    })

    const data = await response.json()
    setMessages([{ role: 'assistant', content: data.message }])
    setLoading(false)
  }

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMessage = { role: 'user', content: input }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    const response = await fetch('/api/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: updatedMessages,
        systemPrompt: getSystemPrompt(interviewType),
        isStart: false
      })
    })

    const data = await response.json()
    setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    setLoading(false)
  }

  function getSystemPrompt(type) {
    const prompts = {
      dsa: `You are a senior software engineer conducting a DSA mock interview. 
        Ask one DSA question at a time. Start with an easy/medium problem. 
        When the candidate answers, give constructive feedback, then ask a follow up 
        or move to the next question. Be encouraging but honest. 
        After 3 questions, give an overall score out of 10 and detailed feedback.`,
      behavioral: `You are an experienced HR interviewer conducting a behavioral interview.
        Ask situational questions using the STAR method framework.
        Be professional and encouraging. After 3 questions give overall feedback.`,
      system_design: `You are a staff engineer conducting a system design interview.
        Ask the candidate to design a real world system. Guide them through 
        requirements, high level design, and deep dives. Give feedback after each response.`,
      domain: `You are a domain expert conducting a technical interview.
        Ask specific technical questions relevant to the candidate's domain.
        Give detailed feedback on each answer.`
    }
    return prompts[type]
  }

  if (!sessionStarted) {
    return (
      <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Mock Interview</h1>
          <p className="text-gray-400 mb-8">Select your interview type and start when ready.</p>

          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <label className="text-sm text-gray-400 mb-2 block text-left">Interview type</label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 border border-gray-700 focus:outline-none focus:border-indigo-500 mb-6"
            >
              <option value="dsa">💻 DSA Interview</option>
              <option value="behavioral">🧠 Behavioral Interview</option>
              <option value="system_design">⚙️ System Design</option>
              <option value="domain">🎯 Domain Specific</option>
            </select>

            <button
              onClick={startInterview}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Start Interview
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="w-full mt-3 text-gray-400 hover:text-white text-sm transition"
            >
              Back to dashboard
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-950 flex flex-col">

      {/* Header */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Aptenza</h1>
        <span className="text-gray-400 text-sm capitalize">{interviewType.replace('_', ' ')} Interview</span>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          End interview
        </button>
      </nav>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl mx-auto w-full">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-900 text-gray-100 border border-gray-800'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl px-4 py-3">
              <span className="text-gray-400 text-sm">Interviewer is typing...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your answer..."
            className="flex-1 bg-gray-900 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-indigo-500 transition text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition disabled:opacity-50 text-sm font-semibold"
          >
            Send
          </button>
        </div>
      </div>

    </main>
  )
}