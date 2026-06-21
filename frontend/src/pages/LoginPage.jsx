import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { errorMessage } from '../api/axiosClient'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { user, signIn } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  if (user) return <Navigate to="/" replace />

  const submit = async (event) => {
    event.preventDefault(); setLoading(true); setError('')
    try { await signIn(form); navigate(location.state?.from?.pathname || '/', { replace: true }) }
    catch (err) { setError(errorMessage(err)) }
    finally { setLoading(false) }
  }

  return <div className="auth-shell">
    <section className="auth-visual"><div className="auth-brand"><span className="brand-mark">S</span> Subtrack</div><div className="visual-copy"><span className="eyebrow light">SMARTER SUBSCRIPTIONS</span><h1>Know where your money goes. Every month.</h1><p>One calm place for every recurring payment, renewal and spending decision.</p><div className="quote-card">“Subtrack turned a messy list of renewals into a clear monthly plan.”<span>— Portfolio demo user</span></div></div></section>
    <section className="auth-form-wrap"><form className="auth-form" onSubmit={submit}><span className="auth-mobile-brand">Subtrack</span><h2>Welcome back</h2><p>Sign in to keep your subscriptions in check.</p>{error && <div className="alert error">{error}</div>}<label className="field"><span>Email address</span><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required /></label><label className="field"><span>Password</span><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" required /></label><button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button><div className="demo-hint">New here? <Link to="/register">Create an account</Link></div></form></section>
  </div>
}
