import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { test } from 'node:test'
import vm from 'node:vm'

const data = JSON.parse(readFileSync(new URL('./missionResearch.json', import.meta.url)))

test('research excerpt matches the verified NASA hematocrit source and cohort', () => {
  const source = readFileSync(new URL('../research/cbc-source.csv', import.meta.url))
  assert.equal(createHash('sha256').update(source).digest('hex'), data.sha256)
  const [header, ...lines] = source.toString().trim().split(/\r?\n/)
  const column = header.split(',').indexOf('hematocrit_value_percent')
  assert.ok(column > 0)
  assert.equal(data.unit, '%')
  assert.deepEqual(data.rows.map((r) => r.point), ['L-92', 'L-44', 'L-3', 'R+1', 'R+45', 'R+82', 'R+194'])
  for (const row of data.rows) {
    const values = lines.map((line) => line.split(',')).filter((r) => r[0].endsWith(`_${row.point}_cbc`)).map((r) => Number(r[column]))
    assert.equal(values.length, 4)
    assert.equal(row.n, 4)
    const mean = values.reduce((sum, value) => sum + value, 0) / 4
    assert.ok(Math.abs(mean - row.mean) <= 0.005001)
  }
})

test('production cache serves the research bundle and home navigation with network unavailable', async () => {
  const handlers = new Map()
  const store = new Map()
  let claimed = false
  const cache = {
    async addAll(urls) {
      for (const url of urls) {
        const relative = new URL(url).pathname.slice('/astroguard/'.length)
        store.set(url, readFileSync(new URL(`../dist/${relative}`, import.meta.url), 'utf8'))
      }
    },
    async match(key) { return store.get(key) },
  }
  const code = readFileSync(new URL('../dist/sw.js', import.meta.url), 'utf8')
  let networkCalls = 0
  vm.runInNewContext(code, {
    URL,
    self: { registration: { scope: 'https://example.test/astroguard/' }, clients: { async claim() { claimed = true } }, addEventListener(type, handler) { handlers.set(type, handler) } },
    caches: { async open() { return cache }, async keys() { return [] }, async delete() { return true } },
    fetch() { networkCalls++; throw new Error('Network unavailable') },
  })
  let pending
  handlers.get('install')({ waitUntil(promise) { pending = promise } })
  await pending
  handlers.get('activate')({ waitUntil(promise) { pending = promise } })
  await pending
  assert.equal(claimed, true)
  const load = async (url, mode) => {
    let response
    handlers.get('fetch')({ request: { url, method: 'GET', mode }, respondWith(promise) { response = promise } })
    assert.ok(response, 'service worker must handle this resource')
    return response
  }
  const html = await load('https://example.test/astroguard/?offline-test', 'navigate')
  assert.match(html, /id="root"/)
  const scriptPath = html.match(/src="([^"]+\.js)"/)[1].replace(/^\//, '')
  const script = await load(`https://example.test/astroguard/${scriptPath}`, 'cors')
  assert.match(script, /Mission research/)
  assert.match(script, /OSD-569/)
  assert.match(script, /43\.28/)
  assert.equal(networkCalls, 0)
})
