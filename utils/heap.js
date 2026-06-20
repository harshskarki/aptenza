export class MaxHeap {
  constructor() {
    this.heap = []
  }

  // Get parent/child indices
  getParentIndex(i) { return Math.floor((i - 1) / 2) }
  getLeftChildIndex(i) { return 2 * i + 1 }
  getRightChildIndex(i) { return 2 * i + 2 }

  // Insert a new item { score, data }
  insert(item) {
    this.heap.push(item)
    this._bubbleUp(this.heap.length - 1)
  }

  // Get the top item without removing
  peek() {
    return this.heap[0] || null
  }

  // Remove and return the top (highest score) item
  extractMax() {
    if (this.heap.length === 0) return null
    if (this.heap.length === 1) return this.heap.pop()

    const max = this.heap[0]
    this.heap[0] = this.heap.pop()
    this._bubbleDown(0)
    return max
  }

  // Get top N items (used for leaderboard) without destroying the heap
  getTopN(n) {
    const copy = [...this.heap]
    const tempHeap = new MaxHeap()
    tempHeap.heap = copy
    const result = []

    for (let i = 0; i < n && tempHeap.heap.length > 0; i++) {
      result.push(tempHeap.extractMax())
    }

    return result
  }

  size() {
    return this.heap.length
  }

  // Move item up until heap property is satisfied
  _bubbleUp(index) {
    while (index > 0) {
      const parentIndex = this.getParentIndex(index)
      if (this.heap[parentIndex].score >= this.heap[index].score) break

      this._swap(index, parentIndex)
      index = parentIndex
    }
  }

  // Move item down until heap property is satisfied
  _bubbleDown(index) {
    const length = this.heap.length

    while (true) {
      let largest = index
      const left = this.getLeftChildIndex(index)
      const right = this.getRightChildIndex(index)

      if (left < length && this.heap[left].score > this.heap[largest].score) {
        largest = left
      }
      if (right < length && this.heap[right].score > this.heap[largest].score) {
        largest = right
      }
      if (largest === index) break

      this._swap(index, largest)
      index = largest
    }
  }

  _swap(i, j) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]]
  }
}