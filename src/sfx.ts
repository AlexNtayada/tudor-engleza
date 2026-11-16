// Tiny synthesized sound effects (no audio files needed).

let ctx: AudioContext | undefined

function ac(): AudioContext | undefined {
  try {
    ctx ??= new AudioContext()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return undefined
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.18) {
  const c = ac()
  if (!c) return
  const t = c.currentTime + start
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(vol, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  o.connect(g).connect(c.destination)
  o.start(t)
  o.stop(t + dur + 0.05)
}

export const sfx = {
  tap: () => tone(660, 0, 0.08, 'triangle', 0.1),
  correct: () => {
    tone(784, 0, 0.18, 'triangle')
    tone(1175, 0.12, 0.3, 'triangle')
  },
  wrong: () => {
    tone(330, 0, 0.15, 'sine', 0.14)
    tone(262, 0.12, 0.25, 'sine', 0.14)
  },
  pop: () => {
    const c = ac()
    if (!c) return
    const len = 0.12
    const buf = c.createBuffer(1, c.sampleRate * len, c.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 3
    const src = c.createBufferSource()
    const g = c.createGain()
    g.gain.value = 0.35
    src.buffer = buf
    src.connect(g).connect(c.destination)
    src.start()
  },
  fanfare: () => {
    ;[523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.13, 0.35, 'triangle', 0.16))
    tone(1319, 0.6, 0.6, 'triangle', 0.14)
  },
  unlock: () => ac(),
}
