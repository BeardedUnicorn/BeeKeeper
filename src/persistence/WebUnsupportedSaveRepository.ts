import type { SavePayload, SaveRepository } from './SaveRepository'

export class WebUnsupportedSaveRepository implements SaveRepository {
  async save(payload: SavePayload): Promise<void> {
    void payload
    throw new Error('Saving is only available in the Tauri app.')
  }

  async load(): Promise<SavePayload | null> {
    throw new Error('Loading is only available in the Tauri app.')
  }
}
