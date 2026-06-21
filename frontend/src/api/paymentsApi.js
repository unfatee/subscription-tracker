import client from './axiosClient'

export const getPayments = (params = {}) => client.get('/payments', { params }).then((r) => r.data)
export const deletePayment = (id) => client.delete(`/payments/${id}`)
