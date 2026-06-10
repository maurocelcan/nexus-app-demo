@AGENTS.md

# Nexus Prototype — CLAUDE.md

## Descripción del proyecto

**Nexus** es un cerebro comercial agéntico para empresas de consumo masivo (CPG) y equipos de revenue. Es un prototipo frontend mockeado sin backend real, construido con Next.js 16 App Router, TypeScript, Tailwind CSS v4, y datos 100% simulados.

Permite: chat analítico en lenguaje natural, KPIs, gráficos ECharts, módulos de negocio (Ventas), gestión de fuentes de datos, settings y simulación de multiusuario.

La demo CPG representa una industria/caso de consumo masivo, no una empresa llamada CPG. La empresa mock principal es **Andes Consumer Goods** y el dataset se llama **Demo CPG Portfolio 2025-2026**.

## Cómo correr el proyecto

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # producción
npm run lint     # linter
```

**Credenciales demo:** `mauro@cpgteam.com` / `nexus123`

## Stack

| Tecnología | Versión | Uso |
|---|---|---|
| Next.js | 16.2.6 | App Router, SSR/SSG |
| React | 19.2.4 | UI |
| TypeScript | 5 | Tipado |
| Tailwind CSS | 4 | Estilos (CSS-first, sin tailwind.config.js) |
| Zustand | latest | Estado global + persist |
| ECharts + echarts-for-react | latest | Gráficos |
| Framer Motion | latest | Animaciones |
| React Hook Form + Zod | latest | Formularios |
| Lucide React | latest | Iconos |

## Arquitectura de carpetas

```
src/
  app/                         # App Router de Next.js
    layout.tsx                 # Root layout
    page.tsx                   # Redirect según estado auth
    login/page.tsx
    register/page.tsx
    onboarding/page.tsx
    workspace/
      layout.tsx               # AppShell (requiere auth)
      page.tsx                 # Chat principal
      ventas/page.tsx          # Módulo Ventas
      settings/page.tsx        # Configuración
      settings/data-sources/   # Fuentes de datos

  components/
    layout/                    # Logo, Sidebar, Topbar
    ui/                        # Button, Input, Card, Badge, Modal, KpiCard, Avatar, Select, Spinner, EmptyState, SectionHeader
    chat/                      # ChatInput, MessageItem, MessageBlocks, AgentThinking
    charts/                    # 4 gráficos ECharts

  theme/                       # Design tokens como constantes TypeScript
    tokens.ts                  # Todos los tokens + chartTheme para ECharts
    palette.ts                 # Paleta de colores documentada
    typography.ts              # Escala tipográfica + tamaños de iconos
    shadows.ts                 # Sombras + clases Tailwind
    spacing.ts                 # Espaciado + dimensiones de layout

  data/                        # Todos los mocks centralizados
  stores/                      # Zustand stores (todos con persist)
  types/                       # Tipos TypeScript
  lib/                         # utils.ts, routes.ts
```

## Tailwind CSS v4

Sin tailwind.config.js. Tokens en `src/app/globals.css` bajo `@theme inline`. Usar: `bg-primary`, `text-accent`, `border-border`, `bg-surface-elevated`, etc.

## Paleta principal

`background #050509` · `surface #0B0B10` · `primary #8B5CF6` · `accent #00E0B8` · `success #10B981` · `danger #FB7185` · `warning #FACC15`

Ver paleta completa y tokens semánticos en `docs/design-system.md`.

## Design System

El design system está documentado en:

- `docs/design-system.md` — tokens, componentes, patrones, motion, responsive
- `docs/branding.md` — identidad visual, personalidad, voz y tono
- `src/theme/tokens.ts` — constantes TypeScript para contextos no-CSS (ECharts, etc.)
- `src/theme/palette.ts` — paleta de colores documentada
- `src/theme/typography.ts` — escala tipográfica e iconos
- `src/theme/shadows.ts` — sombras y sus clases Tailwind
- `src/theme/spacing.ts` — espaciado y dimensiones de layout

Componentes UI disponibles en `src/components/ui/`:
`Button` · `Input` · `Select` · `Card` · `Badge` · `Modal` · `KpiCard` · `Avatar` · `Spinner` · `EmptyState` · `SectionHeader`

Para contextos no-CSS (ECharts), importar tokens desde `@/theme/tokens`:
```ts
import { tokens, chartTheme } from "@/theme/tokens";
```

## Convenciones

- `"use client"` en todos los componentes que usan hooks/estado.
- Datos mock siempre en `src/data/`, nunca en JSX.
- Tipos siempre en `src/types/`.
- Usar `cn()` de `src/lib/utils.ts` para combinar clases.
- `generateId()` para IDs únicos. `sleep()` para simular latencia.
- No usar `any`.

## Rutas

| Ruta | Descripción |
|---|---|
| `/login` | Autenticación (demo: mauro@cpgteam.com / nexus123) |
| `/register` | Registro |
| `/onboarding` | Setup inicial 4 pasos |
| `/workspace` | Chat principal |
| `/workspace/ventas` | Módulo Ventas |
| `/workspace/action-plans` | Planes de acción derivados de insights |
| `/workspace/conversations` | Historial completo de conversaciones |
| `/workspace/settings` | Perfil y configuración |
| `/workspace/settings/data-sources` | Fuentes de datos |

## Criterios antes de terminar una tarea

- [ ] `npm run build` sin errores
- [ ] `npx tsc --noEmit` sin errores
- [ ] Responsive (mobile, tablet, desktop)
- [ ] Datos mock en `src/data/`, no hardcodeados
- [ ] Estilos con tokens del tema
