// A simple Hash Map based LRU-style cache for AI responses
export class ResponseCache {
  constructor(maxSize = 50) {
    this.cache = new Map() // JS Map is a hash map under the hood
    this.maxSize = maxSize
  }

  // Generate a consistent key from interview context
  _generateKey(interviewType, messageCount) {
    return `${interviewType}-${messageCount}`
  }

  // Get cached response if it exists
  get(interviewType, messageCount) {
    const key = this._generateKey(interviewType, messageCount)
    if (!this.cache.has(key)) return null

    // Move to end (most recently used) — LRU behavior
    const value = this.cache.get(key)
    this.cache.delete(key)
    this.cache.set(key, value)

    return value
  }

  // Store a response in cache
  set(interviewType, messageCount, response) {
    const key = this._generateKey(interviewType, messageCount)

    // If at capacity, remove least recently used (first item in Map)
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value
      this.cache.delete(oldestKey)
    }

    this.cache.set(key, response)
  }

  has(interviewType, messageCount) {
    return this.cache.has(this._generateKey(interviewType, messageCount))
  }

  size() {
    return this.cache.size
  }

  clear() {
    this.cache.clear()
  }
}

// Singleton instance shared across the app (server-side, per process)
export const aiResponseCache = new ResponseCache(50)