import { formatDate } from '../utils/dateUtils'
import { formatMoney } from '../utils/formatMoney'

export default function UpcomingPayments({ items = [] }) {
  if (!items.length) return <div className="empty-compact">No payments due in the selected period.</div>
  return <div className="upcoming-list">{items.slice(0, 6).map((item) => (
    <div className="upcoming-item" key={item.id}>
      <span className="service-icon compact">{item.name[0]}</span>
      <div><strong>{item.name}</strong><small>{formatDate(item.next_payment_date)} · {item.days_until === 0 ? 'Today' : `in ${item.days_until} days`}</small></div>
      <b>{formatMoney(item.price, item.currency)}</b>
    </div>
  ))}</div>
}
