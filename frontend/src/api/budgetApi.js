import client from './axiosClient'

export const getBudget = () => client.get('/budget').then((r) => r.data)
export const saveBudget = (payload) => client.post('/budget', payload).then((r) => r.data)
export const deleteBudget = () => client.delete('/budget')
