# AstroGuard

AstroGuard is a React + TypeScript demonstration of a crew health dashboard, with three mission scenarios, a heart rate chart, illustrative alerts, browser-saved crew check-ins, and a separate NASA Mission research panel. The production dashboard supports offline reload after an initial online visit.

## Data and scope

**The dashboard vitals and alert scenarios use synthetic data.** They are not live astronaut telemetry. The demo rules flag sleep below 6 hours and a sustained heart rate when all three latest samples are at least 100 bpm. These thresholds are illustrative and cannot diagnose health conditions or guide medical decisions. Crew check-ins are fictional demo entries and do not affect the alert rules.

**Mission research uses archived NASA data, separate from the simulation.** It shows mean hematocrit (%) across four Inspiration4 crew members at each of seven collection points. Each mean is calculated from four observations and rounded to two decimal places, with no imputation or exclusions:

| Collection point | Mean hematocrit (%) | Crew (n) |
| --- | ---: | ---: |
| L-92 | 43.28 | 4 |
| L-44 | 43.88 | 4 |
| L-3 | 42.75 | 4 |
| R+1 | 42.43 | 4 |
| R+45 | 43.43 | 4 |
| R+82 | 43.23 | 4 |
| R+194 | 42.13 | 4 |

L- denotes days before launch; R+ denotes days after return. All seven complete blood count (CBC) collections were on the ground. There are no in-flight CBC measurements in this excerpt. This small observational cohort cannot establish causation or predict an individual's health. Research values do not feed the simulated vitals, chart, or alerts.

## Windows setup

Use PowerShell with Node.js and npm installed. The verified environment uses **Node.js v26.13.0 and npm 11.20.0**. Tests import TypeScript directly using Node's native support; use this tested Node version for reproducibility.

```powershell
Set-Location 'C:\Users\Ancess\Desktop\Projects\astroguard'
node --version
npm.cmd --version
npm.cmd ci
```

For a copy of the submission in another folder, change the path to that folder. `npm.cmd ci` installs dependencies from `package-lock.json` and requires internet access. Using `npm.cmd` avoids PowerShell's npm script execution-policy issue. No API key, account, environment variables, or backend is required.

For development:

```powershell
npm.cmd run dev
```

Open the URL printed by Vite (normally `http://localhost:5173/`). Use the production preview below to test offline support; the development server does not register the production service worker. Stop either server with **Ctrl+C** in its terminal.

## Verification and production preview

Run these commands in order from the AstroGuard root:

```powershell
npm.cmd run lint
npm.cmd run build
node --test
```

The build runs TypeScript checks, creates the Vite production output in `dist/`, and generates `dist/sw.js` with a versioned cache of the production files. **Build before running tests:** the offline test reads the generated production files. There is no `npm test` script; use `node --test`.

The six current tests cover telemetry scenarios and threshold boundaries, saved check-in parsing, the NASA source hash and aggregate, and service-worker delivery of the research bundle with network fetches disabled. These three verification commands passed on 14 November 2026; a Chrome production offline reload was also verified.

Start the production preview in a terminal and leave it running:

```powershell
npm.cmd run preview
```

Open the printed URL, normally `http://localhost:4173/`. If the port is occupied, Vite can select a different port; use the printed URL consistently throughout the demo and offline test. Preview serves the existing build and does not rebuild source changes.

## Short demo walkthrough

1. Start the production preview and visit it online. Wait for **Online · Ready for offline use**.
2. Select **Normal**: inspect the synthetic vitals, heart rate trend, and **No demo rules triggered** message. Expand **View sample readings** for the chart's exact values.
3. Select **Fatigue**: the 4.5-hour sleep value triggers the short-sleep demo alert. Select **Elevated heart rate**: the latest three heart rate samples trigger the sustained elevated heart rate alert. Expand **How alerts work** to inspect the rules.
4. In **Crew check-in**, choose an energy level, enter an optional fictional mission note, and save. The history records the active scenario and time. Reload to confirm that the saved entry persists in this browser.
5. Scroll to **Mission research**. Show the archived NASA hematocrit table, collection-point explanation, sample counts, and source/reuse disclosure. Emphasize that switching scenarios does not change this research table.
6. Follow the offline reload procedure below to demonstrate the cached dashboard.

