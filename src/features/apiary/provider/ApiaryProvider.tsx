import { isTauri } from '@tauri-apps/api/core'
import { type ReactNode, useMemo, useReducer, useState } from 'react'

import {
  ACTION_COSTS,
  ALLOCATION_PRESETS,
  HONEY_CONSUME_BASE_PER_1000,
  QUEEN_TRAITS,
  SEASONS,
  SEASON_LENGTH,
  VICTORY_REQUIREMENTS,
  advanceDays,
  harvestHive,
  hydrateState,
  initialState,
  requeenHive,
  resetGame,
  selectHive,
  setAllocation,
  splitHive,
  treatHive,
  type GameState
} from '../../../game'
import { type SavePayload, type SaveRepository } from '../../../persistence/SaveRepository'
import { TauriSaveRepository } from '../../../persistence/TauriSaveRepository'
import { WebUnsupportedSaveRepository } from '../../../persistence/WebUnsupportedSaveRepository'
import {
  ApiaryContext,
  type ApiaryContextActions,
  type ApiaryContextMeta,
  type ApiaryContextState,
  type ApiaryContextValue
} from '../context/ApiaryContext'

type Action =
  | { type: 'ADVANCE'; days: number }
  | { type: 'SET_ALLOCATION'; hiveId: string; allocation: keyof typeof ALLOCATION_PRESETS }
  | { type: 'HARVEST'; hiveId: string }
  | { type: 'TREAT'; hiveId: string }
  | { type: 'SPLIT'; hiveId: string }
  | { type: 'REQUEEN'; hiveId: string; candidateId: string }
  | { type: 'SELECT_HIVE'; hiveId: string | null }
  | { type: 'LOAD'; state: ReturnType<typeof initialState> }
  | { type: 'RESET' }

const reducer = (state: GameState, action: Action): GameState => {
  switch (action.type) {
    case 'ADVANCE':
      return advanceDays(state, action.days)
    case 'SET_ALLOCATION':
      return setAllocation(state, action.hiveId, action.allocation)
    case 'HARVEST':
      return harvestHive(state, action.hiveId)
    case 'TREAT':
      return treatHive(state, action.hiveId)
    case 'SPLIT':
      return splitHive(state, action.hiveId)
    case 'REQUEEN':
      return requeenHive(state, action.hiveId, action.candidateId)
    case 'SELECT_HIVE':
      return selectHive(state, action.hiveId)
    case 'LOAD':
      return action.state
    case 'RESET':
      return resetGame()
    default:
      return state
  }
}

const SAVE_UNSUPPORTED_MESSAGE = 'Saving is only available in the Tauri app.'
const LOAD_UNSUPPORTED_MESSAGE = 'Loading is only available in the Tauri app.'

interface ApiaryProviderProps {
  children: ReactNode
}

export const ApiaryProvider = ({ children }: ApiaryProviderProps) => {
  const [game, dispatch] = useReducer(reducer, undefined, initialState)
  const [ioMessage, setIoMessage] = useState<string | null>(null)
  const [ioBusy, setIoBusy] = useState(false)

  const isTauriApp = isTauri()
  const saveRepository = useMemo<SaveRepository>(
    () => (isTauriApp ? new TauriSaveRepository() : new WebUnsupportedSaveRepository()),
    [isTauriApp]
  )

  const season = SEASONS[game.seasonIndex]
  const totalPopulation = game.hives.reduce((sum, hive) => sum + hive.population, 0)
  const totalHiveHoney = game.hives.reduce((sum, hive) => sum + hive.honey, 0)
  const averageHealthRaw = game.hives.length === 0 ? 0 : game.hives.reduce((sum, hive) => sum + hive.health, 0) / game.hives.length
  const averageHealth = Math.round(averageHealthRaw)

  const isInteractive = game.status === 'playing'
  const canAdvance = game.hives.length > 0 && isInteractive
  const selectedHive = game.hives.find((hive) => hive.id === game.selectedHiveId) ?? null

  const objectiveMet = {
    year: game.year >= VICTORY_REQUIREMENTS.year,
    hives: game.hives.length >= VICTORY_REQUIREMENTS.hives,
    stockpile: game.stockpile >= VICTORY_REQUIREMENTS.stockpile,
    health: averageHealthRaw >= VICTORY_REQUIREMENTS.avgHealth
  }

  const handleSave = async () => {
    setIoBusy(true)
    try {
      await saveRepository.save({
        version: 1,
        savedAt: new Date().toISOString(),
        state: game
      })
      setIoMessage('Game saved to local app data.')
    } catch (error) {
      console.error(error)
      if (error instanceof Error && error.message === SAVE_UNSUPPORTED_MESSAGE) {
        setIoMessage(error.message)
      } else {
        setIoMessage('Save failed. Check permissions and try again.')
      }
    } finally {
      setIoBusy(false)
    }
  }

  const handleLoad = async () => {
    setIoBusy(true)
    try {
      const loaded = await saveRepository.load()
      if (!loaded) {
        setIoMessage('No save file found yet.')
        return
      }

      const parsed = loaded as SavePayload & { state?: unknown }
      dispatch({ type: 'LOAD', state: hydrateState(parsed.state ?? parsed) })
      setIoMessage('Save loaded.')
    } catch (error) {
      console.error(error)
      if (error instanceof Error && error.message === LOAD_UNSUPPORTED_MESSAGE) {
        setIoMessage(error.message)
      } else {
        setIoMessage('Load failed. The save file may be corrupted.')
      }
    } finally {
      setIoBusy(false)
    }
  }

  const contextState: ApiaryContextState = {
    game,
    season,
    selectedHive,
    totalPopulation,
    totalHiveHoney,
    averageHealth,
    objectiveMet,
    isInteractive,
    canAdvance
  }

  const contextActions: ApiaryContextActions = {
    advanceDay: () => dispatch({ type: 'ADVANCE', days: 1 }),
    advanceWeek: () => dispatch({ type: 'ADVANCE', days: 7 }),
    restart: () => dispatch({ type: 'RESET' }),
    setAllocation: (hiveId, allocation) => dispatch({ type: 'SET_ALLOCATION', hiveId, allocation }),
    harvest: (hiveId) => dispatch({ type: 'HARVEST', hiveId }),
    treat: (hiveId) => dispatch({ type: 'TREAT', hiveId }),
    split: (hiveId) => dispatch({ type: 'SPLIT', hiveId }),
    selectHive: (hiveId) => dispatch({ type: 'SELECT_HIVE', hiveId }),
    requeen: (hiveId, candidateId) => dispatch({ type: 'REQUEEN', hiveId, candidateId }),
    save: handleSave,
    load: handleLoad,
    clearIoMessage: () => setIoMessage(null)
  }

  const contextMeta: ApiaryContextMeta = {
    ioBusy,
    ioMessage,
    isTauriApp
  }

  const value: ApiaryContextValue = {
    state: contextState,
    actions: contextActions,
    meta: contextMeta
  }

  return <ApiaryContext value={value}>{children}</ApiaryContext>
}

export {
  ACTION_COSTS,
  HONEY_CONSUME_BASE_PER_1000,
  QUEEN_TRAITS,
  SEASONS,
  SEASON_LENGTH,
  VICTORY_REQUIREMENTS,
  ALLOCATION_PRESETS
}
