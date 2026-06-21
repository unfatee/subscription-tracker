import { formatMoney } from '../utils/formatMoney'

export default function BudgetProgress({ summary, currency = 'USD' }) {
  const percent = summary?.budget_used_percent
  if (percent == null) return <div className="budget-empty"><span>Set a monthly budget to see your progress.</span></div>
  const safe = Math.min(percent, 100)
  return (
    <div className="budget-progress">
      <div className="budget-label"><span>{formatMoney(summary.monthly_total, currency)} used</span><strong>{Math.round(percent)}%</strong></div>
      <div className="progress-track"><i className={percent > 100 ? 'over' : percent >= 80 ? 'warning' : ''} style={{ width: `${safe}%` }} /></div>
      <small>of {formatMoney(summary.budget_limit, currency)} monthly budget</small>
    </div>
  )
}
