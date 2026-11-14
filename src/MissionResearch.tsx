import research from './missionResearch.json'

export default function MissionResearch() {
  return (
    <section className="mission-research panel" aria-labelledby="research-title">
      <p className="eyebrow">NASA OSDR · ARCHIVED RESEARCH</p>
      <h2 id="research-title">Mission research</h2>
      <h3>Inspiration4 · Whole blood · {research.accession}</h3>
      <p>Four crew members · three-day low Earth orbit mission · September 2021.</p>
      <p>This research excerpt is independent of the simulated vitals, crew check-ins, and alert rules above. It is not live telemetry or a clinical reference range.</p>
      <div className="research-table">
        <table>
          <caption>Mean {research.measurement.toLowerCase()} ({research.unit}) · complete blood count</caption>
          <thead><tr><th scope="col">Collection point</th><th scope="col">Mean (%)</th><th scope="col">Crew (n)</th></tr></thead>
          <tbody>{research.rows.map((row) => (
            <tr key={row.point}><th scope="row">{row.point}</th><td>{row.mean.toFixed(2)}</td><td>{row.n}</td></tr>
          ))}</tbody>
        </table>
      </div>
      <p className="muted">L− denotes days before launch; R+ denotes days after return. All seven CBC collections were on the ground; there are no in-flight CBC measurements in this excerpt.</p>
      <p className="muted">{research.aggregation} A small observational cohort cannot establish that spaceflight caused a change or predict an individual’s health.</p>
      <details>
        <summary>Source and reuse information</summary>
        <p>{research.title}</p>
        <p>Source file: <span className="research-filename">{research.sourceFile}</span>. Verified {research.verifiedOn}. The NASA file listing marks this file public and unrestricted.</p>
        <p>Data courtesy of NASA Open Science Data Repository and the Inspiration4 study contributors. Reused under OSDR’s redistribution terms and NASA SPD-41a, section III.C. This table is an AstroGuard aggregate, not a NASA clinical interpretation.</p>
        <p><a href="https://science.nasa.gov/reference/osdr-help-terms-and-conditions/">OSDR reuse terms</a> · <a href="https://science.nasa.gov/spd-41/">NASA science policy</a> · <a href={research.fileUrl}>Original CBC file</a></p>
      </details>
      <p><a href={research.studyUrl}>View original NASA study OSD-569</a></p>
      <p className="muted">This bundled excerpt is available offline after setup. NASA links require an internet connection.</p>
    </section>
  )
}
