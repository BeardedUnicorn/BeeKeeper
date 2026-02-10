export type SeasonName = 'Spring' | 'Summer' | 'Autumn' | 'Winter'
export type AllocationPreset = 'Balanced' | 'Forage Focus' | 'Defense Focus' | 'Brood Focus'
export type QueenTrait = 'Productive' | 'Hardy' | 'Gentle' | 'Hygienic' | 'Swarming'
export type ThreatType = 'Varroa Mites' | 'Wasps' | 'Pesticides' | 'Cold Snap'
export type GameStatus = 'playing' | 'won' | 'lost'

export interface Queen {
  id: string
  name: string
  trait: QueenTrait
}

export interface Hive {
  id: string
  name: string
  population: number
  honey: number
  health: number
  allocation: AllocationPreset
  queen: Queen
  immunityDays: number
}

export interface GameEvent {
  id: string
  day: number
  tone: 'good' | 'bad' | 'neutral'
  text: string
}

export interface QueenCandidate {
  id: string
  name: string
  trait: QueenTrait
  effect: string
}

export interface GameState {
  day: number
  seasonIndex: number
  seasonDay: number
  year: number
  stockpile: number
  hives: Hive[]
  events: GameEvent[]
  queenCandidates: QueenCandidate[]
  selectedHiveId: string | null
  status: GameStatus
}

export const SEASON_LENGTH = 30

export const VICTORY_REQUIREMENTS = {
  year: 3,
  hives: 3,
  stockpile: 220,
  avgHealth: 70
}

export const ACTION_COSTS = {
  treat: 6,
  split: 12,
  requeen: 10
} as const

export const HARVEST_EFFICIENCY = 0.92
export const HONEY_CONSUME_BASE_PER_1000 = 0.14
export const STARVATION_THRESHOLD_DAYS = 5

export const SEASONS: Array<{
  name: SeasonName
  honey: number
  brood: number
  threat: number
  death: number
  consume: number
  label: string
}> = [
  { name: 'Spring', honey: 1.0, brood: 1.2, threat: 0.9, death: 0.9, consume: 1.0, label: 'Build Up' },
  { name: 'Summer', honey: 1.3, brood: 1.0, threat: 1.0, death: 1.0, consume: 0.9, label: 'Harvest' },
  { name: 'Autumn', honey: 0.9, brood: 0.8, threat: 1.1, death: 1.05, consume: 1.1, label: 'Prepare' },
  { name: 'Winter', honey: 0.3, brood: 0.4, threat: 1.3, death: 1.35, consume: 1.8, label: 'Survive' }
]

export const ALLOCATION_PRESETS: Record<AllocationPreset, { forage: number; defense: number; brood: number }> = {
  Balanced: { forage: 40, defense: 30, brood: 30 },
  'Forage Focus': { forage: 60, defense: 20, brood: 20 },
  'Defense Focus': { forage: 30, defense: 50, brood: 20 },
  'Brood Focus': { forage: 30, defense: 20, brood: 50 }
}

export const QUEEN_TRAITS: Record<
  QueenTrait,
  {
    effect: string
    modifiers: {
      honey: number
      brood: number
      defense: number
      health: number
      threat: number
    }
  }
> = {
  Productive: {
    effect: '+25% honey, +5% brood, slightly higher threat risk',
    modifiers: { honey: 1.25, brood: 1.05, defense: 0.95, health: 1.0, threat: 1.08 }
  },
  Hardy: {
    effect: '+10% defense, +10% health, steadier winters',
    modifiers: { honey: 0.95, brood: 1.0, defense: 1.1, health: 1.1, threat: 0.9 }
  },
  Gentle: {
    effect: '+5% health, easier to manage, slightly lower defense',
    modifiers: { honey: 1.0, brood: 1.0, defense: 0.95, health: 1.05, threat: 1.0 }
  },
  Hygienic: {
    effect: '+15% defense, -20% threat chance, modest honey cost',
    modifiers: { honey: 0.95, brood: 1.05, defense: 1.15, health: 1.0, threat: 0.8 }
  },
  Swarming: {
    effect: '+15% honey, +20% brood, higher swarm risk',
    modifiers: { honey: 1.15, brood: 1.2, defense: 0.9, health: 0.95, threat: 1.12 }
  }
}

