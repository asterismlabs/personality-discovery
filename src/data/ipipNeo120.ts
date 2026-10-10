import type { DomainDef, FacetDef, LikertItem } from './types'

/**
 * IPIP-NEO-120 items and keying.
 * Source: https://ipip.ori.org/30FacetNEO-PI-RItems.htm
 * Johnson, J. A. (2014). Journal of Research in Personality, 51, 78–89.
 * Public domain. Item wording is unchanged. Presentation order may be shuffled.
 */
export const IPIP_DOMAINS: readonly DomainDef[] = [
  { id: 'N', name: 'Neuroticism' },
  { id: 'E', name: 'Extraversion' },
  { id: 'O', name: 'Openness' },
  { id: 'A', name: 'Agreeableness' },
  { id: 'C', name: 'Conscientiousness' },
]

export const IPIP_FACETS: readonly FacetDef[] = [
  { id: 'N1', name: 'Anxiety', domainId: 'N' },
  { id: 'N2', name: 'Anger', domainId: 'N' },
  { id: 'N3', name: 'Depression', domainId: 'N' },
  { id: 'N4', name: 'Self-Consciousness', domainId: 'N' },
  { id: 'N5', name: 'Immoderation', domainId: 'N' },
  { id: 'N6', name: 'Vulnerability', domainId: 'N' },
  { id: 'E1', name: 'Friendliness', domainId: 'E' },
  { id: 'E2', name: 'Gregariousness', domainId: 'E' },
  { id: 'E3', name: 'Assertiveness', domainId: 'E' },
  { id: 'E4', name: 'Activity Level', domainId: 'E' },
  { id: 'E5', name: 'Excitement-Seeking', domainId: 'E' },
  { id: 'E6', name: 'Cheerfulness', domainId: 'E' },
  { id: 'O1', name: 'Imagination', domainId: 'O' },
  { id: 'O2', name: 'Artistic Interests', domainId: 'O' },
  { id: 'O3', name: 'Emotionality', domainId: 'O' },
  { id: 'O4', name: 'Adventurousness', domainId: 'O' },
  { id: 'O5', name: 'Intellect', domainId: 'O' },
  { id: 'O6', name: 'Liberalism', domainId: 'O' },
  { id: 'A1', name: 'Trust', domainId: 'A' },
  { id: 'A2', name: 'Morality', domainId: 'A' },
  { id: 'A3', name: 'Altruism', domainId: 'A' },
  { id: 'A4', name: 'Cooperation', domainId: 'A' },
  { id: 'A5', name: 'Modesty', domainId: 'A' },
  { id: 'A6', name: 'Sympathy', domainId: 'A' },
  { id: 'C1', name: 'Self-Efficacy', domainId: 'C' },
  { id: 'C2', name: 'Orderliness', domainId: 'C' },
  { id: 'C3', name: 'Dutifulness', domainId: 'C' },
  { id: 'C4', name: 'Achievement-Striving', domainId: 'C' },
  { id: 'C5', name: 'Self-Discipline', domainId: 'C' },
  { id: 'C6', name: 'Cautiousness', domainId: 'C' },
]

function facet(facetId: string, entries: readonly (readonly [string, 1 | -1])[]): LikertItem[] {
  return entries.map(([text, keyed], index) => ({
    id: `${facetId}-${index + 1}`,
    text,
    facetId,
    keyed,
  }))
}

