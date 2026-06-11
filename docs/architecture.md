# Arquitectura técnica — Nexus Prototype

## Stack

- **Next.js 16.2.6** con App Router
- **React 19.2.4** (canary, con Server Components)
- **TypeScript 5**
- **Tailwind CSS v4** (configuración CSS-first, sin tailwind.config.js)
- **Zustand** para estado global + `persist` middleware para localStorage
- **ECharts / echarts-for-react** para gráficos
- **Framer Motion** para animaciones
- **React Hook Form + Zod** para formularios con validación
- **Lucide React** para iconos

## Estructura de carpetas

```
src/
  app/               Next.js App Router (rutas = carpetas)
  components/        Componentes reutilizables por dominio
  data/              Mock data centralizada
  stores/            Zustand stores
  types/             Tipos TypeScript
  lib/               Utilidades puras
```

## Separación de responsabilidades

| Capa | Responsabilidad |
|---|---|
| `app/` | Rutas, layouts, páginas |
| `components/` | UI reutilizable sin lógica de negocio |
| `stores/` | Estado global y acciones |
| `data/` | Fuente única de verdad para datos mock |
| `types/` | Contratos de tipos compartidos |
| `lib/` | Funciones puras (cn, sleep, generateId, etc.) |

## Semantic Commercial Data Engine

Nexus ahora procesa datasets con una arquitectura dataset-first. El núcleo no es un módulo visual, sino el perfil semántico del dataset: hojas, tablas, entidades comerciales, KPIs, áreas de negocio y relaciones.

Pipeline:

1. **Ingestión** (`src/lib/file-processor-core.ts`): lee XLSX/XLS/CSV en el navegador o worker, escanea todas las hojas y detecta la fila de header aunque no esté en la primera fila.
2. **Semantic Engine** (`src/lib/semantic-commercial-engine.ts`): normaliza nombres, evalúa aliases y contexto de hoja/columna, detecta áreas, entidades, KPIs, roles de tabla y relaciones por claves compartidas.
3. **Dataset normalizado** (`ProcessedDataset`): conserva `salesData` y `salesKpis` para compatibilidad con Ventas, y agrega `semanticProfile` para alimentar fuentes, módulos futuros, chat e insights.
4. **Activación** (`data-source-store`): un archivo real se mantiene como un dataset lógico activo. Si se vuelve a cargar otro archivo, reemplaza el `fileDataset` y refresca las fuentes administradas en lugar de acumular tablas obsoletas.

El engine es frontend/mock: no crea backend, no consulta APIs externas y no persiste filas reales fuera de la sesión en memoria.

## Estado Global de Datos

`src/stores/data-source-store.ts` centraliza la fuente activa del workspace:

- `WorkspaceDatasetState = "empty" | "demo" | "real"`
- `DatasetSource = "file" | "integration" | "demo"`
- `getWorkspaceDatasetState()` resuelve el estado consumible por páginas y componentes.
- `getActiveDataset()` devuelve Demo CPG, `fileDataset`, `integrationDataset` o `null` según la fuente activa.

El comportamiento de módulos enterprise queda unificado:

1. `empty`: no se renderizan KPIs, charts ni tablas fake. Se muestra `ModuleDatasetEmptyState`.
2. `demo`: cada módulo usa sus mocks específicos y coherentes con Demo CPG.
3. `real`: se mantiene el mismo layout del módulo y se inyectan KPIs/metadata del `ProcessedDataset` activo mediante la capa de resolución de datos.

Activar Demo CPG mueve explícitamente `activeDatasetSource` a `demo`. Cargar o reemplazar un archivo real mueve la fuente activa a `file`.

`ModuleDataSourceBanner` es el banner estándar de fuente activa para todos los módulos. Ventas, Sell-Through, Finanzas, Trade Marketing, Supply Chain, RGM, Planning y CRM lo renderizan bajo el header, con el mismo patrón visual para Demo CPG y dataset real.

`ModuleHeader` y `ModuleEmptyState` en `src/components/workspace/module-chrome.tsx` estandarizan la experiencia modular:

- todos los headers muestran ícono, nombre, descripción, `Cargar datos` y `Nueva consulta`;
- todos los empty states muestran ícono, título claro, descripción breve, `Probar demo CPG` y `Cargar dataset`;
- no se muestran chips técnicos de datasets compatibles en el empty state principal.

Los formatters de `src/lib/utils.ts` centralizan reglas visuales:

- volumen y conteos sin decimales,
- moneda compacta,
- porcentajes con máximo 1 decimal,
- ratios/price index con 2 decimales.

## Stores Zustand

Todos usan el middleware `persist` para sobrevivir recargas:

| Store | Clave localStorage | Responsabilidad |
|---|---|---|
| `auth-store` | `nexus-auth` | Usuario, auth, onboarding |
| `workspace-store` | `nexus-workspace` | Workspace activo y áreas |
| `chat-store` | `nexus-chat` | Mensajes, proyectos, conversaciones |
| `data-source-store` | `nexus-data-sources` | Archivos e integraciones |
| `ui-store` | (no persist) | Estado UI efímero (sidebar open) |

## Rutas

```
/                    → Home pública; redirige si ya hay sesión
/login               → Autenticación
/register            → Registro
/onboarding          → Setup inicial (4 pasos)
/workspace           → Chat principal (requiere auth)
/workspace/ventas    → Módulo Ventas
/workspace/settings  → Perfil y configuración
/workspace/settings/data-sources → Fuentes de datos
```

El layout `/workspace/layout.tsx` protege todas las rutas hijas con redirección a `/login` si no hay sesión activa.

## Persistencia local

La app simula persistencia completa usando localStorage via Zustand:
- Sesión de usuario sobrevive recargas
- Proyectos y conversaciones persisten entre sesiones
- Archivos cargados y estado de integraciones persisten
- Workspace configurado en onboarding persiste

## Simulación de auth

No hay backend. La auth se simula:
1. `login(user)` guarda el usuario en `auth-store`
2. `logout()` limpia el store y redirige a `/login`
3. Credenciales hardcodeadas en `src/data/mock-user.ts`

## Gráficos ECharts

Los componentes de gráficos usan `dynamic` import de Next.js para evitar errores de SSR:

```ts
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });
```

Cada gráfico recibe datos de `src/data/mock-sales.ts` y usa estilos consistentes con el tema dark de la app.