const HIVE_NAMES = ['Clover', 'Goldenrod', 'Wildflower', 'Meadow', 'Orchard', 'Citrus', 'Thyme']
const QUEEN_NAMES = ['Aurora', 'Juniper', 'Saffron', 'Marigold', 'Zinnia', 'Hazel', 'Vega', 'Lumen']

const THREAT_WEIGHTS: Record<SeasonName, Array<[ThreatType, number]>> = {
  Spring: [
    ['Varroa Mites', 4],
    ['Pesticides', 2],
    ['Wasps', 2],
    ['Cold Snap', 1]
  ],
  Summer: [
    ['Wasps', 4],
    ['Pesticides', 3],
    ['Varroa Mites', 2],
    ['Cold Snap', 1]
  ],
  Autumn: [
    ['Varroa Mites', 3],
    ['Wasps', 2],
    ['Pesticides', 2],
    ['Cold Snap', 3]
  ],
  Winter: [
    ['Cold Snap', 6],
    ['Varroa Mites', 2],
    ['Pesticides', 1],
    ['Wasps', 1]
  ]
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

interface Difficulty {
  honey: number
  threat: number
  death: number
}

const difficultyForYear = (year: number): Difficulty => {
  const tier = Math.max(0, year - 1)
  return {
    honey: clamp(1 - tier * 0.04, 0.7, 1),
    threat: 1 + tier * 0.08,
    death: 1 + tier * 0.05
  }
}

const averageHealth = (hives: Hive[]) =>
  hives.length === 0 ? 0 : hives.reduce((sum, hive) => sum + hive.health, 0) / hives.length

const meetsVictory = (state: GameState) => {
  return (
    state.year >= VICTORY_REQUIREMENTS.year &&
    state.hives.length >= VICTORY_REQUIREMENTS.hives &&
    state.stockpile >= VICTORY_REQUIREMENTS.stockpile &&
    averageHealth(state.hives) >= VICTORY_REQUIREMENTS.avgHealth
  )
}
const rand = (min: number, max: number) => Math.random() * (max - min) + min
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1))

const pickWeighted = <T,>(entries: Array<[T, number]>) => {
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = Math.random() * total
  for (const [value, weight] of entries) {
    roll -= weight
    if (roll <= 0) return value
  }
  return entries[entries.length - 1][0]
}

const makeId = () => `id_${Math.random().toString(36).slice(2, 9)}`

const createQueen = (trait: QueenTrait): Queen => ({
  id: makeId(),
  name: QUEEN_NAMES[randInt(0, QUEEN_NAMES.length - 1)],
  trait
})

export const createQueenCandidates = (): QueenCandidate[] => {
  const traits = Object.keys(QUEEN_TRAITS) as QueenTrait[]
  const shuffled = [...traits].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3).map((trait) => ({
    id: makeId(),
    name: QUEEN_NAMES[randInt(0, QUEEN_NAMES.length - 1)],
    trait,
    effect: QUEEN_TRAITS[trait].effect
  }))
}

export const initialState = (): GameState => {
  return {
    day: 1,
    seasonIndex: 0,
    seasonDay: 1,
    year: 1,
    stockpile: 12,
    status: 'playing',
    hives: [
      {
        id: makeId(),
        name: HIVE_NAMES[0],
        population: 12000,
        honey: 14,
        health: 82,
        allocation: 'Balanced',
        queen: createQueen('Productive'),
        immunityDays: 0
      },
      {
        id: makeId(),
        name: HIVE_NAMES[1],
        population: 9800,
        honey: 9,
        health: 76,
        allocation: 'Brood Focus',
        queen: createQueen('Hardy'),
        immunityDays: 0
      }
    ],
    events: [
      {
        id: makeId(),
        day: 1,
        tone: 'neutral',
        text: 'Spring begins. Your apiary hums to life.'
      }
    ],
    queenCandidates: createQueenCandidates(),
    selectedHiveId: null
  }
}

