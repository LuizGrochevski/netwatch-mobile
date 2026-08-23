export function relativeTime(isoString) {
  if (!isoString) return '—'

  let normalized = isoString
  if (!isoString.includes('T') && !isoString.endsWith('Z')) {
    normalized = isoString.replace(' ', 'T') + 'Z'
  }

  const now = new Date().getTime()
  const then = new Date(normalized).getTime()

  const diffSec = Math.round((now - then) / 1000)
  if (diffSec <= 0) return 'agora mesmo'
  if (diffSec < 60) return `${diffSec}s atrás`

  const diffMin = Math.round(diffSec / 60)
  if (diffMin < 60) return `${diffMin}min atrás`

  const diffHr = Math.round(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h atrás`

  const diffDay = Math.round(diffHr / 24)
  return `${diffDay}d atrás`
}
