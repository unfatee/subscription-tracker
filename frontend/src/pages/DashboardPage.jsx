import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategoryAnalytics, getMonthlySpending, getSummary, getUpcomingPayments } from '../api/analyticsApi'
import { errorMessage } from '../api/axiosClient'
import { createDemoData } from '../api/subscriptionsApi'
import BudgetProgress from '../components/BudgetProgress'
import CategoryChart from '../components/CategoryChart'
import MonthlyChart from '../components/MonthlyChart'
import SummaryCard from '../components/SummaryCard'
import UpcomingPayments from '../components/UpcomingPayments'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/dateUtils'
import { formatMoney } from '../utils/formatMoney'

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [seeding, setSeeding] = useState(false)
  const load = async () => {
    try { const [summary, categories, monthly, upcoming] = await Promise.all([getSummary(), getCategoryAnalytics(), getMonthlySpending(), getUpcomingPayments()]); setData({ summary, categories, monthly, upcoming }) }
    catch (err) { setError(errorMessage(err)) }
  }
  useEffect(() => { load() }, [])
  const addDemo = async () => { setSeeding(true); setError(''); try { await createDemoData(); await load() } catch (err) { setError(errorMessage(err)) } finally { setSeeding(false) } }
  if (!data && !error) return <div className="page-loader"><span className="spinner" /> Loading overview…</div>
  const summary = data?.summary
  const currency = user.default_currency
  return <div className="page"><header className="page-header"><div><span className="eyebrow">OVERVIEW</span><h1>Good to see you, {user.name.split(' ')[0]}.</h1><p>Here’s what is happening with your recurring spend.</p></div><div className="header-actions"><button className="btn btn-secondary" onClick={addDemo} disabled={seeding}>{seeding ? 'Adding…' : 'Load demo data'}</button><Link className="btn btn-primary" to="/subscriptions/new">＋ Add subscription</Link></div></header>{error && <div className="alert error">{error}</div>}{summary && <><section className="summary-grid"><SummaryCard label="Monthly spending" value={formatMoney(summary.monthly_total, currency)} detail="Active subscriptions" icon="↗" tone="violet"/><SummaryCard label="Yearly forecast" value={formatMoney(summary.yearly_total, currency)} detail="Normalized annual cost" icon="⌁" tone="blue"/><SummaryCard label="Active plans" value={summary.active_subscriptions} detail={`${summary.inactive_subscriptions} paused`} icon="✓" tone="green"/><SummaryCard label="Next payment" value={summary.nearest_payment ? formatMoney(summary.nearest_payment.price, summary.nearest_payment.currency) : '—'} detail={summary.nearest_payment ? `${summary.nearest_payment.name} · ${formatDate(summary.nearest_payment.next_payment_date)}` : 'Nothing scheduled'} icon="◷" tone="amber"/></section><section className="dashboard-grid"><article className="panel chart-panel wide"><div className="panel-header"><div><h2>Spending forecast</h2><p>Expected charges over the next 12 months</p></div><Link to="/analytics">View analytics →</Link></div><MonthlyChart data={data.monthly} currency={currency}/></article><article className="panel"><div className="panel-header"><div><h2>Monthly budget</h2><p>Your current spending limit</p></div><Link to="/settings">Edit</Link></div><BudgetProgress summary={summary} currency={currency}/></article><article className="panel"><div className="panel-header"><div><h2>By category</h2><p>Normalized monthly spend</p></div></div><CategoryChart data={data.categories} currency={currency}/></article><article className="panel wide"><div className="panel-header"><div><h2>Upcoming payments</h2><p>Due during the next 30 days</p></div><Link to="/subscriptions">See all →</Link></div><UpcomingPayments items={data.upcoming}/></article></section></>}</div>
}
