'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import ThemeToggle from '@/components/ThemeToggle'
import { useTheme } from 'next-themes'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const DSA_PROBLEMS = [
  {
    id: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nExample:\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]`,
    hint: 'Think about using a Hash Map to store values and their indices as you iterate once through the array.',
    starterCode: {
      javascript: `function twoSum(nums, target) {\n  // Write your solution here\n  \n};\n\n// Test it\nconsole.log(twoSum([2, 7, 11, 15], 9)) // [0, 1]`,
      python: `def two_sum(nums: list[int], target: int) -> list[int]:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        \n    }\n}`
    }
  },
  {
    id: 2,
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.\n\nExample:\nInput: nums = [-2,1,-3,4,-1,2,1,-5,4]\nOutput: 6`,
    hint: "Kadane's Algorithm: track the current subarray sum and the maximum seen so far.",
    starterCode: {
      javascript: `function maxSubArray(nums) {\n  // Write your solution here\n  \n};\n\nconsole.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4])) // 6`,
      python: `def max_sub_array(nums: list[int]) -> int:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        // Write your solution here\n        \n    }\n}`
    }
  },
  {
    id: 3,
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nExample:\nInput: s = "A man, a plan, a canal: Panama"\nOutput: true`,
    hint: 'Use two pointers — one from the start, one from the end. Skip non-alphanumeric characters.',
    starterCode: {
      javascript: `function isPalindrome(s) {\n  // Write your solution here\n  \n};\n\nconsole.log(isPalindrome("A man, a plan, a canal: Panama")) // true`,
      python: `def is_palindrome(s: str) -> bool:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public boolean isPalindrome(String s) {\n        // Write your solution here\n        \n    }\n}`
    }
  },
  {
    id: 4,
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.\n\nExample:\nInput: head = [1,2,3,4,5]\nOutput: [5,4,3,2,1]`,
    hint: 'Iteratively: use three pointers (prev, curr, next). Track carefully to avoid losing references.',
    starterCode: {
      javascript: `function reverseList(head) {\n  // Write your solution here\n  \n};`,
      python: `def reverse_list(head):\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your solution here\n        \n    }\n}`
    }
  },
  {
    id: 5,
    title: 'Longest Substring',
    difficulty: 'Medium',
    description: `Given a string s, find the length of the longest substring without repeating characters.\n\nExample:\nInput: s = "abcabcbb"\nOutput: 3 (The answer is "abc")`,
    hint: 'Sliding window with a Hash Set: expand right, shrink left when you see a repeat.',
    starterCode: {
      javascript: `function lengthOfLongestSubstring(s) {\n  // Write your solution here\n  \n};\n\nconsole.log(lengthOfLongestSubstring("abcabcbb")) // 3`,
      python: `def length_of_longest_substring(s: str) -> int:\n    # Write your solution here\n    pass`,
      java: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your solution here\n        \n    }\n}`
    }
  }
]

const difficultyColors = {
  Easy: 'text-green-500 bg-green-50 dark:bg-green-900/20',
  Medium: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
  Hard: 'text-red-500 bg-red-50 dark:bg-red-900/20'
}

export default function CodePage() {
  const [selectedProblem, setSelectedProblem] = useState(DSA_PROBLEMS[0])
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState(DSA_PROBLEMS[0].starterCode.javascript)
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showHint, setShowHint] = useState(false)
  const router = useRouter()
  const { theme } = useTheme()

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setLoading(false)
    }
    checkUser()
  }, [])

  function handleProblemChange(problem) {
    setSelectedProblem(problem)
    setCode(problem.starterCode[language])
    setOutput('')
    setShowHint(false)
  }

  function handleLanguageChange(lang) {
    setLanguage(lang)
    setCode(selectedProblem.starterCode[lang])
    setOutput('')
  }

  function runCode() {
    setRunning(true)
    setOutput('')
    setTimeout(() => {
      if (language === 'javascript') {
        try {
          const logs = []
          const originalLog = console.log
          console.log = (...args) => logs.push(args.join(' '))
          // eslint-disable-next-line no-new-func
          new Function(code)()
          console.log = originalLog
          setOutput(logs.length > 0 ? logs.join('\n') : '✅ Code ran without errors.\n💡 Add console.log() to see output.')
        } catch (err) {
          setOutput(`❌ Error: ${err.message}`)
        }
      } else {
        setOutput(`ℹ️ Live execution is available for JavaScript only.\n\nFor Python/Java, test locally or on LeetCode.`)
      }
      setRunning(false)
    }, 800)
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
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white flex flex-col transition-colors duration-300">

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-gray-200 dark:border-white/5 px-6 py-3 flex items-center justify-between shrink-0 bg-white dark:bg-gray-950 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-black text-white">A</div>
            <span className="text-lg font-bold">Aptenza</span>
          </div>
          <span className="text-gray-300 dark:text-gray-600">|</span>
          <span className="text-gray-500 dark:text-gray-400 text-sm">Code Editor</span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm rounded-lg px-3 py-1.5 border border-gray-200 dark:border-white/5 focus:outline-none focus:border-indigo-500"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
          <ThemeToggle />
          <button onClick={() => router.push('/dashboard')} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
            ← Dashboard
          </button>
        </div>
      </motion.nav>

      <div className="flex flex-1 overflow-hidden">

        {/* Problem list sidebar */}
        <div className="w-64 border-r border-gray-200 dark:border-white/5 shrink-0 overflow-y-auto bg-white dark:bg-gray-950 transition-colors">
          <div className="p-4">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3">Problems</p>
            <div className="space-y-1">
              {DSA_PROBLEMS.map((problem) => (
                <button
                  key={problem.id}
                  onClick={() => handleProblemChange(problem)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition ${
                    selectedProblem.id === problem.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <div className="font-medium">{problem.title}</div>
                  <div className={`text-xs mt-0.5 ${selectedProblem.id === problem.id ? 'text-indigo-200' : difficultyColors[problem.difficulty]?.split(' ')[0]}`}>
                    {problem.difficulty}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">

          {/* Problem description */}
          <div className="w-96 border-r border-gray-200 dark:border-white/5 shrink-0 overflow-y-auto bg-white dark:bg-gray-950 transition-colors">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-black">{selectedProblem.title}</h2>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyColors[selectedProblem.difficulty]}`}>
                  {selectedProblem.difficulty}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap mb-6">
                {selectedProblem.description}
              </p>
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs text-indigo-500 hover:text-indigo-400 transition mb-2"
              >
                {showHint ? '▼ Hide hint' : '▶ Show hint'}
              </button>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl border border-indigo-200 dark:border-indigo-500/20"
                >
                  <p className="text-gray-600 dark:text-gray-300 text-xs leading-relaxed">💡 {selectedProblem.hint}</p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Code editor + output */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-hidden">
              <MonacoEditor
                height="100%"
                language={language}
                value={code}
                onChange={(val) => setCode(val || '')}
                theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  padding: { top: 16, bottom: 16 },
                  fontFamily: 'JetBrains Mono, Fira Code, monospace',
                }}
              />
            </div>

            {/* Output panel */}
            <div className="border-t border-gray-200 dark:border-white/5 shrink-0">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-white/5">
                <span className="text-xs text-gray-400 font-medium">Output</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setCode(selectedProblem.starterCode[language]); setOutput('') }}
                    className="text-xs text-gray-400 hover:text-gray-900 dark:hover:text-white transition px-3 py-1 rounded-lg border border-gray-200 dark:border-white/5"
                  >
                    Reset
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={runCode}
                    disabled={running}
                    className="text-xs bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-lg transition font-bold disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {running ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          className="w-3 h-3 border border-white border-t-transparent rounded-full" />
                        Running...
                      </>
                    ) : '▶ Run Code'}
                  </motion.button>
                </div>
              </div>
              <div className="px-4 py-3 h-28 overflow-y-auto bg-white dark:bg-gray-950 transition-colors">
                {output ? (
                  <pre className="text-sm text-gray-700 dark:text-gray-300 font-mono whitespace-pre-wrap">{output}</pre>
                ) : (
                  <p className="text-gray-400 text-sm">Click "Run Code" to see output here.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}