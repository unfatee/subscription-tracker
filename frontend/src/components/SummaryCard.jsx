export default function SummaryCard({ label, value, detail, tone = 'violet', icon = '•' }) {
  return (
    <article className="summary-card">
      <span className={`summary-icon ${tone}`}>{icon}</span>
      <div><p>{label}</p><h3>{value}</h3>{detail && <small>{detail}</small>}</div>
    </article>
  )
}
