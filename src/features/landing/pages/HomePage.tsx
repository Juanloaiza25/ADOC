import { Link } from 'react-router-dom'
import {
  CheckIcon,
  AssignmentIcon,
  TableIcon,
  DomainIcon,
  ShieldIcon,
  LightningIcon,
} from '@/shared/icons'

const FEATURES = [
  {
    icon: <CheckIcon />,
    title: 'Checklists de cumplimiento',
    desc: 'Revisa que tienes y qué te falta para INVIMA, BPM y Res. 2674. Marca cada ítem como completado, pendiente o no aplica.',
  },
  {
    icon: <AssignmentIcon />,
    title: 'Formularios normativos',
    desc: 'Plantillas listas para registro sanitario, solicitudes INVIMA y documentación requerida. Carga datos y descarga reportes.',
  },
  {
    icon: <TableIcon />,
    title: 'Reportes y evidencia',
    desc: 'Guarda evidencias, notas y el historial de cumplimiento. Exporta reportes para auditorías o inspecciones.',
  },
  {
    icon: <DomainIcon />,
    title: 'Por empresa',
    desc: 'Cada pyme tiene su espacio. Gestiona los datos de tu empresa y el progreso de cumplimiento en un solo lugar.',
  },
  {
    icon: <ShieldIcon />,
    title: 'Normas actualizadas',
    desc: 'Checklists basados en INVIMA, Resolución 2674 de 2013 y Buenas Prácticas de Manufactura vigentes.',
  },
  {
    icon: <LightningIcon />,
    title: 'Simple de usar',
    desc: 'Sin conocimientos técnicos. Registrate, carga tu empresa y empieza a marcar lo que cumples. Rápido y claro.',
  },
]

const STEPS = [
  { num: '1', title: 'Crea tu cuenta', desc: 'Registrate gratis con tu email.' },
  { num: '2', title: 'Carga tu empresa', desc: 'Nombre, NIT, sector y datos básicos.' },
  { num: '3', title: 'Elige el checklist', desc: 'INVIMA, BPM Infraestructura o Personal.' },
  { num: '4', title: 'Marca y guarda', desc: 'Revisa cada ítem, sube evidencias y has seguimiento.' },
]

const PRICING = [
  { name: 'Starter', price: 'Gratis', desc: 'Para empezar', features: ['1 empresa', 'Checklists básicos', 'Formularios básicos'] },
  { name: 'Pro', price: 'Próximamente', desc: 'Para pymes en crecimiento', features: ['Multi-empresa', 'Reportes exportables', 'Soporte prioritario'], popular: true },
  { name: 'Enterprise', price: 'Próximamente', desc: 'Para grandes empresas', features: ['Multi-empresa', 'Reportes exportables', 'Soporte dedicado 24/7'] },
]

const FAQ = [
  { q: '¿Qué normas cubre?', a: 'INVIMA, Resolución 2674 (BPM), registro sanitario y requisitos relacionados con alimentos.' },
  { q: '¿Necesito experiencia previa?', a: 'No. La plataforma explica cada requisito y te guía paso a paso.' },
  { q: '¿Mis datos están seguros?', a: 'Sí. Usamos encriptación y cumplimos con buenas prácticas de seguridad.' },
  { q: '¿Puedo usarlo en celular?', a: 'Sí. La interfaz es responsive y podés revisar desde cualquier dispositivo.' },
]

export function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-6rem)]">
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-primary-500/20 text-primary-400 text-sm font-medium">
              Cumplimiento normativo simplificado
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Cumple con{' '}
              <span className="text-primary-400">INVIMA</span>
              {' '}y normas alimentarias
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
              Checklists, formularios y seguimiento para que tu pyme de alimentos cumpla con BPM,
              registro sanitario y más. Simple y sin complicaciones.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-dark-950 bg-primary-400 hover:bg-primary-300 transition-all shadow-glow-sm hover:shadow-glow"
              >
                Empezar gratis
              </Link>
              <button
                type="button"
                onClick={() => document.getElementById('precios')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-base font-semibold text-white border border-gray-600 hover:border-primary-500/50 hover:text-primary-400 transition-all"
              >
                Ver planes
              </button>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2"><span className="text-primary-400">✓</span> Sin tarjeta de crédito</span>
              <span className="flex items-center gap-2"><span className="text-primary-400">✓</span> Para pymes de alimentos</span>
              <span className="flex items-center gap-2"><span className="text-primary-400">✓</span> INVIMA y BPM</span>
            </div>
          </div>
        </div>
      </section>

      {/* Funciones */}
      <section id="funciones" className="py-20 sm:py-28 scroll-mt-27">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Todo lo que necesitas
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Herramientas pensadas para que tu pyme cumpla con las normas de INVIMA y BPM de forma simple
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="p-6 rounded-2xl bg-dark-900/60 border border-gray-800 hover:border-gray-700 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-xl text-primary-400 mb-4">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="py-20 sm:py-28 bg-dark-900/30 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Cómo funciona</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              En cuatro pasos simples empezás a ordenar el cumplimiento de tu pyme
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.num} className="relative text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold text-xl">
                  {s.num}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-gray-400 text-sm">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-gray-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Precios */}
      <section id="precios" className="py-20 sm:py-28 scroll-mt-25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Planes y precios</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Elige el plan que se ajuste a tu necesidad
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {PRICING.map((p) => (
              <div
                key={p.name}
                className={`relative p-6 rounded-2xl border transition-colors ${p.popular
                  ? 'bg-dark-900/60 border-primary-500/50 shadow-glow-sm'
                  : 'bg-dark-900/40 border-gray-800 hover:border-gray-700'
                  }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary-500 text-dark-950 text-xs font-semibold">
                    MÁS POPULAR
                  </span>
                )}
                <h3 className="text-xl font-bold text-primary-400 mb-1">{p.name}</h3>
                <p className="text-2xl font-bold text-white mb-1">{p.price}</p>
                <p className="text-gray-500 text-sm mb-6">{p.desc}</p>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-gray-400 text-sm">
                      <span className="text-primary-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block w-full py-3 text-center font-semibold rounded-xl transition-colors ${p.popular
                    ? 'bg-primary-500 text-dark-950 hover:bg-primary-400'
                    : 'bg-dark-800 text-white border border-gray-700 hover:border-gray-600'
                    }`}
                >
                  Elegir {p.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 sm:py-28 bg-dark-900/30 scroll-mt-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Preguntas frecuentes</h2>
            <p className="text-gray-400">Resolvemos las dudas más comunes</p>
          </div>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <div
                key={item.q}
                className="p-6 rounded-2xl bg-dark-900/60 border border-gray-800"
              >
                <h4 className="font-semibold text-white mb-2">{item.q}</h4>
                <p className="text-gray-400 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(16,185,129,0.15),transparent)] pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            ¿Listo para cumplir con INVIMA?
          </h2>
          <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
            Empieza hoy a organizar el cumplimiento normativo de tu pyme. Es gratis, sin tarjeta de crédito.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-10 py-4 rounded-xl text-base font-semibold text-dark-950 bg-primary-400 hover:bg-primary-300 transition-all shadow-glow-sm hover:shadow-glow"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </section>
    </>
  )
}
