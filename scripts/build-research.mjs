import { readFileSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const source = new URL('../research/cbc-source.csv', import.meta.url)
const bytes = readFileSync(source)
const lines = bytes.toString('utf8').trim().split(/\r?\n/)
const headers = lines.shift().split(',')
const column = headers.indexOf('hematocrit_value_percent')
if (column < 0) throw new Error('Hematocrit column missing')
const points = ['L-92', 'L-44', 'L-3', 'R+1', 'R+45', 'R+82', 'R+194']
const groups = new Map(points.map((point) => [point, new Map()]))
for (const line of lines) {
  const fields = line.split(',')
  if (fields.length !== headers.length) throw new Error('Unexpected CBC row width')
  const match = /^(C00[1-4])_whole-blood_(L-\d+|R\+\d+)_cbc$/.exec(fields[0])
  const value = Number(fields[column])
  if (!match || !groups.has(match[2]) || fields[column] === '' || !Number.isFinite(value) || value <= 0 || value > 100) throw new Error('Invalid hematocrit row')
  const group = groups.get(match[2])
  if (group.has(match[1])) throw new Error('Duplicate subject/timepoint')
  group.set(match[1], value)
}
const rows = points.map((point) => {
  const values = [...groups.get(point).values()]
  if (values.length !== 4) throw new Error('Incomplete timepoint')
  return { point, n: values.length, mean: Math.round(values.reduce((sum, value) => sum + Math.round(value * 10), 0) * 10 / values.length) / 100 }
})
const data = {
  accession: 'OSD-569',
  title: 'Whole Blood Measurements from the SpaceX Inspiration4 Mission (RNA-seq, epitranscriptome, WGS, clonal hematopoiesis, CBC)',
  studyUrl: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-569',
  sourceFile: 'LSDS-7_Complete_Blood_Count_CBC_TRANSFORMED.csv',
  fileUrl: 'https://osdr.nasa.gov/geode-py/ws/studies/OSD-569/download?source=datamanager&file=LSDS-7_Complete_Blood_Count_CBC_TRANSFORMED.csv',
  verifiedOn: '2026-11-14',
  sha256: createHash('sha256').update(bytes).digest('hex'),
  measurement: 'Hematocrit', unit: '%', aggregation: 'Arithmetic mean across four crew members at each collection point, rounded to two decimal places; no imputation or exclusions.',
  rows,
}
writeFileSync(new URL('../src/missionResearch.json', import.meta.url), JSON.stringify(data, null, 2) + '\n')
console.log(JSON.stringify(rows))
