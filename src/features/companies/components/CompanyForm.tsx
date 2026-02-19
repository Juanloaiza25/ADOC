import { useState } from 'react'
import type { Company, CreateCompanyInput } from '@/shared/types/database'

const SECTORS = [
  'Alimentos',
  'Bebidas',
  'Lácteos',
  'Carnes y derivados',
  'Panadería y pastelería',
  'Otro',
]

interface CompanyFormProps {
  company?: Company | null
  onSubmit: (data: CreateCompanyInput) => Promise<void>
  isLoading?: boolean
}

const inputClass =
  'w-full px-4 py-3 bg-dark-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors'

export function CompanyForm({ company, onSubmit, isLoading }: CompanyFormProps) {
  const [form, setForm] = useState({
    name: company?.name ?? '',
    nit: company?.nit ?? '',
    address: company?.address ?? '',
    city: company?.city ?? '',
    department: company?.department ?? '',
    phone: company?.phone ?? '',
    sector: company?.sector ?? '',
  })
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!form.name.trim()) {
      setError('El nombre de la empresa es obligatorio')
      return
    }
    try {
      await onSubmit({
        name: form.name.trim(),
        nit: form.nit.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        department: form.department.trim() || undefined,
        phone: form.phone.trim() || undefined,
        sector: form.sector || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm" role="alert">
          {error}
        </div>
      )}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
          Nombre de la empresa *
        </label>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className={inputClass}
          placeholder="Mi Empresa S.A.S"
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="nit" className="block text-sm font-medium text-gray-300 mb-1">NIT</label>
          <input
            id="nit"
            type="text"
            value={form.nit}
            onChange={(e) => setForm((f) => ({ ...f, nit: e.target.value }))}
            className={inputClass}
            placeholder="900.123.456-7"
          />
        </div>
        <div>
          <label htmlFor="sector" className="block text-sm font-medium text-gray-300 mb-1">Sector</label>
          <select
            id="sector"
            value={form.sector}
            onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))}
            className={inputClass}
          >
            <option value="">Seleccionar</option>
            {SECTORS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">Dirección</label>
        <input
          id="address"
          type="text"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          className={inputClass}
          placeholder="Calle 123 #45-67"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-1">Ciudad</label>
          <input id="city" type="text" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className={inputClass} placeholder="Bogotá" />
        </div>
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-300 mb-1">Departamento</label>
          <input id="department" type="text" value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} className={inputClass} placeholder="Cundinamarca" />
        </div>
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Teléfono</label>
        <input id="phone" type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className={inputClass} placeholder="+57 300 123 4567" />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-400 disabled:opacity-50 text-dark-950 font-semibold rounded-xl transition-all shadow-glow-sm"
      >
        {isLoading ? 'Guardando...' : company ? 'Actualizar empresa' : 'Crear empresa'}
      </button>
    </form>
  )
}
