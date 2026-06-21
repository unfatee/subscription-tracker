import client from './axiosClient'

export const getSummary = () => client.get('/analytics/summary').then((r) => r.data)
export const getCategoryAnalytics = () => client.get('/analytics/by-category').then((r) => r.data)
export const getMonthlySpending = () => client.get('/analytics/monthly-spending').then((r) => r.data)
export const getUpcomingPayments = (days = 30) => client.get('/analytics/upcoming-payments', { params: { days } }).then((r) => r.data)
