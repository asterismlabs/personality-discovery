import { describe, expect, it } from 'vitest'
import { INTEREST_SCENARIOS, NO_CHOICE, VALUE_DROP_ID, VALUE_KEEP_ID } from '../data/followUp'
import { ONET_ITEMS } from '../data/onetIpShortForm'
import type { ValuesCeiling } from './ambiguity'
import { contestedTie, scoreFollowUp } from './followUp'
import { scoreRiasec } from './riasec'

const LETTERS = ['R', 'I', 'A', 'S', 'E', 'C'] as const

function interestsFor(counts: Record<(typeof LETTERS)[number], number>) {
  const answers: Record<string, number> = {}
  for (const letter of LETTERS) {
    ONET_ITEMS.filter((item) => item.areaId === letter)
      .slice(0, counts[letter])
      .forEach((item) => {
        answers[item.id] = 1
      })
  }
  return scoreRiasec(answers)
}

const CEILING: ValuesCeiling = {
  highScales: [
    { id: 'achievement', name: 'Achievement' },
    { id: 'independence', name: 'Independence' },
    { id: 'relationships', name: 'Relationships' },
    { id: 'conditions', name: 'Working conditions' },
  ],
  highCount: 4,
  scoredCount: 6,
  message: 'unused',
}

describe('contestedTie', () => {
  it('returns null when no tie touches the Holland code', () => {
    expect(contestedTie(interestsFor({ R: 9, I: 7, A: 5, S: 3, E: 1, C: 0 }))).toBeNull()
  })

  it('ignores ties where nothing was checked', () => {
    expect(contestedTie(interestsFor({ R: 9, I: 7, A: 5, S: 0, E: 0, C: 0 }))).toBeNull()
  })

  it('prefers the tie that decides which letters are in the code', () => {
    const tie = contestedTie(interestsFor({ R: 10, I: 10, A: 5, S: 5, E: 0, C: 0 }))
    expect(tie?.letters).toEqual(['A', 'S'])
  })

  it('uses the highest tie inside the code when none straddles the cutoff', () => {
    const tie = contestedTie(interestsFor({ R: 9, I: 9, A: 6, S: 4, E: 2, C: 0 }))
    expect(tie?.letters).toEqual(['R', 'I'])
  })
})

