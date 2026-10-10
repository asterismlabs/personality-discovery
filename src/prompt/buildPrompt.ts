import { describeScale } from '../data/descriptions'
import type { LikertScaleScore } from '../scoring/likert'
import { levelLabel } from '../scoring/levels'
import { describeNearTie, type ProfileShape } from '../scoring/profile'
import type { FullResults } from '../scoring/scoreAll'

export const TASK_PRESETS = [
  { id: 'professions', label: 'Suitable professions', instruction: 'Suggest suitable professions.' },
  { id: 'education', label: 'Higher education / fields of study', instruction: 'Suggest higher education options and fields of study.' },
  { id: 'career-path', label: 'Career path and progression', instruction: 'Suggest a career path and how it might progress.' },
  { id: 'activities', label: 'Suitable activities and hobbies', instruction: 'Suggest suitable activities and hobbies.' },
  {
    id: 'strengths',
    label: 'Strengths, blind spots, and work environment fit',
    instruction: 'Describe strengths, blind spots, and work environment fit.',
  },
  { id: 'custom', label: 'Something else (write your own)', instruction: '' },
] as const

export type TaskId = (typeof TASK_PRESETS)[number]['id']

export interface PromptContext {
  country: string
  education: string
  constraints: string
  goals: string
}

export interface PromptInput {
  results: FullResults
  taskIds: readonly TaskId[]
  customTask: string
  context: PromptContext
}

const ROLE =
  'The following are self-reported, non-normed questionnaire results (Big Five via IPIP, RIASEC via the O*NET Interest Profiler, and, where present, unvalidated work-values and work-style items). Treat them as tendencies, not facts.'

function formatScale(score: LikertScaleScore, note?: string): string {
  const suffix = note ? ` (${note})` : ''
  if (score.insufficient || score.mean === null || score.pomp === null || score.rawSum === null || score.level === null) {
    return `- ${score.name}: not enough answers (${String(score.answered)} of ${String(score.total)})${suffix}`
  }
  return `- ${score.name}: raw sum ${String(score.rawSum)}, mean ${score.mean.toFixed(2)} (1–5), ${String(score.pomp.toFixed(1))}% of maximum, ${levelLabel(score.level)}. ${describeScale(score.id, score.level, score.name)} Based on ${String(score.answered)} of ${String(score.total)} items. Not a percentile.${suffix}`
}

const FLAT_SHAPES: readonly ProfileShape[] = ['generalist', 'flat-middle', 'flat-low']

function ambiguityLines(results: FullResults): string[] {
  const lines: string[] = []
  const { profile, followUp, valuesCeiling } = results

  if (FLAT_SHAPES.includes(profile.shape)) {
    lines.push(
      '- The interest profile is flat, so the interest scores separate the areas only weakly. Do not call this indecision. Ask about real activities and past experiences to tell the areas apart.',
    )
  }
  for (const group of profile.nearTies) {
    lines.push(`- Close interest counts: ${describeNearTie(group)} Do not rank these against each other from the counts alone.`)
  }

  const interests = followUp.interests
  if (interests) {
    const tied = `${interests.names.join(' and ')} (tied at ${String(interests.count)})`
    if (interests.status === 'unanswered') {
      lines.push(`- Tied interest areas: ${tied}. I have not answered the app's fixed tie-breaker scenarios. Ask a behavior-based question to separate them.`)
    } else {
      lines.push(`- Tied interest areas: ${tied}. App's fixed tie-breaker scenarios, ${String(interests.questions.length)} asked: ${interests.summary} Verify this against what I have actually done.`)
    }
  }

  if (valuesCeiling) {
    lines.push(`- Work values ceiling: ${valuesCeiling.message}`)
    const values = followUp.values
    if (values === null || values.status === 'unanswered') {
      lines.push('  I have not answered the app\'s fixed trade-off questions. Ask a trade-off question to rank them.')
    } else {
      lines.push(`  App's fixed trade-off questions: ${values.summary}`)
    }
  }
  return lines
}

