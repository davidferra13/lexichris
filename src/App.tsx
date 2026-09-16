import { useState } from 'react'
import { CalendarPlus, ChevronDown, MapPin, MessageCircle } from 'lucide-react'
import { PinballArcade } from './components/PinballArcade'
import { RagdollEasterEgg } from './components/RagdollEasterEgg'
import { siteConfig } from './siteConfig'
import './styles.css'

type TapTarget = 'lexi' | 'chris'

function downloadCalendar() {
  const { dateISO, locationLabel, venueLabel } = siteConfig.details
  if (!dateISO) return
  const date = dateISO.replaceAll('-', '')
  const location = [venueLabel, locationLabel].filter(Boolean).join(', ')
  const body = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${date}`,
    `DTEND;VALUE=DATE:${date}`,
    'SUMMARY:Lexi + Chris',
    `LOCATION:${location}`,
    'DESCRIPTION:Save the date. Formal invitation to follow.',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  const blob = new Blob([body], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'lexi-and-chris-save-the-date.ics'
  anchor.click()
  URL.revokeObjectURL(url)
}

function App() {
  const [, setTapCount] = useState({ lexi: 0, chris: 0 })
  const [ragdollOpen, setRagdollOpen] = useState(false)
  const { couple, details, copy } = siteConfig

  const registerTap = (target: TapTarget) => {
    setTapCount((current) => {
      const next = { ...current, [target]: current[target] + 1 }
      if (next.lexi >= 7 && next.chris >= 7) setRagdollOpen(true)
      return next
    })
  }

  const detailsReady = Boolean(details.dateLabel && details.locationLabel)

  return (
    <>
      <main className="site-shell">
        <section className="hero" id="top">
          <div className="hero-photo-wrap">
            <img src="./assets/lexi-chris-hero.png" alt="Lexi and Chris together outdoors" className="hero-photo" />
            <div className="hero-mark" aria-hidden="true">L + C</div>
          </div>
          <div className="hero-copy">
            <p className="eyebrow">{copy.eyebrow}</p>
            <h1 aria-label="Lexi and Chris">
              <button type="button" className="name-button" onClick={() => registerTap('lexi')}>{couple.first}</button>
              <span className="name-plus">+</span>
              <button type="button" className="name-button" onClick={() => registerTap('chris')}>{couple.second}</button>
            </h1>
            <div className="date-lockup">
              <p>{details.dateLabel ?? 'date announcement coming soon'}</p>
              <p>{details.locationLabel ?? 'details to follow'}</p>
            </div>
            <p className="invitation-note">{copy.invitation}</p>
            <div className="hero-actions">
              <button type="button" className="primary-action" onClick={downloadCalendar} disabled={!details.dateISO}>
                <CalendarPlus size={18} />
                {details.dateISO ? 'add to calendar' : 'calendar unlocks with the date'}
              </button>
              {siteConfig.features.messageFormEnabled && (
                <button type="button" className="secondary-action"><MessageCircle size={18} /> leave a message</button>
              )}
            </div>
          </div>
          <a className="scroll-cue" href="#details" aria-label="scroll to details"><ChevronDown size={22} /></a>
        </section>

        <section className="details-section" id="details">
          <div className="section-heading">
            <p className="eyebrow">the short version</p>
            <h2>keep a day open for these two.</h2>
            <p>Everything guests actually need will live here. No hunting through texts, screenshots, or old group chats.</p>
          </div>
          <div className="detail-grid">
            <article className="detail-card">
              <span>01</span>
              <h3>the date</h3>
              <p>{details.dateLabel ?? 'the couple is locking the final date now.'}</p>
            </article>
            <article className="detail-card">
              <span>02</span>
              <h3>the place</h3>
              <p>{details.locationLabel ?? 'venue + travel details will appear here as soon as they are final.'}</p>
            </article>
            <article className="detail-card">
              <span>03</span>
              <h3>the invitation</h3>
              <p>save this page. the formal invitation and full weekend details will follow.</p>
            </article>
          </div>
          {!detailsReady && (
            <div className="status-note">
              <MapPin size={17} />
              <span>this page is live-ready; final date + location content can be dropped in without rebuilding it.</span>
            </div>
          )}
        </section>

        <section className="rules-section" aria-labelledby="rules-title">
          <div className="rules-card">
            <p className="eyebrow">house rules</p>
            <h2 id="rules-title">you found the part that matters.</h2>
            <ol>
              <li>Every RSVP must play at least one game and post a score.</li>
              <li>Don't play? You're buying a round of drinks.</li>
              <li>Lowest score on the board? Also buying a round.</li>
            </ol>
          </div>
        </section>
        <PinballArcade />

        <section className="closing-section">
          <div className="closing-monogram" aria-hidden="true">L+C</div>
          <p className="eyebrow">more soon</p>
          <h2>one link. every update.</h2>
          <p>The final date, place, weekend notes, and anything guests need will stay current here.</p>
          <a className="back-to-top" href="#top">back to top ↑</a>
        </section>

        <footer className="footer">
          <span>{copy.footer}</span>
          <span>lexi + chris</span>
        </footer>
      </main>
      <RagdollEasterEgg open={ragdollOpen} onClose={() => setRagdollOpen(false)} />
    </>
  )
}

export default App
