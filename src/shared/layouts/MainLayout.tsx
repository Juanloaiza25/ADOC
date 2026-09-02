import { useEffect, useState } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/app/store/useAuthStore'
import { useProfile } from '@/features/users/hooks/useProfile'
import { authService } from '@/features/auth/services/authService'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'

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

  const navLinkClass = 'interactive rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800/70 hover:text-white'
  const appNavigation = [
    { label: 'Resumen', href: '/dashboard', icon: 'M4 12h6V4H4v8Zm0 8h6v-4H4v4Zm10 0h6v-8h-6v8Zm0-16v4h6V4h-6Z' },
    { label: 'Checklists', href: '/checklists', icon: 'm5 12 4 4L19 6' },
    { label: 'Formularios', href: '/forms', icon: 'M6 3h9l3 3v15H6V3Zm3 7h6M9 14h6M9 18h4' },
    { label: 'Acciones', href: '/actions', icon: 'M12 3 3 20h18L12 3Zm0 6v5m0 3v.1' },
    { label: 'Vencimientos', href: '/deadlines', icon: 'M7 3v3m10-3v3M4 9h16M5 5h14v16H5V5Z' },
    { label: 'Reportes', href: '/reports', icon: 'M5 20V10m7 10V4m7 16v-7' },
  ]

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
      <Link to="/team" className={navLinkClass}>
        Equipo
      </Link>
      <Link to="/audit" className={navLinkClass}>
        Historial
      </Link>
      <Link to="/deadlines" className={navLinkClass}>
        Vencimientos
      </Link>
      {profile?.is_platform_admin ? <Link to="/admin" className={navLinkClass}>Administración</Link> : null}
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
  const currentPage = [...appNavigation, { label: 'Equipo', href: '/team' }, { label: 'Historial', href: '/audit' }, { label: 'Mi empresa', href: '/settings/company' }]
    .find((item) => location.pathname === item.href)?.label

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <header className={`sticky top-0 z-50 border-b bg-dark-950/92 backdrop-blur-xl transition-[border-color,box-shadow] duration-200 ${scrolled ? 'border-slate-800 shadow-lg shadow-black/15' : 'border-slate-800/55'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-[4.5rem] items-center justify-between gap-4">
            <Link to="/" className="interactive flex min-w-0 items-center gap-3 text-xl font-bold text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-400 text-sm font-extrabold tracking-[-.04em] text-dark-950">A</span>
              <span className="leading-none"><span className="block text-base font-extrabold tracking-[-.03em]">ADOC</span><span className="mt-1 block text-[10px] font-medium tracking-wide text-slate-500">Cumplimiento normativo</span></span>
            </Link>

            {isAuthenticated && currentPage && <div className="hidden min-w-0 flex-1 items-center gap-3 border-l border-slate-800 pl-5 lg:flex"><span className="text-sm text-slate-600">/</span><span className="truncate text-sm font-semibold text-slate-300">{currentPage}</span></div>}

            {/* Desktop nav */}
            <div className="hidden items-center gap-2 lg:flex">
              {!isAuthenticated && <nav className="mr-3 flex items-center rounded-xl border border-slate-800/80 bg-slate-900/45 p-1">{navItems}</nav>}
              {isAuthenticated ? (
                <>
                  <NotificationBell />
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setProfileOpen((open) => !open)}
                      className="interactive flex h-10 max-w-52 items-center gap-2 rounded-xl px-1.5 pr-2.5 text-left hover:bg-slate-800/70"
                      aria-expanded={profileOpen}
                      aria-label="Abrir menú de usuario"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-400 text-xs font-extrabold text-dark-950">{initials}</span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-white">{displayName}</span>
                      </span>
                      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" className={`h-4 w-4 text-slate-500 transition-transform duration-150 ${profileOpen ? 'rotate-180' : ''}`}><path d="m6 8 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                    {profileOpen && (
                      <div className="absolute right-0 mt-2 w-56 origin-top-right overflow-hidden rounded-xl border border-slate-800 bg-dark-900 p-1.5 shadow-2xl shadow-black/40">
                        <div className="mb-1 border-b border-slate-800 px-3 py-2"><p className="truncate text-sm font-semibold text-white">{displayName}</p><p className="mt-0.5 truncate text-xs text-slate-500">{user?.email}</p></div>
                        <Link to="/settings/company" className="block rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-dark-800 hover:text-white">Mi empresa</Link>
                        <Link to="/team" className="block rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-dark-800 hover:text-white">Equipo</Link>
                        <Link to="/audit" className="block rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-dark-800 hover:text-white">Historial</Link>
                        <Link to="/deadlines" className="block rounded-lg px-3 py-2 text-sm text-gray-300 hover:bg-dark-800 hover:text-white">Vencimientos</Link>
                        {profile?.is_platform_admin ? <Link to="/admin" className="block rounded-lg px-3 py-2 text-sm text-primary-400 hover:bg-primary-500/10">Administración</Link> : null}
                        <button type="button" onClick={handleLogout} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-red-500/10">Cerrar sesión</button>
                      </div>
                    )}
                  </div>
                </>
              ) : <><Link to="/login" className="interactive px-3 py-2 text-sm font-semibold text-slate-300 hover:text-white">Ingresar</Link><Link to="/register" className="interactive rounded-xl bg-primary-400 px-4 py-2.5 text-sm font-bold text-dark-950 hover:bg-primary-300">Empezar gratis</Link></>}
            </div>

            {/* Mobile actions */}
            <div className="flex items-center gap-2 lg:hidden">
              {isAuthenticated && <NotificationBell />}
              <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="interactive flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label="Menú"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {mobileOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`overflow-hidden transition-[max-height,opacity] duration-200 ease-[cubic-bezier(.23,1,.32,1)] lg:hidden ${mobileOpen ? 'max-h-[40rem] border-t border-slate-800 opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="flex flex-col items-stretch gap-1 bg-dark-950 px-4 py-4">
            {!isAuthenticated && navItems}
            <div className="mt-2 flex w-full flex-col items-stretch gap-1 border-t border-slate-800 pt-3">
              {mobileAuthItems}
            </div>
          </div>
        </div>
      </header>

      {isAuthenticated && !isHome ? (
        <div className="mx-auto flex w-full max-w-7xl flex-1">
          <aside className="hidden w-60 shrink-0 border-r border-slate-800/70 px-5 py-8 lg:block">
            <nav className="sticky top-24 space-y-1.5">
              <p className="mb-4 px-3 text-[11px] font-bold uppercase tracking-[.18em] text-slate-600">Espacio de trabajo</p>
              {appNavigation.map((item) => <Link key={item.href} to={item.href} className={`interactive flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${location.pathname === item.href ? 'bg-primary-500/12 text-primary-300 shadow-inner shadow-primary-400/5' : 'text-slate-500 hover:bg-slate-900/80 hover:text-slate-200'}`}><svg aria-hidden="true" className="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>{item.label}</Link>)}
              <div className="my-3 border-t border-gray-800" />
              <Link to="/team" className={`block rounded-xl px-3 py-2 text-sm ${location.pathname === '/team' ? 'text-primary-400' : 'text-gray-500 hover:text-gray-200'}`}>Equipo</Link>
              <Link to="/audit" className={`block rounded-xl px-3 py-2 text-sm ${location.pathname === '/audit' ? 'text-primary-400' : 'text-gray-500 hover:text-gray-200'}`}>Historial</Link>
            </nav>
          </aside>
          <main className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8"><Outlet /></main>
        </div>
      ) : <main className={`flex-1 ${!isHome ? 'mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8' : ''}`}><Outlet /></main>}

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
