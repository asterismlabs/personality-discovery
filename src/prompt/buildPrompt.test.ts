import { describe, expect, it } from 'vitest'
import { IPIP_ITEMS } from '../data/ipipNeo120'
import { ONET_ITEMS } from '../data/onetIpShortForm'
import { WORK_VALUE_ITEMS } from '../data/workValues'
import { buildPrompt } from './buildPrompt'
import { scoreAll } from '../scoring/scoreAll'

const results = scoreAll({
  answers: Object.fromEntries(IPIP_ITEMS.map((item) => [item.id, 4])),
  skipped: ['values', 'workStyle'],
  timings: {},
  presentation: { personality: IPIP_ITEMS.map((item) => item.id), interests: [] },
})

const NO_CONTEXT = { country: '', education: '', constraints: '', goals: '' }

function resultsWithAmbiguities(followUp: Record<string, string> = {}) {
  const answers: Record<string, number> = Object.fromEntries(IPIP_ITEMS.map((item) => [item.id, 4]))
  const counts: Record<string, number> = { R: 9, I: 9, A: 6, S: 4, E: 2, C: 0 }
  for (const item of ONET_ITEMS) {
    const index = ONET_ITEMS.filter((other) => other.areaId === item.areaId).indexOf(item)
    if (index < (counts[item.areaId] ?? 0)) answers[item.id] = 1
  }
  for (const item of WORK_VALUE_ITEMS) answers[item.id] = 5
  return scoreAll({
    answers,
    skipped: ['workStyle'],
    timings: {},
    presentation: { personality: IPIP_ITEMS.map((item) => item.id), interests: [] },
    followUp,
    seed: 1,
  })
}

describe('buildPrompt ambiguity section', () => {
  it('is left out when nothing is flagged', () => {
    const answers: Record<string, number> = Object.fromEntries(IPIP_ITEMS.map((item) => [item.id, 4]))
    const counts: Record<string, number> = { R: 9, I: 7, A: 5, S: 3, E: 1, C: 0 }
    for (const item of ONET_ITEMS) {
      const index = ONET_ITEMS.filter((other) => other.areaId === item.areaId).indexOf(item)
      if (index < (counts[item.areaId] ?? 0)) answers[item.id] = 1
    }
    const clean = scoreAll({
      answers,
      skipped: ['values', 'workStyle'],
      timings: {},
      presentation: { personality: [], interests: [] },
    })
    const prompt = buildPrompt({ results: clean, taskIds: ['professions'], customTask: '', context: NO_CONTEXT })
    expect(prompt).not.toContain('### Open ambiguities flagged by this app')
  })

  it('lists the tie, the close counts, and the values ceiling, and says they are not trait conclusions', () => {
    const prompt = buildPrompt({
      results: resultsWithAmbiguities(),
      taskIds: ['professions'],
      customTask: '',
      context: NO_CONTEXT,
    })
    expect(prompt).toContain('### Open ambiguities flagged by this app')
    expect(prompt).toContain('Do not turn them into conclusions about my traits.')
    expect(prompt).toContain('Tied interest areas: Realistic and Investigative (tied at 9)')
    expect(prompt).toContain('I have not answered the app\'s fixed tie-breaker scenarios')
    expect(prompt).toContain('Close interest counts: Realistic, Investigative')
    expect(prompt).toContain('Work values ceiling: 6 of 6 work-value scales are High')
    expect(prompt).toContain('Profile elevation')
    expect(prompt).toContain('Profile differentiation')
    expect(prompt).toContain('start there')
  })

  it('passes the fixed follow-up choices back in as context', () => {
    const prompt = buildPrompt({
      results: resultsWithAmbiguities({
        'fu-int-event': 'I',
        'fu-int-weekend': 'I',
        'fu-val-keep': 'independence',
        'fu-val-drop': 'recognition',
      }),
      taskIds: ['professions'],
      customTask: '',
      context: NO_CONTEXT,
    })
    expect(prompt).toContain('you chose Investigative')
    expect(prompt).toContain('Keep: Independence.')
    expect(prompt).toContain('Give up first: Recognition.')
    expect(prompt).toContain('Verify this against what I have actually done.')
    expect(prompt).not.toContain('I have not answered the app\'s fixed tie-breaker scenarios')
  })

  it('does not call a flat profile undecided and marks the work sections as weak evidence', () => {
    const prompt = buildPrompt({ results, taskIds: ['professions'], customTask: '', context: NO_CONTEXT })
    expect(prompt).toContain('Do not call this indecision.')
    expect(prompt.toLowerCase()).not.toContain('you are undecided')
    expect(prompt).toContain('Treat these as weak evidence')
  })
})

describe('buildPrompt', () => {
  it('leaves optional context out when the fields are blank', () => {
    const prompt = buildPrompt({
      results,
      taskIds: ['education'],
      customTask: '',
      context: { country: '  ', education: '', constraints: '', goals: '' },
    })
    expect(prompt).toContain('Suggest higher education options and fields of study.')
    expect(prompt).not.toContain('## Context I chose to add')
    expect(prompt).toContain('Do not treat these results as a diagnosis.')
    expect(prompt).toContain('Ask me clarifying questions before finalizing.')
    expect(prompt).toContain('## Clarification protocol (follow before finalizing any recommendation)')
    expect(prompt).toContain('Ask at most 3-5 questions per round')
    expect(prompt).toContain('Not completed.')
  })

  it('includes context and a custom task only when they are filled in', () => {
    const prompt = buildPrompt({
      results,
      taskIds: ['custom'],
      customTask: 'Help me choose a first job.',
      context: { country: 'Vietnam', education: '', constraints: 'Need remote work', goals: '' },
    })
    expect(prompt).toContain('Country or region: Vietnam')
    expect(prompt).toContain('Constraints: Need remote work')
    expect(prompt).not.toContain('Education:')
    expect(prompt).toContain('Help me choose a first job.')
    expect(prompt).not.toContain('Suggest suitable professions.')
  })

  it('lists every selected task', () => {
    const prompt = buildPrompt({
      results,
      taskIds: ['professions', 'activities', 'custom'],
      customTask: 'Help me choose a first job.',
      context: { country: '', education: '', constraints: '', goals: '' },
    })
    expect(prompt).toContain('- Suggest suitable professions.')
    expect(prompt).toContain('- Suggest suitable activities and hobbies.')
    expect(prompt).toContain('- Help me choose a first job.')
    expect(prompt).not.toContain('Suggest higher education options')
  })
})
