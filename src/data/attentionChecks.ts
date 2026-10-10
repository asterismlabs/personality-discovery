import type { AttentionItem } from './types'

/** Directed-response items. They are never scored. Not used in the O*NET section. */
export const ATTENTION_ITEMS: readonly AttentionItem[] = [
  {
    id: 'attn-personality-1',
    sectionId: 'personality',
    text: 'This is a check that you are reading each item. Please select Moderately Accurate.',
    expected: 4,
    scale: 'accuracy',
  },
  {
    id: 'attn-personality-2',
    sectionId: 'personality',
    text: 'This is a check that you are reading each item. Please select Very Inaccurate.',
    expected: 1,
    scale: 'accuracy',
  },
  {
    id: 'attn-values-1',
    sectionId: 'values',
    text: 'This is a check that you are reading each item. Please select Disagree.',
    expected: 2,
    scale: 'agreement',
  },
]

export function attentionFor(sectionId: string): AttentionItem[] {
  return ATTENTION_ITEMS.filter((item) => item.sectionId === sectionId)
}
