import { attentionFor } from '../data/attentionChecks'
import { IPIP_ITEMS } from '../data/ipipNeo120'
import { ONET_ITEMS } from '../data/onetIpShortForm'
import { WORK_STYLE_ITEMS } from '../data/workStyle'
import { WORK_VALUE_ITEMS } from '../data/workValues'

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffle<T>(items: readonly T[], seed: number): T[] {
  const copy = items.slice()
  const random = mulberry32(seed)
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    const current = copy[i]
    const other = copy[j]
    if (current === undefined || other === undefined) throw new Error('shuffle index')
    copy[i] = other
    copy[j] = current
  }
  return copy
}

export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (size < 1) throw new RangeError('page size')
  const pages: T[][] = []
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size))
  return pages
}

function insertAttention(ids: string[], sectionId: string, positions: readonly number[]): string[] {
  const next = ids.slice()
  const checks = attentionFor(sectionId)
  const ordered = positions
    .map((position, index) => ({ position, id: checks[index]?.id }))
    .filter((entry): entry is { position: number; id: string } => entry.id !== undefined)
    .sort((a, b) => b.position - a.position)
  for (const entry of ordered) {
    next.splice(Math.min(entry.position, next.length), 0, entry.id)
  }
  return next
}

export function presentationOrder(sectionId: string, seed: number): string[] {
  if (sectionId === 'personality') {
    return insertAttention(
      shuffle(
        IPIP_ITEMS.map((item) => item.id),
        seed,
      ),
      'personality',
      [90, 40],
    )
  }
  if (sectionId === 'interests') return ONET_ITEMS.map((item) => item.id)
  if (sectionId === 'values') {
    return insertAttention(
      shuffle(
        WORK_VALUE_ITEMS.map((item) => item.id),
        seed + 1,
      ),
      'values',
      [9],
    )
  }
  if (sectionId === 'workStyle') {
    return shuffle(
      WORK_STYLE_ITEMS.map((item) => item.id),
      seed + 2,
    )
  }
  return []
}
