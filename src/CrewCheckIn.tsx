import { useState } from 'react'
import type { FormEvent } from 'react'
import { energyLevels, parseCheckIns, storageKey } from './checkIns'
import type { CheckIn, Energy } from './checkIns'
import { scenarios } from './telemetry'
import type { Scenario } from './telemetry'

function loadHistory() {
  try {
    return { entries: parseCheckIns(localStorage.getItem(storageKey)), message: '' }
  } catch {
    return { entries: [], message: 'Saved check-ins could not be loaded.' }
  }
}

export default function CrewCheckIn({ scenario }: { scenario: Scenario }) {
  const [history, setHistory] = useState(loadHistory)
  const [energy, setEnergy] = useState<Energy | ''>('')
  const [note, setNote] = useState('')

  function saveCheckIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!energy) return

    try {
      const entry: CheckIn = {
        id: crypto.randomUUID(),
        scenario,
        energy,
        note: note.trim(),
        recordedAt: new Date().toISOString(),
      }
      const entries = [entry, ...parseCheckIns(localStorage.getItem(storageKey))]
      localStorage.setItem(storageKey, JSON.stringify(entries))
      setHistory({ entries, message: 'Demo check-in saved on this browser.' })
      setEnergy('')
      setNote('')
    } catch {
      setHistory((current) => ({ ...current, message: 'This browser could not save the check-in. Your draft is still here.' }))
    }
  }

  return (
    <section className="check-in panel" aria-labelledby="check-in-title">
      <h2 id="check-in-title">Crew check-in</h2>
      <p className="muted">Use fictional entries for the demo. Check-ins stay in this browser and do not affect telemetry alerts.</p>
      <div className="check-in-grid">
        <form onSubmit={saveCheckIn}>
          <p className="check-in-context">Scenario <strong>{scenarios[scenario].label}</strong></p>
          <label htmlFor="check-in-energy">Energy level</label>
          <select id="check-in-energy" required value={energy} onChange={(event) => setEnergy(event.target.value as Energy | '')}>
            <option value="">Select an energy level</option>
            {energyLevels.map((level) => <option key={level}>{level}</option>)}
          </select>
          <label htmlFor="check-in-note">Mission note (optional)</label>
          <textarea id="check-in-note" rows={3} maxLength={200} value={note} onChange={(event) => setNote(event.target.value)} />
          <button type="submit">Save check-in</button>
          <p role="status" className="muted">{history.message}</p>
        </form>
        <div>
          <h3>Check-in history</h3>
          {history.entries.length === 0 ? <p className="muted">No check-ins to display.</p> : (
            <ul className="check-in-history">
              {history.entries.map((entry) => (
                <li key={entry.id}>
                  <strong>{entry.energy} energy · {scenarios[entry.scenario].label}</strong>
                  <time dateTime={entry.recordedAt}>{new Date(entry.recordedAt).toLocaleString()}</time>
                  {entry.note && <p>{entry.note}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
