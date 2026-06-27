import { aiResponseCache } from '@/utils/cache'

// Question pools — each type has 5 questions
const questionPools = {
  dsa: [
    {
      q: `**Question:** Given an array of integers, return the indices of the two numbers that add up to a target sum.\n\nFor example: nums = [2, 7, 11, 15], target = 9 → Output: [0, 1]`,
      feedback: `✅ You're thinking in the right direction.\n⚠️ Consider the time complexity — can you do better than O(n²)?\n💡 Hint: Think about using a Hash Map to store values you've seen.`
    },
    {
      q: `**Question:** Find the maximum subarray sum in an array of integers.\n\nExample: [-2, 1, -3, 4, -1, 2, 1, -5, 4] → Output: 6`,
      feedback: `✅ Good intuition on the sliding window idea.\n⚠️ Make sure you handle the case where all numbers are negative.\n💡 Hint: Kadane's algorithm runs in O(n).`
    },
    {
      q: `**Question:** Determine if a linked list has a cycle.\n\nThink about how you'd detect this without using extra space.`,
      feedback: `✅ Nice approach.\n⚠️ Think about Floyd's cycle detection (tortoise and hare) for O(1) space.\n💡 Hint: Two pointers moving at different speeds.`
    },
    {
      q: `**Question:** Reverse a singly linked list, both iteratively and recursively.`,
      feedback: `✅ Good grasp of pointer manipulation.\n⚠️ Watch out for losing reference to the next node before reassigning.\n💡 Hint: Track prev, curr, and next carefully.`
    },
    {
      q: `**Question:** Given a string, find the length of the longest substring without repeating characters.\n\nExample: "abcabcbb" → Output: 3 ("abc")`,
      feedback: `✅ Good attempt at tracking unique characters.\n⚠️ Think about how to avoid re-scanning the whole substring each time.\n💡 Hint: Sliding window with a Hash Set or Hash Map of last-seen indices.`
    }
  ],
  behavioral: [
    {
      q: `**Question:** Tell me about a time you disagreed with a teammate. How did you handle it?\n\nUse the STAR method — Situation, Task, Action, Result.`,
      feedback: `✅ Clear situation and outcome.\n⚠️ Try to be more specific about your individual role vs the team's.\n💡 Tip: Quantify the result if possible.`
    },
    {
      q: `**Question:** Describe a time you failed at something. What did you learn from it?`,
      feedback: `✅ Honest reflection — that matters a lot to interviewers.\n⚠️ Make sure you end on what you'd do differently, not just what went wrong.\n💡 Tip: Show growth, not just guilt.`
    },
    {
      q: `**Question:** Tell me about a time you had to convince someone to see things your way.`,
      feedback: `✅ Good persuasion narrative.\n⚠️ Add more detail on the other person's initial pushback.\n💡 Tip: Show you listened, not just convinced.`
    },
    {
      q: `**Question:** Describe a situation where you had to work with limited resources or tight deadlines.`,
      feedback: `✅ Solid example of prioritization.\n⚠️ Be specific about what you cut and why.\n💡 Tip: Mention the trade-offs you consciously made.`
    },
    {
      q: `**Question:** Tell me about a time you received tough feedback. How did you respond?`,
      feedback: `✅ Good maturity in handling criticism.\n⚠️ Mention a concrete change you made afterward, not just how you felt.\n💡 Tip: Interviewers want to see behavior change, not just emotional acceptance.`
    }
  ],
  system_design: [
    {
      q: `**Question:** Design a URL shortener like bit.ly. Walk me through your high-level architecture.\n\nThink about: short-code generation, storage, and redirect handling at scale.`,
      feedback: `✅ Reasonable high-level structure.\n⚠️ Consider how you'd handle collisions in short-code generation.\n💡 Hint: A Hash Map / DB index gives O(1) lookups.`
    },
    {
      q: `**Question:** Design a rate limiter for an API that handles millions of requests per day.`,
      feedback: `✅ Good grasp of the core problem.\n⚠️ Think about distributed rate limiting, not just single-server.\n💡 Hint: Token bucket or sliding window algorithms.`
    },
    {
      q: `**Question:** Design a notification system that sends emails, SMS, and push notifications.`,
      feedback: `✅ Nice separation of concerns.\n⚠️ Think about retry logic and failure handling.\n💡 Hint: A message queue decouples senders from receivers.`
    },
    {
      q: `**Question:** Design the backend for a chat application like WhatsApp.`,
      feedback: `✅ Solid grasp of real-time messaging.\n⚠️ Consider how you'd handle offline message delivery.\n💡 Hint: WebSockets + a message queue for reliability.`
    },
    {
      q: `**Question:** Design a scalable file storage system like Google Drive or Dropbox.`,
      feedback: `✅ Good breakdown of upload/download flow.\n⚠️ Think about how you'd handle large file chunking and deduplication.\n💡 Hint: Object storage (like S3) + metadata DB is a common pattern.`
    }
  ],
  domain: [
    {
      q: `**Question (ML):** Explain the bias-variance tradeoff in machine learning, with a real example.`,
      feedback: `✅ Correct understanding of the core concept.\n⚠️ Try to give a more concrete real-world example.\n💡 Tip: Mention regularization techniques like L1/L2.`
    },
    {
      q: `**Question (ML):** What's the difference between precision and recall, and when would you prioritize one over the other?`,
      feedback: `✅ Good theoretical grasp.\n⚠️ Give an example where precision matters more (e.g. spam detection) and recall matters more (e.g. disease screening).\n💡 Tip: F1 score balances both.`
    },
    {
      q: `**Question (Finance):** Walk me through how you'd value a company using discounted cash flow (DCF) analysis.`,
      feedback: `✅ Good grasp of the core DCF mechanics.\n⚠️ Be more specific about how you'd estimate the discount rate (WACC).\n💡 Tip: Mention sensitivity analysis since DCF is highly assumption-driven.`
    },
    {
      q: `**Question (Frontend):** How would you optimize a React application that's rendering slowly with a large list of items?`,
      feedback: `✅ Good awareness of the re-render problem.\n⚠️ Mention specific tools — React.memo, useMemo, virtualization libraries.\n💡 Tip: Windowing (e.g. react-window) is the standard fix for huge lists.`
    },
    {
      q: `**Question (Backend):** How would you design a database schema for a multi-tenant SaaS application?`,
      feedback: `✅ Solid grasp of multi-tenancy basics.\n⚠️ Discuss trade-offs between shared schema vs separate schema per tenant.\n💡 Tip: Mention row-level security as a middle-ground approach.`
    }
  ]
}

