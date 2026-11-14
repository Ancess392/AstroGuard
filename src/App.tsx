import MissionResearch from './MissionResearch'
import OfflineStatus from './OfflineStatus'
import { useEffect, useRef, useState } from 'react'
import { evaluateTelemetry, scenarioIds, scenarios, thresholds } from './telemetry'
import type { Scenario } from './telemetry'
import CrewCheckIn from './CrewCheckIn'
import './App.css'

function HeartRateChart({ samples }: { samples: number[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const draw = () => {
      const { width, height } = canvas.getBoundingClientRect()
      const ratio = window.devicePixelRatio || 1
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      ctx.scale(ratio, ratio)
      const left = 34
      const right = width - 15
      const top = 10
      const bottom = height - 29
      const y = (value: number) => bottom - ((value - 60) / 60) * (bottom - top)
      const x = (index: number) => left + (index / (samples.length - 1)) * (right - left)

      ctx.font = '11px Consolas, monospace'
      ctx.fillStyle = '#a2b0c9'
      ctx.textBaseline = 'middle'
      for (const tick of [60, 80, 100, 120]) {
        ctx.fillText(String(tick), 0, y(tick))
        ctx.beginPath()
        ctx.strokeStyle = '#26344c'
        ctx.moveTo(left, y(tick))
        ctx.lineTo(right, y(tick))
        ctx.stroke()
      }

      ctx.beginPath()
      ctx.moveTo(left, bottom)
      samples.forEach((sample, index) => ctx.lineTo(x(index), y(sample)))
      ctx.lineTo(right, bottom)
      ctx.closePath()
      const fill = ctx.createLinearGradient(0, top, 0, bottom)
      fill.addColorStop(0, '#a58bff55')
      fill.addColorStop(1, '#a58bff06')
      ctx.fillStyle = fill
      ctx.fill()

      ctx.beginPath()
      ctx.moveTo(left, y(samples[0]))
      samples.slice(1).forEach((sample, index) => ctx.lineTo(x(index + 1), y(sample)))
      ctx.lineWidth = 2.5
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#b299ff'
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(right, y(samples[samples.length - 1]), 4, 0, Math.PI * 2)
      ctx.fillStyle = '#d4c7ff'
      ctx.fill()

      ctx.fillStyle = '#a2b0c9'
      ctx.textAlign = 'center'
      for (const index of [0, 3, 6, 9, 11]) {
        ctx.fillText(`−${(11 - index) * 5}m`.replace('−0m', 'Now'), x(index), height - 8)
      }
    }

    draw()
    const observer = new ResizeObserver(draw)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [samples])

  return (
    <>
      <canvas ref={canvasRef} role="img" aria-label="Simulated heart rate over the last 55 minutes. Exact readings are available below." />
      <details className="readings">
        <summary>View sample readings</summary>
        <table>
          <thead><tr><th scope="col">Time</th><th scope="col">Heart rate (bpm)</th></tr></thead>
          <tbody>
            {samples.map((sample, index) => (
              <tr key={index}><td>{index === 11 ? 'Now' : `${(11 - index) * 5} min ago`}</td><td>{sample}</td></tr>
            ))}
          </tbody>
        </table>
      </details>
    </>
  )
}

function App() {
  const [scenario, setScenario] = useState<Scenario>('normal')
  const data = scenarios[scenario]
  const latestHeartRate = data.heartRate[data.heartRate.length - 1]
  const { shortSleep, sustainedHeartRate } = evaluateTelemetry(data.sleep, data.heartRate)
  const hasAlert = shortSleep || sustainedHeartRate
  const metrics = [
    { name: 'Heart rate', value: latestHeartRate, unit: 'bpm', icon: '♡', color: 'violet', note: 'Latest sample', flagged: sustainedHeartRate },
    { name: 'Blood oxygen', value: data.oxygen, unit: '%', icon: '◈', color: 'cyan', note: 'Simulated SpO₂' },
    { name: 'Temperature', value: data.temperature.toFixed(1), unit: '°C', icon: '♨', color: 'orange', note: 'Simulated body temperature' },
    { name: 'Sleep duration', value: data.sleep.toFixed(1), unit: 'h', icon: '☾', color: 'blue', note: 'Previous sleep period', flagged: shortSleep },
  ]

  return (
    <>
      <header className="site-header">
        <div className="shell topbar">
          <div className="brand"><span className="brand-icon" aria-hidden="true">✦</span>AstroGuard</div>
          <span className="mode"><span aria-hidden="true" /> Simulation mode</span>
        </div>
      </header>
      <main className="shell">
        <OfflineStatus />
        <section className="hero" aria-labelledby="page-title">
          <div className="orbit" aria-hidden="true" />
          <div className="hero-content">
            <p className="eyebrow">NASA SPACE APPS 2026 · DEMO</p>
            <h1 id="page-title">Crew health dashboard</h1>
            <p>Explore how simulated astronaut telemetry changes across three mission scenarios.</p>
          </div>
        </section>

        <section className="scenario panel" aria-labelledby="scenario-title">
          <h2 id="scenario-title">Mission scenario</h2>
          <div className="options" role="group" aria-labelledby="scenario-title">
            {scenarioIds.map((id) => (
              <button key={id} type="button" aria-pressed={id === scenario} onClick={() => setScenario(id)}>
                {scenarios[id].label}
              </button>
            ))}
          </div>
        </section>

        <section aria-labelledby="vitals-title">
          <div className="section-heading">
            <h2 id="vitals-title">Crew vitals</h2>
            <span className="mono">SIMULATED READINGS</span>
          </div>
          <div className="metrics">
            {metrics.map((metric) => (
              <article className="metric panel" key={metric.name}>
                <span className={`metric-icon ${metric.color}`} aria-hidden="true">{metric.icon}</span>
                <h3>{metric.name}</h3>
                <p className="reading">{metric.value} <span>{metric.unit}</span></p>
                <p className={metric.flagged ? 'warning' : 'muted'}>{metric.flagged ? 'Demo rule triggered' : metric.note}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="analysis-grid">
          <section className="chart panel" aria-labelledby="trend-title">
            <h2 id="trend-title">Heart rate trend</h2>
            <p className="muted">Beats per minute · sampled every 5 minutes</p>
            <HeartRateChart samples={data.heartRate} />
          </section>
          <section className="alerts panel" aria-labelledby="alerts-title">
            <h2 id="alerts-title">Scenario alerts</h2>
            <div className={`status ${hasAlert ? 'warning' : 'clear'}`} aria-live="polite">
              {!hasAlert && <p><strong>No demo rules triggered</strong><span>The latest readings did not cross either rule below.</span></p>}
              {shortSleep && <p><strong>Short sleep</strong><span>{data.sleep.toFixed(1)} h of simulated sleep is below the {thresholds.sleep} h demo threshold.</span></p>}
              {sustainedHeartRate && <p><strong>Sustained elevated heart rate</strong><span>The last three readings ({data.heartRate.slice(-3).join(', ')} bpm) all reached the {thresholds.heartRate} bpm demo threshold.</span></p>}
            </div>
            <details className="rules">
              <summary>How alerts work</summary>
              <ul>
                <li><strong>Sleep:</strong> less than {thresholds.sleep} h in the previous sleep period.</li>
                <li><strong>Heart rate:</strong> all three latest samples at or above {thresholds.heartRate} bpm.</li>
              </ul>
              <p>These rules use illustrative thresholds for the demo.</p>
            </details>
          </section>
        </div>
        <CrewCheckIn scenario={scenario} />
        <MissionResearch />
        <footer><strong>Simulation only.</strong> Dashboard vitals are synthetic; the Mission research panel contains separately labeled archived NASA data. Alerts are for demonstration and cannot diagnose health conditions or guide medical decisions.</footer>
      </main>
    </>
  )
}

export default App