const logEvent = (events: GameEvent[], event: Omit<GameEvent, 'id'>) => {
  const next = [{ ...event, id: makeId() }, ...events]
  return next.slice(0, 10)
}

const tickHive = (
  hive: Hive,
  season: (typeof SEASONS)[number],
  difficulty: Difficulty
): { hive: Hive; events: GameEvent[] } => {
  const allocation = ALLOCATION_PRESETS[hive.allocation]
  const queen = QUEEN_TRAITS[hive.queen.trait]

  const forageFactor = allocation.forage / 100
  const broodFactor = allocation.brood / 100
  const defenseFactor = allocation.defense / 100

  const foragerScale = Math.pow(hive.population / 1000, 0.85)
  const honeyGain =
    foragerScale * 0.9 * forageFactor * season.honey * queen.modifiers.honey * difficulty.honey
  const popGain = hive.population * 0.008 * broodFactor * season.brood * queen.modifiers.brood
  const popLoss = hive.population * 0.005 * season.death * difficulty.death * (1.25 - hive.health / 100)

  const healthDelta =
    (defenseFactor * 1.1 + broodFactor * 0.25 - forageFactor * 0.35) *
      0.9 *
      queen.modifiers.health -
    season.death * 0.15

  let population = Math.max(0, hive.population + popGain - popLoss)
  let honey = Math.max(0, hive.honey + honeyGain)
  let health = clamp(hive.health + healthDelta, 0, 100)

  const events: GameEvent[] = []

  const consumption = Math.max(0, (population / 1000) * HONEY_CONSUME_BASE_PER_1000 * season.consume)
  if (consumption > 0) {
    honey = Math.max(0, honey - consumption)
    const storesDays = honey / consumption
    if (storesDays < STARVATION_THRESHOLD_DAYS) {
      const hunger = clamp(1 - storesDays / STARVATION_THRESHOLD_DAYS, 0, 1)
      health = clamp(health - (2 + 6 * hunger) * season.death, 0, 100)
      population = Math.max(0, population - population * (0.003 + 0.01 * hunger) * season.death)
    }
  }

  const threatBase = 0.05 * season.threat * queen.modifiers.threat * difficulty.threat
  const defenseMitigation = defenseFactor * queen.modifiers.defense
  const immunity = hive.immunityDays > 0 ? 0.6 : 1
  const threatChance = clamp(threatBase * (1.15 - defenseMitigation) * immunity, 0.01, 0.18)

  if (Math.random() < threatChance) {
    const threat = pickWeighted(THREAT_WEIGHTS[season.name])
    const severity = randInt(1, 3)
    const impact = severity * (1.15 - defenseMitigation)

    const popHit = population * (0.02 + 0.01 * severity) * impact
    const honeyHit = honey * (0.04 + 0.01 * severity)
    const healthHit = (6 + severity * 3) * (1.1 - defenseMitigation)

    population = Math.max(0, population - popHit)
    honey = Math.max(0, honey - honeyHit)
    health = clamp(health - healthHit, 0, 100)

    events.push({
      id: makeId(),
      day: 0,
      tone: 'bad',
      text: `${hive.name} faced ${threat} (severity ${severity}).`
    })
  }

  if (hive.queen.trait === 'Swarming' && population > 22000 && Math.random() < 0.03) {
    const swarmLoss = population * 0.22
    population = Math.max(0, population - swarmLoss)
    events.push({
      id: makeId(),
      day: 0,
      tone: 'neutral',
      text: `${hive.name} swarmed; a cluster departed with ${Math.round(swarmLoss).toLocaleString()} bees.`
    })
  }

  if (health < 25) {
    events.push({
      id: makeId(),
      day: 0,
      tone: 'bad',
      text: `${hive.name} health is critical. Consider treatment.`
    })
  }

  return {
    hive: {
      ...hive,
      population,
      honey,
      health,
      immunityDays: Math.max(0, hive.immunityDays - 1)
    },
    events
  }
}

