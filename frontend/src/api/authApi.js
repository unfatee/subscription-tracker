import client from './axiosClient'

export const register = (payload) => client.post('/auth/register', payload).then((r) => r.data)
export const login = (payload) => client.post('/auth/login', payload).then((r) => r.data)
export const getMe = () => client.get('/auth/me').then((r) => r.data)
export const updateMe = (payload) => client.patch('/auth/me', payload).then((r) => r.data)
