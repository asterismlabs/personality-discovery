export interface PredigerResult {
  dataIdeas: number
  dataIdeasPole: 'data' | 'ideas' | 'near the middle'
  peopleThings: number
  peopleThingsPole: 'people' | 'things' | 'near the middle'
}

/** Largest absolute value of 1.73*(E+C-I-A) when each score is a POMP from 0 to 100. */
export const DATA_IDEAS_MAX = 1.73 * 200
/** Largest absolute value of 2S+A+E-2R-I-C when each score is a POMP from 0 to 100. */
export const PEOPLE_THINGS_MAX = 400
/** Scores within this fraction of the maximum swing are called near the middle. */
export const MIDDLE_FRACTION = 0.05

export interface PredigerInput {
  R: number
  I: number
  A: number
  S: number
  E: number
  C: number
}

function pole<T extends string>(score: number, max: number, negative: T, positive: T): T | 'near the middle' {
  const threshold = MIDDLE_FRACTION * max
  if (score > threshold) return positive
  if (score < -threshold) return negative
  return 'near the middle'
}

/**
 * Prediger (1982) dimensions, as specified for this app.
 * Positive data/ideas points toward data. Positive people/things points toward people.
 * Inputs are percent-of-maximum scores, not raw counts.
 */
export function scorePrediger(input: PredigerInput): PredigerResult {
  const dataIdeas = 1.73 * (input.E + input.C - input.I - input.A)
  const peopleThings = 2 * input.S + input.A + input.E - 2 * input.R - input.I - input.C
  return {
    dataIdeas,
    dataIdeasPole: pole(dataIdeas, DATA_IDEAS_MAX, 'ideas', 'data'),
    peopleThings,
    peopleThingsPole: pole(peopleThings, PEOPLE_THINGS_MAX, 'things', 'people'),
  }
}
