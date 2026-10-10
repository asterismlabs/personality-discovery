import {
  INTEREST_SCENARIOS,
  NO_CHOICE,
  NO_CHOICE_LABEL,
  VALUE_DROP_ID,
  VALUE_DROP_PROMPT,
  VALUE_KEEP_ID,
  VALUE_KEEP_PROMPT,
  VALUE_TRADEOFF_OPTIONS,
} from '../data/followUp'
import { shuffle } from '../flow/order'
import type { ValuesCeiling } from './ambiguity'
import type { RiasecResult, TieGroup } from './riasec'

export type FollowUpAnswers = Readonly<Record<string, string>>

export interface FollowUpOption {
  value: string
  text: string
}

export interface FollowUpQuestion {
  id: string
  prompt: string
  options: FollowUpOption[]
  /** The stored answer when it is still one of the options, otherwise null. */
  answer: string | null
}

export type FollowUpStatus = 'unanswered' | 'leaning' | 'unresolved'

export interface InterestFollowUp {
  letters: string[]
  names: string[]
  count: number
  questions: FollowUpQuestion[]
  /** Questions answered with one of the tied areas. */
  picked: number
  /** Questions answered with "I cannot choose". */
  declined: number
  picks: Record<string, number>
  leaning: string[]
  status: FollowUpStatus
  summary: string
}

export type ValuesFollowUpStatus = 'unanswered' | 'partial' | 'complete'

export interface ValuesFollowUp {
  scales: { id: string; name: string }[]
  questions: FollowUpQuestion[]
  keep: { id: string; name: string } | null
  drop: { id: string; name: string } | null
  status: ValuesFollowUpStatus
  summary: string
}

export interface FollowUpResult {
  interests: InterestFollowUp | null
  values: ValuesFollowUp | null
}

export interface FollowUpInput {
  interests: RiasecResult
  valuesCeiling: ValuesCeiling | null
  answers: FollowUpAnswers
  seed: number
}

const HOLLAND_POSITIONS = 3

/**
 * Picks the one tie that matters most for the Holland code. A tie that straddles
 * the third position decides which letters are in the code, so it comes first.
 * Otherwise the highest tie inside the code is used. Ties at a count of 0 are
 * ignored, since nothing was checked in those areas.
 */
export function contestedTie(interests: RiasecResult): TieGroup | null {
  let before = 0
  let firstInside: TieGroup | null = null
  for (const group of interests.groups) {
    if (before >= HOLLAND_POSITIONS) break
    if (group.letters.length > 1 && group.raw > 0) {
      if (before + group.letters.length > HOLLAND_POSITIONS) return group
      firstInside ??= group
    }
    before += group.letters.length
  }
  return firstInside
}

function noChoiceOption(): FollowUpOption {
  return { value: NO_CHOICE, text: NO_CHOICE_LABEL }
}

function validAnswer(answers: FollowUpAnswers, id: string, options: readonly FollowUpOption[]): string | null {
  const stored = answers[id]
  if (stored === undefined) return null
  return options.some((option) => option.value === stored) ? stored : null
}

function areaName(interests: RiasecResult, letter: string): string {
  return interests.areas.find((area) => area.letter === letter)?.name ?? letter
}

function interestSummary(
  status: FollowUpStatus,
  leaning: readonly string[],
  names: (letter: string) => string,
  picked: number,
  declined: number,
  total: number,
): string {
  if (status === 'unanswered') return 'Not answered yet.'
  if (status === 'leaning') {
    const letter = leaning[0] ?? ''
    return `In ${String(picked)} of ${String(total)} scenarios you chose ${names(letter)}. This is a lean, not a new score. The O*NET counts above are unchanged.`
  }
  if (picked === 0 && declined > 0) {
    return 'You could not choose between these areas. Treat them as equal preference.'
  }
  return `Your choices split between ${leaning.map(names).join(' and ')}. Treat them as equal preference. The O*NET counts above are unchanged.`
}

