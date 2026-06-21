import { Link } from 'react-router-dom'
import { formatDate } from '../utils/dateUtils'
import { formatMoney } from '../utils/formatMoney'

const categoryIcon = (category) => ({
  Entertainment: '▶', Music: '♫', Productivity: '✦', Development: '</>', Software: '◆', Design: '✎', Security: '⌾', Education: '◎', Health: '+',
}[category] || '◇')

export default function SubscriptionCard({ item, onDelete, onToggle, onPaid, busy }) {
  return (
    <article className={`subscription-card ${!item.is_active ? 'muted-card' : ''}`}>
      <div className="subscription-top">
        <span className="service-icon">{categoryIcon(item.category)}</span>
        <span className={`status-pill ${item.is_active ? 'status-active' : 'status-inactive'}`}>{item.is_active ? 'Active' : 'Paused'}</span>
      </div>
      <div className="subscription-heading"><h3>{item.name}</h3><p>{item.category}</p></div>
      <div className="subscription-price"><strong>{formatMoney(item.price, item.currency)}</strong><span>/ {item.billing_period.replace('ly', '')}</span></div>
      <div className="subscription-due"><span>Next payment</span><strong>{formatDate(item.next_payment_date)}</strong></div>
      <div className="card-actions">
        <button className="btn btn-success btn-small" disabled={busy || !item.is_active} onClick={() => onPaid(item)}>✓ Paid</button>
        <Link className="btn btn-secondary btn-small" to={`/subscriptions/${item.id}/edit`}>Edit</Link>
        <button className="more-button" disabled={busy} onClick={() => onToggle(item)} title={item.is_active ? 'Pause' : 'Resume'}>{item.is_active ? 'Ⅱ' : '▶'}</button>
        <button className="more-button danger-text" disabled={busy} onClick={() => onDelete(item)} title="Delete">×</button>
      </div>
    </article>
  )
}
