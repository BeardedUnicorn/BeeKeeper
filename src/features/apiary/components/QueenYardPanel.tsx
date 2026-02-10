import { ACTION_COSTS, QUEEN_TRAITS } from '../../../game'
import { useApiary } from '../hooks/useApiary'

export const QueenYardPanel = () => {
  const { state, actions } = useApiary()

  return (
    <section className="panel queen-yard">
      <div className="panel-header">
        <h2>Queen Yard</h2>
        <p>Choose a new queen to steer a hive. Cost: {ACTION_COSTS.requeen} honey.</p>
      </div>
      <div className="queen-select">
        <label htmlFor="hive-select">Target hive</label>
        <select
          id="hive-select"
          value={state.selectedHive?.id ?? ''}
          onChange={(event) => actions.selectHive(event.target.value === '' ? null : event.target.value)}
          disabled={!state.isInteractive}
        >
          <option value="">Select hive</option>
          {state.game.hives.map((hive) => (
            <option key={hive.id} value={hive.id}>
              {hive.name} · {hive.queen.trait}
            </option>
          ))}
        </select>
      </div>
      <div className="queen-grid">
        {state.game.queenCandidates.map((candidate) => (
          <div key={candidate.id} className="queen-card">
            <div>
              <h3>{candidate.name}</h3>
              <p className="queen-trait">{candidate.trait}</p>
            </div>
            <p className="queen-effect">{candidate.effect}</p>
            <button
              type="button"
              className="btn"
              disabled={!state.selectedHive || state.game.stockpile < ACTION_COSTS.requeen || !state.isInteractive}
              onClick={() => state.selectedHive && actions.requeen(state.selectedHive.id, candidate.id)}
            >
              Assign Queen
            </button>
          </div>
        ))}
      </div>
      {state.selectedHive && (
        <div className="queen-footer">
          <p>
            Current queen: {state.selectedHive.queen.name} · {state.selectedHive.queen.trait}
          </p>
          <p className="queen-note">{QUEEN_TRAITS[state.selectedHive.queen.trait].effect}</p>
        </div>
      )}
    </section>
  )
}
