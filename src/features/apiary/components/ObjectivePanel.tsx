import { VICTORY_REQUIREMENTS } from '../../../game'
import { useApiary } from '../hooks/useApiary'

export const ObjectivePanel = () => {
  const { state } = useApiary()

  return (
    <section className="panel objective">
      <div className="panel-header">
        <h2>Objective</h2>
        <p>Earn a golden harvest by meeting all four goals.</p>
      </div>
      <ul className="objective-list">
        <li className={state.objectiveMet.year ? 'done' : ''}>Reach year {VICTORY_REQUIREMENTS.year}+</li>
        <li className={state.objectiveMet.hives ? 'done' : ''}>Maintain {VICTORY_REQUIREMENTS.hives}+ hives</li>
        <li className={state.objectiveMet.stockpile ? 'done' : ''}>Store {VICTORY_REQUIREMENTS.stockpile}+ honey jars</li>
        <li className={state.objectiveMet.health ? 'done' : ''}>Keep average health at {VICTORY_REQUIREMENTS.avgHealth}%+</li>
      </ul>
    </section>
  )
}
