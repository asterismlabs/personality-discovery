import { readdirSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { EXTERNAL_LINKS } from '../src/data/links'

const ALLOWED = new Set<string>([
  ...Object.values(EXTERNAL_LINKS),
  'http://www.w3.org/2000/svg',
  'http://www.w3.org/1999/xlink',
  // XML namespace checked by Vue. Not requested.
  'http://www.w3.org/1998/Math/MathML',
  // Vue prints this in dev-oriented error text. The app does not request it.
  'https://vuejs.org/error-reference/#runtime-${r}',
  // Workbox mentions this in an internal warning string. The service worker does not request it.
  'https://bit.ly/wb-precache',
])

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = resolve(dir, name)
    if (statSync(path).isDirectory()) return files(path)
    return path
  })
}

describe('built files', () => {
  it('contains no external URLs except attribution and XML namespaces', () => {
    const dist = resolve('dist')
    const found = new Set<string>()
    for (const path of files(dist)) {
      if (!/\.(html|js|css|svg|webmanifest|json)$/.test(path)) continue
      const text = readFileSync(path, 'utf8')
      for (const match of text.matchAll(/https?:\/\/[^\s"'`<>\\)]+/g)) {
        const url = match[0].replace(/[.,]+$/, '')
        found.add(url)
      }
    }
    const unexpected = [...found].filter((url) => !ALLOWED.has(url))
    expect(unexpected).toEqual([])
  })
})
