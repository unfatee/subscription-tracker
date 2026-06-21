export const formatDate = (date) => date ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(`${date}T00:00:00`)) : '—'
export const todayInput = () => new Date().toISOString().slice(0, 10)
export const nextMonthInput = () => {
  const value = new Date()
  value.setMonth(value.getMonth() + 1)
  return value.toISOString().slice(0, 10)
}
