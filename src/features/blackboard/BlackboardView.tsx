import { useState, type ReactNode } from "react"
import {
  IconEraser,
  IconEye,
  IconEyeOff,
  IconSwap,
  IconTarget,
  IconTemplate,
  IconTrash,
  IconUndo,
} from "@/components/icons"
import { SectionHead } from "@/components/SectionHead"
import DrawingPad from "@/features/blackboard/DrawingPad"
import ModelPicker from "@/features/blackboard/ModelPicker"
import {
  scoreTrace,
  type Stroke,
  type TraceScore,
} from "@/features/blackboard/traceScore"

/** Résultat de vérification, lié au tracé et au modèle évalués : périmé dès que l'un change. */
type Check = { model: string; strokes: Stroke[]; result: TraceScore }

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
  const [strokes, setStrokes] = useState<Stroke[]>([])
  const [model, setModel] = useState<string | null>(null)
  const [picking, setPicking] = useState(false)
  const [modelHidden, setModelHidden] = useState(false)
  const [check, setCheck] = useState<Check | null>(null)
  const [checking, setChecking] = useState(false)

  const result =
    check && check.model === model && check.strokes === strokes
      ? check.result
      : null

  const verify = async () => {
    if (!model || strokes.length === 0) return
    setChecking(true)
    try {
      setCheck({ model, strokes, result: await scoreTrace(model, strokes) })
    } finally {
      setChecking(false)
    }
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
              icon={<IconTarget />}
              label="Vérifier"
              onClick={verify}
              disabled={!model || strokes.length === 0 || checking}
              pressed={result !== null}
            />
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

      <DrawingPad
        strokes={strokes}
        onStroke={(stroke) => setStrokes((prev) => [...prev, stroke])}
        model={modelHidden ? null : model}
        diff={result?.diff}
        className="mx-auto w-[min(100%,max(20rem,calc(100dvh-14.5rem)))] lg:w-[min(100%,calc(100dvh-11rem))]"
      >
        {result && (
          <div
            role="status"
            className="pointer-events-none absolute left-2 top-2 border border-line-bright bg-panel/90 px-3 py-2"
          >
            <div className="flex items-baseline gap-2">
              <span className="display text-3xl leading-none text-ember">
                {result.score}
                <span className="text-lg">%</span>
              </span>
              <span className="jp text-[11px] text-fog/60">一致</span>
            </div>
            <div className="mono mt-1.5 text-[10px] uppercase tracking-[0.1em] text-fog">
              Précision {result.precision} % · Couverture {result.coverage} %
            </div>
          </div>
        )}
      </DrawingPad>

      {picking && (
        <ModelPicker onPick={pickModel} onClose={() => setPicking(false)} />
      )}
    </div>
  )
}
