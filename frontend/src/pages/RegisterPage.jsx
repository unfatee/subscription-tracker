import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { register } from '../api/authApi'
import { errorMessage } from '../api/axiosClient'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { user, signIn } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  if (user) return <Navigate to="/" replace />
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })
  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError('')
    try { await register(form); await signIn({ email: form.email, password: form.password }); navigate('/') }
    catch (err) { setError(errorMessage(err)) }
    finally { setLoading(false) }
  }
  return <div className="auth-shell"><section className="auth-visual register-visual"><div className="auth-brand"><span className="brand-mark">S</span> Subtrack</div><div className="visual-copy"><span className="eyebrow light">A CLEARER MONEY HABIT</span><h1>Your recurring spend deserves a dashboard.</h1><p>Build awareness, catch renewals early and set a budget you can actually follow.</p><ul className="feature-checks"><li>✓ Private account and JWT authentication</li><li>✓ Flexible billing periods</li><li>✓ Analytics and payment history</li></ul></div></section><section className="auth-form-wrap"><form className="auth-form" onSubmit={submit}><span className="auth-mobile-brand">Subtrack</span><h2>Create your account</h2><p>Start with a free local workspace.</p>{error && <div className="alert error">{error}</div>}<label className="field"><span>Full name</span><input name="name" value={form.name} onChange={update} placeholder="Alex Morgan" minLength="2" required /></label><label className="field"><span>Email address</span><input name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" required /></label><label className="field"><span>Password</span><input name="password" type="password" value={form.password} onChange={update} placeholder="At least 8 characters" minLength="8" required /></label><button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</button><div className="demo-hint">Already have an account? <Link to="/login">Sign in</Link></div></form></section></div>
}
