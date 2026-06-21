export const formatMoney = (amount = 0, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(Number(amount))
  } catch {
    return `${Number(amount).toFixed(2)} ${currency}`
  }
}