describe('scoreFollowUp for interests', () => {
  const interests = interestsFor({ R: 9, I: 9, A: 6, S: 4, E: 2, C: 0 })
  const base = { interests, valuesCeiling: null, seed: 3 }

  it('asks nothing when there is no tie and no ceiling', () => {
    const result = scoreFollowUp({ ...base, interests: interestsFor({ R: 9, I: 7, A: 5, S: 3, E: 1, C: 0 }), answers: {} })
    expect(result.interests).toBeNull()
    expect(result.values).toBeNull()
  })

  it('offers each fixed scenario with only the tied areas plus a way to decline', () => {
    const result = scoreFollowUp({ ...base, answers: {} })
    expect(result.interests?.status).toBe('unanswered')
    expect(result.interests?.questions.map((question) => question.id)).toEqual(INTEREST_SCENARIOS.map((scenario) => scenario.id))
    for (const question of result.interests?.questions ?? []) {
      expect(question.options.map((option) => option.value).sort()).toEqual([NO_CHOICE, 'I', 'R'].sort())
    }
  })

  it('does not name interest areas in the option text', () => {
    const result = scoreFollowUp({ ...base, interests: interestsFor({ R: 5, I: 5, A: 5, S: 5, E: 5, C: 5 }), answers: {} })
    const text = (result.interests?.questions ?? []).flatMap((question) => question.options.map((option) => option.text)).join(' ')
    for (const name of ['Realistic', 'Investigative', 'Artistic', 'Enterprising', 'Conventional']) {
      expect(text).not.toContain(name)
    }
  })

  it('reports a lean toward the area chosen more often, without changing the O*NET counts', () => {
    const [first, second] = INTEREST_SCENARIOS
    const result = scoreFollowUp({ ...base, answers: { [first?.id ?? '']: 'I', [second?.id ?? '']: 'I' } })
    expect(result.interests?.status).toBe('leaning')
    expect(result.interests?.leaning).toEqual(['I'])
    expect(result.interests?.picks).toEqual({ R: 0, I: 2 })
    expect(result.interests?.summary).toContain('The O*NET counts above are unchanged')
    expect(interests.hollandCode).toBe('RIA')
  })

  it('stays unresolved when the choices split evenly', () => {
    const [first, second] = INTEREST_SCENARIOS
    const result = scoreFollowUp({ ...base, answers: { [first?.id ?? '']: 'R', [second?.id ?? '']: 'I' } })
    expect(result.interests?.status).toBe('unresolved')
    expect(result.interests?.leaning).toEqual(['R', 'I'])
  })

  it('treats "cannot choose" as an answer that leaves the tie unresolved', () => {
    const [first, second] = INTEREST_SCENARIOS
    const result = scoreFollowUp({ ...base, answers: { [first?.id ?? '']: NO_CHOICE, [second?.id ?? '']: NO_CHOICE } })
    expect(result.interests?.status).toBe('unresolved')
    expect(result.interests?.declined).toBe(2)
    expect(result.interests?.summary).toContain('equal preference')
  })

  it('ignores a stored answer for an area that is no longer tied', () => {
    const [first] = INTEREST_SCENARIOS
    const result = scoreFollowUp({ ...base, answers: { [first?.id ?? '']: 'E' } })
    expect(result.interests?.status).toBe('unanswered')
  })

  it('keeps option order stable for a given seed and varies it between seeds', () => {
    const again = scoreFollowUp({ ...base, answers: {} })
    const same = scoreFollowUp({ ...base, answers: {} })
    expect(again.interests?.questions[0]?.options).toEqual(same.interests?.questions[0]?.options)
    const orders = new Set<string>()
    for (let seed = 0; seed < 20; seed += 1) {
      const result = scoreFollowUp({ ...base, seed, answers: {} })
      orders.add((result.interests?.questions[0]?.options ?? []).map((option) => option.value).join(','))
    }
    expect(orders.size).toBeGreaterThan(1)
  })
})

describe('scoreFollowUp for work values', () => {
  const interests = interestsFor({ R: 9, I: 7, A: 5, S: 3, E: 1, C: 0 })
  const base = { interests, valuesCeiling: CEILING, seed: 1 }

  it('offers a keep question and a give-up question limited to the High scales', () => {
    const result = scoreFollowUp({ ...base, answers: {} })
    expect(result.values?.status).toBe('unanswered')
    const keep = result.values?.questions[0]
    expect(keep?.options.map((option) => option.value).sort()).toEqual(
      [NO_CHOICE, 'achievement', 'conditions', 'independence', 'relationships'].sort(),
    )
  })

  it('removes the kept value from the give-up options', () => {
    const result = scoreFollowUp({ ...base, answers: { [VALUE_KEEP_ID]: 'independence' } })
    const drop = result.values?.questions[1]
    expect(drop?.options.map((option) => option.value)).not.toContain('independence')
    expect(result.values?.status).toBe('partial')
    expect(result.values?.keep?.name).toBe('Independence')
  })

  it('drops a give-up answer that now matches the kept value', () => {
    const result = scoreFollowUp({
      ...base,
      answers: { [VALUE_KEEP_ID]: 'independence', [VALUE_DROP_ID]: 'independence' },
    })
    expect(result.values?.drop).toBeNull()
    expect(result.values?.status).toBe('partial')
  })

  it('is complete once both questions are answered', () => {
    const result = scoreFollowUp({
      ...base,
      answers: { [VALUE_KEEP_ID]: 'achievement', [VALUE_DROP_ID]: 'conditions' },
    })
    expect(result.values?.status).toBe('complete')
    expect(result.values?.summary).toContain('Keep: Achievement.')
    expect(result.values?.summary).toContain('Give up first: Working conditions.')
    expect(result.values?.summary).toContain('not a new score')
  })
})
