import assert from 'node:assert/strict'
import { test } from 'node:test'
import { evaluateTelemetry, scenarios } from './telemetry.ts'

test('each demo scenario triggers only its intended alerts', () => {
  const expected = {
    normal: { shortSleep: false, sustainedHeartRate: false },
    fatigue: { shortSleep: true, sustainedHeartRate: false },
    elevated: { shortSleep: false, sustainedHeartRate: true },
  }
  for (const [id, data] of Object.entries(scenarios)) {
    assert.deepEqual(evaluateTelemetry(data.sleep, data.heartRate), expected[id])
  }
})

test('threshold boundaries and sustained readings are evaluated consistently', () => {
  assert.deepEqual(evaluateTelemetry(6, [100, 100, 100]), { shortSleep: false, sustainedHeartRate: true })
  assert.deepEqual(evaluateTelemetry(5.9, [101, 99, 105]), { shortSleep: true, sustainedHeartRate: false })
  assert.equal(evaluateTelemetry(8, [100, 101]).sustainedHeartRate, false)
  assert.equal(evaluateTelemetry(8, [102, 103, 105, 99]).sustainedHeartRate, false)
})
