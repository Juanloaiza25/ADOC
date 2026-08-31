import { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/app/store/useAuthStore'
import { useProfile } from '@/features/users/hooks/useProfile'
import { authService } from '@/features/auth/services/authService'

const FOOTER_LINKS = {
  Producto: [
    { label: 'Funciones', href: '#funciones' },
    { label: 'Cómo funciona', href: '#como-funciona' },
    { label: 'Precios', href: '#precios' },
    { label: 'FAQ', href: '#faq' },
  ],
  Legal: [
    { label: 'Términos de servicio', href: '#' },
    { label: 'Política de privacidad', href: '#' },
  ],
  Soporte: [
    { label: 'Contacto', href: 'mailto:soporte@adoc.co' },
    { label: 'Documentación', href: '#' },
  ],
}

export function MainLayout() {
  const { isAuthenticated, user, logout } = useAuthStore()
  const { profile } = useProfile()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const isHome = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      await authService.logout()
      logout()
      navigate('/')
    } catch {
      logout()
      navigate('/')
    }
  }

  const scrollTo = (id: string) => {
    setMobileOpen(false)
    const el = document.getElementById(id)
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  const navLinkClass = 'text-gray-400 hover:text-primary-400 font-medium transition-colors'

  const navItems = isHome ? (
    <>
      <button type="button" onClick={() => scrollTo('funciones')} className={navLinkClass}>
        Funciones
      </button>
      <button type="button" onClick={() => scrollTo('como-funciona')} className={navLinkClass}>
        Cómo funciona
      </button>
      <button type="button" onClick={() => scrollTo('precios')} className={navLinkClass}>
        Precios
      </button>
      <button type="button" onClick={() => scrollTo('faq')} className={navLinkClass}>
        FAQ
      </button>
    </>
  ) : (
    <Link to="/" className={navLinkClass}>Inicio</Link>
  )

  const mobileAuthItems = isAuthenticated ? (
    <>
      <Link to="/dashboard" className={navLinkClass}>
        Dashboard
      </Link>
      <Link to="/actions" className={navLinkClass}>
        Acciones correctivas
      </Link>
      <Link to="/reports" className={navLinkClass}>
        Reportes
      </Link>
      <Link to="/settings/company" className={navLinkClass}>
        Mi empresa
      </Link>
      <span className="text-sm text-gray-500">
        {profile?.full_name || user?.email}
      </span>
      <button
        type="button"
        onClick={handleLogout}
        className="text-gray-400 hover:text-primary-400 font-medium transition-colors"
      >
        Cerrar sesión
      </button>
    </>
  ) : (
    <>
      <Link to="/login" className={navLinkClass}>
        Iniciar sesión
      </Link>
      <Link
        to="/register"
        className="px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-400 text-dark-950 font-semibold transition-colors text-center"
      >
        Empezar
      </Link>
    </>
  )

  const displayName = profile?.full_name || user?.email || 'Mi cuenta'
  const initials = displayName
    .split(/\s+|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <nav
        className={`sticky top-0 z-50 bg-dark-950/95 backdrop-blur-md transition-colors duration-200 ${scrolled ? 'border-b border-gray-700/80' : 'border-b border-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex min-w-0 items-center gap-2 text-xl font-bold text-white">
              <span className="w-12 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-dark-950 font-extrabold text-sm">
                ADOC
              </span>
              {!isAuthenticated && <span className="hidden 2xl:inline">Asesoria Documental en Operaciones y Calidad</span>}
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex gap-6 items-center">
              {!isAuthenticated && navItems}
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className={navLinkClass}>Panel</Link>
                  <Link to="/checklists" className={navLinkClass}>Checklists</Link>
                  <Link to="/forms" className={navLinkClass}>Formularios</Link>
                  <Link to="/actions" className={navLinkClass}>Acciones</Link>
                  <Link to="/reports" className={navLinkClass}>Reportes</Link>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setProfileOpen((open) => !open)}
                      className="flex max-w-56 items-center gap-2 rounded-xl border border-gray-800 bg-dark-900 px-2.5 py-1.5 text-left transition-colors hover:border-gray-700 hover:bg-dark-800"
                      aria-expanded={profileOpen}
                      aria-label="Abrir menú de usuario"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-xs font-extrabold text-dark-950">{initials}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-white">{displayName}</span>
                        <span className="block text-xs text-gray-500">Mi cuenta</span>
                      </span>
                      <span className={`text-xs text-gray-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`}>⌄</span>
                    </button>
                    {profileOpen && (
                      <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-gray-800 bg-dark-900 p-1.5 shadow-2xl shadow-black/30">
                        <Link to="/settings/company" className="block rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-dark-800 hover:text-white">Mi empresa</Link>
                        <button type="button" onClick={handleLogout} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10">Cerrar sesión</button>
                      </div>
                    )}
                  </div>
                </>
              ) : mobileAuthItems}
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-800 transition-colors"
              aria-label="Menú"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen ? 'max-h-[32rem] border-t border-gray-800' : 'max-h-0'
            }`}
        >
          <div className="px-4 py-4 flex flex-col items-center gap-3 bg-dark-950/95 backdrop-blur-md">
            {!isAuthenticated && navItems}
            <div className="border-t border-gray-800 pt-3 flex flex-col items-center gap-3 w-full">
              {mobileAuthItems}
            </div>
          </div>
        </div>
      </nav>

      <main className={`flex-1 ${!isHome ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full' : ''}`}>
        <Outlet />
      </main>

      {/* Footer */}
      {isHome && (
        <footer className="border-t border-gray-800 bg-dark-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* Brand */}
              <div className="col-span-2 md:col-span-1">
                <Link to="/" className="flex items-center gap-2 text-lg font-bold text-white mb-4">
                  <span className="w-10 h-7 rounded-md bg-primary-500 flex items-center justify-center text-dark-950 font-extrabold text-xs">
                    ADOC
                  </span>
                  ADOC
                </Link>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Asesoria Documental en Operaciones y Calidad. Simplificamos el cumplimiento normativo para pymes de alimentos en Colombia.
                </p>
              </div>

              {/* Link columns */}
              {Object.entries(FOOTER_LINKS).map(([title, links]) => (
                <div key={title}>
                  <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">{title}</h4>
                  <ul className="space-y-2.5">
                    {links.map((link) => (
                      <li key={link.label}>
                        {link.href.startsWith('#') ? (
                          <button
                            type="button"
                            onClick={() => {
                              const id = link.href.replace('#', '')
                              if (id) scrollTo(id)
                            }}
                            className="text-gray-500 hover:text-primary-400 text-sm transition-colors"
                          >
                            {link.label}
                          </button>
                        ) : (
                          <a
                            href={link.href}
                            className="text-gray-500 hover:text-primary-400 text-sm transition-colors"
                          >
                            {link.label}
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom bar */}
            <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-600 text-sm">
                © {new Date().getFullYear()} ADOC. Todos los derechos reservados.
              </p>
              <div className="flex gap-4">
                <a href="#" aria-label="LinkedIn" className="text-gray-600 hover:text-primary-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="#" aria-label="Instagram" className="text-gray-600 hover:text-primary-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}
