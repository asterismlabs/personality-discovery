import { levelFromPomp, type LevelName } from './levels'

export interface LikertScaleScore {
  id: string
  name: string
  answered: number
  total: number
  rawSum: number | null
  mean: number | null
  pomp: number | null
  level: LevelName | null
  insufficient: boolean
}

export interface KeyedLikertItem {
  id: string
  keyed: 1 | -1
}

export const MIN_COVERAGE = 0.75

export function keyedResponse(keyed: 1 | -1, response: number, min: number, max: number): number {
  if (!Number.isInteger(response) || response < min || response > max) {
    throw new RangeError(`Response ${String(response)} is outside ${String(min)}–${String(max)}.`)
  }
  return keyed === 1 ? response : min + max - response
}

export function scoreLikertScale(
  id: string,
  name: string,
  items: readonly KeyedLikertItem[],
  answers: Readonly<Record<string, number>>,
  min: number,
  max: number,
  coverage = MIN_COVERAGE,
): LikertScaleScore {
  if (items.length === 0) {
    throw new RangeError('A scale needs at least one item.')
  }
  const keyedScores: number[] = []
  for (const item of items) {
    const response = answers[item.id]
    if (response === undefined) continue
    keyedScores.push(keyedResponse(item.keyed, response, min, max))
  }
  const answered = keyedScores.length
  const total = items.length
  const base = { id, name, answered, total }
  if (answered / total < coverage) {
    return { ...base, rawSum: null, mean: null, pomp: null, level: null, insufficient: true }
  }
  const rawSum = keyedScores.reduce((sum, value) => sum + value, 0)
  const mean = rawSum / answered
  const pomp = ((mean - min) / (max - min)) * 100
  return {
    ...base,
    rawSum,
    mean,
    pomp,
    level: levelFromPomp(pomp),
    insufficient: false,
  }
}
