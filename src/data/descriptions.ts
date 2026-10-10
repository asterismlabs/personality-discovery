export interface ScaleCopy {
  high: string
  low: string
}

/**
 * Original wording for this app. Neutral and non-diagnostic.
 * High and low describe the ends of the scale. They are not types.
 */
export const SCALE_COPY: Readonly<Record<string, ScaleCopy>> = {
  N: {
    high: 'You more often described feeling worry, tension, or being easily upset. That is a tendency in these answers, not a diagnosis.',
    low: 'You more often described staying calm and even when things are difficult.',
  },
  E: {
    high: 'You more often described seeking company, activity, and a lively pace.',
    low: 'You more often described being quieter, more reserved, or happier with less stimulation.',
  },
  O: {
    high: 'You more often described curiosity, imagination, and interest in new or abstract ideas.',
    low: 'You more often described preferring the familiar, the practical, and the concrete.',
  },
  A: {
    high: 'You more often described being trusting, cooperative, and concerned about other people.',
    low: 'You more often described being more skeptical, direct, or willing to put your own goals first.',
  },
  C: {
    high: 'You more often described planning, follow-through, and holding yourself to a high standard.',
    low: 'You more often described a looser approach to plans, order, and follow-through.',
  },
  N1: {
    high: 'You more often described worry and expecting that things could go wrong.',
    low: 'You less often described worry as a regular part of your day.',
  },
  N2: {
    high: 'You more often described getting angry or irritated.',
    low: 'You more often described not being easily annoyed.',
  },
  N3: {
    high: 'You more often described feeling down or unhappy with yourself. This is a self-description, not a clinical assessment.',
    low: 'You more often described feeling comfortable with yourself.',
  },
  N4: {
    high: 'You more often described discomfort when attention is on you or when meeting people.',
    low: 'You more often described being less bothered by difficult social situations.',
  },
  N5: {
    high: 'You more often described having trouble resisting cravings or overdoing things.',
    low: 'You more often described being able to resist temptations.',
  },
  N6: {
    high: 'You more often described feeling overwhelmed or unsteady under pressure.',
    low: 'You more often described remaining calm under pressure.',
  },
  E1: {
    high: 'You more often described making friends and feeling at ease around people.',
    low: 'You more often described keeping a distance from others.',
  },
  E2: {
    high: 'You more often described liking groups, parties, and crowds.',
    low: 'You more often described preferring to be alone or away from crowds.',
  },
  E3: {
    high: 'You more often described taking charge and leading.',
    low: 'You more often described waiting for someone else to lead.',
  },
  E4: {
    high: 'You more often described staying busy and on the go.',
    low: 'You more often described preferring to take it easy.',
  },
  E5: {
    high: 'You more often described seeking excitement and adventure.',
    low: 'You less often described seeking thrills.',
  },
  E6: {
    high: 'You more often described joy, fun, and a bright outlook.',
    low: 'You less often described feeling cheerful or playful.',
  },
  O1: {
    high: 'You more often described a vivid imagination and time spent in daydreams.',
    low: 'You less often described fantasy and daydreaming.',
  },
  O2: {
    high: 'You more often described caring about art, beauty, or poetry.',
    low: 'You more often described little interest in poetry or art museums.',
  },
  O3: {
    high: 'You more often described feeling emotions strongly, including other people’s.',
    low: 'You more often described rarely noticing emotional reactions.',
  },
  O4: {
    high: 'You more often described preferring variety over routine.',
    low: 'You more often described sticking with what you know and disliking change.',
  },
  O5: {
    high: 'You more often described interest in challenging reading and abstract ideas.',
    low: 'You more often described avoiding theoretical or philosophical discussion.',
  },
  O6: {
    high: 'You more often endorsed changing social rules, in the wording of these items.',
    low: 'You more often endorsed conventional or tougher social rules, in the wording of these items. This is not a political label.',
  },
  A1: {
    high: 'You more often described trusting what people say and assuming good intentions.',
    low: 'You more often described distrust of people.',
  },
  A2: {
    high: 'You less often described using, cheating, or taking advantage of others.',
    low: 'You more often described using other people to get ahead.',
  },
  A3: {
    high: 'You more often described caring about others and wanting to help.',
    low: 'You more often described being indifferent to other people’s feelings.',
  },
  A4: {
    high: 'You less often described insults, yelling, or getting back at people.',
    low: 'You more often described conflict, insults, or payback.',
  },
  A5: {
    high: 'You less often described seeing yourself as better than other people.',
    low: 'You more often described a high opinion of yourself.',
  },
  A6: {
    high: 'You more often described sympathy for people who are worse off.',
    low: 'You more often described not wanting to think about other people’s problems.',
  },
  C1: {
    high: 'You more often described completing tasks and knowing how to get things done.',
    low: 'You less often described smooth, successful follow-through.',
  },
  C2: {
    high: 'You more often described liking things tidy and put away.',
    low: 'You more often described leaving things out of place.',
  },
  C3: {
    high: 'You more often described keeping promises and telling the truth.',
    low: 'You more often described breaking rules or promises.',
  },
  C4: {
    high: 'You more often described working hard and doing more than the minimum.',
    low: 'You more often described putting in little effort or doing just enough.',
  },
  C5: {
    high: 'You more often described starting tasks and carrying out plans.',
    low: 'You more often described wasting time or having trouble getting started.',
  },
  C6: {
    high: 'You less often described rushing or deciding without thinking.',
    low: 'You more often described jumping in or acting without thinking.',
  },
  iR: {
    high: 'You checked more activities that involve hands-on work with tools, machines, plants, animals, or the outdoors.',
    low: 'You checked few activities that involve hands-on work with tools, machines, plants, animals, or the outdoors.',
  },
  iI: {
    high: 'You checked more activities that involve studying problems, science, or how things work.',
    low: 'You checked few activities that involve studying problems, science, or how things work.',
  },
  iA: {
    high: 'You checked more activities that involve art, music, writing, or design.',
    low: 'You checked few activities that involve art, music, writing, or design.',
  },
  iS: {
    high: 'You checked more activities that involve teaching, caring, or helping people.',
    low: 'You checked few activities that involve teaching, caring, or helping people.',
  },
  iE: {
    high: 'You checked more activities that involve leading, selling, or running a business.',
    low: 'You checked few activities that involve leading, selling, or running a business.',
  },
  iC: {
    high: 'You checked more activities that involve records, numbers, and orderly procedures.',
    low: 'You checked few activities that involve records, numbers, and orderly procedures.',
  },
  achievement: {
    high: 'You more strongly agreed that using your skills and doing the job well matter to you.',
    low: 'You less strongly agreed that using your skills and doing the job well are central for you.',
  },
  independence: {
    high: 'You more strongly agreed that you want freedom in how you work.',
    low: 'You less strongly agreed that freedom in how you work is important to you.',
  },
  recognition: {
    high: 'You more strongly agreed that you want your work to be noticed and to grow in responsibility.',
    low: 'You less strongly agreed that recognition and advancement are important to you.',
  },
  relationships: {
    high: 'You more strongly agreed that coworkers and being useful to others matter to you.',
    low: 'You less strongly agreed that coworkers and being useful to others are central for you.',
  },
  support: {
    high: 'You more strongly agreed that fair supervision, training, and consistent rules matter to you.',
    low: 'You less strongly agreed that support from the organization is a priority for you.',
  },
  conditions: {
    high: 'You more strongly agreed that steady work, comfort, safety, and pay matter to you.',
    low: 'You less strongly agreed that steady conditions and pay are priorities for you.',
  },
  ambiguity: {
    high: 'You more often agreed that you can move ahead when the goal is still unclear.',
    low: 'You more often agreed that unclear instructions are hard to work with.',
  },
  structure: {
    high: 'You more often agreed that you want a plan and procedures before you start.',
    low: 'You more often agreed that you do better when the steps are left up to you.',
  },
  collaboration: {
    high: 'You more often agreed that you like to think and decide with other people.',
    low: 'You more often agreed that you would rather work a problem through on your own.',
  },
  pace: {
    high: 'You more often agreed that you want a faster pace and quicker feedback.',
    low: 'You more often agreed that you prefer a steadier pace and can wait longer for feedback.',
  },
  risk: {
    high: 'You more often agreed that you will try something that might not work.',
    low: 'You more often agreed that you prefer a safer option over an uncertain one.',
  },
}

export function describeScale(id: string, level: 'low' | 'moderate' | 'high' | null, name: string): string {
  if (level === null) return 'There are not enough answers to describe this scale.'
  const copy = SCALE_COPY[id]
  if (!copy) return 'No description is available for this scale.'
  if (level === 'high') return copy.high
  if (level === 'low') return copy.low
  return `Your answers sit near the midpoint of ${name}. Neither end of this scale is a strong description of how you answered.`
}
