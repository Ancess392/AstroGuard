import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseCheckIns } from './checkIns.ts'

test('new and saved histories load', () => {
  const entry = { id: 'demo', scenario: 'fatigue', energy: 'Low', note: 'Demo note', recordedAt: '2026-11-14T12:00:00Z' }
  assert.deepEqual(parseCheckIns(null), [])
  assert.deepEqual(parseCheckIns(JSON.stringify([entry])), [entry])
})

test('malformed history is rejected so save cannot overwrite it silently', () => {
  for (const raw of ['{', '{}', '[null]', '[{"scenario":"constructor"}]']) {
    assert.throws(() => parseCheckIns(raw))
  }
})
