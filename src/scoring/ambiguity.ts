import type { LikertScaleScore } from './likert'

/** A ceiling is reported when at least this many of the work-value scales are High. */
export const VALUES_CEILING_MIN_HIGH = 4

export interface ValuesCeiling {
  /** Scales scored High, in the order they appear in the section. */
  highScales: { id: string; name: string }[]
  highCount: number
  scoredCount: number
  message: string
}

/**
 * Detects the case where nearly every work value is rated High, which leaves the
 * ranking of values unresolved. Returns null when the section was skipped or the
 * pattern is absent.
 */
export function detectValuesCeiling(values: readonly LikertScaleScore[] | null): ValuesCeiling | null {
  if (values === null) return null
  const scored = values.filter((scale) => !scale.insufficient && scale.level !== null)
  const high = scored.filter((scale) => scale.level === 'high')
  if (high.length < VALUES_CEILING_MIN_HIGH) return null
  return {
    highScales: high.map((scale) => ({ id: scale.id, name: scale.name })),
    highCount: high.length,
    scoredCount: scored.length,
    message: `${String(high.length)} of ${String(scored.length)} work-value scales are High. When most values are High, these answers do not show which ones matter most, so the ranking of your values is unresolved.`,
  }
}
