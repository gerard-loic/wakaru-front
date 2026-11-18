/**
 * Compare le tracé de l'utilisateur à la forme du modèle (glyphe de la police).
 *
 * Le tracé est d'abord recentré et remis à l'échelle du modèle (les
 * proportions peuvent un peu varier) : seule la forme compte, pas la position
 * ni la taille.
 * Les deux sont ensuite rasterisés sur une petite grille puis réduits à leur ligne
 * centrale (squelette) : un trait fin et un trait épais de la police deviennent
 * comparables. Chaque point est jugé sur son écart à l'autre ligne : plein
 * crédit jusqu'à `TOLERANCE`, crédit dégressif jusqu'à `MAX_TOLERANCE`.
 * On mesure ensuite :
 * - la précision : part du tracé proche du modèle, pénalisée si le tracé est
 *   nettement plus long que le modèle (gribouillis) ;
 * - la couverture : part du modèle approchée par le tracé.
 * Le score est leur moyenne harmonique : gribouiller partout ou ne tracer
 * qu'un point bien placé donnent tous deux un score faible.
 *
 * Ne juge ni l'ordre, ni le sens, ni le nombre des traits.
 */

/** Coordonnées relatives au côté du carré (0 à 1) : le tracé survit au redimensionnement. */
export type Point = { x: number; y: number }
export type Stroke = Point[]

/** Épaisseur du trait, relative au côté du carré. */
export const STROKE_WIDTH = 0.014

/** Taille du modèle, relative au côté du carré (partagée entre ses caractères : きゃ). */
export const MODEL_SIZE = 0.8

/** Côté de la grille de comparaison, en pixels. */
const GRID = 128

/** Écart (relatif au côté) entre la ligne centrale du tracé et celle du modèle compté comme exact. */
const TOLERANCE = 0.03

/** Écart (relatif au côté) au-delà duquel un point ne rapporte plus rien. */
const MAX_TOLERANCE = 0.07

/** Variation de proportions (largeur / hauteur) admise entre le tracé et le modèle. */
const ASPECT_SLACK = 1.3

/** Branches du squelette du modèle plus courtes que ceci (px de grille) : artefacts de la police, ignorés. */
const SPUR_LENGTH = 6

/** Longueur de tracé admise, en multiple de celle du modèle, avant de pénaliser la précision. */
const LENGTH_SLACK = 1.5

/** Épaisseur minimale de l'encre sur la grille (px) : un trait plus fin y disparaîtrait. */
const MIN_INK_WIDTH = 3

/** Facteurs de mise à l'échelle admis pour caler le tracé sur le modèle. */
const MIN_SCALE = 0.4
const MAX_SCALE = 2.5

/** En dessous de cette taille (relative au côté), le tracé n'est pas remis à l'échelle. */
const MIN_INK_SIZE = 0.03

/** Distance (relative au côté) au-delà de laquelle une zone est signalée dans l'image de différence. */
const DIFF_TOLERANCE = 0.05

/** Score minimal pour qu'un tracé soit considéré comme juste (exercices de dessin). */
export const PASS_SCORE = 70

/**
 * Part minimale de chaque partie séparée du modèle (trait détaché, dakuten,
 * rond du handakuten) à couvrir : ces petites marques pèsent peu dans le score
 * global mais changent le caractère (か / が, は / ぱ).
 */
const MIN_PART_COVERAGE = 0.35

/** Taille minimale (px de grille) d'une partie du modèle pour être exigée. */
const MIN_PART_SIZE = 4

/** Couleurs RGBA de l'image de différence (ember, ember-soft). */
const STRAY_COLOR = [255, 106, 26, 255]
const MISSING_COLOR = [255, 138, 76, 110]

/** Carré du glyphe dans Noto Sans JP, si le navigateur ne fournit pas `emHeightAscent`. */
const EM_ASCENT = 0.88

export type TraceScore = {
  /** Score global, de 0 à 100. */
  score: number
  precision: number
  coverage: number
  /** Chaque partie séparée du modèle est suffisamment couverte. */
  complete: boolean
  /** Tracé jugé juste : score suffisant et aucune partie oubliée. */
  passed: boolean
  /** Image GRID×GRID : encre hors modèle et parties du modèle non couvertes. */
  diff: ImageData
}

