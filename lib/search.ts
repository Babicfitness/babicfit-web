// Copied verbatim from Expo src/lib/search.ts — pure TypeScript, no dependencies.

const DIACRITIC_MAP: [RegExp, string][] = [
  [/[čć]/g, 'c'], [/š/g, 's'], [/ž/g, 'z'], [/đ/g, 'dj'],
  [/[ČĆ]/g, 'c'], [/Š/g,  's'], [/Ž/g,  'z'], [/Đ/g,  'dj'],
]

export function toSearchName(input: string): string {
  let result = input.toLowerCase()
  for (const [pattern, replacement] of DIACRITIC_MAP) {
    result = result.replace(pattern, replacement)
  }
  return result.trim()
}

export function normalizeQuery(raw: string): string {
  return toSearchName(raw).replace(/\s+/g, ' ').trim()
}

export function toLikePattern(query: string): string {
  return `%${normalizeQuery(query)}%`
}
