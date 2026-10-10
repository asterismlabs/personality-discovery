import { computed, reactive, watch } from 'vue'
import { buildJsonExport, buildTextExport } from '../export/buildExport'
import { VALUE_DROP_ID, VALUE_KEEP_ID } from '../data/followUp'
import { chunk, presentationOrder } from '../flow/order'
import { buildPrompt, TASK_PRESETS, type PromptContext, type TaskId } from '../prompt/buildPrompt'
import { scoreAll } from '../scoring/scoreAll'
import { SECTIONS, type SectionDef } from '../data/sections'

const STORAGE_KEY = 'personality-discovery.v1'

export interface Position {
  stage: 'welcome' | 'intro' | 'items' | 'results' | 'about'
  sectionIndex: number
  page: number
}

export interface SessionState {
  version: 1
  seed: number
  saveLocally: boolean
  answers: Record<string, number>
  /** Choices on the fixed follow-up questions, keyed by question id. */
  followUp: Record<string, string>
  skipped: string[]
  position: Position
  history: Position[]
  timings: Record<string, { startedAt: number | null; completedAt: number | null }>
  context: PromptContext
  taskIds: TaskId[]
  customTask: string
  error: string
  errorItemId: string
  resultsUnlocked: boolean
}

function emptyContext(): PromptContext {
  return { country: '', education: '', constraints: '', goals: '' }
}

function freshState(): SessionState {
  return {
    version: 1,
    seed: Math.floor(Math.random() * 1_000_000_000),
    saveLocally: false,
    answers: {},
    followUp: {},
    skipped: [],
    position: { stage: 'welcome', sectionIndex: 0, page: 0 },
    history: [],
    timings: {},
    context: emptyContext(),
    taskIds: ['professions'],
    customTask: '',
    error: '',
    errorItemId: '',
    resultsUnlocked: false,
  }
}

function storedTaskIds(parsed: { taskIds?: unknown; taskId?: unknown }): TaskId[] {
  const raw = Array.isArray(parsed.taskIds) ? parsed.taskIds : typeof parsed.taskId === 'string' ? [parsed.taskId] : []
  const ids = raw.filter((id): id is TaskId => TASK_PRESETS.some((task) => task.id === id))
  return ids.length > 0 ? ids : ['professions']
}

function canUseStorage(): boolean {
  return typeof localStorage !== 'undefined'
}

function readStored(): SessionState | null {
  if (!canUseStorage()) return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SessionState
    if (parsed.version !== 1 || typeof parsed.seed !== 'number' || !parsed.position) return null
    return {
      ...freshState(),
      ...parsed,
      saveLocally: true,
      answers: parsed.answers ?? {},
      followUp: parsed.followUp ?? {},
      skipped: parsed.skipped ?? [],
      history: parsed.history ?? [],
      timings: parsed.timings ?? {},
      context: { ...emptyContext(), ...parsed.context },
      error: '',
      errorItemId: '',
      taskIds: storedTaskIds(parsed),
      resultsUnlocked: parsed.resultsUnlocked === true || parsed.position.stage === 'results',
    }
  } catch {
    return null
  }
}

