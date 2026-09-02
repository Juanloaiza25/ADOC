import { Link } from 'react-router-dom'
import { CheckIcon, AssignmentIcon, TableIcon, DomainIcon, ShieldIcon, LightningIcon } from '@/shared/icons'

const FEATURES = [
  { icon: <CheckIcon />, title: 'Checklists de cumplimiento', desc: 'Identifica qué tienes, qué falta y qué evidencia respalda cada requisito de INVIMA y BPM.' },
  { icon: <AssignmentIcon />, title: 'Formularios normativos', desc: 'Completa plantillas de registro sanitario y documentación operativa sin empezar desde cero.' },
  { icon: <TableIcon />, title: 'Reportes y evidencia', desc: 'Conserva notas, archivos e historial; exporta un expediente listo para auditoría.' },
  { icon: <DomainIcon />, title: 'Un espacio por empresa', desc: 'Centraliza los datos, responsables y avance normativo de cada organización.' },
  { icon: <ShieldIcon />, title: 'Normativa en contexto', desc: 'Trabaja con guías basadas en INVIMA, Resolución 2674 y buenas prácticas de manufactura.' },
  { icon: <LightningIcon />, title: 'Seguimiento sin fricción', desc: 'Prioriza pendientes, recibe alertas y mantén al equipo alineado desde cualquier dispositivo.' },
]

const STEPS = [
  ['Crea tu espacio', 'Registra tu cuenta y los datos básicos de la empresa.'],
  ['Selecciona la norma', 'Activa el checklist que corresponde a tu operación.'],
  ['Documenta el avance', 'Marca requisitos, adjunta evidencia y asigna responsables.'],
  ['Llega preparado', 'Exporta el expediente y consulta el historial antes de una visita.'],
]

const PRICING = [
  { name: 'Starter', price: 'Gratis', desc: 'Para ordenar una primera empresa', features: ['1 empresa', 'Checklists esenciales', 'Formularios básicos'] },
  { name: 'Pro', price: 'Próximamente', desc: 'Para equipos que necesitan trazabilidad', features: ['Más empresas', 'Reportes exportables', 'Alertas y colaboración'], popular: true },
  { name: 'Enterprise', price: 'Próximamente', desc: 'Para operaciones con mayor alcance', features: ['Gestión multiempresa', 'Historial avanzado', 'Acompañamiento dedicado'] },
]

const FAQ = [
  ['¿Qué normas cubre?', 'INVIMA, Resolución 2674 (BPM), registro sanitario y requisitos relacionados con alimentos.'],
  ['¿Necesito experiencia previa?', 'No. Cada requisito incluye contexto y el flujo te guía para documentar el avance.'],
  ['¿Puedo trabajar con mi equipo?', 'Sí. Puedes invitar integrantes, asignar responsabilidades y consultar quién hizo cada cambio.'],
  ['¿Funciona en celular?', 'Sí. Puedes revisar pendientes, evidencias y vencimientos desde cualquier dispositivo.'],
]

