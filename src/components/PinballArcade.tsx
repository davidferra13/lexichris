import { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import { RotateCcw, Sparkles } from 'lucide-react'

const WIDTH = 620
const HEIGHT = 430

export function PinballArcade() {
  const hostRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const ballRef = useRef<Matter.Body | null>(null)
  const [score, setScore] = useState(0)
  const [launched, setLaunched] = useState(false)

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
      Bodies.circle(170, 122, 28, bumperStyle),
      Bodies.circle(310, 190, 34, bumperStyle),
      Bodies.circle(452, 112, 26, bumperStyle),
      Bodies.circle(210, 300, 23, bumperStyle),
      Bodies.circle(414, 302, 23, bumperStyle),
      ball,
    ])
    const onCollision = (event: Matter.IEventCollision<Matter.Engine>) => {
      let hits = 0
      event.pairs.forEach(({ bodyA, bodyB }) => {
        const labels = new Set([bodyA.label, bodyB.label])
        if (labels.has('ball') && labels.has('bumper')) hits += 1
      })
      if (hits) setScore((value) => value + hits * 50)
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

  const launch = () => {
    const ball = ballRef.current
    if (!ball) return
    Matter.Body.setPosition(ball, { x: WIDTH - 54, y: HEIGHT - 62 })
    Matter.Body.setVelocity(ball, { x: -5.5, y: -17 })
    Matter.Body.setAngularVelocity(ball, 0.12)
    setLaunched(true)
  }
  const nudge = (direction: -1 | 1) => {
    const ball = ballRef.current
    if (!ball) return
    Matter.Body.applyForce(ball, ball.position, { x: direction * 0.012, y: -0.006 })
  }

  const reset = () => {
    setScore(0)
    setLaunched(false)
    launch()
  }

  return (
    <section className="arcade-shell" aria-labelledby="arcade-title">
      <div className="arcade-kicker">hidden in plain sight</div>
      <div className="arcade-title-row">
        <div>
          <span className="arcade-label">browser pinball</span>
          <h2 id="arcade-title">space cadet</h2>
        </div>
        <div className="arcade-score" aria-live="polite">
          <span>score</span>
          <strong>{score.toString().padStart(5, '0')}</strong>
        </div>
      </div>
      <p className="arcade-copy">A tiny wedding-site arcade. Launch the ball, nudge the table, chase the bumpers.</p>
      <div className="pinball-stage" ref={hostRef} />
      <div className="arcade-controls" aria-label="pinball controls">
        <button type="button" onClick={() => nudge(-1)} aria-label="nudge left">← nudge</button>
        <button type="button" className="launch-control" onClick={launch}>
          <Sparkles size={16} /> {launched ? 'launch again' : 'launch'}
        </button>
        <button type="button" onClick={() => nudge(1)} aria-label="nudge right">nudge →</button>
        <button type="button" className="reset-control" onClick={reset} aria-label="reset score">
          <RotateCcw size={15} />
        </button>
      </div>
    </section>
  )
}
