import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { SEASONS, type GameStatus, initialState } from '../../../game'
import { ApiaryContext, type ApiaryContextValue } from '../context/ApiaryContext'
import { ApiaryRoot } from './ApiaryRoot'

interface ContextOptions {
  status?: GameStatus
  isTauriApp?: boolean
  ioBusy?: boolean
  stockpile?: number
  selectFirstHive?: boolean
}

const createContextValue = ({
  status = 'playing',
  isTauriApp = true,
  ioBusy = false,
  stockpile,
  selectFirstHive = false
}: ContextOptions = {}): ApiaryContextValue => {
  const game = initialState()
  game.status = status

  if (typeof stockpile === 'number') {
    game.stockpile = stockpile
  }

  game.selectedHiveId = selectFirstHive ? game.hives[0]?.id ?? null : null

  const selectedHive = game.hives.find((hive) => hive.id === game.selectedHiveId) ?? null
  const totalPopulation = game.hives.reduce((sum, hive) => sum + hive.population, 0)
  const totalHiveHoney = game.hives.reduce((sum, hive) => sum + hive.honey, 0)
  const averageHealthRaw = game.hives.reduce((sum, hive) => sum + hive.health, 0) / game.hives.length

  return {
    state: {
      game,
      season: SEASONS[game.seasonIndex],
      selectedHive,
      totalPopulation,
      totalHiveHoney,
      averageHealth: Math.round(averageHealthRaw),
      objectiveMet: {
        year: false,
        hives: false,
        stockpile: false,
        health: false
      },
      isInteractive: game.status === 'playing',
      canAdvance: game.hives.length > 0 && game.status === 'playing'
    },
    actions: {
      advanceDay: () => undefined,
      advanceWeek: () => undefined,
      restart: () => undefined,
      setAllocation: () => undefined,
      harvest: () => undefined,
      treat: () => undefined,
      split: () => undefined,
      selectHive: () => undefined,
      requeen: () => undefined,
      save: async () => undefined,
      load: async () => undefined,
      clearIoMessage: () => undefined
    },
    meta: {
      ioBusy,
      ioMessage: null,
      isTauriApp
    }
  }
}

const renderWithContext = (value: ApiaryContextValue) =>
  render(
    <ApiaryContext value={value}>
      <ApiaryRoot />
    </ApiaryContext>
  )

describe('ApiaryRoot integration', () => {
  it('renders only the won banner when game status is won', () => {
    renderWithContext(createContextValue({ status: 'won' }))

    expect(screen.getByText('Golden Harvest Achieved')).toBeInTheDocument()
    expect(screen.queryByText('Apiary Lost')).not.toBeInTheDocument()
  })

  it('renders only the lost banner when game status is lost', () => {
    renderWithContext(createContextValue({ status: 'lost' }))

    expect(screen.getByText('Apiary Lost')).toBeInTheDocument()
    expect(screen.queryByText('Golden Harvest Achieved')).not.toBeInTheDocument()
  })

  it('renders web persistence controls with disabled buttons when Tauri is unavailable', () => {
    renderWithContext(createContextValue({ isTauriApp: false }))

    expect(screen.getByText('Tauri app required for saves.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save Game' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Load Game' })).toBeDisabled()
  })

  it('disables Tauri persistence controls while IO is busy', () => {
    renderWithContext(createContextValue({ isTauriApp: true, ioBusy: true }))

    expect(screen.queryByText('Tauri app required for saves.')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save Game' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Load Game' })).toBeDisabled()
  })

  it('keeps queen assignment disabled when no hive is selected', () => {
    renderWithContext(createContextValue({ selectFirstHive: false, stockpile: 100 }))

    const assignButtons = screen.getAllByRole('button', { name: 'Assign Queen' })
    assignButtons.forEach((button) => {
      expect(button).toBeDisabled()
    })
  })

  it('enables queen assignment when a hive is selected with enough stockpile in playing state', () => {
    renderWithContext(createContextValue({ selectFirstHive: true, stockpile: 100, status: 'playing' }))

    const assignButtons = screen.getAllByRole('button', { name: 'Assign Queen' })
    assignButtons.forEach((button) => {
      expect(button).toBeEnabled()
    })
  })
})
