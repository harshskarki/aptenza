import confetti from 'canvas-confetti'

export function fireConfetti() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#4f46e5', '#7c3aed', '#6366f1', '#a78bfa', '#ffffff']
  })
}

export function fireSchoolPride() {
  const end = Date.now() + 2000
  const colors = ['#4f46e5', '#7c3aed']

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
}

export function fireStars() {
  const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    colors: ['#4f46e5', '#7c3aed', '#a78bfa', '#fbbf24', '#ffffff']
  }

  confetti({ ...defaults, particleCount: 40, scalar: 1.2, shapes: ['star'] })
  confetti({ ...defaults, particleCount: 20, scalar: 0.75, shapes: ['circle'] })
}