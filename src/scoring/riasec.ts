import { ONET_AREAS, onetItemsForArea } from '../data/onetIpShortForm'
import { levelFromPomp, type LevelName } from './levels'

export interface RiasecAreaScore {
  id: string
  letter: string
  name: string
  raw: number
  total: number
  pomp: number
  level: LevelName
}

export interface TieGroup {
  raw: number
  letters: string[]
}

export interface RiasecResult {
  areas: RiasecAreaScore[]
  groups: TieGroup[]
  hollandLetters: string[]
  hollandCode: string
  tieNote: string | null
}

const CANONICAL = ['R', 'I', 'A', 'S', 'E', 'C'] as const

function letterIndex(letter: string): number {
  const index = CANONICAL.indexOf(letter as (typeof CANONICAL)[number])
  return index === -1 ? CANONICAL.length : index
}

export function scoreRiasec(answers: Readonly<Record<string, number>>): RiasecResult {
  const areas: RiasecAreaScore[] = ONET_AREAS.map((area) => {
    const items = onetItemsForArea(area.id)
    let raw = 0
    for (const item of items) {
      const response = answers[item.id]
      if (response === undefined || response === 0) continue
      if (response !== 1) {
        throw new RangeError(`Interest item ${item.id} must be 0 or 1.`)
      }
      raw += 1
    }
    const pomp = (raw / items.length) * 100
    return {
      id: area.id,
      letter: area.letter,
      name: area.name,
      raw,
      total: items.length,
      pomp,
      level: levelFromPomp(pomp),
    }
  })

  const byRaw = new Map<number, string[]>()
  for (const area of areas) {
    const letters = byRaw.get(area.raw) ?? []
    letters.push(area.letter)
    byRaw.set(area.raw, letters)
  }
  const groups: TieGroup[] = [...byRaw.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([raw, letters]) => ({
      raw,
      letters: letters.slice().sort((a, b) => letterIndex(a) - letterIndex(b)),
    }))

  const hollandLetters: string[] = []
  const included: TieGroup[] = []
  for (const group of groups) {
    if (hollandLetters.length >= 3) break
    included.push(group)
    hollandLetters.push(...group.letters)
  }

  const tied = included.filter((group) => group.letters.length > 1)
  let tieNote: string | null = null
  if (tied.length > 0 || hollandLetters.length > 3) {
    const parts = tied.map((group) => `${group.letters.join(' and ')} tied at ${String(group.raw)}`)
    tieNote =
      parts.length > 0
        ? `${parts.join('; ')}. Tied areas are listed in R-I-A-S-E-C order, not ranked against each other. The paper form asks you to break a tie by choosing the activities that fit you best. This app does not break ties.`
        : 'Tied areas are listed in R-I-A-S-E-C order. This app does not break ties.'
  }

  return {
    areas,
    groups,
    hollandLetters,
    hollandCode: hollandLetters.join(''),
    tieNote,
  }
}
