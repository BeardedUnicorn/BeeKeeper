import { ACTION_COSTS, ALLOCATION_PRESETS, HONEY_CONSUME_BASE_PER_1000 } from '../../../game'
import { useApiary } from '../hooks/useApiary'
import { formatCount, formatHoney } from './format'

const LOW_STORES_THRESHOLD_DAYS = 7

export const HivesPanel = () => {
  const { state, actions } = useApiary()

  return (
    <section className="panel hives">
      <div className="panel-header">
        <h2>Hives</h2>
        <p>
          Allocate the workforce and keep each hive healthy enough for the next flow. Hives consume stores daily; winter
          consumption is highest.
        </p>
      </div>
      <div className="hive-grid">
        {state.game.hives.map((hive) => {
          const allocation = ALLOCATION_PRESETS[hive.allocation]
          const canSplit = state.game.stockpile >= ACTION_COSTS.split && hive.population >= 15000
          const canTreat = state.game.stockpile >= ACTION_COSTS.treat
          const canHarvest = hive.honey >= 1
          const consumption = (hive.population / 1000) * HONEY_CONSUME_BASE_PER_1000 * (state.season.consume ?? 1)
          const storesDays = consumption > 0 ? hive.honey / consumption : Number.POSITIVE_INFINITY
          const storesDaysLabel = Number.isFinite(storesDays) ? storesDays.toFixed(1) : '∞'
          const isLowStores = storesDays < LOW_STORES_THRESHOLD_DAYS

          return (
            <article key={hive.id} className={`hive-card ${isLowStores ? 'low-stores' : ''}`}>
              <div className="hive-top">
                <div>
                  <h3>{hive.name}</h3>
                  <p className="hive-queen">
                    Queen {hive.queen.name} · {hive.queen.trait}
                  </p>
                </div>
                <div className="health-pill">{Math.round(hive.health)}% health</div>
              </div>

              <div className="hive-metrics">
                <div>
                  <span>Population</span>
                  <strong>{formatCount(hive.population)}</strong>
                </div>
                <div>
                  <span>Stores</span>
                  <strong>
                    {formatHoney(hive.honey)} jars ({storesDaysLabel} days)
                  </strong>
                </div>
                <div>
                  <span>Immunity</span>
                  <strong>{hive.immunityDays > 0 ? `${hive.immunityDays} days` : 'None'}</strong>
                </div>
              </div>

              <div className="health-bar" role="presentation">
                <span style={{ width: `${hive.health}%` }} />
              </div>

              <div className="allocation">
                <p>Allocation</p>
                <div className="pill-row">
                  {(Object.keys(ALLOCATION_PRESETS) as Array<keyof typeof ALLOCATION_PRESETS>).map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      className={`pill ${preset === hive.allocation ? 'active' : ''}`}
                      onClick={() => actions.setAllocation(hive.id, preset)}
                      disabled={!state.isInteractive}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <div className="allocation-details">
                  <span>{allocation.forage}% forage</span>
                  <span>{allocation.defense}% defense</span>
                  <span>{allocation.brood}% brood</span>
                </div>
              </div>

              <div className="hive-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={() => actions.harvest(hive.id)}
                  disabled={!canHarvest || !state.isInteractive}
                >
                  Harvest
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => actions.treat(hive.id)}
                  disabled={!canTreat || !state.isInteractive}
                  title={`Costs ${ACTION_COSTS.treat} honey`}
                >
                  Treat ({ACTION_COSTS.treat})
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => actions.split(hive.id)}
                  disabled={!canSplit || !state.isInteractive}
                  title={`Costs ${ACTION_COSTS.split} honey and 15k bees`}
                >
                  Split ({ACTION_COSTS.split})
                </button>
                <button
                  type="button"
                  className={`btn ghost ${state.game.selectedHiveId === hive.id ? 'active' : ''}`}
                  onClick={() => actions.selectHive(state.game.selectedHiveId === hive.id ? null : hive.id)}
                  disabled={!state.isInteractive}
                >
                  {state.game.selectedHiveId === hive.id ? 'Queen Selected' : 'Select for Queen'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
      {state.game.hives.length === 0 && (
        <div className="empty-state">
          <h3>No hives remain.</h3>
          <p>Restart the season to rebuild your apiary.</p>
        </div>
      )}
    </section>
  )
}