export function drawStrokes(
  ctx: CanvasRenderingContext2D,
  strokes: Stroke[],
  size: number,
  lineWidth = size * STROKE_WIDTH,
) {
  ctx.lineWidth = lineWidth
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

function modelFont(model: string, size: number) {
  return `${(size * MODEL_SIZE) / [...model].length}px "Noto Sans JP"`
}

function createContext() {
  const canvas = document.createElement("canvas")
  canvas.width = GRID
  canvas.height = GRID
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) throw new Error("Canvas 2D indisponible")
  ctx.fillStyle = "#000"
  ctx.strokeStyle = "#000"
  return ctx
}

function toMask(ctx: CanvasRenderingContext2D) {
  const { data } = ctx.getImageData(0, 0, GRID, GRID)
  const mask = new Uint8Array(GRID * GRID)
  for (let i = 0; i < mask.length; i++) mask[i] = data[i * 4 + 3] > 127 ? 1 : 0
  return mask
}

/** Rasterise le modèle comme l'affiche le tableau : carré du glyphe centré dans la grille. */
function modelMask(model: string) {
  const ctx = createContext()
  ctx.font = modelFont(model, GRID)
  ctx.textAlign = "center"
  ctx.textBaseline = "alphabetic"
  const metrics = ctx.measureText(model)
  const em = (GRID * MODEL_SIZE) / [...model].length
  const ascent = metrics.emHeightAscent ?? em * EM_ASCENT
  const descent = metrics.emHeightDescent ?? em * (1 - EM_ASCENT)
  ctx.fillText(model, GRID / 2, GRID / 2 + (ascent - descent) / 2)
  return toMask(ctx)
}

type Box = { cx: number; cy: number; w: number; h: number; size: number }

/** Centre et côtés (en pixels de grille) du rectangle englobant des points. */
function boundingBox(points: Iterable<{ x: number; y: number }>): Box | null {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const { x, y } of points) {
    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
  }
  if (minX > maxX) return null
  return {
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
    w: maxX - minX,
    h: maxY - minY,
    size: Math.max(maxX - minX, maxY - minY),
  }
}

function* maskPoints(mask: Uint8Array) {
  for (let i = 0; i < mask.length; i++)
    if (mask[i]) yield { x: (i % GRID) + 0.5, y: Math.floor(i / GRID) + 0.5 }
}

/**
 * Transformation (en pixels de grille) qui cale le tracé sur le modèle :
 * translation, puis échelle par axe, bornée autour de l'échelle uniforme
 * (un caractère un peu trop étroit ou trop large reste reconnaissable).
 */
function fitTransform(strokes: Stroke[], targetLine: Uint8Array) {
  const ink = boundingBox(
    strokes.flat().map((p) => ({ x: p.x * GRID, y: p.y * GRID })),
  )
  const target = boundingBox(maskPoints(targetLine))
  if (!ink || !target) return (x: number, y: number) => ({ x, y })
  const scale =
    ink.size < MIN_INK_SIZE * GRID
      ? 1
      : Math.min(MAX_SCALE, Math.max(MIN_SCALE, target.size / ink.size))
  // Un axe presque plat (一, ノ) ne donne pas d'échelle fiable : on garde l'échelle uniforme.
  const axisScale = (inkSide: number, targetSide: number) =>
    scale === 1 || inkSide < ink.size / 4 || targetSide < ink.size / 4
      ? scale
      : Math.min(scale * ASPECT_SLACK, Math.max(scale / ASPECT_SLACK, targetSide / inkSide))
  const sx = axisScale(ink.w, target.w)
  const sy = axisScale(ink.h, target.h)
  return (x: number, y: number) => ({
    x: (x - ink.cx) * sx + target.cx,
    y: (y - ink.cy) * sy + target.cy,
  })
}

function strokesMask(strokes: Stroke[]) {
  const ctx = createContext()
  drawStrokes(ctx, strokes, GRID, Math.max(GRID * STROKE_WIDTH, MIN_INK_WIDTH))
  return toMask(ctx)
}

