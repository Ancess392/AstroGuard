import { scenarios } from './telemetry.ts'
import type { Scenario } from './telemetry.ts'

export const storageKey = 'astroguard.check-ins.v1'
export const energyLevels = ['Low', 'Moderate', 'High'] as const
export type Energy = (typeof energyLevels)[number]

export interface CheckIn {
  id: string
  scenario: Scenario
  energy: Energy
  note: string
  recordedAt: string
}

function isCheckIn(value: unknown): value is CheckIn {
  if (typeof value !== 'object' || value === null) return false
  const entry = value as Partial<CheckIn>
  return typeof entry.id === 'string'
    && typeof entry.scenario === 'string' && Object.hasOwn(scenarios, entry.scenario)
    && typeof entry.energy === 'string' && energyLevels.includes(entry.energy)
    && typeof entry.note === 'string'
    && typeof entry.recordedAt === 'string' && Number.isFinite(Date.parse(entry.recordedAt))
}

export function parseCheckIns(raw: string | null): CheckIn[] {
  if (raw === null) return []
  const entries: unknown = JSON.parse(raw)
  if (!Array.isArray(entries) || !entries.every(isCheckIn)) {
    throw new Error('Invalid check-in history')
  }
  return entries
}
