# OSD-569 verification — 2026-11-14

NASA sources:
- Study: https://osdr.nasa.gov/bio/repo/data/studies/OSD-569
- Metadata: https://osdr.nasa.gov/osdr/data/osd/meta/569
- Public file listing: https://osdr.nasa.gov/osdr/data/osd/files/569
- CBC download: https://osdr.nasa.gov/geode-py/ws/studies/OSD-569/download?source=datamanager&file=LSDS-7_Complete_Blood_Count_CBC_TRANSFORMED.csv
- Reuse terms: https://science.nasa.gov/reference/osdr-help-terms-and-conditions/
- Governing policy: https://science.nasa.gov/spd-41/ (SPD-41a, III.C.ii and III.C.vii)

The listing marks the transformed CBC file visible=true and restricted=false; the unauthenticated download succeeded. OSDR's Data Redistribution section places acquired data under NASA SMD science information policy. SPD-41a III.C.ii provides for public data without restriction of use; III.C.vii addresses reuse with open licenses. We rely on these repository redistribution terms, not a claim that everything on nasa.gov is CC0. Attribution and source links are retained. No controlled-access genomic data were downloaded.

The downloaded source is retained unchanged in cbc-source.csv. Its SHA-256 is recorded in src/missionResearch.json. The study metadata and file listing are saved here for auditability. These source files are outside public/ and src/ and are not included in the production bundle.

Only hematocrit_value_percent is used, with units from that exact header. All 28 rows provide this field. The seven collection points and their meaning are confirmed by the study description: CBC in K2 EDTA whole blood, Quest Diagnostics, all ground timepoints. No in-flight values are inferred. The aggregate has four observations per point, arithmetic mean rounded to two decimal places. Only the aggregate JSON is bundled; no subject-level data are rendered. No measurements from other CBC columns are used or repaired.

Regenerate offline, using the retained source: node scripts/build-research.mjs

The panel does not import telemetry, alter thresholds, or feed the simulated chart. It makes no causal or diagnostic claims. A full production build precaches its bundled content through the existing service worker.

## Validation

On 2026-11-14: npm.cmd run lint, npm.cmd run build, and node --test passed (6 tests). The research tests verify the source hash and aggregate, and execute the generated production service worker with network fetches disabled.

Browser verification: Chrome at http://localhost:4173/ initially showed Online / Ready for offline use and the research panel. With DevTools Network throttling set to Offline, a normal reload retained the Mission research table (including L-92 = 43.28% and R+194 = 42.13%). Network rows showed HTML, JS, and CSS served from ServiceWorker and 0 B transferred. Chrome was left in Offline emulation for inspection; select No throttling to restore network access in that tab.
