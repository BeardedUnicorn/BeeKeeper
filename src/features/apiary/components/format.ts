export const formatCount = (value: number) => {
  if (value >= 100000) return `${(value / 1000).toFixed(0)}k`
  if (value >= 10000) return `${(value / 1000).toFixed(1)}k`
  return Math.round(value).toLocaleString()
}

export const formatHoney = (value: number) => value.toFixed(1)
