import { useState } from 'react'
import { BILLING_PERIODS, CATEGORIES, CURRENCIES } from '../utils/constants'
import { nextMonthInput, todayInput } from '../utils/dateUtils'

const emptyForm = {
  name: '', description: '', price: '', currency: 'USD', billing_period: 'monthly', category: 'Entertainment',
  start_date: todayInput(), next_payment_date: nextMonthInput(), is_active: true,
}

export default function SubscriptionForm({ initial, onSubmit, submitLabel, loading }) {
  const [form, setForm] = useState(() => initial ? { ...initial, price: String(initial.price) } : emptyForm)
  const update = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const submit = (event) => {
    event.preventDefault()
    onSubmit({ ...form, price: Number(form.price) })
  }

  return (
    <form className="panel form-panel" onSubmit={submit}>
      <div className="form-section-title"><span>01</span><div><h3>Subscription details</h3><p>The basics about your recurring service.</p></div></div>
      <div className="form-grid">
        <label className="field field-wide"><span>Name</span><input name="name" value={form.name} onChange={update} placeholder="e.g. Netflix" required maxLength="160" /></label>
        <label className="field field-wide"><span>Description <small>optional</small></span><textarea name="description" value={form.description || ''} onChange={update} placeholder="What do you use this for?" rows="3" maxLength="1000" /></label>
        <label className="field"><span>Category</span><select name="category" value={form.category} onChange={update}>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="field"><span>Status</span><span className="switch-row"><input type="checkbox" name="is_active" checked={form.is_active} onChange={update} /><span>{form.is_active ? 'Active subscription' : 'Paused subscription'}</span></span></label>
      </div>
      <div className="form-divider" />
      <div className="form-section-title"><span>02</span><div><h3>Billing information</h3><p>Set the price and renewal schedule.</p></div></div>
      <div className="form-grid form-grid-3">
        <label className="field"><span>Price</span><input name="price" value={form.price} onChange={update} type="number" min="0.01" step="0.01" placeholder="0.00" required /></label>
        <label className="field"><span>Currency</span><select name="currency" value={form.currency} onChange={update}>{CURRENCIES.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="field"><span>Billing period</span><select name="billing_period" value={form.billing_period} onChange={update}>{BILLING_PERIODS.map((item) => <option value={item} key={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}</select></label>
        <label className="field"><span>Start date</span><input name="start_date" value={form.start_date} onChange={update} type="date" required /></label>
        <label className="field"><span>Next payment</span><input name="next_payment_date" value={form.next_payment_date} onChange={update} type="date" min={form.start_date} required /></label>
      </div>
      <div className="form-footer"><button className="btn btn-primary" disabled={loading}>{loading ? 'Saving…' : submitLabel}</button></div>
    </form>
  )
}
