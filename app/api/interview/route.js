export async function POST(request) {
  const { interviewType, isStart, messages } = await request.json()

  if (isStart) {
    return Response.json({
      message: `Hi! I'm your AI interviewer for today's ${interviewType} session. Let's get started!\n\nHere's your first question:\n\n**Question 1:** Given an array of integers, return the indices of the two numbers that add up to a target sum.\n\nFor example: nums = [2, 7, 11, 15], target = 9 → Output: [0, 1]\n\nTake your time and explain your thought process as you go.`
    })
  }

  const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || ''

  if (messages.length <= 2) {
    return Response.json({
      message: `Good attempt! Here are some thoughts on your answer:\n\n✅ You're thinking in the right direction.\n⚠️ Consider the time complexity — can you do better than O(n²)?\n💡 Hint: Think about using a Hash Map to store values you've seen.\n\nReady for the next question?\n\n**Question 2:** Find the maximum subarray sum in an array of integers.\n\nExample: [-2, 1, -3, 4, -1, 2, 1, -5, 4] → Output: 6`
    })
  }

  if (messages.length <= 4) {
    return Response.json({
      message: `Nice work! Let's try one more.\n\n**Question 3:** Check if a string is a valid palindrome, ignoring non-alphanumeric characters.\n\nExample: "A man, a plan, a canal: Panama" → true`
    })
  }

  return Response.json({
    message: `Great session! Here's your performance summary:\n\n**Overall Score: 7/10** 🎯\n\n**Strengths:**\n✅ Good problem understanding\n✅ Clear communication\n✅ Logical approach\n\n**Areas to improve:**\n⚠️ Work on optimizing time complexity\n⚠️ Practice edge case handling\n⚠️ Review Hash Map patterns\n\nKeep practising — you're making great progress! 💪`
  })
}