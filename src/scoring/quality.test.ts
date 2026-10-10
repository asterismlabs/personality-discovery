import { describe, expect, it } from 'vitest'
import { attentionFlags, identicalShare, isStraightLine, longestRun, sectionQuality } from './quality'

describe('straight-lining', () => {
  it('flags a long run and a section that is mostly one answer', () => {
    expect(longestRun([1, 1, 1, 2, 2])).toBe(3)
    expect(identicalShare([3, 3, 3, 3, 3, 3, 3, 1])).toBeCloseTo(0.875)
    expect(isStraightLine(Array.from({ length: 8 }, () => 3))).toBe(true)
    expect(isStraightLine([1, 2, 3, 4, 5, 1, 2, 3, 4, 5])).toBe(false)
    expect(isStraightLine(Array.from({ length: 12 }, () => 4))).toBe(true)
    expect(isStraightLine([1, 1, 1])).toBe(false)
  })
})

describe('sectionQuality', () => {
  it('notes an interest section with no checks and one with every box checked', () => {
    const none = sectionQuality({
      sectionId: 'interests',
      kind: 'checklist',
      orderedAnswers: [0, 0, 0],
      startedAt: 0,
      completedAt: 10_000,
      itemCount: 3,
    })
    expect(none.map((flag) => flag.id)).toContain('interests-none')

    const all = sectionQuality({
      sectionId: 'interests',
      kind: 'checklist',
      orderedAnswers: [1, 1, 1],
      startedAt: null,
      completedAt: null,
      itemCount: 3,
    })
    expect(all.map((flag) => flag.id)).toContain('interests-all')
  })

  it('notes a section finished faster than 800ms per item', () => {
    const flags = sectionQuality({
      sectionId: 'personality',
      kind: 'likert',
      orderedAnswers: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
      startedAt: 0,
      completedAt: 1000,
      itemCount: 10,
    })
    expect(flags.map((flag) => flag.id)).toContain('personality-fast')
  })
})

describe('attentionFlags', () => {
  it('notes a missed reading check and ignores a correct one', () => {
    const missed = attentionFlags('personality', { 'attn-personality-1': 5, 'attn-personality-2': 1 })
    expect(missed.map((flag) => flag.id)).toContain('attn-personality-1-mismatch')
    const passed = attentionFlags('values', { 'attn-values-1': 2 })
    expect(passed).toEqual([])
  })
})