function contextLines(context: PromptContext): string[] {
  const rows: [string, string][] = [
    ['Country or region', context.country],
    ['Education', context.education],
    ['Constraints', context.constraints],
    ['Goals', context.goals],
  ]
  return rows.filter(([, value]) => value.trim().length > 0).map(([label, value]) => `- ${label}: ${value.trim()}`)
}

function taskLines(input: PromptInput): string[] {
  const selected = new Set(input.taskIds)
  const lines: string[] = []
  for (const preset of TASK_PRESETS) {
    if (!selected.has(preset.id)) continue
    if (preset.id === 'custom') {
      const text = input.customTask.trim()
      if (text.length > 0) lines.push(`- ${text}`)
      continue
    }
    lines.push(`- ${preset.instruction}`)
  }
  if (lines.length === 0) return ['Ask me what I want help with before suggesting options.']
  return lines
}

export function buildPrompt(input: PromptInput): string {
  const { results } = input
  const lines: string[] = [ROLE, '', '## Results', '', '### Personality (IPIP-NEO-120, not normed)']
  for (const domain of results.personality) {
    lines.push(formatScale(domain))
    for (const facet of domain.facets) {
      lines.push(`  ${formatScale(facet, '4-item facet, less stable than the domain')}`)
    }
  }

  lines.push('', '### Vocational interests (O*NET Interest Profiler Short Form)')
  lines.push('Official scores are counts of checked activities, from 0 to 10. They are not normed.')
  const ranked = results.interests.groups.flatMap((group) =>
    group.letters.map((letter) => results.interests.areas.find((area) => area.letter === letter)),
  )
  for (const area of ranked) {
    if (!area) continue
    const tied = (results.interests.groups.find((group) => group.letters.includes(area.letter))?.letters.length ?? 0) > 1
    lines.push(`- ${area.name} (${area.letter}): ${String(area.raw)} of ${String(area.total)}${tied ? ' (tied)' : ''}`)
  }
  lines.push(`Holland code: ${results.interests.hollandCode}`)
  if (results.interests.tieNote) lines.push(results.interests.tieNote)
  const profile = results.profile
  lines.push(
    `Profile elevation (mean count across the six areas): ${profile.elevation.toFixed(1)} of 10, ${levelLabel(profile.elevationLevel)}. Profile differentiation (spread of the six counts, standard deviation): ${profile.differentiation.toFixed(1)}, ${profile.differentiationLevel}. These are two separate readings. The cut points are this app's rules of thumb, not norms.`,
  )
  lines.push(profile.summary)

  const interp = results.interpretation
  lines.push('', "### This app's interpretation of the interest scores (not part of the O*NET Interest Profiler)")
  lines.push('Low / Moderate / High here is relative to the scale midpoint. It is not an official score and not a percentile.')
  for (const area of results.interests.areas) {
    lines.push(`- ${area.name}: ${levelLabel(area.level)} (${String(area.pomp.toFixed(1))}% of maximum). ${describeScale(`i${area.id}`, area.level, area.name)}`)
  }
  lines.push(
    `- Ideas versus data: ${interp.dataIdeasPole} (score ${interp.dataIdeas.toFixed(1)}; positive is toward data, negative is toward ideas).`,
  )
  lines.push(
    `- People versus things: ${interp.peopleThingsPole} (score ${interp.peopleThings.toFixed(1)}; positive is toward people, negative is toward things).`,
  )

  lines.push('', '### Work values (original items, unvalidated)')
  lines.push('Three positively worded items per scale. Treat these as weak evidence, weaker than the personality and interest sections.')
  if (results.values === null) {
    lines.push('Not completed.')
  } else {
    for (const scale of results.values) lines.push(formatScale(scale, 'unvalidated'))
  }

  lines.push('', '### Work style (original items, exploratory, unvalidated)')
  lines.push('Three items per scale. Treat these as weak evidence, weaker than the personality and interest sections.')
  if (results.workStyle === null) {
    lines.push('Not completed.')
  } else {
    for (const scale of results.workStyle) lines.push(formatScale(scale, 'exploratory, unvalidated'))
  }

  const ambiguities = ambiguityLines(results)
  if (ambiguities.length > 0) {
    lines.push('', '### Open ambiguities flagged by this app')
    lines.push(
      'These were found by simple counting rules, not by a model. Question them with behavior-based questions. Do not turn them into conclusions about my traits.',
    )
    lines.push(...ambiguities)
  }

  if (results.quality.length > 0) {
    lines.push('', '### Response quality notes')
    for (const flag of results.quality) lines.push(`- ${flag.message}`)
  }

  const context = contextLines(input.context)
  if (context.length > 0) {
    lines.push('', '## Context I chose to add', ...context)
  }

  const tasks = taskLines(input)
  lines.push('', '## Task', ...tasks)

  lines.push(
    '',
    '## Instructions',
    '- Give multiple options with reasoning.',
    '- Distinguish evidence-based reasoning from speculation.',
    '- State uncertainty.',
    '- Do not treat these results as a diagnosis.',
    '- Mention where other factors (skills, values, constraints, labor market) matter.',
    '- Ask me clarifying questions before finalizing.',
    '',
    CLARIFICATION_PROTOCOL,
  )
  return lines.join('\n')
}

