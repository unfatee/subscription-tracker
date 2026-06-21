import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const links = [
  ['▦', 'Overview', '/'],
  ['◫', 'Subscriptions', '/subscriptions'],
  ['⌁', 'Analytics', '/analytics'],
  ['↻', 'Payments', '/payments'],
  ['⚙', 'Settings', '/settings'],
]

export default function Navbar() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const logout = () => { signOut(); navigate('/login') }

  return (
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">S</span><span>Subtrack</span></div>
      <nav className="nav-links">
        {links.map(([icon, label, path]) => (
          <NavLink key={path} to={path} end={path === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">{icon}</span><span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-block">
          <span className="avatar">{user?.name?.[0]?.toUpperCase()}</span>
          <span className="user-copy"><strong>{user?.name}</strong><small>{user?.email}</small></span>
        </div>
        <button className="icon-button" onClick={logout} title="Sign out">↪</button>
      </div>
    </aside>
  )
}
