import { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import { RotateCcw, Sparkles } from 'lucide-react'

const WIDTH = 620
const HEIGHT = 430
const HIGH_SCORE_KEY = 'lexichris-pinball-best'

function playTone(context: AudioContext, frequency: number, duration = 0.055) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()
  const now = context.currentTime
  oscillator.type = 'triangle'
  oscillator.frequency.setValueAtTime(frequency, now)
  gain.gain.setValueAtTime(0.045, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(now)
  oscillator.stop(now + duration)
}

export function PinballArcade() {
  const hostRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const activeRef = useRef(false)
  const engineRef = useRef<Matter.Engine | null>(null)
  const ballRef = useRef<Matter.Body | null>(null)
  const audioRef = useRef<AudioContext | null>(null)
  const [{ score, best }, setScores] = useState(() => {
    const saved = Number(window.localStorage.getItem(HIGH_SCORE_KEY))
    return { score: 0, best: Number.isFinite(saved) ? saved : 0 }
  })
  const [launched, setLaunched] = useState(false)

  const unlockAudio = () => {
    if (!audioRef.current && typeof window.AudioContext !== 'undefined') {
      audioRef.current = new AudioContext()
    }
    if (audioRef.current?.state === 'suspended') void audioRef.current.resume()
  }


  useEffect(() => {
    if (!hostRef.current) return
    const { Engine, Render, Runner, Bodies, Composite, Events } = Matter
    const engine = Engine.create({ gravity: { x: 0, y: 0.78 } })
    engineRef.current = engine
    const render = Render.create({
      element: hostRef.current,
      engine,
      options: { width: WIDTH, height: HEIGHT, wireframes: false, background: '#070707' },
    })
    render.canvas.className = 'pinball-canvas'
    const runner = Runner.create()
    const wallStyle = { isStatic: true, render: { fillStyle: '#1e1e1e' } }
    const bumperStyle = {
      isStatic: true,
      restitution: 1.45,
      label: 'bumper',
      render: { fillStyle: '#b17b86', strokeStyle: '#f6ecde', lineWidth: 2 },
    }
    const targetStyle = {
      isStatic: true,
      restitution: 1.12,
      label: 'target',
      render: { fillStyle: '#6c7464', strokeStyle: '#e8dfd3', lineWidth: 1 },
    }
    const ball = Bodies.circle(WIDTH - 54, HEIGHT - 62, 10, {
      label: 'ball',
      restitution: 0.9,
      friction: 0.002,
      frictionAir: 0.002,
      render: { fillStyle: '#f6ecde' },
    })
    ballRef.current = ball
    Composite.add(engine.world, [
      Bodies.rectangle(WIDTH / 2, HEIGHT + 10, WIDTH, 20, wallStyle),
      Bodies.rectangle(-8, HEIGHT / 2, 16, HEIGHT, wallStyle),
      Bodies.rectangle(WIDTH + 8, HEIGHT / 2, 16, HEIGHT, wallStyle),
      Bodies.rectangle(WIDTH / 2, -8, WIDTH, 16, wallStyle),
      Bodies.rectangle(WIDTH - 96, HEIGHT - 120, 10, 220, wallStyle),
      Bodies.rectangle(178, 356, 150, 12, { ...wallStyle, angle: 0.28 }),
      Bodies.rectangle(407, 356, 150, 12, { ...wallStyle, angle: -0.28 }),
      Bodies.circle(170, 122, 28, bumperStyle),
      Bodies.circle(310, 190, 34, bumperStyle),
      Bodies.circle(452, 112, 26, bumperStyle),
      Bodies.circle(210, 292, 23, bumperStyle),
      Bodies.circle(414, 292, 23, bumperStyle),
      Bodies.rectangle(91, 208, 12, 58, { ...targetStyle, angle: -0.2 }),
      Bodies.rectangle(522, 214, 12, 58, { ...targetStyle, angle: 0.2 }),
      ball,
    ])

    const onCollision = (event: Matter.IEventCollision<Matter.Engine>) => {
      let points = 0
      event.pairs.forEach(({ bodyA, bodyB }) => {
        const labels = new Set([bodyA.label, bodyB.label])
        if (!labels.has('ball')) return
        if (labels.has('bumper')) points += 50
        if (labels.has('target')) points += 125
      })
      if (!points) return
      setScores((current) => {
        const score = current.score + points
        const best = Math.max(current.best, score)
        if (best > current.best) window.localStorage.setItem(HIGH_SCORE_KEY, String(best))
        return { score, best }
      })
      if (audioRef.current) playTone(audioRef.current, points > 100 ? 760 : 590)
    }

    Events.on(engine, 'collisionStart', onCollision)
    Render.run(render)
    Runner.run(runner, engine)
    return () => {
      Events.off(engine, 'collisionStart', onCollision)
      Render.stop(render)
      Runner.stop(runner)
      Composite.clear(engine.world, false, true)
      Engine.clear(engine)
      render.canvas.remove()
      engineRef.current = null
      ballRef.current = null
    }
  }, [])

  const placeBall = () => {
    const ball = ballRef.current
    if (!ball) return
    Matter.Body.setPosition(ball, { x: WIDTH - 54, y: HEIGHT - 62 })
    Matter.Body.setVelocity(ball, { x: 0, y: 0 })
    Matter.Body.setAngularVelocity(ball, 0)
  }

  const launch = () => {
    const ball = ballRef.current
    if (!ball) return
    unlockAudio()
    placeBall()
    Matter.Body.setVelocity(ball, { x: -5.6, y: -17.2 })
    Matter.Body.setAngularVelocity(ball, 0.12)
    navigator.vibrate?.(12)
    if (audioRef.current) playTone(audioRef.current, 330, 0.08)
    setLaunched(true)
  }

  const nudge = (direction: -1 | 1) => {
    const ball = ballRef.current
    if (!ball) return
    unlockAudio()
    Matter.Body.applyForce(ball, ball.position, { x: direction * 0.012, y: -0.006 })
    if (audioRef.current) playTone(audioRef.current, 220 + direction * 20, 0.035)
  }

  const reset = () => {
    setScores((current) => ({ ...current, score: 0 }))
    setLaunched(false)
    placeBall()
  }

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const observer = new IntersectionObserver(([entry]) => {
      activeRef.current = entry.isIntersecting
    }, { threshold: 0.2 })
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!activeRef.current) return
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        nudge(-1)
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        nudge(1)
      }
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        launch()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => () => {
    if (audioRef.current) void audioRef.current.close()
  }, [])

  return (
    <section ref={sectionRef} className="arcade-shell" aria-labelledby="arcade-title">
      <div className="arcade-kicker">hidden in plain sight</div>
      <div className="arcade-title-row">
        <div>
          <span className="arcade-label">browser pinball</span>
          <h2 id="arcade-title">space cadet</h2>
        </div>
        <div className="arcade-score" aria-live="polite">
          <div><span>score</span><strong>{score.toString().padStart(5, '0')}</strong></div>
          <div><span>best</span><strong>{best.toString().padStart(5, '0')}</strong></div>
        </div>
      </div>
      <p className="arcade-copy">Launch the ball, work the table, hit the rose bumpers for 50 and the green targets for 125. Your best score stays on this device.</p>
      <div className="pinball-stage" ref={hostRef} />
      <div className="arcade-controls" aria-label="pinball controls">
        <button type="button" onClick={() => nudge(-1)} aria-label="nudge left">left nudge</button>
        <button type="button" className="launch-control" onClick={launch}>
          <Sparkles size={16} /> {launched ? 'relaunch' : 'launch'}
        </button>
        <button type="button" onClick={() => nudge(1)} aria-label="nudge right">right nudge</button>
        <button type="button" className="reset-control" onClick={reset} aria-label="reset score">
          <RotateCcw size={15} />
        </button>
      </div>
      <p className="arcade-help">keyboard: left/right arrows to nudge · space to launch · sound unlocks on first play</p>
    </section>
  )
}
