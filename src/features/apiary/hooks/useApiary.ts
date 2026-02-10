import { use } from 'react'

import { ApiaryContext } from '../context/ApiaryContext'

export const useApiary = () => {
  const context = use(ApiaryContext)
  if (!context) {
    throw new Error('useApiary must be used within an ApiaryProvider')
  }

  return context
}