export const advanceDays = (state: GameState, days: number): GameState => {
  if (state.status !== 'playing') return state
  const next = { ...state, events: [...state.events], hives: [...state.hives] }

  for (let step = 0; step < days; step += 1) {
    const season = SEASONS[next.seasonIndex]
    const difficulty = difficultyForYear(next.year)
    const dailyEvents: GameEvent[] = []
    const updatedHives: Hive[] = []

    for (const hive of next.hives) {
      const { hive: updated, events } = tickHive(hive, season, difficulty)
      if (updated.population < 600 || updated.health < 8) {
        dailyEvents.push({
          id: makeId(),
          day: 0,
          tone: 'bad',
          text: `${hive.name} collapsed. You lost that hive.`
        })
      } else {
        updatedHives.push(updated)
      }
      dailyEvents.push(...events)
    }

    next.day += 1
    next.seasonDay += 1

    if (next.seasonDay > SEASON_LENGTH) {
      next.seasonDay = 1
      next.seasonIndex = (next.seasonIndex + 1) % SEASONS.length
      if (next.seasonIndex === 0) {
        next.year += 1
        next.events = logEvent(next.events, {
          day: next.day,
          tone: 'neutral',
          text: `Year ${next.year} begins. Threats intensify across the region.`
        })
      }
      next.queenCandidates = createQueenCandidates()
      const newSeason = SEASONS[next.seasonIndex]
      next.events = logEvent(next.events, {
        day: next.day,
        tone: 'neutral',
        text: `${newSeason.name} arrives. Focus: ${newSeason.label}.`
      })
    }

    next.hives = updatedHives

    for (const event of dailyEvents) {
      next.events = logEvent(next.events, {
        day: next.day,
        tone: event.tone,
        text: event.text
      })
    }

    if (next.hives.length === 0) {
      next.status = 'lost'
      next.events = logEvent(next.events, {
        day: next.day,
        tone: 'bad',
        text: 'Your apiary is empty. Restart to try a new season.'
      })
      break
    }

    if (meetsVictory(next)) {
      next.status = 'won'
      next.events = logEvent(next.events, {
        day: next.day,
        tone: 'good',
        text: 'Victory! Your apiary is thriving and the cooperative declares a golden harvest.'
      })
      break
    }
  }

  if (next.selectedHiveId && !next.hives.some((hive) => hive.id === next.selectedHiveId)) {
    next.selectedHiveId = null
  }

  return next
}

export const setAllocation = (state: GameState, hiveId: string, allocation: AllocationPreset): GameState => {
  if (state.status !== 'playing') return state
  return {
    ...state,
    hives: state.hives.map((hive) => (hive.id === hiveId ? { ...hive, allocation } : hive))
  }
}

export const harvestHive = (state: GameState, hiveId: string): GameState => {
  if (state.status !== 'playing') return state
  const hive = state.hives.find((item) => item.id === hiveId)
  if (!hive || hive.honey < 1) return state
  const harvested = Number((hive.honey * HARVEST_EFFICIENCY).toFixed(1))
  const lost = Math.max(0, Number((hive.honey - harvested).toFixed(1)))
  return {
    ...state,
    stockpile: state.stockpile + harvested,
    hives: state.hives.map((item) => (item.id === hiveId ? { ...item, honey: 0 } : item)),
    events: logEvent(state.events, {
      day: state.day,
      tone: 'good',
      text: `Harvested ${harvested.toFixed(1)} jars from ${hive.name} (lost ${lost.toFixed(1)}).`
    })
  }
}

export const treatHive = (state: GameState, hiveId: string): GameState => {
  if (state.status !== 'playing') return state
  const cost = ACTION_COSTS.treat
  const hive = state.hives.find((item) => item.id === hiveId)
  if (!hive || state.stockpile < cost) return state
  return {
    ...state,
    stockpile: state.stockpile - cost,
    hives: state.hives.map((item) =>
      item.id === hiveId
        ? {
            ...item,
            health: clamp(item.health + 18, 0, 100),
            immunityDays: Math.max(item.immunityDays, 10)
          }
        : item
    ),
    events: logEvent(state.events, {
      day: state.day,
      tone: 'good',
      text: `${hive.name} received treatment. Health is improving.`
    })
  }
}

