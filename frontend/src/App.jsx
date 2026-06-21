import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

const AddSubscriptionPage = lazy(() => import('./pages/AddSubscriptionPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const EditSubscriptionPage = lazy(() => import('./pages/EditSubscriptionPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const PaymentHistoryPage = lazy(() => import('./pages/PaymentHistoryPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const SubscriptionsPage = lazy(() => import('./pages/SubscriptionsPage'))

function AppLayout() {
  return <div className="app-shell"><Navbar/><main className="main-content"><Routes><Route index element={<DashboardPage/>}/><Route path="subscriptions" element={<SubscriptionsPage/>}/><Route path="subscriptions/new" element={<AddSubscriptionPage/>}/><Route path="subscriptions/:id/edit" element={<EditSubscriptionPage/>}/><Route path="analytics" element={<AnalyticsPage/>}/><Route path="payments" element={<PaymentHistoryPage/>}/><Route path="settings" element={<SettingsPage/>}/></Routes></main></div>
}

export default function App() {
  return <Suspense fallback={<div className="full-loader"><span className="spinner"/> Loading…</div>}><Routes><Route path="/login" element={<LoginPage/>}/><Route path="/register" element={<RegisterPage/>}/><Route element={<ProtectedRoute/>}><Route path="/*" element={<AppLayout/>}/></Route></Routes></Suspense>
}
