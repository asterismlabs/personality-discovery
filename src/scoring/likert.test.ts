import { describe, expect, it } from 'vitest'
import { IPIP_ITEMS } from '../data/ipipNeo120'
import { ACCURACY_SCALE } from '../data/scales'
import { keyedResponse, scoreLikertScale } from './likert'
import { LEVEL_HIGH_ABOVE, LEVEL_LOW_BELOW, levelFromPomp } from './levels'

const scale = [
  { id: 'a', keyed: 1 as const },
  { id: 'b', keyed: -1 as const },
  { id: 'c', keyed: 1 as const },
  { id: 'd', keyed: -1 as const },
]

describe('keyedResponse', () => {
  it('keeps positively keyed answers', () => {
    expect(keyedResponse(1, 1, 1, 5)).toBe(1)
    expect(keyedResponse(1, 5, 1, 5)).toBe(5)
  })

  it('reverses negatively keyed answers with 6 minus the response', () => {
    expect(keyedResponse(-1, 1, 1, 5)).toBe(5)
    expect(keyedResponse(-1, 2, 1, 5)).toBe(4)
    expect(keyedResponse(-1, 3, 1, 5)).toBe(3)
    expect(keyedResponse(-1, 4, 1, 5)).toBe(2)
    expect(keyedResponse(-1, 5, 1, 5)).toBe(1)
  })

  it('rejects out-of-range and non-integer answers', () => {
    expect(() => keyedResponse(1, 0, 1, 5)).toThrow(RangeError)
    expect(() => keyedResponse(1, 6, 1, 5)).toThrow(RangeError)
    expect(() => keyedResponse(1, 1.5, 1, 5)).toThrow(RangeError)
  })
})

describe('scoreLikertScale', () => {
  it('scores an all-3s profile at the midpoint even with reverse-keyed items', () => {
    const score = scoreLikertScale('t', 'Test', scale, { a: 3, b: 3, c: 3, d: 3 }, 1, 5)
    expect(score.insufficient).toBe(false)
    expect(score.rawSum).toBe(12)
    expect(score.mean).toBe(3)
    expect(score.pomp).toBe(50)
    expect(score.level).toBe('moderate')
  })

  it('reverse-scores a high answer on a negative item as low', () => {
    const score = scoreLikertScale('t', 'Test', scale, { a: 5, b: 5, c: 5, d: 5 }, 1, 5)
    expect(score.rawSum).toBe(5 + 1 + 5 + 1)
    expect(score.mean).toBe(3)
  })

  it('treats missing answers as missing and enforces 75% coverage', () => {
    const three = scoreLikertScale('t', 'Test', scale, { a: 5, b: 1, c: 4 }, 1, 5)
    expect(three.insufficient).toBe(false)
    expect(three.answered).toBe(3)
    expect(three.rawSum).toBe(5 + 5 + 4)

    const two = scoreLikertScale('t', 'Test', scale, { a: 5, b: 1 }, 1, 5)
    expect(two.insufficient).toBe(true)
    expect(two.mean).toBeNull()
    expect(two.level).toBeNull()
  })

  it('returns insufficient data when nothing was answered', () => {
    const score = scoreLikertScale('t', 'Test', scale, {}, 1, 5)
    expect(score.insufficient).toBe(true)
    expect(score.answered).toBe(0)
  })

  it('rejects an out-of-range stored answer', () => {
    expect(() => scoreLikertScale('t', 'Test', scale, { a: 6, b: 3, c: 3, d: 3 }, 1, 5)).toThrow(RangeError)
  })
})

describe('levelFromPomp', () => {
  it('uses a band around the midpoint', () => {
    expect(levelFromPomp(0)).toBe('low')
    expect(levelFromPomp(LEVEL_LOW_BELOW - 0.001)).toBe('low')
    expect(levelFromPomp(LEVEL_LOW_BELOW)).toBe('moderate')
    expect(levelFromPomp(50)).toBe('moderate')
    expect(levelFromPomp(LEVEL_HIGH_ABOVE)).toBe('moderate')
    expect(levelFromPomp(LEVEL_HIGH_ABOVE + 0.001)).toBe('high')
    expect(levelFromPomp(100)).toBe('high')
  })
})

describe('IPIP all-neutral profile', () => {
  it('lands every domain at the midpoint', () => {
    const answers = Object.fromEntries(IPIP_ITEMS.map((item) => [item.id, 3]))
    const score = scoreLikertScale('N', 'Neuroticism', IPIP_ITEMS.filter((item) => item.facetId.startsWith('N')), answers, ACCURACY_SCALE.min, ACCURACY_SCALE.max)
    expect(score.mean).toBe(3)
    expect(score.level).toBe('moderate')
  })
})
