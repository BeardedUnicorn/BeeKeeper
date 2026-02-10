import { useApiary } from '../hooks/useApiary'

export const ApiaryLogPanel = () => {
  const { state } = useApiary()

  return (
    <section className="panel log">
      <div className="panel-header">
        <h2>Apiary Log</h2>
        <p>Recent events from your hives.</p>
      </div>
      <div className="log-list">
        {state.game.events.map((event) => (
          <div key={event.id} className={`log-item ${event.tone}`}>
            <span>Day {event.day}</span>
            <p>{event.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
