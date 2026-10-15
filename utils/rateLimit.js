// In-memory rate limiter using Hash Map
// In production, replace with Redis (Upstash)

const rateLimitMap = new Map()

export function rateLimit({
  windowMs = 60 * 1000, // 1 minute window
  max = 10              // max requests per window
}) {
  return function check(identifier) {
    const now = Date.now()
    const windowStart = now - windowMs

    // Get or create entry for this identifier
    if (!rateLimitMap.has(identifier)) {
      rateLimitMap.set(identifier, [])
    }

    // Clean up old requests outside the window
    const requests = rateLimitMap
      .get(identifier)
      .filter(timestamp => timestamp > windowStart)

    // Check if limit exceeded
    if (requests.length >= max) {
      const oldestRequest = Math.min(...requests)
      const resetTime = Math.ceil((oldestRequest + windowMs - now) / 1000)
      return {
        success: false,
        limit: max,
        remaining: 0,
        resetInSeconds: resetTime
      }
    }

    // Add current request
    requests.push(now)
    rateLimitMap.set(identifier, requests)

    return {
      success: true,
      limit: max,
      remaining: max - requests.length,
      resetInSeconds: null
    }
  }
}

// Clean up old entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [key, timestamps] of rateLimitMap.entries()) {
    const valid = timestamps.filter(t => now - t < 5 * 60 * 1000)
    if (valid.length === 0) {
      rateLimitMap.delete(key)
    } else {
      rateLimitMap.set(key, valid)
    }
  }
}, 5 * 60 * 1000)