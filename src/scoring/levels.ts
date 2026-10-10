export const LEVEL_LOW_BELOW = 37.5
export const LEVEL_HIGH_ABOVE = 62.5

export type LevelName = 'low' | 'moderate' | 'high'

export function levelFromPomp(pomp: number): LevelName {
  if (pomp < LEVEL_LOW_BELOW) return 'low'
  if (pomp > LEVEL_HIGH_ABOVE) return 'high'
  return 'moderate'
}

export function levelLabel(level: LevelName): string {
  if (level === 'low') return 'Low'
  if (level === 'moderate') return 'Moderate'
  return 'High'
}
