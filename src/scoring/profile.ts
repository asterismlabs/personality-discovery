import { levelFromPomp, type LevelName } from './levels'
import type { RiasecAreaScore } from './riasec'

/**
 * Interest profile shape, reported as two separate quantities.
 * Elevation is the mean of the six area counts. Differentiation is the
 * population standard deviation of the six area counts. Both are in O*NET
 * checklist-count units (0 to 10). The cut points below are this app's rules of
 * thumb. They are not norms.
 */
export const FLAT_BELOW_SD = 1.5
export const CLEAR_FROM_SD = 2.5
/** Counts this close to the leading count of a group are treated as equal preference. */
export const NEAR_TIE_GAP = 1
const HOLLAND_POSITIONS = 3

export type DifferentiationLevel = 'flat' | 'some' | 'clear'
export type ProfileShape = 'sharp' | 'moderate' | 'generalist' | 'flat-middle' | 'flat-low'

export interface NearTieGroup {
  /** Letters from highest count to lowest, ties in R-I-A-S-E-C order. */
  letters: string[]
  names: string[]
  highest: number
  lowest: number
  /** True when every area in the group has exactly the same count. */
  exact: boolean
}

export interface InterestProfile {
  elevation: number
  elevationLevel: LevelName
  differentiation: number
  differentiationLevel: DifferentiationLevel
  shape: ProfileShape
  summary: string
  nearTies: NearTieGroup[]
}

const CANONICAL = ['R', 'I', 'A', 'S', 'E', 'C']

function canonicalIndex(letter: string): number {
  const index = CANONICAL.indexOf(letter)
  return index === -1 ? CANONICAL.length : index
}

export function differentiationLevel(sd: number): DifferentiationLevel {
  if (sd < FLAT_BELOW_SD) return 'flat'
  if (sd >= CLEAR_FROM_SD) return 'clear'
  return 'some'
}

export function profileShape(differentiation: DifferentiationLevel, elevation: LevelName): ProfileShape {
  if (differentiation === 'clear') return 'sharp'
  if (differentiation === 'some') return 'moderate'
  if (elevation === 'high') return 'generalist'
  if (elevation === 'low') return 'flat-low'
  return 'flat-middle'
}

export const SHAPE_SUMMARY: Readonly<Record<ProfileShape, string>> = {
  sharp:
    'Sharp profile. A few areas stand out clearly from the rest, which gives a more specific starting point for exploring options.',
  moderate: 'Moderately differentiated profile. Some areas lead, and the gaps between them are not large.',
  generalist:
    'Generalist profile. Many areas were checked at similar levels, which usually points to broad interests, exploration energy, and adaptability. Cross-functional roles can fit. This is not the same as being undecided.',
  'flat-middle':
    'Flat profile at a middle level. The areas are close together and none stands out. More exposure to different kinds of work, or comparing real activities side by side, would help separate them.',
  'flat-low':
    'Flat profile at a low level. Few activities were checked in any area. That can reflect limited exposure to these kinds of work, low energy for this kind of choice right now, or a tired moment. Foundational exploration of a few different kinds of work is a reasonable next step.',
}

function nearTieGroups(areas: readonly RiasecAreaScore[]): NearTieGroup[] {
  const sorted = areas
    .slice()
    .sort((a, b) => b.raw - a.raw || canonicalIndex(a.letter) - canonicalIndex(b.letter))
  const groups: NearTieGroup[] = []
  let index = 0
  while (index < sorted.length) {
    const anchor = sorted[index]
    if (!anchor) break
    const members = [anchor]
    let cursor = index + 1
    while (cursor < sorted.length) {
      const candidate = sorted[cursor]
      if (!candidate || anchor.raw - candidate.raw > NEAR_TIE_GAP) break
      members.push(candidate)
      cursor += 1
    }
    const last = members[members.length - 1] ?? anchor
    if (members.length > 1 && index < HOLLAND_POSITIONS) {
      groups.push({
        letters: members.map((member) => member.letter),
        names: members.map((member) => member.name),
        highest: anchor.raw,
        lowest: last.raw,
        exact: anchor.raw === last.raw,
      })
    }
    index = cursor
  }
  return groups
}

export function scoreProfile(areas: readonly RiasecAreaScore[]): InterestProfile {
  if (areas.length === 0) throw new RangeError('A profile needs at least one area.')
  const mean = areas.reduce((sum, area) => sum + area.raw, 0) / areas.length
  const variance = areas.reduce((sum, area) => sum + (area.raw - mean) ** 2, 0) / areas.length
  const sd = Math.sqrt(variance)
  const maxTotal = Math.max(...areas.map((area) => area.total))
  const elevationLevel = levelFromPomp((mean / maxTotal) * 100)
  const level = differentiationLevel(sd)
  const shape = profileShape(level, elevationLevel)
  return {
    elevation: mean,
    elevationLevel,
    differentiation: sd,
    differentiationLevel: level,
    shape,
    summary: SHAPE_SUMMARY[shape],
    nearTies: nearTieGroups(areas),
  }
}

export function describeNearTie(group: NearTieGroup): string {
  const names = group.names.join(', ')
  return group.exact
    ? `${names}: the same count (${String(group.highest)}). Treat these as equal preference.`
    : `${names}: counts from ${String(group.highest)} down to ${String(group.lowest)}. A gap of ${String(NEAR_TIE_GAP)} is treated as equal preference.`
}