const CLARIFICATION_PROTOCOL = `## Clarification protocol (follow before finalizing any recommendation)

1. **Ask first, conclude later.** Before giving final recommendations, run a clarification phase. Give only provisional, clearly labeled options until I have answered.

2. **Ask only what would change the answer.** Do not ask about anything already in my results or context. For each question, say in one short line why it matters and what it would change. Drop any question whose answer would not alter your recommendations.

3. **Limit and prioritize.** Ask at most 3-5 questions per round, ordered by expected impact on the recommendation. Hold lower-priority questions for a later round.

4. **Prefer behavior over self-description.** Favor concrete, past-based questions ("What did you last build or start on your own? Did you finish it?") over abstract ones ("Are you disciplined?"). Past behavior is better evidence than questionnaire scores.

5. **Target the specific ambiguities in my data.** If there is a section called "Open ambiguities flagged by this app", start there. Question each item with a concrete, behavior-based question. Do not restate the app's descriptive sentences as conclusions about my traits, and do not name traits or types that the results do not state. Then examine my results for the following and ask about the ones that matter most:
   - Ties or near-ties (e.g., interest codes tied at the same score)
   - Ceiling effects (e.g., nearly every value rated high, which hides trade-offs). Use forced-choice or ranking questions with realistic scenarios instead.
   - Contradictions between instruments (e.g., high Artistic personality facets but low Artistic interest score). Ask which reading fits my actual behavior.
   - Tensions between stated goals and scores (e.g., wanting full independence while scoring high on stability and support)
   - Facets based on few items, which are noisy

6. **Cover these gaps, as relevant to my stated task:**
   - My actual goal (credential, career change, research, or self-directed building) and what I want to build or do
   - Whether I need the work to support me financially, and my timeline
   - Current education, skills, and work or project history
   - Constraints (budget, location, time, family, visa)
   - Past activities that energized or drained me
   - Aptitude evidence (not just interest)

7. **Make questions easy to answer.** Where useful, give 2-4 options plus "other" and "not sure." Do not ask leading questions, and do not ask several things in one question.

8. **Respect sensitivity and scope.** These results are not a diagnosis. Do not probe clinical or mental-health details beyond what I volunteer. If something in my answers suggests I may benefit from a professional, mention it briefly and without alarm.

9. **Update visibly.** After each of my answers, state in 1-3 sentences: what changed in your conclusions, what stayed the same, and what remains uncertain. Revise earlier conclusions when my answers contradict them.

10. **Handle non-answers honestly.** If I skip or cannot answer a question, proceed with an explicit labeled assumption instead of guessing silently or asking again.

11. **Know when to stop.** Stop asking when additional questions would not change your recommendations. Then give a final answer that separates:
    - **Evidence-supported** reasoning
    - **Inference** from my data
    - **Speculation or judgment calls**
    and states your confidence level and the main factors that could overturn it (skills, values, constraints, labor market).

12. **Do not pad.** No generic questions, no repeating my results back to me, and no more questions once the decision is clear enough to act on.`
