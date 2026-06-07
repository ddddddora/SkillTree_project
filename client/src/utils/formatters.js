// Форматирование чисел для отображения
export function formatNumber(value, defaultValue = '0') {
  if (value === undefined || value === null) return defaultValue
  if (typeof value === 'string') {
    const num = parseInt(value)
    return isNaN(num) ? defaultValue : num.toString()
  }
  if (typeof value === 'number') {
    return value.toString()
  }
  return defaultValue
}

// Форматирование процентов
export function formatPercentage(value, defaultValue = '0%') {
  if (value === undefined || value === null) return defaultValue
  if (typeof value === 'string') {
    const num = parseInt(value)
    return isNaN(num) ? defaultValue : `${num}%`
  }
  if (typeof value === 'number') {
    return `${Math.round(value)}%`
  }
  return defaultValue
}

// Получение безопасного числового значения
export function safeNumber(value, fallback = 0) {
  if (value === undefined || value === null) return fallback
  const num = Number(value)
  return isNaN(num) ? fallback : num
}