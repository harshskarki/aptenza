import { jsPDF } from 'jspdf'

const STUDY_CONTENT = {
  dsa: {
    title: 'DSA Study Guide',
    emoji: '💻',
    topics: [
      {
        name: 'Arrays & Hash Maps',
        color: [79, 70, 229],
        points: [
          'Two Sum pattern: use a hash map to store seen values — O(n)',
          'Sliding window: expand right, shrink left when condition breaks',
          'Prefix sums: precompute cumulative sums for range queries',
          'Two pointers: sorted arrays, palindrome checks, container problems'
        ],
        complexity: 'Time: O(n) | Space: O(n)'
      },
      {
        name: 'Linked Lists',
        color: [16, 185, 129],
        points: [
          'Fast & slow pointers (Floyd\'s): cycle detection, middle finding',
          'Dummy node trick: simplifies edge cases in insertions/deletions',
          'Reverse in place: track prev, curr, next pointers carefully',
          'Merge sorted lists: compare heads, recursively merge remainder'
        ],
        complexity: 'Time: O(n) | Space: O(1)'
      },
      {
        name: 'Trees & Graphs',
        color: [245, 158, 11],
        points: [
          'DFS: use recursion or explicit stack — good for path problems',
          'BFS: use queue — good for shortest path, level order traversal',
          'BST property: left < root < right — enables O(log n) search',
          'Graph: visited set to avoid infinite loops in DFS/BFS'
        ],
        complexity: 'Time: O(V+E) | Space: O(V)'
      },
      {
        name: 'Dynamic Programming',
        color: [239, 68, 68],
        points: [
          'Top-down (memoization): recursion + cache repeated subproblems',
          'Bottom-up (tabulation): fill table from base cases upward',
          'State: what changes between subproblems? (index, remaining, etc)',
          'Common patterns: 0/1 knapsack, LCS, LIS, coin change, grid paths'
        ],
        complexity: 'Time: O(n²) | Space: O(n)'
      }
    ]
  },
  behavioral: {
    title: 'Behavioral Interview Guide',
    emoji: '🧠',
    topics: [
      {
        name: 'STAR Method Framework',
        color: [79, 70, 229],
        points: [
          'Situation: 2-3 sentences, set the scene without over-explaining',
          'Task: YOUR specific role and responsibility — use "I" not "we"',
          'Action: most important part — specific steps YOU took',
          'Result: quantify when possible — numbers, percentages, time saved'
        ],
        complexity: 'Target: 2-3 minutes per answer'
      },
      {
        name: 'Common Question Types',
        color: [16, 185, 129],
        points: [
          'Conflict: show empathy, active listening, and constructive resolution',
          'Failure: own it, show what you learned, what you changed',
          'Leadership: focus on influence without authority, not just titles',
          'Pressure: show systematic thinking, prioritization, communication'
        ],
        complexity: 'Prepare 5-7 versatile STAR stories'
      },
      {
        name: 'Anti-Patterns to Avoid',
        color: [239, 68, 68],
        points: [
          'Blaming others — always frame as "we could have done better"',
          'Being too vague — specifics and numbers make stories credible',
          'Rambling — practice timing, aim for 2 minutes max',
          'No result — always end with the outcome, even if imperfect'
        ],
        complexity: 'Practice out loud, not just in your head'
      }
    ]
  },
  system_design: {
    title: 'System Design Guide',
    emoji: '⚙️',
    topics: [
      {
        name: 'Design Framework',
        color: [79, 70, 229],
        points: [
          '1. Clarify requirements: functional vs non-functional, scale',
          '2. Estimate scale: DAU, QPS, storage — back of envelope math',
          '3. High-level design: core components and data flow diagram',
          '4. Deep dive: focus on the hardest part — DB schema, APIs, etc'
        ],
        complexity: '45 minutes: 5 clarify, 10 estimate, 15 HLD, 15 deep dive'
      },
      {
        name: 'Core Concepts',
        color: [16, 185, 129],
        points: [
          'Load balancer: distributes traffic, enables horizontal scaling',
          'Cache (Redis): reduce DB load, store hot data in memory O(1)',
          'CDN: serve static assets close to users, reduce latency',
          'Message queue: decouple services, handle async operations'
        ],
        complexity: 'Know trade-offs for each component'
      },
      {
        name: 'Database Choices',
        color: [245, 158, 11],
        points: [
          'SQL: ACID, complex queries, financial data, strong consistency',
          'NoSQL (MongoDB): flexible schema, horizontal scale, JSON docs',
          'Cassandra: write-heavy, time-series, distributed, eventual consistency',
          'Redis: caching, sessions, pub/sub, sorted sets for leaderboards'
        ],
        complexity: 'Always justify your DB choice with trade-offs'
      }
    ]
  }
}

