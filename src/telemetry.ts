export const scenarios = {
  normal: { label: 'Normal', heartRate: [71, 75, 74, 81, 76, 79, 73, 76, 72, 77, 75, 74], oxygen: 98, temperature: 36.7, sleep: 7.8 },
  fatigue: { label: 'Fatigue', heartRate: [68, 72, 70, 75, 72, 79, 78, 76, 81, 77, 80, 78], oxygen: 98, temperature: 36.8, sleep: 4.5 },
  elevated: { label: 'Elevated heart rate', heartRate: [74, 76, 81, 85, 82, 88, 94, 98, 103, 106, 109, 112], oxygen: 97, temperature: 37.1, sleep: 7.2 },
}

export type Scenario = keyof typeof scenarios
export const scenarioIds = Object.keys(scenarios) as Scenario[]

export const thresholds = { sleep: 6, heartRate: 100 }

export function evaluateTelemetry(sleep: number, heartRate: readonly number[]) {
  const recentSamples = heartRate.slice(-3)
  return {
    shortSleep: sleep < thresholds.sleep,
    sustainedHeartRate:
      recentSamples.length === 3 && recentSamples.every((sample) => sample >= thresholds.heartRate),
  }
}
