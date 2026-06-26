import { aiResponseCache } from '@/utils/cache'

// Question pools — each type has multiple questions to randomly pick from
const questionPools = {
  dsa: [
    {
      q: `**Question 1:** Given an array of integers, return the indices of the two numbers that add up to a target sum.\n\nFor example: nums = [2, 7, 11, 15], target = 9 → Output: [0, 1]`,
      feedback: `✅ You're thinking in the right direction.\n⚠️ Consider the time complexity — can you do better than O(n²)?\n💡 Hint: Think about using a Hash Map to store values you've seen.`
    },
    {
      q: `**Question 1:** Find the maximum subarray sum in an array of integers.\n\nExample: [-2, 1, -3, 4, -1, 2, 1, -5, 4] → Output: 6`,
      feedback: `✅ Good intuition on the sliding window idea.\n⚠️ Make sure you handle the case where all numbers are negative.\n💡 Hint: Kadane's algorithm runs in O(n).`
    },
    {
      q: `**Question 1:** Determine if a linked list has a cycle.\n\nThink about how you'd detect this without using extra space.`,
      feedback: `✅ Nice approach.\n⚠️ Think about Floyd's cycle detection (tortoise and hare) for O(1) space.\n💡 Hint: Two pointers moving at different speeds.`
    },
    {
      q: `**Question 1:** Reverse a singly linked list, both iteratively and recursively.`,
      feedback: `✅ Good grasp of pointer manipulation.\n⚠️ Watch out for losing reference to the next node before reassigning.\n💡 Hint: Track prev, curr, and next carefully.`
    }
  ],
  behavioral: [
    {
      q: `**Question 1:** Tell me about a time you disagreed with a teammate. How did you handle it?\n\nUse the STAR method — Situation, Task, Action, Result.`,
      feedback: `✅ Clear situation and outcome.\n⚠️ Try to be more specific about your individual role vs the team's.\n💡 Tip: Quantify the result if possible.`
    },
    {
      q: `**Question 1:** Describe a time you failed at something. What did you learn from it?`,
      feedback: `✅ Honest reflection — that matters a lot to interviewers.\n⚠️ Make sure you end on what you'd do differently, not just what went wrong.\n💡 Tip: Show growth, not just guilt.`
    },
    {
      q: `**Question 1:** Tell me about a time you had to convince someone to see things your way.`,
      feedback: `✅ Good persuasion narrative.\n⚠️ Add more detail on the other person's initial pushback.\n💡 Tip: Show you listened, not just convinced.`
    },
    {
      q: `**Question 1:** Describe a situation where you had to work with limited resources or tight deadlines.`,
      feedback: `✅ Solid example of prioritization.\n⚠️ Be specific about what you cut and why.\n💡 Tip: Mention the trade-offs you consciously made.`
    }
  ],
  system_design: [
    {
      q: `**Question 1:** Design a URL shortener like bit.ly. Walk me through your high-level architecture.\n\nThink about: short-code generation, storage, and redirect handling at scale.`,
      feedback: `✅ Reasonable high-level structure.\n⚠️ Consider how you'd handle collisions in short-code generation.\n💡 Hint: A Hash Map / DB index gives O(1) lookups.`
    },
    {
      q: `**Question 1:** Design a rate limiter for an API that handles millions of requests per day.`,
      feedback: `✅ Good grasp of the core problem.\n⚠️ Think about distributed rate limiting, not just single-server.\n💡 Hint: Token bucket or sliding window algorithms.`
    },
    {
      q: `**Question 1:** Design a notification system that sends emails, SMS, and push notifications.`,
      feedback: `✅ Nice separation of concerns.\n⚠️ Think about retry logic and failure handling.\n💡 Hint: A message queue decouples senders from receivers.`
    },
    {
      q: `**Question 1:** Design the backend for a chat application like WhatsApp.`,
      feedback: `✅ Solid grasp of real-time messaging.\n⚠️ Consider how you'd handle offline message delivery.\n💡 Hint: WebSockets + a message queue for reliability.`
    }
  ],
  domain: [
    {
      q: `**Question 1:** Explain the bias-variance tradeoff in machine learning, with a real example.`,
      feedback: `✅ Correct understanding of the core concept.\n⚠️ Try to give a more concrete real-world example.\n💡 Tip: Mention regularization techniques like L1/L2.`
    },
    {
      q: `**Question 1:** What's the difference between precision and recall, and when would you prioritize one over the other?`,
      feedback: `✅ Good theoretical grasp.\n⚠️ Give an example where precision matters more (e.g. spam detection) and recall matters more (e.g. disease screening).\n💡 Tip: F1 score balances both.`
    },
    {
      q: `**Question 1:** How would you handle an imbalanced dataset in a classification problem?`,
      feedback: `✅ Solid awareness of the problem.\n⚠️ Mention specific techniques: oversampling, undersampling, SMOTE, class weights.\n💡 Tip: Also consider better evaluation metrics, not just accuracy.`
    },
    {
      q: `**Question 1:** Explain how a transformer model's attention mechanism works, at a high level.`,
      feedback: `✅ Good high-level understanding.\n⚠️ Try to clarify the difference between self-attention and cross-attention.\n💡 Tip: Mention query, key, value vectors.`
    }
  ]
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getFinalFeedback(interviewType) {
  const scores = [6, 7, 7, 8]
  const score = pickRandom(scores)

  const finalFeedbacks = {
    dsa: `Great session! Here's your performance summary:\n\n**Overall Score: ${score}/10** 🎯\n\n**Strengths:**\n✅ Good problem understanding\n✅ Clear communication\n✅ Logical approach\n\n**Areas to improve:**\n⚠️ Work on optimizing time complexity\n⚠️ Practice edge case handling\n⚠️ Review common patterns (Hash Map, two pointers, sliding window)\n\nKeep practising — you're making great progress! 💪`,
    behavioral: `Great session! Here's your performance summary:\n\n**Overall Score: ${score}/10** 🎯\n\n**Strengths:**\n✅ Honest self-reflection\n✅ Good structure using STAR\n✅ Clear communication\n\n**Areas to improve:**\n⚠️ Add more measurable outcomes\n⚠️ Slow down and be more concise\n⚠️ Practice owning challenges without over-explaining\n\nKeep practising — you're making great progress! 💪`,
    system_design: `Great session! Here's your performance summary:\n\n**Overall Score: ${score}/10** 🎯\n\n**Strengths:**\n✅ Solid grasp of high-level architecture\n✅ Good awareness of scaling concerns\n✅ Logical breakdown of components\n\n**Areas to improve:**\n⚠️ Go deeper on database trade-offs\n⚠️ Discuss caching strategies explicitly\n⚠️ Consider failure scenarios and redundancy\n\nKeep practising — you're making great progress! 💪`,
    domain: `Great session! Here's your performance summary:\n\n**Overall Score: ${score}/10** 🎯\n\n**Strengths:**\n✅ Strong theoretical foundation\n✅ Clear explanations\n✅ Good awareness of trade-offs\n\n**Areas to improve:**\n⚠️ Add more real-world examples\n⚠️ Go deeper on implementation details\n⚠️ Discuss evaluation metrics more thoroughly\n\nKeep practising — you're making great progress! 💪`
  }

  return finalFeedbacks[interviewType] || finalFeedbacks.dsa
}

export async function POST(request) {
  const { interviewType, isStart, messages } = await request.json()
  const messageCount = messages?.length || 0
  const pool = questionPools[interviewType] || questionPools.dsa

  // Note: caching is intentionally skipped for variety —
  // randomized mock responses shouldn't be cached or they'd lose their purpose
  let responseMessage

  if (isStart) {
    const greetings = {
      dsa: `Hi! I'm your AI interviewer for today's DSA session. Let's get started!\n\n`,
      behavioral: `Hi! I'm your AI interviewer for today's Behavioral session. Let's get started!\n\n`,
      system_design: `Hi! I'm your AI interviewer for today's System Design session. Let's get started!\n\n`,
      domain: `Hi! I'm your AI interviewer for today's Domain Specific session. Let's get started!\n\n`
    }
    const picked = pickRandom(pool)
    responseMessage = (greetings[interviewType] || greetings.dsa) + picked.q
  } else if (messageCount <= 2) {
    const picked = pickRandom(pool)
    responseMessage = `${picked.feedback}\n\nReady for the next question?\n\n${picked.q}`
  } else if (messageCount <= 4) {
    const picked = pickRandom(pool)
    responseMessage = `${picked.feedback}\n\nLet's try one more.\n\n${picked.q}`
  } else {
    responseMessage = getFinalFeedback(interviewType)
  }

  return Response.json({ message: responseMessage, cached: false })
}