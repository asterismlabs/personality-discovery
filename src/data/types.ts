export type KeyDirection = 1 | -1

export type Level = 'low' | 'moderate' | 'high'

export interface ResponseOption {
  value: number
  label: string
}

export interface ResponseScale {
  min: number
  max: number
  options: readonly ResponseOption[]
}

export interface LikertItem {
  id: string
  text: string
  facetId: string
  keyed: KeyDirection
}

export interface FacetDef {
  id: string
  name: string
  domainId: string
}

export interface DomainDef {
  id: string
  name: string
}

export interface ChecklistItem {
  id: string
  text: string
  areaId: string
}

export interface AreaDef {
  id: string
  letter: string
  name: string
}

export interface AttentionItem {
  id: string
  sectionId: string
  text: string
  expected: number
  scale: 'accuracy' | 'agreement'
}
