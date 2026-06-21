import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { CATEGORY_COLORS } from '../utils/constants'
import { formatMoney } from '../utils/formatMoney'

export default function CategoryChart({ data = [], currency = 'USD' }) {
  if (!data.length) return <div className="chart-empty"><span>◔</span><p>No category data yet</p></div>
  return (
    <div className="donut-layout">
      <div className="donut-chart">
        <ResponsiveContainer width="100%" height={230}>
          <PieChart>
            <Pie data={data} dataKey="monthly_total" nameKey="category" innerRadius={66} outerRadius={95} paddingAngle={3} stroke="none">
              {data.map((_, index) => <Cell key={index} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(value) => formatMoney(value, currency)} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="chart-legend">{data.map((item, index) => <div key={item.category}><i style={{ background: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }} /><span>{item.category}</span><strong>{formatMoney(item.monthly_total, currency)}</strong></div>)}</div>
    </div>
  )
}
