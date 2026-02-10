import { BaseDirectory, exists, mkdir, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs'

import type { SavePayload, SaveRepository } from './SaveRepository'

export const SAVE_DIR = 'beekeeper'
export const SAVE_FILE = `${SAVE_DIR}/save.json`

export class TauriSaveRepository implements SaveRepository {
  async save(payload: SavePayload): Promise<void> {
    await mkdir(SAVE_DIR, { baseDir: BaseDirectory.AppData, recursive: true })
    await writeTextFile(SAVE_FILE, JSON.stringify(payload, null, 2), {
      baseDir: BaseDirectory.AppData
    })
  }

  async load(): Promise<SavePayload | null> {
    const hasSave = await exists(SAVE_FILE, { baseDir: BaseDirectory.AppData })
    if (!hasSave) {
      return null
    }

    const text = await readTextFile(SAVE_FILE, { baseDir: BaseDirectory.AppData })
    return JSON.parse(text) as SavePayload
  }
}
