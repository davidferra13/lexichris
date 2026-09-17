import { siteConfig } from './siteConfig'

const escapeIcs = (value: string) =>
  value.replaceAll('\\', '\\\\').replaceAll(';', '\\;').replaceAll(',', '\\,').replaceAll('\n', '\\n')

const addOneDay = (dateISO: string) => {
  const [year, month, day] = dateISO.split('-').map(Number)
  const next = new Date(Date.UTC(year, month - 1, day + 1))
  return next.toISOString().slice(0, 10).replaceAll('-', '')
}

export function downloadCalendar() {
  const { dateISO, locationLabel, venueLabel } = siteConfig.details
  if (!dateISO) return
  const start = dateISO.replaceAll('-', '')
  const location = escapeIcs([venueLabel, locationLabel].filter(Boolean).join(', '))
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lexi + Chris//Save the Date//EN',
    'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${addOneDay(dateISO)}`, 'SUMMARY:Lexi + Chris', `LOCATION:${location}`,
    'DESCRIPTION:Save the date. Formal invitation to follow.', 'END:VEVENT', 'END:VCALENDAR']
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'lexi-and-chris-save-the-date.ics'
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