export function generateStudyGuide(weakAreas, userName) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  // Color palette
  const teal = [0, 180, 160]
  const orange = [255, 120, 50]
  const red = [180, 60, 60]
  const dark = [15, 23, 42]
  const indigo = [79, 70, 229]
  const lightGray = [248, 250, 252]

  let currentPage = 1

  function addHeader(title, subtitle) {
    // Dark header
    doc.setFillColor(...dark)
    doc.rect(0, 0, pageWidth, 55, 'F')

    // Accent line
    doc.setFillColor(...teal)
    doc.rect(0, 52, pageWidth, 3, 'F')

    // Title
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('Aptenza', 15, 22)

    doc.setFontSize(13)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...teal)
    doc.text(title, 15, 34)

    doc.setTextColor(150, 160, 180)
    doc.setFontSize(9)
    doc.text(subtitle, 15, 44)

    // Page number
    doc.setTextColor(150, 160, 180)
    doc.setFontSize(8)
    doc.text(`Page ${currentPage}`, pageWidth - 15, 44, { align: 'right' })
  }

  function addFooter() {
    doc.setFillColor(...dark)
    doc.rect(0, pageHeight - 14, pageWidth, 14, 'F')
    doc.setTextColor(150, 160, 180)
    doc.setFontSize(7)
    doc.text(`Generated for ${userName} | aptenza.vercel.app | ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 5, { align: 'center' })
  }

  function drawTopicCard(topic, yPos) {
    const cardHeight = 14 + (topic.points.length * 11) + 16

    // Check if we need a new page
    if (yPos + cardHeight > pageHeight - 20) {
      addFooter()
      doc.addPage()
      currentPage++
      addHeader('Study Guide (continued)', `Personalized for ${userName}`)
      yPos = 68
    }

    // Card background
    doc.setFillColor(...lightGray)
    doc.roundedRect(12, yPos, pageWidth - 24, cardHeight, 3, 3, 'F')

    // Left accent bar
    doc.setFillColor(...topic.color)
    doc.roundedRect(12, yPos, 4, cardHeight, 2, 2, 'F')

    // Topic name
    doc.setTextColor(...topic.color)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text(topic.name, 22, yPos + 10)

    // Complexity badge
    doc.setFillColor(...topic.color)
    doc.setFillColor(topic.color[0], topic.color[1], topic.color[2], 0.15)
    doc.setDrawColor(...topic.color)
    doc.roundedRect(pageWidth - 75, yPos + 3, 63, 10, 2, 2, 'FD')
    doc.setTextColor(...topic.color)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.text(topic.complexity, pageWidth - 43, yPos + 9.5, { align: 'center' })

    // Points
    topic.points.forEach((point, i) => {
      const py = yPos + 20 + (i * 11)

      // Bullet
      doc.setFillColor(...teal)
      doc.circle(22, py - 1.5, 1.5, 'F')

      // Text
      doc.setTextColor(...dark)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      const lines = doc.splitTextToSize(point, pageWidth - 50)
      doc.text(lines[0], 27, py)
    })

    return yPos + cardHeight + 8
  }

  // ---- COVER PAGE ----
  doc.setFillColor(...dark)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  // Geometric accent shapes
  doc.setFillColor(...teal)
  doc.circle(pageWidth - 20, 30, 40, 'F')
  doc.setFillColor(...orange)
  doc.circle(15, pageHeight - 20, 30, 'F')
  doc.setFillColor(...indigo)
  doc.rect(0, pageHeight / 2 - 2, pageWidth, 4, 'F')

  // Cover title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(32)
  doc.setFont('helvetica', 'bold')
  doc.text('STUDY', 20, 100)
  doc.setTextColor(...teal)
  doc.text('GUIDE', 20, 120)

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'normal')
  doc.text(`Personalized for ${userName}`, 20, 140)

  doc.setTextColor(150, 160, 180)
  doc.setFontSize(10)
  doc.text('Based on your Aptenza interview performance', 20, 152)
  doc.text(`Generated ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`, 20, 162)

  // Weak areas on cover
  doc.setFillColor(30, 41, 59)
  doc.roundedRect(15, 185, pageWidth - 30, 55, 5, 5, 'F')
  doc.setTextColor(...teal)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('FOCUS AREAS IN THIS GUIDE', 25, 198)

  weakAreas.forEach((area, i) => {
    const content = STUDY_CONTENT[area]
    if (!content) return
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`${content.emoji} ${content.title}`, 25, 210 + (i * 12))
  })

  doc.setTextColor(100, 116, 139)
  doc.setFontSize(8)
  doc.text('aptenza.vercel.app', pageWidth / 2, pageHeight - 15, { align: 'center' })

  // ---- CONTENT PAGES ----
  weakAreas.forEach(area => {
    const content = STUDY_CONTENT[area]
    if (!content) return

    doc.addPage()
    currentPage++
    addHeader(`${content.emoji} ${content.title}`, `Personalized study guide for ${userName}`)

    // Section intro
    doc.setFillColor(...indigo)
    doc.rect(12, 62, pageWidth - 24, 0.5, 'F')

    let yPos = 70

    content.topics.forEach(topic => {
      yPos = drawTopicCard(topic, yPos)
    })

    addFooter()
  })

  return doc
}