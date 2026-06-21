import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { errorMessage } from '../api/axiosClient'
import { deleteSubscription, exportSubscriptions, listSubscriptions, markPaid, toggleSubscription } from '../api/subscriptionsApi'
import SubscriptionCard from '../components/SubscriptionCard'
import { BILLING_PERIODS } from '../utils/constants'

export default function SubscriptionsPage() {
  const [items, setItems] = useState([])
  const [filters, setFilters] = useState({ search: '', category: '', is_active: '', billing_period: '' })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState('')
  const categories = useMemo(() => [...new Set(items.map((item) => item.category))].sort(), [items])
  const load = async () => { setLoading(true); try { const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '')); setItems(await listSubscriptions(params)); setError('') } catch (err) { setError(errorMessage(err)) } finally { setLoading(false) } }
  useEffect(() => { const timeout = setTimeout(load, 250); return () => clearTimeout(timeout) }, [filters.search, filters.category, filters.is_active, filters.billing_period])
  const run = async (item, action) => { setBusy(item.id); setError(''); try { await action(item.id); await load() } catch (err) { setError(errorMessage(err)) } finally { setBusy(null) } }
  const remove = (item) => { if (window.confirm(`Delete ${item.name}? Its payment history will also be removed.`)) run(item, deleteSubscription) }
  const exportCsv = async () => { try { const response = await exportSubscriptions(); const url = URL.createObjectURL(response.data); const link = document.createElement('a'); link.href = url; link.download = 'subscriptions.csv'; link.click(); URL.revokeObjectURL(url) } catch (err) { setError(errorMessage(err)) } }
  const clear = () => setFilters({ search: '', category: '', is_active: '', billing_period: '' })
  return <div className="page"><header className="page-header"><div><span className="eyebrow">YOUR SERVICES</span><h1>Subscriptions</h1><p>Manage every plan, renewal and recurring charge.</p></div><div className="header-actions"><button className="btn btn-secondary" onClick={exportCsv}>⇩ Export CSV</button><Link className="btn btn-primary" to="/subscriptions/new">＋ Add subscription</Link></div></header>{error && <div className="alert error">{error}</div>}<section className="filter-bar"><label className="search-field"><span>⌕</span><input value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} placeholder="Search subscriptions…" /></label><select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}><option value="">All categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select><select value={filters.is_active} onChange={(e) => setFilters({ ...filters, is_active: e.target.value })}><option value="">All statuses</option><option value="true">Active</option><option value="false">Paused</option></select><select value={filters.billing_period} onChange={(e) => setFilters({ ...filters, billing_period: e.target.value })}><option value="">Any billing cycle</option>{BILLING_PERIODS.map((item) => <option key={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}</select></section>{loading ? <div className="page-loader"><span className="spinner"/> Loading subscriptions…</div> : items.length ? <section className="subscriptions-grid">{items.map((item) => <SubscriptionCard key={item.id} item={item} busy={busy === item.id} onDelete={remove} onToggle={(value) => run(value, toggleSubscription)} onPaid={(value) => run(value, markPaid)} />)}</section> : <section className="empty-state"><span className="empty-icon">◇</span><h2>No subscriptions found</h2><p>Add your first recurring service or adjust the current filters.</p><div><button className="btn btn-secondary" onClick={clear}>Clear filters</button> <Link className="btn btn-primary" to="/subscriptions/new">Add subscription</Link></div></section>}</div>
}
