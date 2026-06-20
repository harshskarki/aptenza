class TrieNode {
  constructor() {
    this.children = {}
    this.isEndOfWord = false
    this.questionData = null
  }
}

export class Trie {
  constructor() {
    this.root = new TrieNode()
  }

  // Insert a question title into the Trie
  insert(word, data = null) {
    let node = this.root
    const lowerWord = word.toLowerCase()

    for (const char of lowerWord) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode()
      }
      node = node.children[char]
    }

    node.isEndOfWord = true
    node.questionData = data
  }

  // Search for exact word
  search(word) {
    const node = this._findNode(word.toLowerCase())
    return node !== null && node.isEndOfWord
  }

  // Get all words that start with given prefix (autocomplete)
  autocomplete(prefix, limit = 5) {
    const node = this._findNode(prefix.toLowerCase())
    if (!node) return []

    const results = []
    this._collectWords(node, prefix.toLowerCase(), results, limit)
    return results
  }

  // Helper: find node for given prefix
  _findNode(prefix) {
    let node = this.root
    for (const char of prefix) {
      if (!node.children[char]) return null
      node = node.children[char]
    }
    return node
  }

  // Helper: collect all words from a node (DFS)
  _collectWords(node, prefix, results, limit) {
    if (results.length >= limit) return

    if (node.isEndOfWord) {
      results.push({
        text: prefix,
        data: node.questionData
      })
    }

    for (const char in node.children) {
      if (results.length >= limit) return
      this._collectWords(node.children[char], prefix + char, results, limit)
    }
  }
}