function getFinalFeedback(interviewType) {
  const scores = [6, 7, 7, 8]
  const score = scores[Math.floor(Math.random() * scores.length)]

  const finalFeedbacks = {
    dsa: `Great session! Here's your performance summary:\n\n**Overall Score: ${score}/10** 🎯\n\n**Strengths:**\n✅ Good problem understanding\n✅ Clear communication\n✅ Logical approach\n\n**Areas to improve:**\n⚠️ Work on optimizing time complexity\n⚠️ Practice edge case handling\n⚠️ Review common patterns (Hash Map, two pointers, sliding window)\n\nKeep practising — you're making great progress! 💪`,
    behavioral: `Great session! Here's your performance summary:\n\n**Overall Score: ${score}/10** 🎯\n\n**Strengths:**\n✅ Honest self-reflection\n✅ Good structure using STAR\n✅ Clear communication\n\n**Areas to improve:**\n⚠️ Add more measurable outcomes\n⚠️ Slow down and be more concise\n⚠️ Practice owning challenges without over-explaining\n\nKeep practising — you're making great progress! 💪`,
    system_design: `Great session! Here's your performance summary:\n\n**Overall Score: ${score}/10** 🎯\n\n**Strengths:**\n✅ Solid grasp of high-level architecture\n✅ Good awareness of scaling concerns\n✅ Logical breakdown of components\n\n**Areas to improve:**\n⚠️ Go deeper on database trade-offs\n⚠️ Discuss caching strategies explicitly\n⚠️ Consider failure scenarios and redundancy\n\nKeep practising — you're making great progress! 💪`,
    domain: `Great session! Here's your performance summary:\n\n**Overall Score: ${score}/10** 🎯\n\n**Strengths:**\n✅ Strong theoretical foundation\n✅ Clear explanations\n✅ Good awareness of trade-offs\n\n**Areas to improve:**\n⚠️ Add more real-world examples\n⚠️ Go deeper on implementation details\n⚠️ Discuss evaluation metrics more thoroughly\n\nKeep practising — you're making great progress! 💪`
  }

  return finalFeedbacks[interviewType] || finalFeedbacks.dsa
}

// Track which question indices have already been used in THIS conversation,
// by reading them back out of the assistant messages already sent.
function getUnaskedQuestionIndex(pool, previousMessages) {
  const askedTexts = previousMessages
    .filter(m => m.role === 'assistant')
    .map(m => m.content)

  const unaskedIndices = pool
    .map((_, idx) => idx)
    .filter(idx => !askedTexts.some(text => text.includes(pool[idx].q)))

  if (unaskedIndices.length === 0) {
    // fallback — shouldn't happen since we stop after 5 questions
    return Math.floor(Math.random() * pool.length)
  }

  return unaskedIndices[Math.floor(Math.random() * unaskedIndices.length)]
}

export async function POST(request) {
  const { interviewType, isStart, messages } = await request.json()
  const pool = questionPools[interviewType] || questionPools.dsa

  // Count how many questions have been asked so far (each assistant message with a "**Question" counts)
  const questionsAskedSoFar = (messages || []).filter(
    m => m.role === 'assistant' && m.content.includes('**Question')
  ).length

  let responseMessage

  if (isStart) {
    const greetings = {
      dsa: `Hi! I'm your AI interviewer for today's DSA session. Let's get started!\n\n`,
      behavioral: `Hi! I'm your AI interviewer for today's Behavioral session. Let's get started!\n\n`,
      system_design: `Hi! I'm your AI interviewer for today's System Design session. Let's get started!\n\n`,
      domain: `Hi! I'm your AI interviewer for today's Domain Specific session. Let's get started!\n\n`
    }
    const idx = getUnaskedQuestionIndex(pool, [])
    responseMessage = (greetings[interviewType] || greetings.dsa) + pool[idx].q
  } else if (questionsAskedSoFar >= 5) {
    // Already asked all 5 — give final feedback
    responseMessage = getFinalFeedback(interviewType)
  } else {
    // Give feedback on previous answer + ask next unasked question
    const lastQuestionIdx = pool.findIndex(item =>
      messages[messages.length - 2]?.content === undefined
        ? false
        : false
    )
    // Find feedback matching the most recently asked question
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant')
    const matchedQuestion = pool.find(item => lastAssistantMsg?.content.includes(item.q))
    const feedbackText = matchedQuestion ? matchedQuestion.feedback : `✅ Good attempt — let's keep going.`

    const idx = getUnaskedQuestionIndex(pool, messages)
    const isLast = questionsAskedSoFar === 4

    responseMessage = `${feedbackText}\n\n${isLast ? "Last question!" : "Ready for the next question?"}\n\n${pool[idx].q}`
  }

  return Response.json({ message: responseMessage, cached: false })
}