import { describe, expect, it } from 'vitest'
import { ONET_ITEMS } from '../data/onetIpShortForm'
import { scorePrediger } from './prediger'
import { scoreRiasec } from './riasec'

function checks(ids: readonly string[]): Record<string, number> {
  return Object.fromEntries(ids.map((id) => [id, 1]))
}

describe('scoreRiasec', () => {
  it('counts checks from 0 to 10 and does not invent a ranking when all are tied', () => {
    const result = scoreRiasec({})
    expect(result.areas.every((area) => area.raw === 0)).toBe(true)
    expect(result.hollandCode).toBe('RIASEC')
    expect(result.tieNote).toContain('tied')
  })

  it('reports a tie at the cutoff instead of breaking it', () => {
    const wanted = ONET_ITEMS.filter((item) => item.areaId === 'R' || item.areaId === 'I').map((item) => item.id)
    const artistic = ONET_ITEMS.filter((item) => item.areaId === 'A').slice(0, 5).map((item) => item.id)
    const social = ONET_ITEMS.filter((item) => item.areaId === 'S').slice(0, 5).map((item) => item.id)
    const result = scoreRiasec(checks([...wanted, ...artistic, ...social]))
    expect(result.hollandCode).toBe('RIAS')
    expect(result.tieNote).toContain('R and I tied at 10')
    expect(result.tieNote).toContain('A and S tied at 5')
  })

  it('rejects a value other than checked or unchecked', () => {
    expect(() => scoreRiasec({ R01: 2 })).toThrow(RangeError)
  })
})

describe('scorePrediger', () => {
  it('is near the middle when the six scores are equal', () => {
    const result = scorePrediger({ R: 50, I: 50, A: 50, S: 50, E: 50, C: 50 })
    expect(result.dataIdeas).toBeCloseTo(0)
    expect(result.peopleThings).toBeCloseTo(0)
    expect(result.dataIdeasPole).toBe('near the middle')
    expect(result.peopleThingsPole).toBe('near the middle')
  })

  it('points toward data when enterprising and conventional are high', () => {
    const result = scorePrediger({ R: 0, I: 0, A: 0, S: 0, E: 100, C: 100 })
    expect(result.dataIdeas).toBeCloseTo(346)
    expect(result.dataIdeasPole).toBe('data')
    expect(result.peopleThingsPole).toBe('near the middle')
  })

  it('points toward ideas when investigative and artistic are high', () => {
    const result = scorePrediger({ R: 0, I: 100, A: 100, S: 0, E: 0, C: 0 })
    expect(result.dataIdeas).toBeLessThan(0)
    expect(result.dataIdeasPole).toBe('ideas')
  })

  it('points toward people for social and toward things for realistic', () => {
    expect(scorePrediger({ R: 0, I: 0, A: 0, S: 100, E: 0, C: 0 }).peopleThingsPole).toBe('people')
    expect(scorePrediger({ R: 100, I: 0, A: 0, S: 0, E: 0, C: 0 }).peopleThingsPole).toBe('things')
  })
})
