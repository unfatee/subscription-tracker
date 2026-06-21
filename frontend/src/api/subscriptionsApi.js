import client from './axiosClient'

export const listSubscriptions = (params = {}) => client.get('/subscriptions', { params }).then((r) => r.data)
export const getSubscription = (id) => client.get(`/subscriptions/${id}`).then((r) => r.data)
export const createSubscription = (payload) => client.post('/subscriptions', payload).then((r) => r.data)
export const updateSubscription = (id, payload) => client.put(`/subscriptions/${id}`, payload).then((r) => r.data)
export const deleteSubscription = (id) => client.delete(`/subscriptions/${id}`)
export const toggleSubscription = (id) => client.patch(`/subscriptions/${id}/toggle-active`).then((r) => r.data)
export const markPaid = (id) => client.patch(`/subscriptions/${id}/mark-paid`).then((r) => r.data)
export const createDemoData = () => client.post('/subscriptions/demo-data').then((r) => r.data)
export const exportSubscriptions = () => client.get('/subscriptions/export/csv', { responseType: 'blob' })