function scoreInterestFollowUp(input: FollowUpInput): InterestFollowUp | null {
  const tie = contestedTie(input.interests)
  if (tie === null) return null
  const letters = tie.letters
  const questions: FollowUpQuestion[] = INTEREST_SCENARIOS.map((scenario, index) => {
    const choices = shuffle(
      letters.map((letter) => ({ value: letter, text: scenario.options[letter] ?? '' })),
      input.seed + 101 + index,
    ).filter((option) => option.text.length > 0)
    const options = [...choices, noChoiceOption()]
    return { id: scenario.id, prompt: scenario.prompt, options, answer: validAnswer(input.answers, scenario.id, options) }
  })

  const picks: Record<string, number> = Object.fromEntries(letters.map((letter) => [letter, 0]))
  let picked = 0
  let declined = 0
  for (const question of questions) {
    if (question.answer === null) continue
    if (question.answer === NO_CHOICE) {
      declined += 1
      continue
    }
    picks[question.answer] = (picks[question.answer] ?? 0) + 1
    picked += 1
  }
  const most = Math.max(...Object.values(picks))
  const leaning = picked === 0 ? [] : letters.filter((letter) => picks[letter] === most)
  const answeredAny = picked + declined > 0
  const status: FollowUpStatus = !answeredAny ? 'unanswered' : leaning.length === 1 ? 'leaning' : 'unresolved'
  const names = (letter: string): string => areaName(input.interests, letter)
  return {
    letters,
    names: letters.map(names),
    count: tie.raw,
    questions,
    picked,
    declined,
    picks,
    leaning,
    status,
    summary: interestSummary(status, leaning, names, picked, declined, questions.length),
  }
}

function scoreValuesFollowUp(input: FollowUpInput): ValuesFollowUp | null {
  const ceiling = input.valuesCeiling
  if (ceiling === null) return null
  const scales = ceiling.highScales
  const nameOf = (id: string): string => scales.find((scale) => scale.id === id)?.name ?? id
  const textFor = (id: string): string => VALUE_TRADEOFF_OPTIONS[id] ?? ''

  const keepOptions = [
    ...shuffle(
      scales.map((scale) => ({ value: scale.id, text: textFor(scale.id) })),
      input.seed + 201,
    ).filter((option) => option.text.length > 0),
    noChoiceOption(),
  ]
  const keepAnswer = validAnswer(input.answers, VALUE_KEEP_ID, keepOptions)
  const keepId = keepAnswer !== null && keepAnswer !== NO_CHOICE ? keepAnswer : null

  const dropOptions = [
    ...shuffle(
      scales.filter((scale) => scale.id !== keepId).map((scale) => ({ value: scale.id, text: textFor(scale.id) })),
      input.seed + 202,
    ).filter((option) => option.text.length > 0),
    noChoiceOption(),
  ]
  const dropAnswer = validAnswer(input.answers, VALUE_DROP_ID, dropOptions)
  const dropId = dropAnswer !== null && dropAnswer !== NO_CHOICE ? dropAnswer : null

  const questions: FollowUpQuestion[] = [
    { id: VALUE_KEEP_ID, prompt: VALUE_KEEP_PROMPT, options: keepOptions, answer: keepAnswer },
    { id: VALUE_DROP_ID, prompt: VALUE_DROP_PROMPT, options: dropOptions, answer: dropAnswer },
  ]
  const answeredCount = questions.filter((question) => question.answer !== null).length
  const status: ValuesFollowUpStatus = answeredCount === 0 ? 'unanswered' : answeredCount === 1 ? 'partial' : 'complete'
  const keep = keepId === null ? null : { id: keepId, name: nameOf(keepId) }
  const drop = dropId === null ? null : { id: dropId, name: nameOf(dropId) }

  let summary = 'Not answered yet.'
  if (status !== 'unanswered') {
    const parts: string[] = []
    if (keepAnswer !== null) parts.push(keep ? `Keep: ${keep.name}.` : 'Keep: you could not choose.')
    if (dropAnswer !== null) parts.push(drop ? `Give up first: ${drop.name}.` : 'Give up first: you could not choose.')
    summary = `${parts.join(' ')} This is a forced trade-off between values you rated High. It is not a new score.`
  }
  return { scales, questions, keep, drop, status, summary }
}

/**
 * Builds the fixed follow-up questions that the current scores call for, and
 * reads back any answers already given. Returns nulls when nothing needs resolving.
 */
export function scoreFollowUp(input: FollowUpInput): FollowUpResult {
  return {
    interests: scoreInterestFollowUp(input),
    values: scoreValuesFollowUp(input),
  }
}

/** Total number of follow-up questions that could be asked at once. Capped by design. */
export const FOLLOW_UP_QUESTION_CAP = INTEREST_SCENARIOS.length + 2
