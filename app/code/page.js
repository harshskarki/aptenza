'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'

// Monaco must be loaded dynamically (no SSR)
const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const DSA_PROBLEMS = [
  {
    id: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: nums[0] + nums[1] == 9, so return [0, 1].`,
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your solution here
  
};`,
      python: `def two_sum(nums: list[int], target: int) -> list[int]:
    # Write your solution here
    pass`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        
    }
}`
    }
  },
  {
    id: 2,
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.

Example:
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: The subarray [4,-1,2,1] has the largest sum 6.`,
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  // Write your solution here
  
};`,
      python: `def max_sub_array(nums: list[int]) -> int:
    # Write your solution here
    pass`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Write your solution here
        
    }
}`
    }
  },
  {
    id: 3,
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string s, return true if it is a palindrome, or false otherwise.

Example:
Input: s = "A man, a plan, a canal: Panama"
Output: true`,
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
  // Write your solution here
  
};`,
      python: `def is_palindrome(s: str) -> bool:
    # Write your solution here
    pass`,
      java: `class Solution {
    public boolean isPalindrome(String s) {
        // Write your solution here
        
    }
}`
    }
  },
  {
    id: 4,
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.

Example:
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]`,
    starterCode: {
      javascript: `/**
 * @param {ListNode} head
 * @return {ListNode}
 */
function reverseList(head) {
  // Write your solution here
  
};`,
      python: `def reverse_list(head):
    # Write your solution here
    pass`,
      java: `class Solution {
    public ListNode reverseList(ListNode head) {
        // Write your solution here
        
    }
}`
    }
  },
  {
    id: 5,
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    description: `Given a string s, find the length of the longest substring without repeating characters.

Example:
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.`,
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  // Write your solution here
  
};`,
      python: `def length_of_longest_substring(s: str) -> int:
    # Write your solution here
    pass`,
      java: `class Solution {
    public int lengthOfLongestSubstring(String s) {
        // Write your solution here
        
    }
}`
    }
  }
]

const difficultyColors = {
  Easy: 'text-green-400 bg-green-400/10',
  Medium: 'text-yellow-400 bg-yellow-400/10',
  Hard: 'text-red-400 bg-red-400/10'
}

export default function CodePage() {
  const [selectedProblem, setSelectedProblem] = useState(DSA_PROBLEMS[0])
  const [language, setLanguage] = useState('javascript')
  const [code, setCode] = useState(DSA_PROBLEMS[0].starterCode.javascript)
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setLoading(false)
    }
    checkUser()
  }, [])

  function handleProblemChange(problem) {
    setSelectedProblem(problem)
    setCode(problem.starterCode[language])
    setOutput('')
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
          // Capture console.log output
          const logs = []
          const originalLog = console.log
          console.log = (...args) => logs.push(args.join(' '))

          // eslint-disable-next-line no-new-func
          const fn = new Function(code + '\n// Test run')
          fn()

          console.log = originalLog
          setOutput(logs.length > 0
            ? logs.join('\n')
            : '✅ Code ran without errors.\n💡 Add console.log() statements to see output.'
          )
        } catch (err) {
          setOutput(`❌ Error: ${err.message}`)
        }
      } else {
        setOutput(`ℹ️ Live execution is available for JavaScript only in the browser.\n\nFor Python/Java, copy your code and test it in your local environment or on LeetCode.`)
      }
      setRunning(false)
    }, 800)
  }

  function resetCode() {
    setCode(selectedProblem.starterCode[language])
    setOutput('')
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

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col">

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b border-white/5 px-6 py-3 flex items-center justify-between flex-shrink-0"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-black">A</div>
            <span className="text-lg font-bold">Aptenza</span>
          </div>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400 text-sm">Code Editor</span>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-gray-800 text-white text-sm rounded-lg px-3 py-1.5 border border-white/5 focus:outline-none focus:border-indigo-500"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-400 hover:text-white transition"
          >
            ← Dashboard
          </button>
        </div>
      </motion.nav>

      <div className="flex flex-1 overflow-hidden">

        {/* Problem list sidebar */}
        <div className="w-64 border-r border-white/5 flex-shrink-0 overflow-y-auto">
          <div className="p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">Problems</p>
            <div className="space-y-1">
              {DSA_PROBLEMS.map((problem) => (
                <button
                  key={problem.id}
                  onClick={() => handleProblemChange(problem)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition ${
                    selectedProblem.id === problem.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <div className="font-medium">{problem.title}</div>
                  <div className={`text-xs mt-0.5 ${
                    selectedProblem.id === problem.id
                      ? 'text-indigo-200'
                      : difficultyColors[problem.difficulty]?.split(' ')[0]
                  }`}>
                    {problem.difficulty}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 flex overflow-hidden">

          {/* Problem description */}
          <div className="w-96 border-r border-white/5 flex-shrink-0 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-black">{selectedProblem.title}</h2>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${difficultyColors[selectedProblem.difficulty]}`}>
                  {selectedProblem.difficulty}
                </span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {selectedProblem.description}
              </p>

              <div className="mt-6 p-4 bg-gray-900 rounded-xl border border-white/5">
                <p className="text-xs text-gray-500 mb-2 font-medium">💡 Hint</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {selectedProblem.id === 1 && 'Think about using a Hash Map to store values and their indices as you iterate once through the array.'}
                  {selectedProblem.id === 2 && "Kadane's Algorithm: track the current subarray sum and the maximum seen so far."}
                  {selectedProblem.id === 3 && 'Use two pointers — one from the start, one from the end. Skip non-alphanumeric characters.'}
                  {selectedProblem.id === 4 && 'Iteratively: use three pointers (prev, curr, next). Recursively: think about what the base case is.'}
                  {selectedProblem.id === 5 && 'Sliding window with a Set: expand right, shrink left when you see a repeat.'}
                </p>
              </div>
            </div>
          </div>

          {/* Code editor + output */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Editor */}
            <div className="flex-1 overflow-hidden">
              <MonacoEditor
                height="100%"
                language={language}
                value={code}
                onChange={(val) => setCode(val || '')}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  lineNumbers: 'on',
                  renderLineHighlight: 'all',
                  padding: { top: 16, bottom: 16 },
                  fontFamily: 'JetBrains Mono, Fira Code, monospace',
                  fontLigatures: true,
                }}
              />
            </div>

            {/* Output panel */}
            <div className="border-t border-white/5 flex-shrink-0">
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
                <span className="text-xs text-gray-500 font-medium">Output</span>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetCode}
                    className="text-xs text-gray-500 hover:text-white transition px-3 py-1 rounded-lg border border-white/5 hover:border-white/20"
                  >
                    Reset
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={runCode}
                    disabled={running}
                    className="text-xs bg-green-600 hover:bg-green-500 text-white px-4 py-1.5 rounded-lg transition font-bold disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {running ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                          className="w-3 h-3 border border-white border-t-transparent rounded-full"
                        />
                        Running...
                      </>
                    ) : (
                      '▶ Run Code'
                    )}
                  </motion.button>
                </div>
              </div>
              <div className="px-4 py-3 h-28 overflow-y-auto">
                {output ? (
                  <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap">{output}</pre>
                ) : (
                  <p className="text-gray-600 text-sm">Click "Run Code" to see output here.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}