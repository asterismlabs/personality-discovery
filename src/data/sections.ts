export interface SectionDef {
  id: 'personality' | 'interests' | 'values' | 'workStyle'
  title: string
  minutes: string
  optional: boolean
  kind: 'likert' | 'checklist'
  scale: 'accuracy' | 'agreement' | 'check'
  pageSize: number
  validated: boolean
  exploratory: boolean
  randomize: boolean
  summary: string
}

export const SECTIONS: readonly SectionDef[] = [
  {
    id: 'personality',
    title: 'Personality',
    minutes: '15–20 minutes',
    optional: false,
    kind: 'likert',
    scale: 'accuracy',
    pageSize: 10,
    validated: true,
    exploratory: false,
    randomize: true,
    summary:
      '120 public-domain IPIP-NEO-120 items about the Big Five. Describe how accurate each statement is for you, as you usually are.',
  },
  {
    id: 'interests',
    title: 'Work interests',
    minutes: '5–10 minutes',
    optional: false,
    kind: 'checklist',
    scale: 'check',
    pageSize: 10,
    validated: true,
    exploratory: false,
    randomize: false,
    summary:
      '60 activities from the O*NET Interest Profiler Short Form, in the original order. Check an activity if you would like to do it.',
  },
  {
    id: 'values',
    title: 'Work values',
    minutes: 'About 3 minutes',
    optional: true,
    kind: 'likert',
    scale: 'agreement',
    pageSize: 10,
    validated: false,
    exploratory: false,
    randomize: true,
    summary:
      'Original items about what you want from work. This section is unvalidated. You can skip it.',
  },
  {
    id: 'workStyle',
    title: 'Work style',
    minutes: 'About 3 minutes',
    optional: true,
    kind: 'likert',
    scale: 'agreement',
    pageSize: 10,
    validated: false,
    exploratory: true,
    randomize: true,
    summary:
      'Original items about ambiguity, structure, working with others, pace, and risk. Exploratory and unvalidated. You can skip it. This is not an ability test.',
  },
]

export const PAGE_SIZE = 10