/** Amincissement de Zhang-Suen : réduit chaque trait à une ligne d'un pixel. */
function skeleton(mask: Uint8Array) {
  const img = mask.slice()
  const at = (x: number, y: number) => img[y * GRID + x]
  for (let changed = true; changed; ) {
    changed = false
    for (const pass of [0, 1]) {
      const removed: number[] = []
      for (let y = 1; y < GRID - 1; y++) {
        for (let x = 1; x < GRID - 1; x++) {
          if (!at(x, y)) continue
          // Voisins dans le sens horaire, en partant du haut.
          const n = [
            at(x, y - 1),
            at(x + 1, y - 1),
            at(x + 1, y),
            at(x + 1, y + 1),
            at(x, y + 1),
            at(x - 1, y + 1),
            at(x - 1, y),
            at(x - 1, y - 1),
          ]
          const neighbours = n.reduce((sum, v) => sum + v, 0)
          let transitions = 0
          for (let k = 0; k < 8; k++) if (!n[k] && n[(k + 1) % 8]) transitions++
          const a = pass === 0 ? n[0] * n[2] * n[4] : n[0] * n[2] * n[6]
          const b = pass === 0 ? n[2] * n[4] * n[6] : n[0] * n[4] * n[6]
          if (neighbours >= 2 && neighbours <= 6 && transitions === 1 && !a && !b)
            removed.push(y * GRID + x)
        }
      }
      for (const i of removed) img[i] = 0
      if (removed.length > 0) changed = true
    }
  }
  return img
}

/** Voisins (8-voisinage) actifs d'un pixel. */
function neighbours(mask: Uint8Array, i: number) {
  const x = i % GRID
  const y = Math.floor(i / GRID)
  const out: number[] = []
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx
      const ny = y + dy
      if ((dx || dy) && nx >= 0 && ny >= 0 && nx < GRID && ny < GRID && mask[ny * GRID + nx])
        out.push(ny * GRID + nx)
    }
  }
  return out
}

/**
 * Retire les branches courtes qui partent d'une jonction (crochets, empattements
 * de la police) : personne ne les dessine, elles ne doivent pas coûter de couverture.
 */
function pruneSpurs(line: Uint8Array) {
  const pruned = line.slice()
  for (let start = 0; start < line.length; start++) {
    if (!line[start] || neighbours(line, start).length !== 1) continue
    const branch = [start]
    let previous = -1
    let current = start
    for (;;) {
      const next = neighbours(line, current).filter((j) => j !== previous)
      if (next.length !== 1 || branch.length > SPUR_LENGTH) break
      previous = current
      current = next[0]
      if (neighbours(line, current).length > 2) break // jonction atteinte
      branch.push(current)
    }
    if (branch.length <= SPUR_LENGTH && neighbours(line, current).length > 2)
      for (const i of branch) pruned[i] = 0
  }
  return pruned
}

/** Numéro de partie connexe (8-voisinage) de chaque pixel actif, -1 ailleurs. */
function components(mask: Uint8Array) {
  const labels = new Int32Array(mask.length).fill(-1)
  let count = 0
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || labels[start] !== -1) continue
    const stack = [start]
    labels[start] = count
    while (stack.length > 0) {
      const i = stack.pop()!
      const x = i % GRID
      const y = Math.floor(i / GRID)
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue
          const j = ny * GRID + nx
          if (mask[j] && labels[j] === -1) {
            labels[j] = count
            stack.push(j)
          }
        }
      }
    }
    count++
  }
  return { labels, count }
}

/** Distance (en pixels, approximation chanfrein 3-4) de chaque pixel au pixel actif le plus proche. */
function distanceMap(mask: Uint8Array) {
  const dist = new Float32Array(mask.length)
  for (let i = 0; i < mask.length; i++) dist[i] = mask[i] ? 0 : Infinity

  const relax = (i: number, j: number, cost: number) => {
    if (dist[j] + cost < dist[i]) dist[i] = dist[j] + cost
  }
  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      const i = y * GRID + x
      if (x > 0) relax(i, i - 1, 3)
      if (y > 0) {
        relax(i, i - GRID, 3)
        if (x > 0) relax(i, i - GRID - 1, 4)
        if (x < GRID - 1) relax(i, i - GRID + 1, 4)
      }
    }
  }
  for (let y = GRID - 1; y >= 0; y--) {
    for (let x = GRID - 1; x >= 0; x--) {
      const i = y * GRID + x
      if (x < GRID - 1) relax(i, i + 1, 3)
      if (y < GRID - 1) {
        relax(i, i + GRID, 3)
        if (x < GRID - 1) relax(i, i + GRID + 1, 4)
        if (x > 0) relax(i, i + GRID - 1, 4)
      }
    }
  }
  for (let i = 0; i < dist.length; i++) dist[i] /= 3
  return dist
}

