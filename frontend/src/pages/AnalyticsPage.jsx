import { useEffect, useMemo, useState } from 'react'
import { getCategoryAnalytics, getMonthlySpending, getSummary, getUpcomingPayments } from '../api/analyticsApi'
import { errorMessage } from '../api/axiosClient'
import { listSubscriptions } from '../api/subscriptionsApi'
import CategoryChart from '../components/CategoryChart'
import MonthlyChart from '../components/MonthlyChart'
import UpcomingPayments from '../components/UpcomingPayments'
import { useAuth } from '../context/AuthContext'
import { formatMoney } from '../utils/formatMoney'

const monthlyCost = (item) => item.billing_period === 'monthly' ? +item.price : item.billing_period === 'yearly' ? +item.price / 12 : item.billing_period === 'weekly' ? +item.price * 4.33 : +item.price / 3

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { Promise.all([getSummary(), getCategoryAnalytics(), getMonthlySpending(), getUpcomingPayments(60), listSubscriptions({ is_active: true })]).then(([summary, categories, monthly, upcoming, subscriptions]) => setData({ summary, categories, monthly, upcoming, subscriptions })).catch((err) => setError(errorMessage(err))) }, [])
  const expensive = useMemo(() => data ? [...data.subscriptions].sort((a, b) => monthlyCost(b) - monthlyCost(a)).slice(0, 5) : [], [data])
  if (!data && !error) return <div className="page-loader"><span className="spinner"/> Loading analytics…</div>
  return <div className="page"><header className="page-header"><div><span className="eyebrow">INSIGHTS</span><h1>Spending analytics</h1><p>See the shape of your recurring costs and what is coming next.</p></div><span className="period-chip">Next 12 months</span></header>{error && <div className="alert error">{error}</div>}{data && <section className="analytics-grid"><article className="panel"><div className="panel-header"><div><h2>Spending by category</h2><p>Monthly equivalent</p></div></div><CategoryChart data={data.categories} currency={user.default_currency}/></article><article className="panel analytics-wide"><div className="panel-header"><div><h2>Monthly forecast</h2><p>Projected charges by due date</p></div></div><MonthlyChart data={data.monthly} currency={user.default_currency}/></article><article className="panel"><div className="panel-header"><div><h2>Costliest subscriptions</h2><p>Ranked by monthly impact</p></div></div>{expensive.length ? <div className="rank-list">{expensive.map((item, index) => <div key={item.id}><span>{index + 1}</span><div><strong>{item.name}</strong><small>{item.category}</small></div><b>{formatMoney(monthlyCost(item), item.currency)}<small>/mo</small></b></div>)}</div> : <div className="empty-compact">No active subscriptions yet.</div>}</article><article className="panel analytics-wide"><div className="panel-header"><div><h2>Upcoming payments</h2><p>Due during the next 60 days</p></div></div><UpcomingPayments items={data.upcoming}/></article></section>}</div>
}