export const IPIP_ITEMS: readonly LikertItem[] = [
  ...facet('N1', [
    ['Worry about things.', 1],
    ['Fear for the worst.', 1],
    ['Am afraid of many things.', 1],
    ['Get stressed out easily.', 1],
  ]),
  ...facet('N2', [
    ['Get angry easily.', 1],
    ['Get irritated easily.', 1],
    ['Lose my temper.', 1],
    ['Am not easily annoyed.', -1],
  ]),
  ...facet('N3', [
    ['Often feel blue.', 1],
    ['Dislike myself.', 1],
    ['Am often down in the dumps.', 1],
    ['Feel comfortable with myself.', -1],
  ]),
  ...facet('N4', [
    ['Find it difficult to approach others.', 1],
    ['Am afraid to draw attention to myself.', 1],
    ['Only feel comfortable with friends.', 1],
    ['Am not bothered by difficult social situations.', -1],
  ]),
  ...facet('N5', [
    ['Go on binges.', 1],
    ['Rarely overindulge.', -1],
    ['Easily resist temptations.', -1],
    ['Am able to control my cravings.', -1],
  ]),
  ...facet('N6', [
    ['Panic easily.', 1],
    ['Become overwhelmed by events.', 1],
    ["Feel that I'm unable to deal with things.", 1],
    ['Remain calm under pressure.', -1],
  ]),
  ...facet('E1', [
    ['Make friends easily.', 1],
    ['Feel comfortable around people.', 1],
    ['Avoid contacts with others.', -1],
    ['Keep others at a distance.', -1],
  ]),
  ...facet('E2', [
    ['Love large parties.', 1],
    ['Talk to a lot of different people at parties.', 1],
    ['Prefer to be alone.', -1],
    ['Avoid crowds.', -1],
  ]),
  ...facet('E3', [
    ['Take charge.', 1],
    ['Try to lead others.', 1],
    ['Take control of things.', 1],
    ['Wait for others to lead the way.', -1],
  ]),
  ...facet('E4', [
    ['Am always busy.', 1],
    ['Am always on the go.', 1],
    ['Do a lot in my spare time.', 1],
    ['Like to take it easy.', -1],
  ]),
  ...facet('E5', [
    ['Love excitement.', 1],
    ['Seek adventure.', 1],
    ['Enjoy being reckless.', 1],
    ['Act wild and crazy.', 1],
  ]),
  ...facet('E6', [
    ['Radiate joy.', 1],
    ['Have a lot of fun.', 1],
    ['Love life.', 1],
    ['Look at the bright side of life.', 1],
  ]),
  ...facet('O1', [
    ['Have a vivid imagination.', 1],
    ['Enjoy wild flights of fantasy.', 1],
    ['Love to daydream.', 1],
    ['Like to get lost in thought.', 1],
  ]),
  ...facet('O2', [
    ['Believe in the importance of art.', 1],
    ['See beauty in things that others might not notice.', 1],
    ['Do not like poetry.', -1],
    ['Do not enjoy going to art museums.', -1],
  ]),
  ...facet('O3', [
    ['Experience my emotions intensely.', 1],
    ["Feel others' emotions.", 1],
    ['Rarely notice my emotional reactions.', -1],
    ["Don't understand people who get emotional.", -1],
  ]),
  ...facet('O4', [
    ['Prefer variety to routine.', 1],
    ['Prefer to stick with things that I know.', -1],
    ['Dislike changes.', -1],
    ['Am attached to conventional ways.', -1],
  ]),
  ...facet('O5', [
    ['Love to read challenging material.', 1],
    ['Avoid philosophical discussions.', -1],
    ['Have difficulty understanding abstract ideas.', -1],
    ['Am not interested in theoretical discussions.', -1],
  ]),
  ...facet('O6', [
    ['Tend to vote for liberal political candidates.', 1],
    ['Believe that there is no absolute right and wrong.', 1],
    ['Tend to vote for conservative political candidates.', -1],
    ['Believe that we should be tough on crime.', -1],
  ]),
  ...facet('A1', [
    ['Trust others.', 1],
    ['Believe that others have good intentions.', 1],
    ['Trust what people say.', 1],
    ['Distrust people.', -1],
  ]),
  ...facet('A2', [
    ['Use others for my own ends.', -1],
    ['Cheat to get ahead.', -1],
    ['Take advantage of others.', -1],
    ["Obstruct others' plans.", -1],
  ]),
  ...facet('A3', [
    ['Am concerned about others.', 1],
    ['Love to help others.', 1],
    ['Am indifferent to the feelings of others.', -1],
    ['Take no time for others.', -1],
  ]),
  ...facet('A4', [
    ['Love a good fight.', -1],
    ['Yell at people.', -1],
    ['Insult people.', -1],
    ['Get back at others.', -1],
  ]),
  ...facet('A5', [
    ['Believe that I am better than others.', -1],
    ['Think highly of myself.', -1],
    ['Have a high opinion of myself.', -1],
    ['Boast about my virtues.', -1],
  ]),
  ...facet('A6', [
    ['Sympathize with the homeless.', 1],
    ['Feel sympathy for those who are worse off than myself.', 1],
    ["Am not interested in other people's problems.", -1],
    ['Try not to think about the needy.', -1],
  ]),
  ...facet('C1', [
    ['Complete tasks successfully.', 1],
    ['Excel in what I do.', 1],
    ['Handle tasks smoothly.', 1],
    ['Know how to get things done.', 1],
  ]),
  ...facet('C2', [
    ['Like to tidy up.', 1],
    ['Often forget to put things back in their proper place.', -1],
    ['Leave a mess in my room.', -1],
    ['Leave my belongings around.', -1],
  ]),
  ...facet('C3', [
    ['Keep my promises.', 1],
    ['Tell the truth.', 1],
    ['Break rules.', -1],
    ['Break my promises.', -1],
  ]),
  ...facet('C4', [
    ["Do more than what's expected of me.", 1],
    ['Work hard.', 1],
    ['Put little time and effort into my work.', -1],
    ['Do just enough work to get by.', -1],
  ]),
  ...facet('C5', [
    ['Am always prepared.', 1],
    ['Carry out my plans.', 1],
    ['Waste my time.', -1],
    ['Have difficulty starting tasks.', -1],
  ]),
  ...facet('C6', [
    ['Jump into things without thinking.', -1],
    ['Make rash decisions.', -1],
    ['Rush into things.', -1],
    ['Act without thinking.', -1],
  ]),
]

export const IPIP_BY_ID: ReadonlyMap<string, LikertItem> = new Map(
  IPIP_ITEMS.map((item) => [item.id, item]),
)

export function ipipItemsForFacet(facetId: string): LikertItem[] {
  return IPIP_ITEMS.filter((item) => item.facetId === facetId)
}

export function ipipItemsForDomain(domainId: string): LikertItem[] {
  const facetIds = new Set(IPIP_FACETS.filter((facet) => facet.domainId === domainId).map((facet) => facet.id))
  return IPIP_ITEMS.filter((item) => facetIds.has(item.facetId))
}
