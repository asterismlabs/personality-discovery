import { describe, expect, it } from 'vitest'
import { ONET_ITEMS } from '../data/onetIpShortForm'
import { detectValuesCeiling } from './ambiguity'
import type { LikertScaleScore } from './likert'
import { describeNearTie, scoreProfile } from './profile'
import { scoreRiasec } from './riasec'

const LETTERS = ['R', 'I', 'A', 'S', 'E', 'C'] as const

function profileFor(counts: Record<(typeof LETTERS)[number], number>) {
  const answers: Record<string, number> = {}
  for (const letter of LETTERS) {
    ONET_ITEMS.filter((item) => item.areaId === letter)
      .slice(0, counts[letter])
      .forEach((item) => {
        answers[item.id] = 1
      })
  }
  return scoreProfile(scoreRiasec(answers).areas)
}

describe('scoreProfile', () => {
  it('reports a sharp profile when a few areas stand out', () => {
    const profile = profileFor({ R: 0, I: 9, A: 1, S: 8, E: 0, C: 1 })
    expect(profile.differentiationLevel).toBe('clear')
    expect(profile.shape).toBe('sharp')
    expect(profile.elevation).toBeCloseTo(19 / 6)
  })

  it('frames a flat, high profile as a generalist profile and not as indecision', () => {
    const profile = profileFor({ R: 7, I: 8, A: 7, S: 8, E: 7, C: 8 })
    expect(profile.elevationLevel).toBe('high')
    expect(profile.differentiationLevel).toBe('flat')
    expect(profile.shape).toBe('generalist')
    expect(profile.summary).toContain('Generalist profile')
    expect(profile.summary).toContain('not the same as being undecided')
  })

  it('separates a flat, low profile from a flat, high one', () => {
    const profile = profileFor({ R: 1, I: 0, A: 1, S: 0, E: 1, C: 0 })
    expect(profile.elevationLevel).toBe('low')
    expect(profile.shape).toBe('flat-low')
    expect(profile.summary).toContain('low level')
  })

  it('reads a flat profile at a middle level as flat-middle', () => {
    const profile = profileFor({ R: 5, I: 5, A: 5, S: 5, E: 5, C: 5 })
    expect(profile.differentiation).toBe(0)
    expect(profile.shape).toBe('flat-middle')
  })

  it('keeps elevation and differentiation independent of each other', () => {
    const low = profileFor({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 6 })
    const high = profileFor({ R: 4, I: 4, A: 4, S: 4, E: 4, C: 10 })
    expect(low.differentiation).toBeCloseTo(high.differentiation)
    expect(high.elevation).toBeGreaterThan(low.elevation)
  })

  it('groups counts within one of the leader as equal preference', () => {
    const profile = profileFor({ R: 8, I: 7, A: 5, S: 5, E: 2, C: 0 })
    expect(profile.nearTies.map((group) => group.letters)).toEqual([['R', 'I'], ['A', 'S']])
    expect(profile.nearTies[0]?.exact).toBe(false)
    expect(profile.nearTies[1]?.exact).toBe(true)
  })

  it('does not chain counts that drift further than one from the group leader', () => {
    const profile = profileFor({ R: 8, I: 7, A: 6, S: 5, E: 4, C: 3 })
    expect(profile.nearTies.map((group) => group.letters)).toEqual([['R', 'I'], ['A', 'S']])
  })

  it('ignores close counts that sit entirely below the top three positions', () => {
    const profile = profileFor({ R: 10, I: 8, A: 6, S: 2, E: 1, C: 1 })
    expect(profile.nearTies.map((group) => group.letters)).toEqual([])
  })

  it('describes a near-tie without ranking the areas against each other', () => {
    const profile = profileFor({ R: 8, I: 7, A: 0, S: 0, E: 0, C: 0 })
    const text = describeNearTie(profile.nearTies[0]!)
    expect(text).toContain('Realistic, Investigative')
    expect(text).toContain('equal preference')
  })
})

function scale(id: string, level: LikertScaleScore['level']): LikertScaleScore {
  return {
    id,
    name: id,
    answered: 3,
    total: 3,
    rawSum: level === null ? null : 12,
    mean: level === null ? null : 4,
    pomp: level === null ? null : 75,
    level,
    insufficient: level === null,
  }
}

describe('detectValuesCeiling', () => {
  it('returns null when the section was skipped', () => {
    expect(detectValuesCeiling(null)).toBeNull()
  })

  it('returns null when fewer than four scales are High', () => {
    const values = [scale('a', 'high'), scale('b', 'high'), scale('c', 'high'), scale('d', 'moderate'), scale('e', 'low'), scale('f', 'moderate')]
    expect(detectValuesCeiling(values)).toBeNull()
  })

  it('reports the High scales when four or more are High and says the ranking is unresolved', () => {
    const values = [scale('a', 'high'), scale('b', 'high'), scale('c', 'high'), scale('d', 'high'), scale('e', 'moderate'), scale('f', 'low')]
    const ceiling = detectValuesCeiling(values)
    expect(ceiling?.highScales.map((entry) => entry.id)).toEqual(['a', 'b', 'c', 'd'])
    expect(ceiling?.message).toContain('4 of 6')
    expect(ceiling?.message).toContain('unresolved')
  })

  it('does not count scales with too few answers', () => {
    const values = [scale('a', 'high'), scale('b', 'high'), scale('c', 'high'), scale('d', null), scale('e', 'high'), scale('f', 'low')]
    expect(detectValuesCeiling(values)?.scoredCount).toBe(5)
  })
})
