import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@tauri-apps/api/core', () => ({
  isTauri: vi.fn()
}))

vi.mock('@tauri-apps/plugin-fs', () => ({
  BaseDirectory: { AppData: 'appData' },
  exists: vi.fn(),
  mkdir: vi.fn(),
  readTextFile: vi.fn(),
  writeTextFile: vi.fn()
}))

import { isTauri } from '@tauri-apps/api/core'
import { exists, readTextFile } from '@tauri-apps/plugin-fs'

import { initialState } from '../../../game'
import { useApiary } from '../hooks/useApiary'
import { ApiaryProvider } from './ApiaryProvider'

const mockedIsTauri = vi.mocked(isTauri)
const mockedExists = vi.mocked(exists)
const mockedReadTextFile = vi.mocked(readTextFile)

const Harness = () => {
  const { state, actions, meta } = useApiary()
  const firstHive = state.game.hives[0]
  const firstCandidate = state.game.queenCandidates[0]

  return (
    <div>
      <div data-testid="day">{state.game.day}</div>
      <div data-testid="stockpile">{state.game.stockpile.toFixed(1)}</div>
      <div data-testid="allocation">{firstHive?.allocation ?? ''}</div>
      <div data-testid="selected">{state.game.selectedHiveId ?? ''}</div>
      <div data-testid="hive-count">{state.game.hives.length}</div>
      <div data-testid="io-message">{meta.ioMessage ?? ''}</div>

      <button onClick={actions.advanceDay}>advance-day</button>
      <button onClick={actions.advanceWeek}>advance-week</button>
      <button onClick={() => firstHive && actions.setAllocation(firstHive.id, 'Forage Focus')}>set-allocation</button>
      <button onClick={() => firstHive && actions.treat(firstHive.id)}>treat-first</button>
      <button onClick={() => firstHive && actions.harvest(firstHive.id)}>harvest-first</button>
      <button onClick={() => firstHive && actions.selectHive(firstHive.id)}>select-first</button>
      <button onClick={() => firstHive && firstCandidate && actions.requeen(firstHive.id, firstCandidate.id)}>requeen-first</button>
      <button onClick={() => void actions.save()}>save</button>
      <button onClick={() => void actions.load()}>load</button>
    </div>
  )
}

const renderProvider = () =>
  render(
    <ApiaryProvider>
      <Harness />
    </ApiaryProvider>
  )

describe('ApiaryProvider', () => {
  it('advances day and week through context actions', async () => {
    mockedIsTauri.mockReturnValue(false)

    const user = userEvent.setup()
    renderProvider()

    expect(screen.getByTestId('day')).toHaveTextContent('1')

    await user.click(screen.getByRole('button', { name: 'advance-day' }))
    await user.click(screen.getByRole('button', { name: 'advance-week' }))

    expect(screen.getByTestId('day')).toHaveTextContent('9')
  })

  it('applies hive actions via provider action contracts', async () => {
    mockedIsTauri.mockReturnValue(false)

    const user = userEvent.setup()
    renderProvider()

    expect(screen.getByTestId('allocation')).toHaveTextContent('Balanced')
    expect(screen.getByTestId('stockpile')).toHaveTextContent('12.0')

    await user.click(screen.getByRole('button', { name: 'set-allocation' }))
    expect(screen.getByTestId('allocation')).toHaveTextContent('Forage Focus')

    await user.click(screen.getByRole('button', { name: 'treat-first' }))
    expect(screen.getByTestId('stockpile')).toHaveTextContent('6.0')

    await user.click(screen.getByRole('button', { name: 'harvest-first' }))
    const afterHarvest = Number(screen.getByTestId('stockpile').textContent)
    expect(afterHarvest).toBeGreaterThan(6)

    await user.click(screen.getByRole('button', { name: 'select-first' }))
    expect(screen.getByTestId('selected').textContent).not.toBe('')

    await user.click(screen.getByRole('button', { name: 'requeen-first' }))
    const afterRequeen = Number(screen.getByTestId('stockpile').textContent)
    expect(afterRequeen).toBeCloseTo(afterHarvest - 10, 1)
  })

  it('clears selected hive when the selected hive collapses after advancing', async () => {
    mockedIsTauri.mockReturnValue(true)

    const loaded = initialState()
    const doomedHive = {
      ...loaded.hives[0],
      population: 500,
      health: 50
    }
    const payload = {
      version: 1,
      savedAt: '2026-02-09T00:00:00.000Z',
      state: {
        ...loaded,
        hives: [doomedHive],
        selectedHiveId: doomedHive.id,
        status: 'playing' as const
      }
    }

    mockedExists.mockResolvedValue(true)
    mockedReadTextFile.mockResolvedValue(JSON.stringify(payload))

    const user = userEvent.setup()
    renderProvider()

    await user.click(screen.getByRole('button', { name: 'load' }))

    await waitFor(() => {
      expect(screen.getByTestId('io-message')).toHaveTextContent('Save loaded.')
      expect(screen.getByTestId('selected')).toHaveTextContent(doomedHive.id)
    })

    await user.click(screen.getByRole('button', { name: 'advance-day' }))

    await waitFor(() => {
      expect(screen.getByTestId('hive-count')).toHaveTextContent('0')
      expect(screen.getByTestId('selected')).toHaveTextContent('')
    })
  })

  it('surfaces the corrupted save payload error message on load', async () => {
    mockedIsTauri.mockReturnValue(true)
    mockedExists.mockResolvedValue(true)
    mockedReadTextFile.mockResolvedValue('{corrupted-json')

    const user = userEvent.setup()
    renderProvider()

    await user.click(screen.getByRole('button', { name: 'load' }))

    await waitFor(() => {
      expect(screen.getByTestId('io-message')).toHaveTextContent('Load failed. The save file may be corrupted.')
    })
  })

  it('handles unsupported web save and load without crashing', async () => {
    mockedIsTauri.mockReturnValue(false)

    const user = userEvent.setup()
    renderProvider()

    await user.click(screen.getByRole('button', { name: 'save' }))
    await waitFor(() => {
      expect(screen.getByTestId('io-message')).toHaveTextContent('Saving is only available in the Tauri app.')
    })

    await user.click(screen.getByRole('button', { name: 'load' }))
    await waitFor(() => {
      expect(screen.getByTestId('io-message')).toHaveTextContent('Loading is only available in the Tauri app.')
    })
  })
})