export async function scoreTrace(
  model: string,
  strokes: Stroke[],
): Promise<TraceScore> {
  // Le modèle est rendu par la police web : elle doit être chargée avant de rasteriser.
  await document.fonts.load(modelFont(model, GRID), model)

  const target = modelMask(model)
  const targetLine = pruneSpurs(skeleton(target))
  const fit = fitTransform(strokes, targetLine)
  const fitted = strokes.map((stroke) =>
    stroke.map((p) => {
      const q = fit(p.x * GRID, p.y * GRID)
      return { x: q.x / GRID, y: q.y / GRID }
    }),
  )
  const drawn = strokesMask(strokes)
  const ink = strokesMask(fitted)
  const inkLine = skeleton(ink)
  const toTarget = distanceMap(target)
  const toTargetLine = distanceMap(targetLine)
  const toInkLine = distanceMap(inkLine)
  const tolerance = TOLERANCE * GRID
  const maxTolerance = MAX_TOLERANCE * GRID
  const credit = (distance: number) =>
    distance <= tolerance
      ? 1
      : Math.max(0, (maxTolerance - distance) / (maxTolerance - tolerance))
  const diffTolerance = DIFF_TOLERANCE * GRID

  const parts = components(targetLine)
  const partTotal = new Array<number>(parts.count).fill(0)
  const partHit = new Array<number>(parts.count).fill(0)
  let inkTotal = 0
  let inkHit = 0
  let targetTotal = 0
  let targetHit = 0
  for (let i = 0; i < target.length; i++) {
    if (inkLine[i]) {
      inkTotal++
      inkHit += credit(toTargetLine[i])
    }
    if (targetLine[i]) {
      targetTotal++
      partTotal[parts.labels[i]]++
      const c = credit(toInkLine[i])
      targetHit += c
      partHit[parts.labels[i]] += c
    }
  }
  const complete = partTotal.every(
    (total, k) => total < MIN_PART_SIZE || partHit[k] >= MIN_PART_COVERAGE * total,
  )

  // Image de différence dans le repère du tracé (là où l'utilisateur a dessiné),
  // chaque pixel étant comparé à son correspondant dans le repère du modèle.
  const diff = new ImageData(GRID, GRID)
  for (let i = 0; i < target.length; i++) {
    const q = fit((i % GRID) + 0.5, Math.floor(i / GRID) + 0.5)
    const x = Math.floor(q.x)
    const y = Math.floor(q.y)
    if (x < 0 || y < 0 || x >= GRID || y >= GRID) {
      if (drawn[i]) diff.data.set(STRAY_COLOR, i * 4)
      continue
    }
    const j = y * GRID + x
    if (drawn[i] && toTarget[j] > diffTolerance / 2) {
      diff.data.set(STRAY_COLOR, i * 4) // encre hors du modèle
    } else if (target[j] && !ink[j] && toInkLine[j] > diffTolerance) {
      diff.data.set(MISSING_COLOR, i * 4) // partie du modèle oubliée
    }
  }

  // Longueur réelle des traits : un gribouillis dense se remplit en tache sur la
  // grille et son squelette paraîtrait court.
  let inkLength = inkTotal
  let strokesLength = 0
  for (const stroke of fitted)
    for (let k = 1; k < stroke.length; k++)
      strokesLength += Math.hypot(
        stroke[k].x - stroke[k - 1].x,
        stroke[k].y - stroke[k - 1].y,
      )
  inkLength = Math.max(inkLength, strokesLength * GRID)
  const excess = inkTotal ? Math.min(1, (LENGTH_SLACK * targetTotal) / inkLength) : 0
  const precision = inkTotal ? (inkHit / inkTotal) * excess : 0
  const coverage = targetTotal ? targetHit / targetTotal : 0
  const f1 =
    precision + coverage ? (2 * precision * coverage) / (precision + coverage) : 0

  const score = Math.round(f1 * 100)
  return {
    score,
    precision: Math.round(precision * 100),
    coverage: Math.round(coverage * 100),
    complete,
    passed: complete && score >= PASS_SCORE,
    diff,
  }
}
