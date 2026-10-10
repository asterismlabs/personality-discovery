import { IPIP_DOMAINS, IPIP_FACETS, ipipItemsForDomain, ipipItemsForFacet } from '../data/ipipNeo120'
import { ACCURACY_SCALE, AGREEMENT_SCALE } from '../data/scales'
import { WORK_STYLE_ITEMS, WORK_STYLE_SCALES } from '../data/workStyle'
import { WORK_VALUE_ITEMS, WORK_VALUE_SCALES } from '../data/workValues'
import { detectValuesCeiling, type ValuesCeiling } from './ambiguity'
import { scoreFollowUp, type FollowUpAnswers, type FollowUpResult } from './followUp'
import { scoreLikertScale, type LikertScaleScore } from './likert'
import { scorePrediger, type PredigerResult } from './prediger'
import { scoreProfile, type InterestProfile } from './profile'
import { attentionFlags, sectionQuality, type QualityFlag } from './quality'
import { scoreRiasec, type RiasecResult } from './riasec'

export interface SectionTiming {
  startedAt: number | null
  completedAt: number | null
}

export interface ScoreInput {
  answers: Readonly<Record<string, number>>
  skipped: readonly string[]
  timings: Readonly<Record<string, SectionTiming>>
  presentation: Readonly<Record<string, readonly string[]>>
  /** Answers to the fixed follow-up questions, keyed by question id. */
  followUp?: FollowUpAnswers
  /** Session seed. Only used to vary the order of follow-up options. */
  seed?: number
}

export interface DomainScore extends LikertScaleScore {
  facets: LikertScaleScore[]
}

export interface FullResults {
  personality: DomainScore[]
  interests: RiasecResult
  profile: InterestProfile
  interpretation: PredigerResult
  values: LikertScaleScore[] | null
  valuesCeiling: ValuesCeiling | null
  followUp: FollowUpResult
  workStyle: LikertScaleScore[] | null
  quality: QualityFlag[]
  skipped: string[]
}

function likertValues(order: readonly string[] | undefined, answers: Readonly<Record<string, number>>): number[] {
  if (!order) return []
  const values: number[] = []
  for (const id of order) {
    const value = answers[id]
    if (value !== undefined) values.push(value)
  }
  return values
}

function timingFlags(
  sectionId: string,
  kind: 'likert' | 'checklist',
  input: ScoreInput,
): QualityFlag[] {
  const timing = input.timings[sectionId]
  const order = input.presentation[sectionId] ?? []
  return sectionQuality({
    sectionId,
    kind,
    orderedAnswers: kind === 'checklist' ? order.map((id) => input.answers[id] ?? 0) : likertValues(order, input.answers),
    startedAt: timing?.startedAt ?? null,
    completedAt: timing?.completedAt ?? null,
    itemCount: order.length,
  })
}

export function scoreAll(input: ScoreInput): FullResults {
  const personality: DomainScore[] = IPIP_DOMAINS.map((domain) => {
    const domainScore = scoreLikertScale(
      domain.id,
      domain.name,
      ipipItemsForDomain(domain.id),
      input.answers,
      ACCURACY_SCALE.min,
      ACCURACY_SCALE.max,
    )
    const facets = IPIP_FACETS.filter((facet) => facet.domainId === domain.id).map((facet) =>
      scoreLikertScale(
        facet.id,
        facet.name,
        ipipItemsForFacet(facet.id),
        input.answers,
        ACCURACY_SCALE.min,
        ACCURACY_SCALE.max,
      ),
    )
    return { ...domainScore, facets }
  })

  const interests = scoreRiasec(input.answers)
  const pomp = Object.fromEntries(interests.areas.map((area) => [area.letter, area.pomp])) as Record<
    string,
    number
  >
  const interpretation = scorePrediger({
    R: pomp.R ?? 0,
    I: pomp.I ?? 0,
    A: pomp.A ?? 0,
    S: pomp.S ?? 0,
    E: pomp.E ?? 0,
    C: pomp.C ?? 0,
  })

  const skipped = [...input.skipped]
  const values = skipped.includes('values')
    ? null
    : WORK_VALUE_SCALES.map((scale) =>
        scoreLikertScale(
          scale.id,
          scale.name,
          WORK_VALUE_ITEMS.filter((item) => item.facetId === scale.id),
          input.answers,
          AGREEMENT_SCALE.min,
          AGREEMENT_SCALE.max,
        ),
      )
  const workStyle = skipped.includes('workStyle')
    ? null
    : WORK_STYLE_SCALES.map((scale) =>
        scoreLikertScale(
          scale.id,
          scale.name,
          WORK_STYLE_ITEMS.filter((item) => item.facetId === scale.id),
          input.answers,
          AGREEMENT_SCALE.min,
          AGREEMENT_SCALE.max,
        ),
      )

  const quality = [
    ...timingFlags('personality', 'likert', input),
    ...attentionFlags('personality', input.answers),
    ...timingFlags('interests', 'checklist', input),
    ...(values ? timingFlags('values', 'likert', input) : []),
    ...(values ? attentionFlags('values', input.answers) : []),
    ...(workStyle ? timingFlags('workStyle', 'likert', input) : []),
  ]

  const profile = scoreProfile(interests.areas)
  const valuesCeiling = detectValuesCeiling(values)
  const followUp = scoreFollowUp({
    interests,
    valuesCeiling,
    answers: input.followUp ?? {},
    seed: input.seed ?? 0,
  })

  return {
    personality,
    interests,
    profile,
    interpretation,
    values,
    valuesCeiling,
    followUp,
    workStyle,
    quality,
    skipped,
  }
}
