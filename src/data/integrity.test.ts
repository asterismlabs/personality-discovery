import { describe, expect, it } from 'vitest'
import { ATTENTION_ITEMS } from '../data/attentionChecks'
import { IPIP_DOMAINS, IPIP_FACETS, IPIP_ITEMS } from '../data/ipipNeo120'
import { ONET_AREAS, ONET_ITEMS } from '../data/onetIpShortForm'
import { WORK_STYLE_ITEMS } from '../data/workStyle'
import { WORK_VALUE_ITEMS } from '../data/workValues'
import { presentationOrder } from '../flow/order'

const REVERSE_TEXTS = [
  'Am not easily annoyed.',
  'Feel comfortable with myself.',
  'Am not bothered by difficult social situations.',
  'Rarely overindulge.',
  'Easily resist temptations.',
  'Am able to control my cravings.',
  'Remain calm under pressure.',
  'Avoid contacts with others.',
  'Keep others at a distance.',
  'Prefer to be alone.',
  'Avoid crowds.',
  'Wait for others to lead the way.',
  'Like to take it easy.',
  'Do not like poetry.',
  'Do not enjoy going to art museums.',
  'Rarely notice my emotional reactions.',
  "Don't understand people who get emotional.",
  'Prefer to stick with things that I know.',
  'Dislike changes.',
  'Am attached to conventional ways.',
  'Avoid philosophical discussions.',
  'Have difficulty understanding abstract ideas.',
  'Am not interested in theoretical discussions.',
  'Tend to vote for conservative political candidates.',
  'Believe that we should be tough on crime.',
  'Distrust people.',
  'Use others for my own ends.',
  'Cheat to get ahead.',
  'Take advantage of others.',
  "Obstruct others' plans.",
  'Am indifferent to the feelings of others.',
  'Take no time for others.',
  'Love a good fight.',
  'Yell at people.',
  'Insult people.',
  'Get back at others.',
  'Believe that I am better than others.',
  'Think highly of myself.',
  'Have a high opinion of myself.',
  'Boast about my virtues.',
  "Am not interested in other people's problems.",
  'Try not to think about the needy.',
  'Often forget to put things back in their proper place.',
  'Leave a mess in my room.',
  'Leave my belongings around.',
  'Break rules.',
  'Break my promises.',
  'Put little time and effort into my work.',
  'Do just enough work to get by.',
  'Waste my time.',
  'Have difficulty starting tasks.',
  'Jump into things without thinking.',
  'Make rash decisions.',
  'Rush into things.',
  'Act without thinking.',
]

describe('item banks', () => {
  it('has 120 unique IPIP-NEO-120 items and four items on every facet', () => {
    expect(IPIP_ITEMS).toHaveLength(120)
    expect(new Set(IPIP_ITEMS.map((item) => item.id)).size).toBe(120)
    expect(new Set(IPIP_ITEMS.map((item) => item.text)).size).toBe(120)
    expect(IPIP_FACETS).toHaveLength(30)
    expect(IPIP_DOMAINS).toHaveLength(5)
    for (const facet of IPIP_FACETS) {
      expect(IPIP_ITEMS.filter((item) => item.facetId === facet.id)).toHaveLength(4)
    }
    const reverse = IPIP_ITEMS.filter((item) => item.keyed === -1).map((item) => item.text).sort()
    expect(reverse).toEqual([...REVERSE_TEXTS].sort())
  })

  it('keeps the O*NET Interest Profiler Short Form in paper-form order', () => {
    expect(ONET_ITEMS).toHaveLength(60)
    expect(ONET_ITEMS.map((item) => item.text)).toEqual([
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
    ])
    for (const area of ONET_AREAS) {
      expect(ONET_ITEMS.filter((item) => item.areaId === area.id)).toHaveLength(10)
    }
  })

  it('shuffles personality items but not interest items, and keeps attention checks out of the interest section', () => {
    const personality = presentationOrder('personality', 7)
    const again = presentationOrder('personality', 7)
    expect(personality).toEqual(again)
    expect(personality).toHaveLength(122)
    expect(personality.filter((id) => id.startsWith('attn-')).sort()).toEqual(
      ATTENTION_ITEMS.filter((item) => item.sectionId === 'personality').map((item) => item.id).sort(),
    )
    expect(presentationOrder('interests', 7)).toEqual(ONET_ITEMS.map((item) => item.id))
    expect(presentationOrder('values', 7)).toHaveLength(WORK_VALUE_ITEMS.length + 1)
    expect(presentationOrder('workStyle', 7)).toHaveLength(WORK_STYLE_ITEMS.length)
  })
})
