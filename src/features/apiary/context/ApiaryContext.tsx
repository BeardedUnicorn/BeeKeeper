import { createContext } from 'react'

import { SEASONS, type AllocationPreset, type GameState, type Hive } from '../../../game'

export interface ApiaryContextState {
  game: GameState
  season: (typeof SEASONS)[number]
  selectedHive: Hive | null
  totalPopulation: number
  totalHiveHoney: number
  averageHealth: number
  objectiveMet: { year: boolean; hives: boolean; stockpile: boolean; health: boolean }
  isInteractive: boolean
  canAdvance: boolean
}

export interface ApiaryContextActions {
  advanceDay(): void
  advanceWeek(): void
  restart(): void
  setAllocation(hiveId: string, allocation: AllocationPreset): void
  harvest(hiveId: string): void
  treat(hiveId: string): void
  split(hiveId: string): void
  selectHive(hiveId: string | null): void
  requeen(hiveId: string, candidateId: string): void
  save(): Promise<void>
  load(): Promise<void>
  clearIoMessage(): void
}

export interface ApiaryContextMeta {
  ioBusy: boolean
  ioMessage: string | null
  isTauriApp: boolean
}

export interface ApiaryContextValue {
  state: ApiaryContextState
  actions: ApiaryContextActions
  meta: ApiaryContextMeta
}

export const ApiaryContext = createContext<ApiaryContextValue | null>(null)
