import './App.css'

import { ApiaryRoot } from './features/apiary/components'
import { ApiaryProvider } from './features/apiary/provider/ApiaryProvider'

function App() {
  return (
    <ApiaryProvider>
      <ApiaryRoot />
    </ApiaryProvider>
  )
}

export default App