export function HomePage() {
  return <>
    <section className="relative overflow-hidden border-b border-slate-800/60">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.08fr_.92fr] lg:px-8 lg:py-24">
        <div className="hero-reveal">
          <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.02] tracking-[-.04em] text-white sm:text-6xl lg:text-[4.6rem]">
            Cumplimiento alimentario, <span className="text-primary-300">bajo control.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">Organiza requisitos, evidencia y vencimientos de INVIMA en un espacio compartido que tu equipo sí puede mantener al día.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="interactive inline-flex items-center justify-center rounded-xl bg-primary-400 px-6 py-3.5 font-bold text-dark-950 shadow-lg shadow-primary-500/10 hover:bg-primary-300">Crear cuenta gratis <span className="ml-2" aria-hidden="true">→</span></Link>
            <Link to="/login" className="interactive inline-flex items-center justify-center rounded-xl border border-slate-700 px-6 py-3.5 font-semibold text-slate-200 hover:border-slate-500 hover:bg-slate-900">Ver demo</Link>
          </div>
          <p className="mt-5 text-sm text-slate-500">Sin tarjeta · Configuración guiada · Datos exportables</p>
        </div>

        <div className="hero-reveal relative" style={{ animationDelay: '100ms' }} aria-label="Vista previa del panel de ADOC">
          <div className="absolute -inset-8 rounded-full bg-primary-500/10 blur-3xl" />
          <div className="surface relative overflow-hidden bg-[#0d151c] p-5 shadow-2xl shadow-black/40 sm:p-6">
            <div className="mb-7 flex items-center justify-between"><div><p className="text-xs font-semibold text-slate-500">AVANCE GENERAL</p><p className="mt-1 text-xl font-bold text-white">Planta principal</p></div><span className="rounded-full bg-primary-400/10 px-3 py-1 text-xs font-semibold text-primary-300">Al día</span></div>
            <div className="grid gap-5 sm:grid-cols-[.75fr_1.25fr]">
              <div className="flex min-h-44 flex-col justify-between rounded-xl bg-primary-400 p-5 text-dark-950"><span className="text-sm font-semibold">Cumplimiento</span><strong className="text-5xl font-extrabold tracking-[-.05em]">78%</strong><span className="text-sm font-medium">+12% este mes</span></div>
              <div className="space-y-3">{[['BPM · Infraestructura','86%'],['Registro sanitario','72%'],['Personal manipulador','64%']].map(([label,value]) => <div key={label} className="rounded-xl bg-slate-900 p-4"><div className="mb-3 flex justify-between text-sm"><span className="text-slate-300">{label}</span><strong className="text-white">{value}</strong></div><div className="h-1.5 rounded-full bg-slate-800"><span className="block h-full rounded-full bg-primary-400" style={{width:value}} /></div></div>)}</div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4 text-sm"><span className="text-slate-500">Próximo vencimiento</span><span className="font-semibold text-amber-300">Registro INVIMA · 12 días</span></div>
          </div>
        </div>
      </div>
    </section>

    <section id="funciones" className="scroll-mt-24 py-24 sm:py-32"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr]"><div><h2 className="section-title lg:sticky lg:top-28">Todo el expediente, en un solo lugar.</h2><p className="section-copy">Menos archivos dispersos. Más claridad sobre qué falta, quién responde y cuándo vence.</p></div>
      <div className="grid border-t border-slate-800 sm:grid-cols-2">{FEATURES.map((f) => <article key={f.title} className="group border-b border-slate-800 py-7 sm:p-7 sm:[&:nth-child(odd)]:border-r"><div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-primary-300 transition-transform duration-200 group-hover:-translate-y-1">{f.icon}</div><h3 className="font-bold text-white">{f.title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{f.desc}</p></article>)}</div></div>
    </div></section>

    <section id="como-funciona" className="scroll-mt-24 border-y border-slate-800/70 bg-slate-900/30 py-24"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><h2 className="section-title">De requisito a evidencia.</h2><p className="section-copy">Un flujo directo para llegar a la auditoría con menos incertidumbre.</p><div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-slate-800 bg-slate-800 md:grid-cols-4">{STEPS.map(([title,desc],i) => <article key={title} className="bg-dark-950 p-6"><span className="font-mono text-sm text-primary-300">0{i+1}</span><h3 className="mt-16 font-bold text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p></article>)}</div></div></section>

    <section id="precios" className="scroll-mt-24 py-24 sm:py-32"><div className="mx-auto max-w-5xl px-4 sm:px-6"><div className="text-center"><h2 className="section-title">Empieza sin costo.</h2><p className="section-copy mx-auto">Escala cuando tu operación necesite más empresas, equipo y trazabilidad.</p></div><div className="mt-14 grid gap-5 md:grid-cols-3">{PRICING.map(p => <article key={p.name} className={`surface relative flex flex-col p-6 ${p.popular ? 'border-primary-400/50 bg-primary-400/[.06]' : ''}`}>{p.popular && <span className="mb-4 w-fit rounded-full bg-primary-400 px-2.5 py-1 text-[11px] font-bold text-dark-950">RECOMENDADO</span>}<h3 className="text-lg font-bold text-white">{p.name}</h3><strong className="mt-3 text-2xl text-primary-300">{p.price}</strong><p className="mt-2 min-h-12 text-sm text-slate-500">{p.desc}</p><ul className="my-6 flex-1 space-y-3">{p.features.map(f => <li key={f} className="flex gap-2 text-sm text-slate-300"><span className="text-primary-300">✓</span>{f}</li>)}</ul><Link to="/register" className={`interactive rounded-xl py-3 text-center text-sm font-bold ${p.popular ? 'bg-primary-400 text-dark-950 hover:bg-primary-300' : 'border border-slate-700 text-white hover:bg-slate-800'}`}>Elegir {p.name}</Link></article>)}</div></div></section>

    <section id="faq" className="scroll-mt-24 border-y border-slate-800/70 bg-slate-900/30 py-24"><div className="mx-auto max-w-4xl px-4 sm:px-6"><h2 className="section-title">Preguntas frecuentes</h2><div className="mt-10 divide-y divide-slate-800 border-y border-slate-800">{FAQ.map(([q,a]) => <div key={q} className="grid gap-2 py-6 md:grid-cols-[.75fr_1.25fr]"><h3 className="font-semibold text-white">{q}</h3><p className="text-sm leading-6 text-slate-400">{a}</p></div>)}</div></div></section>

    <section className="py-24 sm:py-32"><div className="mx-auto max-w-4xl px-4 text-center"><h2 className="section-title">Tu próxima auditoría puede empezar hoy.</h2><p className="section-copy mx-auto">Crea tu espacio, carga la empresa y convierte los pendientes en un plan claro.</p><Link to="/register" className="interactive mt-9 inline-flex rounded-xl bg-primary-400 px-7 py-3.5 font-bold text-dark-950 hover:bg-primary-300">Crear cuenta gratis</Link></div></section>
  </>
}
