import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@tauri-apps/plugin-fs', () => ({
  BaseDirectory: { AppData: 'appData' },
  exists: vi.fn(),
  mkdir: vi.fn(),
  readTextFile: vi.fn(),
  writeTextFile: vi.fn()
}))

import { BaseDirectory, exists, mkdir, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs'

import { initialState } from '../game'
import type { SavePayload } from './SaveRepository'
import { SAVE_DIR, SAVE_FILE, TauriSaveRepository } from './TauriSaveRepository'
import { WebUnsupportedSaveRepository } from './WebUnsupportedSaveRepository'

const mockedExists = vi.mocked(exists)
const mockedMkdir = vi.mocked(mkdir)
const mockedReadTextFile = vi.mocked(readTextFile)
const mockedWriteTextFile = vi.mocked(writeTextFile)

describe('TauriSaveRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('saves payloads to AppData with the expected path', async () => {
    const repository = new TauriSaveRepository()
    const payload: SavePayload = {
      version: 1,
      savedAt: '2026-02-09T00:00:00.000Z',
      state: initialState()
    }

    await repository.save(payload)

    expect(mockedMkdir).toHaveBeenCalledWith(SAVE_DIR, {
      baseDir: BaseDirectory.AppData,
      recursive: true
    })
    expect(mockedWriteTextFile).toHaveBeenCalledTimes(1)
    expect(mockedWriteTextFile).toHaveBeenCalledWith(SAVE_FILE, JSON.stringify(payload, null, 2), {
      baseDir: BaseDirectory.AppData
    })
  })

  it('returns null when no save file exists', async () => {
    mockedExists.mockResolvedValue(false)

    const repository = new TauriSaveRepository()

    await expect(repository.load()).resolves.toBeNull()
    expect(mockedReadTextFile).not.toHaveBeenCalled()
  })

  it('loads and parses a saved payload when the file exists', async () => {
    const payload: SavePayload = {
      version: 1,
      savedAt: '2026-02-09T00:00:00.000Z',
      state: initialState()
    }

    mockedExists.mockResolvedValue(true)
    mockedReadTextFile.mockResolvedValue(JSON.stringify(payload))

    const repository = new TauriSaveRepository()

    await expect(repository.load()).resolves.toEqual(payload)
  })

  it('throws when save file content is corrupted JSON', async () => {
    mockedExists.mockResolvedValue(true)
    mockedReadTextFile.mockResolvedValue('{not-json')

    const repository = new TauriSaveRepository()

    await expect(repository.load()).rejects.toBeInstanceOf(SyntaxError)
  })
})

describe('WebUnsupportedSaveRepository', () => {
  it('throws a clear save unsupported message', async () => {
    const repository = new WebUnsupportedSaveRepository()

    await expect(
      repository.save({
        version: 1,
        savedAt: '2026-02-09T00:00:00.000Z',
        state: initialState()
      })
    ).rejects.toThrow('Saving is only available in the Tauri app.')
  })

  it('throws a clear load unsupported message', async () => {
    const repository = new WebUnsupportedSaveRepository()

    await expect(repository.load()).rejects.toThrow('Loading is only available in the Tauri app.')
  })
})