export function useSession() {
  const state = reactive<SessionState>(readStored() ?? freshState())

  watch(
    state,
    () => {
      if (!canUseStorage()) return
      if (!state.saveLocally) return
      try {
        const snapshot = JSON.parse(JSON.stringify(state)) as SessionState
        snapshot.error = ''
        snapshot.errorItemId = ''
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
      } catch {
        // Storage can be unavailable or full. Answers remain in memory.
      }
    },
    { deep: true },
  )

  const presentation = computed(() => {
    const map: Record<string, string[]> = {}
    for (const section of SECTIONS) map[section.id] = presentationOrder(section.id, state.seed)
    return map
  })

  const results = computed(() =>
    scoreAll({
      answers: state.answers,
      skipped: state.skipped,
      timings: state.timings,
      presentation: presentation.value,
      followUp: state.followUp,
      seed: state.seed,
    }),
  )

  const promptInput = computed(() => ({
    results: results.value,
    taskIds: state.taskIds,
    customTask: state.customTask,
    context: state.context,
  }))

  const prompt = computed(() => buildPrompt(promptInput.value))

  function sectionByIndex(index: number): SectionDef {
    return SECTIONS[index] ?? SECTIONS[0]
  }

  function pagesFor(section: SectionDef): string[][] {
    return chunk(presentation.value[section.id] ?? [], section.pageSize)
  }

  function markStarted(section: SectionDef): void {
    const current = state.timings[section.id]
    if (current?.startedAt) return
    state.timings[section.id] = { startedAt: Date.now(), completedAt: current?.completedAt ?? null }
  }

  function markCompleted(section: SectionDef): void {
    const current = state.timings[section.id]
    state.timings[section.id] = { startedAt: current?.startedAt ?? Date.now(), completedAt: Date.now() }
  }

  function go(next: Position): void {
    state.history.push({ ...state.position })
    state.position = next
    state.error = ''
    state.errorItemId = ''
    if (next.stage === 'results') state.resultsUnlocked = true
  }

  function pageMissing(section: SectionDef, page: number): string | null {
    if (section.kind !== 'likert') return null
    const items = pagesFor(section)[page] ?? []
    return items.find((id) => state.answers[id] === undefined) ?? null
  }

  function next(): void {
    const pos = state.position
    if (pos.stage === 'about') return
    if (pos.stage === 'welcome') {
      go({ stage: 'intro', sectionIndex: 0, page: 0 })
      markStarted(sectionByIndex(0))
      return
    }
    if (pos.stage === 'results') return
    const section = sectionByIndex(pos.sectionIndex)
    if (pos.stage === 'intro') {
      state.skipped = state.skipped.filter((id) => id !== section.id)
      markStarted(section)
      go({ stage: 'items', sectionIndex: pos.sectionIndex, page: 0 })
      return
    }
    const missing = pageMissing(section, pos.page)
    if (missing) {
      state.error = 'Please answer every item on this page before continuing.'
      state.errorItemId = missing
      return
    }
    const pages = pagesFor(section)
    if (pos.page < pages.length - 1) {
      go({ stage: 'items', sectionIndex: pos.sectionIndex, page: pos.page + 1 })
      return
    }
    markCompleted(section)
    const nextIndex = pos.sectionIndex + 1
    if (nextIndex >= SECTIONS.length) {
      go({ stage: 'results', sectionIndex: pos.sectionIndex, page: 0 })
      return
    }
    go({ stage: 'intro', sectionIndex: nextIndex, page: 0 })
    markStarted(sectionByIndex(nextIndex))
  }

  function skipSection(): void {
    const section = sectionByIndex(state.position.sectionIndex)
    if (!section.optional || state.position.stage !== 'intro') return
    if (!state.skipped.includes(section.id)) state.skipped.push(section.id)
    const nextIndex = state.position.sectionIndex + 1
    if (nextIndex >= SECTIONS.length) go({ stage: 'results', sectionIndex: state.position.sectionIndex, page: 0 })
    else {
      go({ stage: 'intro', sectionIndex: nextIndex, page: 0 })
      markStarted(sectionByIndex(nextIndex))
    }
  }

  function back(): void {
    const previous = state.history.pop()
    if (!previous) return
    state.position = previous
    state.error = ''
    state.errorItemId = ''
  }

  function goToPage(page: number): void {
    const pos = state.position
    if (pos.stage !== 'items') return
    const section = sectionByIndex(pos.sectionIndex)
    const pages = pagesFor(section)
    if (page < 0 || page >= pages.length || page === pos.page) return
    if (page > pos.page) {
      for (let index = pos.page; index < page; index += 1) {
        const missing = pageMissing(section, index)
        if (missing) {
          state.error = 'Please answer every item on this page before continuing.'
          state.errorItemId = missing
          if (index !== pos.page) go({ stage: 'items', sectionIndex: pos.sectionIndex, page: index })
          return
        }
      }
    }
    go({ stage: 'items', sectionIndex: pos.sectionIndex, page })
  }

  function goToStep(index: number): void {
    if (!state.resultsUnlocked) return
    if (index < 0 || index >= SECTIONS.length) return
    const section = sectionByIndex(index)
    const pos = state.position
    if (state.skipped.includes(section.id)) {
      if (pos.stage === 'intro' && pos.sectionIndex === index) return
      go({ stage: 'intro', sectionIndex: index, page: 0 })
      return
    }
    if (pos.stage === 'items' && pos.sectionIndex === index && pos.page === 0) return
    markStarted(section)
    go({ stage: 'items', sectionIndex: index, page: 0 })
  }

  function goToResults(): void {
    if (!state.resultsUnlocked || state.position.stage === 'results') return
    go({ stage: 'results', sectionIndex: state.position.sectionIndex, page: 0 })
  }

  function goHome(): void {
    if (state.position.stage === 'welcome') return
    go({ stage: 'welcome', sectionIndex: 0, page: 0 })
  }

  function reviewSection(sectionId: string): void {
    const index = SECTIONS.findIndex((section) => section.id === sectionId)
    if (index < 0) return
    go({ stage: 'intro', sectionIndex: index, page: 0 })
  }

  function openAbout(): void {
    if (state.position.stage === 'about') return
    go({ stage: 'about', sectionIndex: state.position.sectionIndex, page: state.position.page })
  }

  function setAnswer(id: string, value: number): void {
    state.answers[id] = value
    if (state.errorItemId === id) {
      state.error = ''
      state.errorItemId = ''
    }
  }

  function setFollowUp(id: string, value: string): void {
    state.followUp[id] = value
    if (id === VALUE_KEEP_ID && state.followUp[VALUE_DROP_ID] === value) delete state.followUp[VALUE_DROP_ID]
  }

  function setSaveLocally(on: boolean): void {
    state.saveLocally = on
    if (!canUseStorage() || on) return
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Leave the in-memory answers in place either way.
    }
  }

  function clearAll(): void {
    const next = freshState()
    state.seed = next.seed
    state.saveLocally = false
    state.answers = {}
    state.followUp = {}
    state.skipped = []
    state.position = next.position
    state.history = []
    state.timings = {}
    state.context = emptyContext()
    state.taskIds = ['professions']
    state.customTask = ''
    state.error = ''
    state.errorItemId = ''
    state.resultsUnlocked = false
    if (!canUseStorage()) return
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Already cleared in memory.
    }
  }

  const progress = computed(() => {
    const included = SECTIONS.filter((section) => !state.skipped.includes(section.id))
    if (included.length === 0) return 0
    const total = included.reduce((sum, section) => {
      const ids = (presentation.value[section.id] ?? []).filter((id) => !id.startsWith('attn-'))
      if (section.kind === 'checklist') {
        const done = state.timings[section.id]?.completedAt
        if (done) return sum + 1
        if (state.position.stage === 'items' && sectionByIndex(state.position.sectionIndex).id === section.id) {
          return sum + state.position.page / Math.max(pagesFor(section).length, 1)
        }
        return sum
      }
      const answered = ids.filter((id) => state.answers[id] !== undefined).length
      return sum + answered / Math.max(ids.length, 1)
    }, 0)
    return Math.round((total / included.length) * 100)
  })

  const textExport = computed(() => buildTextExport(prompt.value))
  const jsonExport = computed(() => buildJsonExport(results.value, promptInput.value, state.answers))

  return {
    state,
    sections: SECTIONS,
    tasks: TASK_PRESETS,
    presentation,
    results,
    prompt,
    progress,
    textExport,
    jsonExport,
    sectionByIndex,
    pagesFor,
    next,
    back,
    skipSection,
    goToPage,
    goToStep,
    goToResults,
    goHome,
    reviewSection,
    openAbout,
    setAnswer,
    setFollowUp,
    setSaveLocally,
    clearAll,
  }
}

export type Session = ReturnType<typeof useSession>
