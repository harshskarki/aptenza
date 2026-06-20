// A classic FIFO Queue implementation
export class Queue {
  constructor() {
    this.items = []
  }

  // Add item to the back of the queue
  enqueue(item) {
    this.items.push(item)
  }

  // Remove and return item from the front of the queue
  dequeue() {
    if (this.isEmpty()) return null
    return this.items.shift()
  }

  // Look at the front item without removing it
  peek() {
    if (this.isEmpty()) return null
    return this.items[0]
  }

  isEmpty() {
    return this.items.length === 0
  }

  size() {
    return this.items.length
  }

  // Get all items in order (for display)
  toArray() {
    return [...this.items]
  }

  // Remove a specific item by id
  remove(id) {
    this.items = this.items.filter(item => item.id !== id)
  }

  clear() {
    this.items = []
  }
}