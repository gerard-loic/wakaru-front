import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
} from "react"
import {
  IconEraser,
  IconEye,
  IconEyeOff,
  IconSwap,
  IconTemplate,
  IconTrash,
  IconUndo,
} from "@/components/icons"
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

function ToolGroup({
  label,
  jp,
  aside,
  children,
}: {
  label: string
  jp: string
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <div role="group" aria-label={label} className="min-w-0">
      <div className="mb-1.5 flex items-baseline gap-2">
        <span className="mono text-[10px] uppercase tracking-[0.14em] text-fog">
          {label}
        </span>
        <span className="jp text-[11px] text-fog/60">{jp}</span>
        {aside}
      </div>
      <div className="flex divide-x divide-line border border-line bg-panel">
        {children}
      </div>
    </div>
  )
}

function ToolButton({
  icon,
  label,
  onClick,
  disabled,
  pressed,
  danger,
}: {
  icon: ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  pressed?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      className={`group flex flex-1 items-center justify-center gap-2 px-3 py-2.5 mono text-[11px] uppercase tracking-[0.08em] whitespace-nowrap transition-colors disabled:opacity-35 enabled:hover:bg-panel-2 ${
        pressed
          ? "text-ember"
          : danger
            ? "text-fog enabled:hover:text-ember-soft"
            : "text-fog enabled:hover:text-chalk"
      }`}
    >
      <span
        className={`size-4 shrink-0 transition-colors ${
          pressed ? "" : "text-fog/70 group-enabled:group-hover:text-current"
        }`}
      >
        {icon}
      </span>
      {label}
    </button>
  )
}

export default function BlackboardView() {
  const boardRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const current = useRef<{ pointerId: number; stroke: Stroke } | null>(null)
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [size, setSize] = useState(0)
  const [model, setModel] = useState<string | null>(null)
  const [picking, setPicking] = useState(false)
  const [modelHidden, setModelHidden] = useState(false)

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
    setModelHidden(false)
    setStrokes([])
    setPicking(false)
  }

  return (
    <div>
      <SectionHead title="Tableau noir" jp="黒板">
        <div className="grid gap-4 sm:flex sm:items-end">
          <ToolGroup
            label="Modèle"
            jp="手本"
            aside={
              model && (
                <span className="jp ml-auto text-[12px] leading-none text-chalk/80">
                  {model}
                </span>
              )
            }
          >
            <ToolButton
              icon={model ? <IconSwap /> : <IconTemplate />}
              label={model ? "Changer" : "Charger"}
              onClick={() => setPicking(true)}
            />
            {model && (
              <>
                <ToolButton
                  icon={modelHidden ? <IconEyeOff /> : <IconEye />}
                  label={modelHidden ? "Afficher" : "Masquer"}
                  onClick={() => setModelHidden((prev) => !prev)}
                  pressed={modelHidden}
                />
                <ToolButton
                  icon={<IconTrash />}
                  label="Retirer"
                  onClick={() => setModel(null)}
                  danger
                />
              </>
            )}
          </ToolGroup>
          <ToolGroup label="Tracé" jp="筆">
            <ToolButton
              icon={<IconUndo />}
              label="Annuler"
              onClick={() => setStrokes((prev) => prev.slice(0, -1))}
              disabled={strokes.length === 0}
            />
            <ToolButton
              icon={<IconEraser />}
              label="Effacer"
              onClick={() => setStrokes([])}
              disabled={strokes.length === 0}
              danger
            />
          </ToolGroup>
        </div>
      </SectionHead>

      <div
        ref={boardRef}
        className="relative mx-auto aspect-square w-[min(100%,max(20rem,calc(100dvh-14.5rem)))] lg:w-[min(100%,calc(100dvh-11rem))] border border-line-bright bg-panel"
      >
        <div className="absolute inset-y-0 left-1/2 border-l border-dashed border-line-bright" />
        <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-line-bright" />
        {model && !modelHidden && (
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
