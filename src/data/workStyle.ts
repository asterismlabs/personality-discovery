import type { FacetDef, LikertItem } from './types'

/**
 * Original items written for this app. Exploratory and unvalidated.
 * Not an ability measure.
 */
export const WORK_STYLE_SCALES: readonly FacetDef[] = [
  { id: 'ambiguity', name: 'Tolerance for ambiguity', domainId: 'style' },
  { id: 'structure', name: 'Need for structure', domainId: 'style' },
  { id: 'collaboration', name: 'Preference for working with others', domainId: 'style' },
  { id: 'pace', name: 'Pace and feedback', domainId: 'style' },
  { id: 'risk', name: 'Risk tolerance', domainId: 'style' },
]

function item(id: string, text: string, facetId: string, keyed: 1 | -1): LikertItem {
  return { id, text, facetId, keyed }
}

export const WORK_STYLE_ITEMS: readonly LikertItem[] = [
  item('style-ambiguity-1', 'I can move ahead even when the goal is not fully defined.', 'ambiguity', 1),
  item('style-ambiguity-2', 'Unclear instructions bother me until they are spelled out.', 'ambiguity', -1),
  item('style-ambiguity-3', 'I am comfortable deciding before every fact is in.', 'ambiguity', 1),
  item('style-structure-1', 'I like a clear plan before I start.', 'structure', 1),
  item('style-structure-2', 'I prefer procedures I can follow.', 'structure', 1),
  item('style-structure-3', 'I do my best work when the steps are left up to me.', 'structure', -1),
  item('style-collaboration-1', 'I do my best thinking when I work with other people.', 'collaboration', 1),
  item('style-collaboration-2', 'I would rather solve a problem on my own than in a group.', 'collaboration', -1),
  item('style-collaboration-3', 'I like to check an idea with someone else before I settle on it.', 'collaboration', 1),
  item('style-pace-1', 'I like to hear quickly whether my work is on track.', 'pace', 1),
  item('style-pace-2', 'I prefer a steady pace over a fast one.', 'pace', -1),
  item('style-pace-3', 'Long stretches without feedback make me uneasy.', 'pace', 1),
  item('style-risk-1', 'I am willing to try something that might not work.', 'risk', 1),
  item('style-risk-2', 'I would rather take a safe option than an uncertain one.', 'risk', -1),
  item('style-risk-3', 'A chance of a better result is worth some risk to me.', 'risk', 1),
]

export const WORK_STYLE_BY_ID: ReadonlyMap<string, LikertItem> = new Map(
  WORK_STYLE_ITEMS.map((item) => [item.id, item]),
)
