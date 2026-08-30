import { Link } from 'react-router-dom'

export function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-gray-800 bg-dark-900/60 p-8 shadow-glow-sm">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10 text-xl text-primary-400">🔐</div>
        <h1 className="text-2xl font-bold text-white">Recuperación manual</h1>
        <p className="mt-3 text-sm leading-6 text-gray-400">
          Por ahora, un administrador debe validar tu identidad y asignarte una contraseña temporal.
        </p>
        <div className="mt-5 rounded-xl border border-gray-800 bg-dark-800/70 p-4 text-sm text-gray-300">
          Comunícate con el administrador de ADOC e indica el correo con el que registraste tu cuenta. Nunca envíes tu contraseña actual.
        </div>
        <Link to="/login" className="mt-6 block rounded-xl bg-primary-500 px-4 py-3 text-center font-semibold text-dark-950 transition hover:bg-primary-400">
          Volver al inicio de sesión
        </Link>
      </div>
    </div>
  )
}
