import type { GameState } from '../game'

export interface SavePayload {
  version: 1
  savedAt: string
  state: GameState
}

export interface SaveRepository {
  save(payload: SavePayload): Promise<void>
  load(): Promise<SavePayload | null>
}
