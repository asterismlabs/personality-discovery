import { ATTENTION_ITEMS } from './attentionChecks'
import { IPIP_BY_ID } from './ipipNeo120'
import { ONET_AREAS, ONET_BY_ID } from './onetIpShortForm'
import type { ResponseScale } from './types'
import { ACCURACY_SCALE, AGREEMENT_SCALE } from './scales'
import { WORK_STYLE_BY_ID } from './workStyle'
import { WORK_VALUE_BY_ID } from './workValues'

export interface PresentedItem {
  id: string
  text: string
  kind: 'likert' | 'check' | 'attention'
  scale: ResponseScale | null
  areaName: string | null
}

export function presentItem(id: string, sectionScale: 'accuracy' | 'agreement' | 'check'): PresentedItem | null {
  const attention = ATTENTION_ITEMS.find((item) => item.id === id)
  if (attention) {
    return {
      id,
      text: attention.text,
      kind: 'attention',
      scale: attention.scale === 'accuracy' ? ACCURACY_SCALE : AGREEMENT_SCALE,
      areaName: null,
    }
  }
  if (sectionScale === 'check') {
    const item = ONET_BY_ID.get(id)
    if (!item) return null
    return {
      id,
      text: item.text,
      kind: 'check',
      scale: null,
      areaName: ONET_AREAS.find((area) => area.id === item.areaId)?.name ?? null,
    }
  }
  const likert = IPIP_BY_ID.get(id) ?? WORK_VALUE_BY_ID.get(id) ?? WORK_STYLE_BY_ID.get(id)
  if (!likert) return null
  return {
    id,
    text: likert.text,
    kind: 'likert',
    scale: sectionScale === 'accuracy' ? ACCURACY_SCALE : AGREEMENT_SCALE,
    areaName: null,
  }
}
