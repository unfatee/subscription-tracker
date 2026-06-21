import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api/axiosClient'
import { createSubscription } from '../api/subscriptionsApi'
import SubscriptionForm from '../components/SubscriptionForm'

export default function AddSubscriptionPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const submit = async (data) => { setLoading(true); setError(''); try { await createSubscription(data); navigate('/subscriptions') } catch (err) { setError(errorMessage(err)) } finally { setLoading(false) } }
  return <div className="page narrow-page"><header className="page-header"><div><Link className="back-link" to="/subscriptions">← Back to subscriptions</Link><h1>Add subscription</h1><p>Bring a recurring payment into your dashboard.</p></div></header>{error && <div className="alert error">{error}</div>}<SubscriptionForm onSubmit={submit} submitLabel="Add subscription" loading={loading}/></div>
}
