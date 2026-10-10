import { attentionFor } from '../data/attentionChecks'

export interface QualityFlag {
  id: string
  sectionId: string
  message: string
}

export const FAST_MS_PER_ITEM = 800
export const STRAIGHT_SHARE = 0.8
export const STRAIGHT_MIN_ANSWERED = 8

export function longestRun(values: readonly number[]): number {
  let best = 0
  let run = 0
  let previous: number | null = null
  for (const value of values) {
    if (value === previous) {
      run += 1
    } else {
      run = 1
      previous = value
    }
    if (run > best) best = run
  }
  return best
}

export function identicalShare(values: readonly number[]): number {
  if (values.length === 0) return 0
  const counts = new Map<number, number>()
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1)
  const most = Math.max(...counts.values())
  return most / values.length
}

export function isStraightLine(values: readonly number[]): boolean {
  if (values.length < STRAIGHT_MIN_ANSWERED) return false
  return identicalShare(values) > STRAIGHT_SHARE || longestRun(values) >= Math.min(12, values.length)
}

export interface SectionQualityInput {
  sectionId: string
  kind: 'likert' | 'checklist'
  orderedAnswers: readonly number[]
  startedAt: number | null
  completedAt: number | null
  itemCount: number
}

export function sectionQuality(input: SectionQualityInput): QualityFlag[] {
  const flags: QualityFlag[] = []
  if (input.kind === 'likert' && isStraightLine(input.orderedAnswers)) {
    flags.push({
      id: `${input.sectionId}-straight`,
      sectionId: input.sectionId,
      message:
        'Many answers in this section were the same. If you were moving quickly, you may want to go back and check them. This is only a note.',
    })
  }
  if (input.kind === 'checklist' && input.orderedAnswers.length > 0) {
    const checked = input.orderedAnswers.filter((value) => value === 1).length
    if (checked === 0) {
      flags.push({
        id: `${input.sectionId}-none`,
        sectionId: input.sectionId,
        message:
          'No activity was checked. If that was intentional, you can ignore this note. If you were moving quickly, you may want to look again.',
      })
    } else if (checked === input.orderedAnswers.length) {
      flags.push({
        id: `${input.sectionId}-all`,
        sectionId: input.sectionId,
        message:
          'Every activity was checked. If that was intentional, you can ignore this note. If you were moving quickly, you may want to look again.',
      })
    }
  }
  if (
    input.startedAt !== null &&
    input.completedAt !== null &&
    input.itemCount >= 10 &&
    input.completedAt - input.startedAt < FAST_MS_PER_ITEM * input.itemCount
  ) {
    flags.push({
      id: `${input.sectionId}-fast`,
      sectionId: input.sectionId,
      message: 'This section was completed very quickly. Quick answers are sometimes less accurate. This is only a note.',
    })
  }
  return flags
}

export function attentionFlags(
  sectionId: string,
  answers: Readonly<Record<string, number>>,
): QualityFlag[] {
  const flags: QualityFlag[] = []
  for (const check of attentionFor(sectionId)) {
    const given = answers[check.id]
    if (given === undefined) {
      flags.push({
        id: `${check.id}-missing`,
        sectionId,
        message: 'A reading-check item was left blank. This is only a note.',
      })
    } else if (given !== check.expected) {
      flags.push({
        id: `${check.id}-mismatch`,
        sectionId,
        message:
          'A reading-check item did not match the requested answer. If you were moving quickly, you may want to review this section. This is only a note.',
      })
    }
  }
  return flags
}
