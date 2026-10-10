import type { ResponseScale } from './types'

/** IPIP-NEO-120 response format. Wording follows the IPIP convention. */
export const ACCURACY_SCALE = {
  min: 1,
  max: 5,
  options: [
    { value: 1, label: 'Very Inaccurate' },
    { value: 2, label: 'Moderately Inaccurate' },
    { value: 3, label: 'Neither Accurate Nor Inaccurate' },
    { value: 4, label: 'Moderately Accurate' },
    { value: 5, label: 'Very Accurate' },
  ],
} as const satisfies ResponseScale

/** Original sections. Not part of IPIP or the O*NET Interest Profiler. */
export const AGREEMENT_SCALE = {
  min: 1,
  max: 5,
  options: [
    { value: 1, label: 'Strongly disagree' },
    { value: 2, label: 'Disagree' },
    { value: 3, label: 'Neither agree nor disagree' },
    { value: 4, label: 'Agree' },
    { value: 5, label: 'Strongly agree' },
  ],
} as const satisfies ResponseScale
