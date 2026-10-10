import { buildPrompt, type PromptInput } from '../prompt/buildPrompt'
import type { FullResults } from '../scoring/scoreAll'

export const DISCLAIMER =
  'These results are self-reported tendencies, not diagnoses or predictions. Effects of this kind are usually small to moderate. The scores are not normed and are not percentiles. This is not a substitute for professional career counseling or a clinical assessment.'

export function buildTextExport(prompt: string): string {
  return `${DISCLAIMER}\n\n${prompt}\n`
}

export function buildJsonExport(results: FullResults, promptInput: PromptInput, answers: Readonly<Record<string, number>>): string {
  return JSON.stringify(
    {
      disclaimer: DISCLAIMER,
      normed: false,
      percentiles: false,
      results,
      responses: answers,
      prompt: buildPrompt(promptInput),
    },
    null,
    2,
  )
}
