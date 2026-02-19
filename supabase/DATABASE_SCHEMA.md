# Estructura de Base de Datos

## Diagrama ER

```
┌─────────────┐       ┌─────────────┐
│ auth.users  │       │  companies  │
│ (Supabase)  │       └──────┬──────┘
└──────┬──────┘              │
       │                     │
       ▼                     │
┌─────────────┐    company_id│
│  profiles   │◄─────────────┘
└─────────────┘

┌─────────────┐       ┌─────────────┐       ┌──────────────────┐
│ regulations │──────►│  checklists │──────►│ checklist_items  │
└─────────────┘       └──────┬──────┘       └──────────────────┘
       │                     │                         │
       │                     │                         │
       │              ┌──────▼──────────────┐          │
       │              │ company_checklists  │          │
       │              └──────┬──────────────┘          │
       │                     │                         │
       │                     ▼                         ▼
       │              ┌─────────────────────────────┐
       │              │  checklist_item_responses   │
       │              └─────────────────────────────┘
       │
       │              ┌─────────────┐       ┌──────────────────┐
       └─────────────►│    forms    │──────►│ form_submissions │
                      └─────────────┘       └──────────────────┘
```

## Tablas

| Tabla | Descripción |
|-------|-------------|
| **profiles** | Extiende auth.users. Usuario con company_id y role |
| **companies** | Pymes (empresas del sector alimentos) |
| **regulations** | Normas: INVIMA, Res. 2674, BPM, etc. |
| **checklists** | Plantillas de cumplimiento por norma |
| **checklist_items** | Ítems individuales del checklist |
| **company_checklists** | Checklist asignado a una empresa (progreso) |
| **checklist_item_responses** | Respuesta de la empresa a cada ítem |
| **forms** | Plantillas de formularios normativos |
| **form_submissions** | Envíos de formularios por empresa |

## Cómo ejecutar las migraciones

1. **Schema inicial**: SQL Editor → pegar `migrations/001_initial_schema.sql` → ejecutar
2. **Seed de datos**: SQL Editor → pegar `migrations/002_seed_data.sql` → ejecutar

Con esto tendrás 3 normas (INVIMA-RS, Res. 2674, BPM) y 3 checklists con ítems de ejemplo.
