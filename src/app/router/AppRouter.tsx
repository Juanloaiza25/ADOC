import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '@/shared/layouts/MainLayout'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { HomePage } from '@/features/landing/pages/HomePage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { CompanySettingsPage } from '@/features/companies/pages/CompanySettingsPage'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/company"
          element={
            <ProtectedRoute>
              <CompanySettingsPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}