## Test offline reload with production preview

1. Run `npm.cmd run build`, then `npm.cmd run preview`. Open its URL in Chrome while online and wait for **Ready for offline use**. Do not open `dist/index.html` using a `file://` URL; service workers need localhost or HTTPS.
2. If an older AstroGuard build is already cached, visit online to let the new worker install, close all tabs using that preview origin, and reopen the same URL. Updates wait until the previous dashboard tabs close. Confirm the Mission research panel is present before continuing.
3. Save a fictional check-in. Open Chrome DevTools with **F12** or **Ctrl+Shift+I**, select **Network**, and change the throttling dropdown from **No throttling** to **Offline**. Keep DevTools open and use a normal reload (**Ctrl+R**), not a hard reload.
4. Confirm **Offline · Ready for offline use** and verify that scenario switching, the chart and sample readings, and the corresponding alerts still work. Confirm the saved check-in remains, then save another fictional check-in offline and reload again.
5. Confirm **Mission research** still displays all seven hematocrit means, including **L-92 = 43.28%** and **R+194 = 42.13%**. The document, JavaScript, and CSS should show **ServiceWorker** as their source in Network; the dashboard needs no NASA request to display this excerpt.
6. Restore **No throttling** after testing. Original NASA study, file, and policy links require internet access.

Offline access depends on the browser retaining the site's service worker/cache. Saved check-ins use `localStorage` and remain only in the same browser profile and origin (scheme, host, and port); switching between `localhost` and `127.0.0.1`, changing ports, or clearing site data changes or removes that local history. An optional Google font may be unavailable offline; the dashboard uses system-font fallbacks.

## NASA source and reuse credit

Data are courtesy of the **NASA Open Science Data Repository (OSDR)** and the **Inspiration4 study contributors**.

- **Study:** [OSD-569 — Whole Blood Measurements from the SpaceX Inspiration4 Mission (RNA-seq, epitranscriptome, WGS, clonal hematopoiesis, CBC)](https://osdr.nasa.gov/bio/repo/data/studies/OSD-569).
- **Source file:** [LSDS-7_Complete_Blood_Count_CBC_TRANSFORMED.csv](https://osdr.nasa.gov/geode-py/ws/studies/OSD-569/download?source=datamanager&file=LSDS-7_Complete_Blood_Count_CBC_TRANSFORMED.csv), field `hematocrit_value_percent`.
- **Access verification:** on 14 November 2026, the [NASA file listing](https://osdr.nasa.gov/osdr/data/osd/files/569) marked this file visible and unrestricted; an unauthenticated download succeeded.
- **Reuse basis:** the [OSDR Terms and Conditions](https://science.nasa.gov/reference/osdr-help-terms-and-conditions/) Data Redistribution section refers to NASA's science information policy. [SPD-41a](https://science.nasa.gov/spd-41/), section III.C.ii, addresses public data without restriction of use; III.C.vii addresses reusable data with open licenses. Attribution and source links are retained. This is not a blanket claim that all NASA-hosted material is CC0.

The displayed table is an AstroGuard aggregate, not a NASA clinical interpretation. Only the aggregate is bundled into the dashboard; no subject-level rows are displayed or fetched at runtime. The original downloaded CBC file, public file listing, study metadata, and verification notes are retained in [research/](research/README.md). The source SHA-256 and bundled means are recorded in [src/missionResearch.json](src/missionResearch.json).

To reproduce the aggregate from the retained source without downloading it again:

```powershell
node scripts/build-research.mjs
npm.cmd run build
node --test
```

No controlled-access genomic data are used. Stage 2 crew check-ins remain independent of the research excerpt.
