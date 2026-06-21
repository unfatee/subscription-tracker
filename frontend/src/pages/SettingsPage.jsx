import { useEffect, useState } from 'react'
import { errorMessage } from '../api/axiosClient'
import { updateMe } from '../api/authApi'
import { deleteBudget, getBudget, saveBudget } from '../api/budgetApi'
import { useAuth } from '../context/AuthContext'
import { CURRENCIES } from '../utils/constants'

export default function SettingsPage() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({ name: user.name, default_currency: user.default_currency, monthly_limit: '', budget_currency: user.default_currency })
  const [hasBudget, setHasBudget] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  useEffect(() => { getBudget().then((budget) => { if (budget) { setHasBudget(true); setForm((current) => ({ ...current, monthly_limit: String(budget.monthly_limit), budget_currency: budget.currency })) } }).catch((err) => setError(errorMessage(err))) }, [])
  const submit = async (event) => { event.preventDefault(); setSaving(true); setError(''); setMessage(''); try { const updated = await updateMe({ name: form.name, default_currency: form.default_currency }); setUser(updated); if (form.monthly_limit) { await saveBudget({ monthly_limit: Number(form.monthly_limit), currency: form.budget_currency }); setHasBudget(true) } setMessage('Settings saved successfully.') } catch (err) { setError(errorMessage(err)) } finally { setSaving(false) } }
  const removeBudget = async () => { if (!hasBudget || !window.confirm('Remove your monthly budget?')) return; try { await deleteBudget(); setHasBudget(false); setForm({ ...form, monthly_limit: '' }); setMessage('Budget removed.') } catch (err) { setError(errorMessage(err)) } }
  return <div className="page narrow-page"><header className="page-header"><div><span className="eyebrow">PREFERENCES</span><h1>Settings</h1><p>Personalize your workspace and monthly spending target.</p></div></header>{error && <div className="alert error">{error}</div>}{message && <div className="alert success">{message}</div>}<form className="settings-stack" onSubmit={submit}><section className="panel settings-card"><div className="settings-heading"><span className="settings-icon">◎</span><div><h2>Profile</h2><p>Your account identity and display currency.</p></div></div><div className="form-grid"><label className="field"><span>Name</span><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label><label className="field"><span>Default currency</span><select value={form.default_currency} onChange={(e) => setForm({ ...form, default_currency: e.target.value })}>{CURRENCIES.map((item) => <option key={item}>{item}</option>)}</select></label></div></section><section className="panel settings-card"><div className="settings-heading"><span className="settings-icon">◴</span><div><h2>Monthly budget</h2><p>Get a warning as recurring spend approaches this amount.</p></div></div><div className="form-grid"><label className="field"><span>Monthly limit</span><input type="number" min="0.01" step="0.01" value={form.monthly_limit} onChange={(e) => setForm({ ...form, monthly_limit: e.target.value })} placeholder="e.g. 250.00" /></label><label className="field"><span>Budget currency</span><select value={form.budget_currency} onChange={(e) => setForm({ ...form, budget_currency: e.target.value })}>{CURRENCIES.map((item) => <option key={item}>{item}</option>)}</select></label></div>{hasBudget && <button type="button" className="text-button danger-text budget-delete" onClick={removeBudget}>Delete budget</button>}</section><div className="settings-actions"><button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</button></div></form></div>
}
