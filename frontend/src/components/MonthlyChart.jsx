import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMoney } from '../utils/formatMoney'

export default function MonthlyChart({ data = [], currency = 'USD' }) {
  if (!data.length) return <div className="chart-empty"><span>⌁</span><p>No spending forecast yet</p></div>
  return (
    <ResponsiveContainer width="100%" height={285}>
      <AreaChart data={data} margin={{ left: -18, right: 10, top: 20 }}>
        <defs><linearGradient id="spending" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#635bff" stopOpacity={0.24}/><stop offset="100%" stopColor="#635bff" stopOpacity={0}/></linearGradient></defs>
        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e9ebf2" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#8a90a2', fontSize: 11 }} tickFormatter={(value) => value.split(' ')[0]} />
        <YAxis tickLine={false} axisLine={false} tick={{ fill: '#8a90a2', fontSize: 11 }} />
        <Tooltip formatter={(value) => formatMoney(value, currency)} />
        <Area type="monotone" dataKey="amount" stroke="#635bff" strokeWidth={3} fill="url(#spending)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
