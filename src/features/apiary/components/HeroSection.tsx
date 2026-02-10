import { useMemo } from 'react'

import { SEASONS, SEASON_LENGTH } from '../../../game'
import { useApiary } from '../hooks/useApiary'

const Scene = ({ hiveCount }: { hiveCount: number }) => {
  const bees = useMemo(() => {
    const rand = (seed: number) => {
      const value = Math.sin(seed) * 10000
      return value - Math.floor(value)
    }

    return Array.from({ length: 14 }).map((_, index) => {
      const base = index + 1
      return {
        id: `bee_${index}`,
        x: 70 + rand(base * 11) * 600,
        y: 40 + rand(base * 17) * 90,
        size: 3 + rand(base * 23) * 3,
        delay: rand(base * 29) * 2,
        duration: 4 + rand(base * 31) * 4
      }
    })
  }, [])

  const hivePositions = Array.from({ length: Math.max(1, hiveCount) }).map((_, index) => {
    const spacing = 600 / Math.max(1, hiveCount)
    return {
      x: 100 + spacing * index,
      y: 150
    }
  })

  return (
    <svg className="scene" viewBox="0 0 760 220" role="img" aria-label="Apiary scene">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--sky)" />
          <stop offset="100%" stopColor="var(--sky-deep)" />
        </linearGradient>
        <linearGradient id="field" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--field)" />
          <stop offset="100%" stopColor="var(--field-deep)" />
        </linearGradient>
      </defs>
      <rect width="760" height="140" fill="url(#sky)" />
      <rect y="140" width="760" height="80" fill="url(#field)" />
      <circle cx="650" cy="40" r="26" fill="var(--sun)" opacity="0.9" />
      <path
        d="M0 150 C 120 120, 240 180, 360 150 C 480 120, 600 180, 760 140 L 760 220 L 0 220 Z"
        fill="var(--field-shadow)"
        opacity="0.45"
      />
      {hivePositions.map((pos, index) => (
        <g key={`hive_${index}`} transform={`translate(${pos.x} ${pos.y})`}>
          <rect x="-28" y="-26" width="56" height="12" rx="4" fill="var(--hive)" />
          <rect x="-30" y="-14" width="60" height="12" rx="4" fill="var(--hive)" />
          <rect x="-32" y="-2" width="64" height="14" rx="5" fill="var(--hive)" />
          <rect x="-24" y="12" width="48" height="6" rx="3" fill="var(--hive-dark)" />
        </g>
      ))}
      {bees.map((bee) => (
        <g key={bee.id} transform={`translate(${bee.x} ${bee.y})`}>
          <g className="bee" style={{ animationDelay: `${bee.delay}s`, animationDuration: `${bee.duration}s` }}>
            <ellipse cx="0" cy="0" rx={bee.size + 1.2} ry={bee.size} fill="var(--bee)" />
            <ellipse cx="-2" cy="-3" rx={bee.size * 0.7} ry={bee.size * 0.5} fill="var(--bee-wing)" />
            <ellipse cx="3" cy="-3" rx={bee.size * 0.7} ry={bee.size * 0.5} fill="var(--bee-wing)" />
          </g>
        </g>
      ))}
    </svg>
  )
}

const TauriPersistenceControls = () => {
  const { actions, meta } = useApiary()

  return (
    <div className="button-row secondary">
      <button
        type="button"
        className="btn"
        onClick={() => void actions.save()}
        disabled={meta.ioBusy}
        title="Save your game locally"
      >
        Save Game
      </button>
      <button
        type="button"
        className="btn ghost"
        onClick={() => void actions.load()}
        disabled={meta.ioBusy}
        title="Load your last save"
      >
        Load Game
      </button>
    </div>
  )
}

const WebPersistenceControls = () => {
  return (
    <div className="button-row secondary">
      <button type="button" className="btn" disabled title="Run in Tauri to save">
        Save Game
      </button>
      <button type="button" className="btn ghost" disabled title="Run in Tauri to load">
        Load Game
      </button>
      <span className="io-hint">Tauri app required for saves.</span>
    </div>
  )
}

const PersistenceControls = () => {
  const {
    meta: { isTauriApp }
  } = useApiary()

  return isTauriApp ? <TauriPersistenceControls /> : <WebPersistenceControls />
}

export const HeroSection = () => {
  const { state, actions, meta } = useApiary()

  return (
    <header className="hero">
      <div className="hero-copy">
        <p className="eyebrow">BeeKeeper Cooperative</p>
        <h1>BeeKeeper</h1>
        <p className="subtitle">
          Guide your apiary through the seasons. Balance forage, defense, and brood while selecting queens and fending off
          threats.
        </p>
        <div className="hero-controls">
          <div className="day-badge">
            <span>Year {state.game.year}</span>
            <strong>
              {state.season.name} · Day {state.game.seasonDay} / {SEASON_LENGTH}
            </strong>
          </div>
          <div className="button-row">
            <button type="button" className="btn primary" onClick={actions.advanceDay} disabled={!state.canAdvance}>
              Advance Day
            </button>
            <button type="button" className="btn" onClick={actions.advanceWeek} disabled={!state.canAdvance}>
              Advance Week
            </button>
            <button type="button" className="btn ghost" onClick={actions.restart}>
              Restart Season
            </button>
          </div>
          <PersistenceControls />
          {meta.ioMessage && <div className="io-message">{meta.ioMessage}</div>}
        </div>
      </div>
      <div className="hero-scene panel">
        <Scene hiveCount={state.game.hives.length} />
        <div className="season-strip">
          {SEASONS.map((entry, index) => (
            <div key={entry.name} className={`season-chip ${index === state.game.seasonIndex ? 'active' : ''}`}>
              <span>{entry.name}</span>
              <small>{entry.label}</small>
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}
