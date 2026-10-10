import { describe, expect, it } from 'vitest'
import { IPIP_ITEMS } from '../data/ipipNeo120'
import { buildJsonExport, buildTextExport } from '../export/buildExport'
import { buildPrompt } from '../prompt/buildPrompt'
import { scoreAll } from '../scoring/scoreAll'

describe('no network', () => {
  it('scores, writes a prompt, and builds exports without calling browser network APIs', () => {
    const calls: string[] = []
    const globalRecord = globalThis as typeof globalThis & {
      fetch?: typeof fetch
      XMLHttpRequest?: typeof XMLHttpRequest
      WebSocket?: typeof WebSocket
    }
    const previous = {
      fetch: globalRecord.fetch,
      XMLHttpRequest: globalRecord.XMLHttpRequest,
      WebSocket: globalRecord.WebSocket,
      sendBeacon: globalThis.navigator?.sendBeacon,
    }
    globalRecord.fetch = (() => {
      calls.push('fetch')
      throw new Error('network')
    }) as typeof fetch
    class BlockedXHR {
      open(): void {
        calls.push('xhr')
        throw new Error('network')
      }
    }
    globalRecord.XMLHttpRequest = BlockedXHR as unknown as typeof XMLHttpRequest
    globalRecord.WebSocket = class {
      constructor() {
        calls.push('websocket')
        throw new Error('network')
      }
    } as unknown as typeof WebSocket
    if (globalThis.navigator) {
      globalThis.navigator.sendBeacon = () => {
        calls.push('beacon')
        throw new Error('network')
      }
    }

    try {
      const answers = Object.fromEntries(IPIP_ITEMS.map((item) => [item.id, 3]))
      const results = scoreAll({
        answers,
        skipped: ['values', 'workStyle'],
        timings: {},
        presentation: { personality: IPIP_ITEMS.map((item) => item.id), interests: [] },
      })
      const promptInput = {
        results,
        taskIds: ['professions'] as const,
        customTask: '',
        context: { country: '', education: '', constraints: '', goals: '' },
      }
      const prompt = buildPrompt(promptInput)
      const text = buildTextExport(prompt)
      const json = buildJsonExport(results, promptInput, answers)
      expect(prompt.length).toBeGreaterThan(200)
      expect(text).toContain('not a substitute')
      expect(json).toContain('"percentiles": false')
      expect(calls).toEqual([])
    } finally {
      globalRecord.fetch = previous.fetch
      globalRecord.XMLHttpRequest = previous.XMLHttpRequest
      globalRecord.WebSocket = previous.WebSocket
      if (globalThis.navigator && previous.sendBeacon) globalThis.navigator.sendBeacon = previous.sendBeacon
    }
  })
})
