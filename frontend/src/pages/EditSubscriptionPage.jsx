import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { errorMessage } from '../api/axiosClient'
import { getSubscription, updateSubscription } from '../api/subscriptionsApi'
import SubscriptionForm from '../components/SubscriptionForm'

export default function EditSubscriptionPage() {
  const { id } = useParams()
  const [item, setItem] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const navigate = useNavigate()
  useEffect(() => { getSubscription(id).then(setItem).catch((err) => setError(errorMessage(err))) }, [id])
  const submit = async (data) => { setSaving(true); setError(''); try { await updateSubscription(id, data); navigate('/subscriptions') } catch (err) { setError(errorMessage(err)) } finally { setSaving(false) } }
  return <div className="page narrow-page"><header className="page-header"><div><Link className="back-link" to="/subscriptions">← Back to subscriptions</Link><h1>Edit subscription</h1><p>Update billing details or pause this plan.</p></div></header>{error && <div className="alert error">{error}</div>}{item ? <SubscriptionForm initial={item} onSubmit={submit} submitLabel="Save changes" loading={saving}/> : !error && <div className="page-loader"><span className="spinner"/> Loading subscription…</div>}</div>
}