export const splitHive = (state: GameState, hiveId: string): GameState => {
  if (state.status !== 'playing') return state
  const cost = ACTION_COSTS.split
  const hive = state.hives.find((item) => item.id === hiveId)
  if (!hive || state.stockpile < cost || hive.population < 15000) return state

  const newPopulation = Math.round(hive.population * 0.42)
  const newHoney = Number((hive.honey * 0.35).toFixed(1))

  return {
    ...state,
    stockpile: state.stockpile - cost,
    hives: state.hives.flatMap((item) => {
      if (item.id !== hiveId) return [item]
      const splitHive: Hive = {
        ...item,
        id: makeId(),
        name: HIVE_NAMES[randInt(0, HIVE_NAMES.length - 1)],
        population: newPopulation,
        honey: newHoney,
        health: clamp(item.health - 6, 0, 100),
        allocation: 'Balanced',
        queen: createQueen(item.queen.trait),
        immunityDays: 0
      }
      return [
        {
          ...item,
          population: Math.round(item.population * 0.58),
          honey: Number((item.honey * 0.65).toFixed(1)),
          health: clamp(item.health - 4, 0, 100)
        },
        splitHive
      ]
    }),
    events: logEvent(state.events, {
      day: state.day,
      tone: 'good',
      text: `${hive.name} was split into a new hive.`
    })
  }
}

export const requeenHive = (state: GameState, hiveId: string, candidateId: string): GameState => {
  if (state.status !== 'playing') return state
  const cost = ACTION_COSTS.requeen
  const hive = state.hives.find((item) => item.id === hiveId)
  const candidate = state.queenCandidates.find((item) => item.id === candidateId)
  if (!hive || !candidate || state.stockpile < cost) return state

  return {
    ...state,
    stockpile: state.stockpile - cost,
    hives: state.hives.map((item) =>
      item.id === hiveId
        ? {
            ...item,
            queen: { id: makeId(), name: candidate.name, trait: candidate.trait },
            health: clamp(item.health + 8, 0, 100)
          }
        : item
    ),
    events: logEvent(state.events, {
      day: state.day,
      tone: 'good',
      text: `${hive.name} selected Queen ${candidate.name} (${candidate.trait}).`
    })
  }
}

export const selectHive = (state: GameState, hiveId: string | null): GameState => ({
  ...state,
  selectedHiveId: hiveId
})

export const resetGame = (): GameState => initialState()

export const hydrateState = (raw: unknown): GameState => {
  const base = initialState()
  if (!raw || typeof raw !== 'object') return base
  const data = raw as Partial<GameState>

  const hives = Array.isArray(data.hives) && data.hives.length > 0 ? data.hives : base.hives
  const events = Array.isArray(data.events) ? data.events : base.events
  const queenCandidates =
    Array.isArray(data.queenCandidates) && data.queenCandidates.length > 0
      ? data.queenCandidates
      : createQueenCandidates()
  const status: GameStatus = data.status === 'won' || data.status === 'lost' ? data.status : 'playing'
  const selectedHiveId =
    data.selectedHiveId && hives.some((hive) => hive.id === data.selectedHiveId)
      ? data.selectedHiveId
      : null
  const seasonIndex =
    typeof data.seasonIndex === 'number' ? clamp(Math.floor(data.seasonIndex), 0, SEASONS.length - 1) : base.seasonIndex

  return {
    ...base,
    ...data,
    day: typeof data.day === 'number' ? data.day : base.day,
    seasonIndex,
    seasonDay: typeof data.seasonDay === 'number' ? data.seasonDay : base.seasonDay,
    year: typeof data.year === 'number' ? data.year : base.year,
    stockpile: typeof data.stockpile === 'number' ? data.stockpile : base.stockpile,
    hives,
    events,
    queenCandidates,
    status,
    selectedHiveId
  }
}
