import { useApiary } from '../hooks/useApiary'
import { formatHoney } from './format'
import { SEASONS } from '../../../game'

export const StatusBannerLost = () => {
  const { state } = useApiary()
  const seasonName = SEASONS[state.game.seasonIndex]?.name ?? 'Unknown'

  return (
    <section className="status-banner lost">
      <h2>Apiary Lost</h2>
      <p>Every hive has fallen. Restart the season to rebuild your apiary.</p>
      <div className="banner-stats">
        <div className="banner-stat">
          <span>Days survived</span>
          <strong>{state.game.day}</strong>
        </div>
        <div className="banner-stat">
          <span>Year reached</span>
          <strong>Year {state.game.year}</strong>
        </div>
        <div className="banner-stat">
          <span>Season at loss</span>
          <strong>{seasonName}</strong>
        </div>
        <div className="banner-stat">
          <span>Stockpile at end</span>
          <strong>{formatHoney(state.game.stockpile)} jars</strong>
        </div>
      </div>
    </section>
  )
}
