const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || ''

function joinUrl(base: string, path: string): string {
  if (!base) return path
  if (base.endsWith('/') && path.startsWith('/')) return base.slice(0, -1) + path
  if (!base.endsWith('/') && !path.startsWith('/')) return base + '/' + path
  return base + path
}

export async function apiFetch(inputPath: string, init?: RequestInit) {
  const url = joinUrl(API_BASE_URL, inputPath)
  const res = await fetch(url, init)
  return res
}

export { API_BASE_URL }


