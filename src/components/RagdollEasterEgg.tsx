import { useEffect, useRef, useState } from 'react'
import Matter from 'matter-js'
import { X } from 'lucide-react'

type Props = { open: boolean; onClose: () => void }
type Doll = {
  torso: Matter.Body
  startX: number
  bodies: Matter.Body[]
  constraints: Matter.Constraint[]
}

function makeDoll(x: number, y: number, label: string, group: number): Doll {
  const { Bodies, Constraint } = Matter
  const fill = label === 'lexi' ? '#a76a78' : '#6c7464'
  const opts = {
    collisionFilter: { group },
    render: { fillStyle: fill, strokeStyle: '#f8f2e8', lineWidth: 1 },
  }
  const head = Bodies.circle(x, y - 62, 18, opts)
  const torso = Bodies.rectangle(x, y, 34, 70, opts)
  const armL = Bodies.rectangle(x - 30, y - 8, 42, 12, opts)
  const armR = Bodies.rectangle(x + 30, y - 8, 42, 12, opts)
  const legL = Bodies.rectangle(x - 12, y + 53, 14, 54, opts)
  const legR = Bodies.rectangle(x + 12, y + 53, 14, 54, opts)
  const bodies = [head, torso, armL, armR, legL, legR]
  bodies.forEach((body) => {
    body.label = label
  })
  const joint = (bodyA: Matter.Body, bodyB: Matter.Body, pointA: Matter.Vector, pointB: Matter.Vector) =>
    Constraint.create({
      bodyA,
      bodyB,
      pointA,
      pointB,
      stiffness: 0.72,
      damping: 0.08,
      render: { visible: false },
    })
  const constraints = [
    joint(head, torso, { x: 0, y: 16 }, { x: 0, y: -34 }),
    joint(armL, torso, { x: 19, y: 0 }, { x: -16, y: -18 }),
    joint(armR, torso, { x: -19, y: 0 }, { x: 16, y: -18 }),
    joint(legL, torso, { x: 0, y: -25 }, { x: -10, y: 34 }),
    joint(legR, torso, { x: 0, y: -25 }, { x: 10, y: 34 }),
  ]
  return { torso, startX: x, bodies, constraints }
}

export function RagdollEasterEgg({ open, onClose }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [scores, setScores] = useState({ lexi: 0, chris: 0 })
  useEffect(() => {
    if (!open || !hostRef.current) return
    const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Events } = Matter
    const width = window.innerWidth
    const height = window.innerHeight
    const engine = Engine.create({ gravity: { x: 0, y: 0.72 } })
    const render = Render.create({
      element: hostRef.current,
      engine,
      options: { width, height, wireframes: false, background: '#11100f' },
    })
    const runner = Runner.create()
    const wall = { isStatic: true, render: { fillStyle: '#24211e' } }
    Composite.add(engine.world, [
      Bodies.rectangle(width / 2, height + 22, width, 44, wall),
      Bodies.rectangle(-22, height / 2, 44, height, wall),
      Bodies.rectangle(width + 22, height / 2, 44, height, wall),
    ])

    const lexi = makeDoll(width * 0.34, height * 0.38, 'lexi', -1)
    const chris = makeDoll(width * 0.66, height * 0.38, 'chris', -2)
    Composite.add(engine.world, [...lexi.bodies, ...lexi.constraints, ...chris.bodies, ...chris.constraints])
    const mouse = Mouse.create(render.canvas)
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: { stiffness: 0.12, render: { visible: false } },
    })
    Composite.add(engine.world, mouseConstraint)
    render.mouse = mouse
    const updateScore = () => {
      setScores({
        lexi: Math.round(Math.abs(lexi.torso.position.x - lexi.startX)),
        chris: Math.round(Math.abs(chris.torso.position.x - chris.startX)),
      })
    }
    Events.on(engine, 'afterUpdate', updateScore)
    Render.run(render)
    Runner.run(runner, engine)

    return () => {
      Events.off(engine, 'afterUpdate', updateScore)
      Render.stop(render)
      Runner.stop(runner)
      Composite.clear(engine.world, false, true)
      Engine.clear(engine)
      render.canvas.remove()
      render.textures = {}
    }
  }, [open])

  if (!open) return null
  return (
    <div className="ragdoll-overlay" role="dialog" aria-modal="true" aria-label="secret throw game">
      <div className="ragdoll-hud">
        <div><span>lexi</span><strong>{scores.lexi} px</strong></div>
        <p>grab + throw them. distance is tracked live.</p>
        <div><span>chris</span><strong>{scores.chris} px</strong></div>
      </div>
      <button className="ragdoll-close" onClick={onClose} aria-label="close secret game">
        <X size={22} />
      </button>
      <div className="ragdoll-canvas" ref={hostRef} />
    </div>
  )
}
