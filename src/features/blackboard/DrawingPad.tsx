import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react"
import {
  drawStrokes,
  MODEL_SIZE,
  type Point,
  type Stroke,
} from "@/features/blackboard/traceScore"

function paint(canvas: HTMLCanvasElement, strokes: Stroke[]) {
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  const color = getComputedStyle(canvas).color
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = color
  ctx.fillStyle = color
  drawStrokes(ctx, strokes, canvas.width)
}

/**
 * Grille carrée de dessin à main levée (tableau noir, exercices de tracé).
 * Les traits sont contrôlés par le parent : `onStroke` est appelé à la fin de chaque trait.
 */
export default function DrawingPad({
  strokes,
  onStroke,
  model,
  diff,
  disabled,
  className = "",
  children,
}: {
  strokes: Stroke[]
  onStroke: (stroke: Stroke) => void
  /** Caractère affiché en filigrane sous le tracé. */
  model?: string | null
  /** Image des écarts (`TraceScore.diff`) superposée au tracé. */
  diff?: ImageData | null
  /** Fige le tracé (réponse validée). */
  disabled?: boolean
  /** Taille du carré (largeur ; la hauteur suit). */
  className?: string
  /** Éléments superposés à la grille (score…). */
  children?: ReactNode
}) {
  const boardRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const diffRef = useRef<HTMLCanvasElement>(null)
  const current = useRef<{ pointerId: number; stroke: Stroke } | null>(null)
  const [size, setSize] = useState(0)

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

  useEffect(() => {
    const canvas = diffRef.current
    if (!canvas || !diff) return
    canvas.width = diff.width
    canvas.height = diff.height
    canvas.getContext("2d")?.putImageData(diff, 0, 0)
  }, [diff])

  const toPoint = (e: { clientX: number; clientY: number }): Point => {
    const rect = canvasRef.current!.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    }
  }

  const startStroke = (e: PointerEvent<HTMLCanvasElement>) => {
    // Un seul trait à la fois : ignore un second doigt ou le clic droit.
    if (disabled || current.current || e.button !== 0) return
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
    onStroke(stroke)
  }

  return (
    <div
      ref={boardRef}
      className={`relative aspect-square border border-line-bright bg-panel ${className}`}
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
      {diff && (
        <canvas
          ref={diffRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full opacity-70"
        />
      )}
      <canvas
        ref={canvasRef}
        aria-label="Grille de dessin pour tracer un kanji ou un kana"
        onPointerDown={startStroke}
        onPointerMove={extendStroke}
        onPointerUp={endStroke}
        onPointerCancel={endStroke}
        className={`absolute inset-0 size-full touch-none text-chalk ${
          disabled ? "" : "cursor-crosshair"
        }`}
      />
      {children}
    </div>
  )
}
