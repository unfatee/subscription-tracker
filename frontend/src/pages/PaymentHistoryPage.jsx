import { useEffect, useState } from 'react'
import { errorMessage } from '../api/axiosClient'
import { deletePayment, getPayments } from '../api/paymentsApi'
import { listSubscriptions } from '../api/subscriptionsApi'
import { formatDate } from '../utils/dateUtils'
import { formatMoney } from '../utils/formatMoney'

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [filters, setFilters] = useState({ subscription_id: '', date_from: '', date_to: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const load = async () => { setLoading(true); try { const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value)); const [history, plans] = await Promise.all([getPayments(params), listSubscriptions()]); setPayments(history); setSubscriptions(plans); setError('') } catch (err) { setError(errorMessage(err)) } finally { setLoading(false) } }
  useEffect(() => { load() }, [filters.subscription_id, filters.date_from, filters.date_to])
  const remove = async (item) => { if (!window.confirm('Remove this payment record?')) return; try { await deletePayment(item.id); await load() } catch (err) { setError(errorMessage(err)) } }
  return <div className="page"><header className="page-header"><div><span className="eyebrow">TRANSACTIONS</span><h1>Payment history</h1><p>A clean audit trail of subscriptions marked as paid.</p></div></header>{error && <div className="alert error">{error}</div>}<section className="filter-bar history-filters"><select value={filters.subscription_id} onChange={(e) => setFilters({ ...filters, subscription_id: e.target.value })}><option value="">All subscriptions</option>{subscriptions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><label className="date-filter"><span>From</span><input type="date" value={filters.date_from} onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}/></label><label className="date-filter"><span>To</span><input type="date" value={filters.date_to} onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}/></label></section><section className="panel table-panel">{loading ? <div className="page-loader"><span className="spinner"/> Loading payments…</div> : payments.length ? <div className="table-scroll"><table><thead><tr><th>Subscription</th><th>Payment date</th><th>Amount</th><th>Currency</th><th></th></tr></thead><tbody>{payments.map((item) => <tr key={item.id}><td><div className="table-service"><span className="service-icon compact">{item.subscription_name?.[0]}</span><strong>{item.subscription_name}</strong></div></td><td>{formatDate(item.payment_date)}</td><td><strong>{formatMoney(item.amount, item.currency)}</strong></td><td><span className="currency-chip">{item.currency}</span></td><td><button className="text-button danger-text" onClick={() => remove(item)}>Delete</button></td></tr>)}</tbody></table></div> : <div className="empty-state inside"><span className="empty-icon">↻</span><h2>No payment records</h2><p>Mark a subscription as paid and it will appear here.</p></div>}</section></div>
}
