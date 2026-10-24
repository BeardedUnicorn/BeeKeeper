import { VICTORY_REQUIREMENTS } from '../../../game'
import { useApiary } from '../hooks/useApiary'
import { formatHoney } from './format'

export const ObjectivePanel = () => {
  const { state } = useApiary()

  const stockpileProgress = Math.min(100, (state.game.stockpile / VICTORY_REQUIREMENTS.stockpile) * 100)
  const healthProgress = Math.min(100, (state.averageHealth / VICTORY_REQUIREMENTS.avgHealth) * 100)

  return (
    <section className="panel objective">
      <div className="panel-header">
        <h2>Objective</h2>
        <p>Earn a golden harvest by meeting all four goals.</p>
      </div>
      <ul className="objective-list">
        <li className={state.objectiveMet.year ? 'done' : ''}>
          <span className="obj-label">Reach year {VICTORY_REQUIREMENTS.year}+</span>
          <span className="obj-current">Year {state.game.year}</span>
        </li>
        <li className={state.objectiveMet.hives ? 'done' : ''}>
          <span className="obj-label">Maintain {VICTORY_REQUIREMENTS.hives}+ hives</span>
          <span className="obj-current">{state.game.hives.length} hive{state.game.hives.length !== 1 ? 's' : ''}</span>
        </li>
        <li className={state.objectiveMet.stockpile ? 'done' : ''}>
          <span className="obj-label">Store {VICTORY_REQUIREMENTS.stockpile}+ honey jars</span>
          <span className="obj-current">
            {formatHoney(state.game.stockpile)} / {VICTORY_REQUIREMENTS.stockpile}
          </span>
          {!state.objectiveMet.stockpile && (
            <div className="obj-bar">
              <span style={{ width: `${stockpileProgress}%` }} />
            </div>
          )}
        </li>
        <li className={state.objectiveMet.health ? 'done' : ''}>
          <span className="obj-label">Keep avg health at {VICTORY_REQUIREMENTS.avgHealth}%+</span>
          <span className="obj-current">
            {state.averageHealth}% / {VICTORY_REQUIREMENTS.avgHealth}%
          </span>
          {!state.objectiveMet.health && (
            <div className="obj-bar">
              <span style={{ width: `${healthProgress}%` }} />
            </div>
          )}
        </li>
      </ul>
    </section>
  )
}
