import type { FacetDef, LikertItem } from './types'

/**
 * Original items written for this app. They are organized around six widely
 * used work-value ideas (achievement, independence, recognition, relationships,
 * support, working conditions). They are not O*NET Work Importance items,
 * have not been validated, and must be labeled as such.
 */
export const WORK_VALUE_SCALES: readonly FacetDef[] = [
  { id: 'achievement', name: 'Achievement', domainId: 'values' },
  { id: 'independence', name: 'Independence', domainId: 'values' },
  { id: 'recognition', name: 'Recognition', domainId: 'values' },
  { id: 'relationships', name: 'Relationships', domainId: 'values' },
  { id: 'support', name: 'Support', domainId: 'values' },
  { id: 'conditions', name: 'Working conditions', domainId: 'values' },
]

function items(scaleId: string, texts: readonly string[]): LikertItem[] {
  return texts.map((text, index) => ({
    id: `val-${scaleId}-${index + 1}`,
    text,
    facetId: scaleId,
    keyed: 1 as const,
  }))
}

export const WORK_VALUE_ITEMS: readonly LikertItem[] = [
  ...items('achievement', [
    'I want work where I can see the results of my own effort.',
    'Doing a job well matters more to me than having an easy job.',
    'I want chances to use my skills fully.',
  ]),
  ...items('independence', [
    'I want to decide for myself how to do my work.',
    'I prefer to set my own pace rather than follow a fixed routine.',
    'I want room to try my own ideas.',
  ]),
  ...items('recognition', [
    'I want my good work to be noticed.',
    'Being respected for what I do matters to me.',
    'I want a path toward more responsibility.',
  ]),
  ...items('relationships', [
    'I want coworkers I can count on.',
    'Getting along with the people around me matters a lot.',
    'I want to feel that my work is useful to other people.',
  ]),
  ...items('support', [
    'I want a supervisor who treats people fairly.',
    'I want training so I can do the job well.',
    'I want rules at work to be applied the same way to everyone.',
  ]),
  ...items('conditions', [
    'I want work that is steady from month to month.',
    'I want a workplace that feels physically comfortable and safe.',
    'Pay that covers my needs matters a lot to me.',
  ]),
]

export const WORK_VALUE_BY_ID: ReadonlyMap<string, LikertItem> = new Map(
  WORK_VALUE_ITEMS.map((item) => [item.id, item]),
)
