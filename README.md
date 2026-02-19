# SaaS App

Proyecto base para una aplicación SaaS construida con React, TypeScript y Tailwind CSS.

## Stack tecnológico

- **React 18** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Tailwind CSS** - Framework CSS utility-first
- **React Router** - Navegación
- **Zustand** - Estado global
- **TanStack Query** - Gestión de datos y caché
- **Supabase** - Auth JWT, base de datos

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

## Configuración de autenticación (Supabase)

1. Crea un proyecto en [Supabase](https://supabase.com/dashboard)
2. Copia `.env.example` a `.env`
3. En el dashboard de Supabase: **Settings → API** → copia:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` → `VITE_SUPABASE_ANON_KEY`
4. En **Authentication → Providers** habilita Email

## Próximos pasos

- Integrar API backend
- Configurar tests (Vitest + React Testing Library)
