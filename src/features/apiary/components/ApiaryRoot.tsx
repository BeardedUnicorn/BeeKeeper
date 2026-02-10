import { useApiary } from '../hooks/useApiary'
import { ApiaryLogPanel } from './ApiaryLogPanel'
import { formatCount, formatHoney } from './format'
import { HeroSection } from './HeroSection'
import { HivesPanel } from './HivesPanel'
import { ObjectivePanel } from './ObjectivePanel'
import { QueenYardPanel } from './QueenYardPanel'
import { StatusBannerLost } from './StatusBannerLost'
import { StatusBannerWon } from './StatusBannerWon'

export const ApiaryRoot = () => {
  const { state } = useApiary()

  return (
    <div className="app" data-season={state.season.name}>
      <HeroSection />

      {state.game.status === 'won' && <StatusBannerWon />}
      {state.game.status === 'lost' && <StatusBannerLost />}

      <section className="stats">
        <div className="stat-card">
          <span>Total Bees</span>
          <strong>{formatCount(state.totalPopulation)}</strong>
        </div>
        <div className="stat-card">
          <span>Honey Stockpile</span>
          <strong>{formatHoney(state.game.stockpile)} jars</strong>
        </div>
        <div className="stat-card">
          <span>Hive Stores</span>
          <strong>{formatHoney(state.totalHiveHoney)} jars</strong>
        </div>
        <div className="stat-card">
          <span>Average Health</span>
          <strong>{state.averageHealth}%</strong>
        </div>
      </section>

      <main className="layout">
        <HivesPanel />

        <aside className="side">
          <ObjectivePanel />
          <QueenYardPanel />
          <ApiaryLogPanel />
        </aside>
      </main>
    </div>
  )
}
