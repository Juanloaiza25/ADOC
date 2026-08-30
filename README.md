# ADOC

SaaS para gestionar el cumplimiento documental de pymes de alimentos frente a INVIMA, BPM y otras normas colombianas.

## Stack tecnológico

- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework CSS utility-first
- **React Router** - Navegación
- **Zustand** - Estado global
- **TanStack Query** - Gestión de datos y caché
- **Cloudflare Workers** - API y autenticación
- **Cloudflare D1** - Base de datos SQL
- **Cloudflare R2** - Evidencias documentales

## Comandos

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa del build de producción
npm run preview
```

## Estructura del proyecto

```
saas-app/
├── public/
├── src/
│   ├── app/                        # Núcleo de la aplicación
│   │   ├── router/AppRouter.tsx
│   │   ├── providers/              # Auth, Theme, Query
│   │   ├── store/useAuthStore.ts
│   │   └── App.tsx
│   ├── features/                   # Dominios por feature
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── landing/
│   │   ├── users/
│   │   ├── projects/
│   │   ├── billing/
│   │   └── settings/
│   ├── shared/                     # Componentes y utilidades globales
│   ├── styles/index.css
│   └── main.tsx
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Configuración

1. Copia `.env.example` como `.env`.
2. Ejecuta `npm run worker:dev` para iniciar la API local.
3. Ejecuta `npm run dev` para iniciar el frontend.
4. Las migraciones D1 están en `worker/migrations`.

## Próximos pasos

- Exportación de reportes PDF y Excel
- Recuperación de contraseña por correo
- Configurar tests (Vitest + React Testing Library)
