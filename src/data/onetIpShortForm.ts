import type { AreaDef, ChecklistItem } from './types'

/**
 * O*NET Interest Profiler Short Form, paper-and-pencil, verbatim.
 * Items are in left-to-right, top-to-bottom order of the two-column form.
 * Source PDF: https://www.onetcenter.org/dl_tools/ipsf/Interest_Profiler.pdf
 * License: CC BY-ND 4.0. Do not edit item wording, order, or the checklist response.
 */
export const ONET_INSTRUCTION =
  'Read the 60 work activities below. Place a check in the box by the activities you would like to do. Do not think about how much education/training is needed or how much money you will make!'

export const ONET_SPONSOR =
  'Sponsored by the U.S. Department of Labor, Employment & Training Administration. Developed by the National Center for O*NET Development.'

export const ONET_AREAS: readonly AreaDef[] = [
  { id: 'R', letter: 'R', name: 'Realistic' },
  { id: 'I', letter: 'I', name: 'Investigative' },
  { id: 'A', letter: 'A', name: 'Artistic' },
  { id: 'S', letter: 'S', name: 'Social' },
  { id: 'E', letter: 'E', name: 'Enterprising' },
  { id: 'C', letter: 'C', name: 'Conventional' },
]

const RAW: readonly (readonly [string, readonly string[]])[] = [
  [
    'R',
    [
      'Build kitchen cabinets',
      'Drive a truck to deliver packages to offices and homes',
      'Lay brick or tile',
      'Test the quality of parts before shipment',
      'Repair household appliances',
      'Repair and install locks',
      'Raise fish in a fish hatchery',
      'Set up and operate machines to make products',
      'Assemble electronic parts',
      'Put out forest fires',
    ],
  ],
  [
    'I',
    [
      'Develop a new medicine',
      'Investigate the cause of a fire',
      'Study ways to reduce water pollution',
      'Develop a way to better predict the weather',
      'Conduct chemical experiments',
      'Work in a biology lab',
      'Study the movement of planets',
      'Invent a replacement for sugar',
      'Examine blood samples using a microscope',
      'Do laboratory tests to identify diseases',
    ],
  ],
  [
    'A',
    [
      'Write books or plays',
      'Paint sets for plays',
      'Play a musical instrument',
      'Write scripts for movies or television shows',
      'Compose or arrange music',
      'Perform jazz or tap dance',
      'Draw pictures',
      'Sing in a band',
      'Create special effects for movies',
      'Edit movies',
    ],
  ],
  [
    'S',
    [
      'Teach an individual an exercise routine',
      'Teach children how to play sports',
      'Help people with personal or emotional problems',
      'Teach sign language to people who are deaf or hard of hearing',
      'Give career guidance to people',
      'Help conduct a group therapy session',
      'Perform rehabilitation therapy',
      'Take care of children at a day-care center',
      'Do volunteer work at a non-profit organization',
      'Teach a high-school class',
    ],
  ],
  [
    'E',
    [
      'Buy and sell stocks and bonds',
      'Negotiate business contracts',
      'Manage a retail store',
      'Represent a client in a lawsuit',
      'Operate a beauty salon or barber shop',
      'Market a new line of clothing',
      'Manage a department within a large company',
      'Sell merchandise at a department store',
      'Start your own business',
      'Manage a clothing store',
    ],
  ],
  [
    'C',
    [
      'Develop a spreadsheet using computer software',
      'Calculate the wages of employees',
      'Proofread records or forms',
      'Inventory supplies using a hand-held computer',
      'Install software across computers on a large network',
      'Record rent payments',
      'Operate a calculator',
      'Keep inventory records',
      'Keep shipping and receiving records',
      'Stamp, sort, and distribute mail for an organization',
    ],
  ],
]

export const ONET_ITEMS: readonly ChecklistItem[] = RAW.flatMap(([areaId, texts]) =>
  texts.map((text, index) => ({
    id: `${areaId}${String(index + 1).padStart(2, '0')}`,
    text,
    areaId,
  })),
)

export const ONET_BY_ID: ReadonlyMap<string, ChecklistItem> = new Map(
  ONET_ITEMS.map((item) => [item.id, item]),
)

export function onetItemsForArea(areaId: string): ChecklistItem[] {
  return ONET_ITEMS.filter((item) => item.areaId === areaId)
}
