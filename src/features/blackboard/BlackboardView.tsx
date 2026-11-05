import { useEffect, useRef, useState, type PointerEvent } from "react"
import { SectionHead } from "@/components/SectionHead"
import ModelPicker from "@/features/blackboard/ModelPicker"

/** Coordonnées relatives au côté du carré (0 à 1) : le tracé survit au redimensionnement. */
type Point = { x: number; y: number }
type Stroke = Point[]

/** Épaisseur du trait, relative au côté du carré. */
const STROKE_WIDTH = 0.014

/** Taille du modèle, relative au côté du carré (partagée entre ses caractères : きゃ). */
const MODEL_SIZE = 0.8

function paint(canvas: HTMLCanvasElement, strokes: Stroke[]) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  const size = canvas.width
  const color = getComputedStyle(canvas).color
  ctx.clearRect(0, 0, size, size)
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = size * STROKE_WIDTH
  ctx.lineCap = "round"
  ctx.lineJoin = "round"

  for (const stroke of strokes) {
    const [first, ...rest] = stroke
    ctx.beginPath()
    if (rest.length === 0) {
      ctx.arc(first.x * size, first.y * size, ctx.lineWidth / 2, 0, Math.PI * 2)
      ctx.fill()
      continue
    }
    ctx.moveTo(first.x * size, first.y * size)
    // Courbes passant par le milieu des segments : lisse le tracé à main levée.
    rest.forEach((point, i) => {
      const next = rest[i + 1] ?? point
      ctx.quadraticCurveTo(
        point.x * size,
        point.y * size,
        ((point.x + next.x) / 2) * size,
        ((point.y + next.y) / 2) * size,
      )
    })
    ctx.stroke()
  }
}

const ACTION_CLASS =
  "mono text-[11px] uppercase tracking-[0.08em] px-3 py-2.5 border border-line text-fog transition-colors enabled:hover:text-chalk enabled:hover:border-line-bright disabled:opacity-40"

export default function BlackboardView() {
  const boardRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const current = useRef<{ pointerId: number; stroke: Stroke } | null>(null)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [size, setSize] = useState(0)
  const [model, setModel] = useState<string | null>(null)
  const [picking, setPicking] = useState(false)

  useEffect(() => {
    const board = boardRef.current
    if (!board) return
    const observer = new ResizeObserver(() => setSize(board.clientWidth))
    observer.observe(board)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const pixels = Math.round(size * window.devicePixelRatio)
    if (canvas.width !== pixels) {
      canvas.width = pixels
      canvas.height = pixels
    }
    paint(canvas, strokes)
  }, [size, strokes])

  const toPoint = (e: { clientX: number; clientY: number }): Point => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    }
  }

  const startStroke = (e: PointerEvent<HTMLCanvasElement>) => {
    // Un seul trait à la fois : ignore un second doigt ou le clic droit.
    if (current.current || e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    current.current = { pointerId: e.pointerId, stroke: [toPoint(e)] }
    paint(e.currentTarget, [...strokes, current.current.stroke])
  }

  const extendStroke = (e: PointerEvent<HTMLCanvasElement>) => {
    if (current.current?.pointerId !== e.pointerId) return
    // Événements intermédiaires regroupés par le navigateur : garde les tracés rapides fidèles.
    const events = e.nativeEvent.getCoalescedEvents?.() ?? []
    const points = (events.length > 0 ? events : [e]).map(toPoint)
    current.current.stroke.push(...points)
    paint(e.currentTarget, [...strokes, current.current.stroke])
  }

  const endStroke = (e: PointerEvent<HTMLCanvasElement>) => {
    if (current.current?.pointerId !== e.pointerId) return
    const { stroke } = current.current
    current.current = null
    setStrokes((prev) => [...prev, stroke])
  }

  const pickModel = (char: string) => {
    setModel(char)
    setStrokes([])
    setPicking(false)
  }

  return (
    <div>
      <SectionHead title="Tableau noir" jp="黒板">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPicking(true)}
            className={ACTION_CLASS}
          >
            {model ? "Changer le modèle" : "Charger un modèle"}
          </button>
          {model && (
            <button
              type="button"
              onClick={() => setModel(null)}
              className={ACTION_CLASS}
            >
              Retirer le modèle
            </button>
          )}
          <button
            type="button"
            onClick={() => setStrokes((prev) => prev.slice(0, -1))}
            disabled={strokes.length === 0}
            className={ACTION_CLASS}
          >
            Annuler le trait
          </button>
          <button
            type="button"
            onClick={() => setStrokes([])}
            disabled={strokes.length === 0}
            className={ACTION_CLASS}
          >
            Tout effacer
          </button>
        </div>
      </SectionHead>

      <div
        ref={boardRef}
        className="relative mx-auto aspect-square w-[min(100%,max(20rem,calc(100dvh-14.5rem)))] lg:w-[min(100%,calc(100dvh-11rem))] border border-line-bright bg-panel"
      >
        <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-line-bright" />
        <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-line-bright" />
        {model && (
          // `pb` : le carré du glyphe est 0,056 em sous le centre de la ligne dans Noto Sans JP.
          <div
            aria-hidden="true"
            style={{ fontSize: (size * MODEL_SIZE) / [...model].length }}
            className="jp absolute inset-0 grid place-items-center overflow-hidden pb-[0.112em] leading-none whitespace-nowrap select-none text-chalk/20"
          >
            {model}
          </div>
        )}
        <canvas
          ref={canvasRef}
          aria-label="Grille de dessin pour tracer un kanji ou un hiragana"
          onPointerDown={startStroke}
          onPointerMove={extendStroke}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
          className="absolute inset-0 size-full touch-none cursor-crosshair text-chalk"
        />
      </div>

      {picking && (
        <ModelPicker onPick={pickModel} onClose={() => setPicking(false)} />
      )}
    </div>
  )
}
