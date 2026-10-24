import { useApiary } from '../hooks/useApiary'
import { formatCount, formatHoney } from './format'

export const StatusBannerWon = () => {
  const { state } = useApiary()
  const totalPop = state.game.hives.reduce((s, h) => s + h.population, 0)

  return (
    <section className="status-banner won">
      <h2>
        Golden Harvest Achieved <span aria-hidden="true">🍯</span>
      </h2>
      <p>You have built a thriving network of hives. Restart to chase an even greater legacy.</p>
      <div className="banner-stats">
        <div className="banner-stat">
          <span>Days survived</span>
          <strong>{state.game.day}</strong>
        </div>
        <div className="banner-stat">
          <span>Hives at end</span>
          <strong>{state.game.hives.length}</strong>
        </div>
        <div className="banner-stat">
          <span>Total bees</span>
          <strong>{formatCount(totalPop)}</strong>
        </div>
        <div className="banner-stat">
          <span>Honey stockpile</span>
          <strong>{formatHoney(state.game.stockpile)} jars</strong>
        </div>
      </div>
    </section>
  )
}
