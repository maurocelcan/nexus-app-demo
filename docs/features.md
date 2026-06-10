# Nexus — Features & Módulos

Documentación funcional de todos los módulos implementados (prototipo frontend con Demo CPG mock y datasets reales procesados en memoria).

---

## Módulos disponibles

### Ventas (`/workspace/ventas`)
**Status:** Implementado (completo)

Dashboard comercial principal. Consume datos del Dataset Engine (Demo CPG Portfolio 2025-2026).

**KPIs:** Sell-in · Sell-out · Passthrough · Distribución · Clientes compradores

**Funcionalidades:**
- Filtros por período (MTD/QTD/YTD/6M/12M), SKU y canal
- KPI strip con 6 indicadores principales
- Gráfico sell-in vs sell-out (semanal)
- Gráfico distribución por canal
- Waterfall de revenue
- Tabla de SKUs con performance
- Insights automáticos
- Modal de creación de plan de acción
- Integración con chat IA y action-plan-store

---

### Sell-Through / Retail Execution (`/workspace/sell-through`)
**Status:** Implementado (completo)

Módulo de ejecución comercial y retail intelligence. Focalizado en PDVs, zonas y dinámicas.

**KPIs:** Passthrough por SKU · Cobertura · OOS · Mix real vs target · Distribución

**Funcionalidades:**
- Filtros avanzados (período, SKU, canal, zona, distribuidor)
- Mapa de PDVs con zonas dibujables
- Análisis de zona seleccionada (universo, compradores, revenue, gap)
- Tabla de PDVs con detalle
- Vista de compradores por SKU
- Mix real vs target por categoría
- Promotions designer + simulador de ROI/margen/volumen
- Dynamics tracker (seguimiento semanal)
- En dataset real conserva fallback visual demo/referencial para mix `73% / 84%`, margen `36%` y oportunidad `USD 244K` cuando el archivo no trae esos campos.

---

### Finanzas (`/workspace/finanzas`)
**Status:** Implementado

Análisis de P&L, rentabilidad por SKU/canal, y drivers de EBITDA.

**KPIs:** Net Revenue ($5.39M) · Gross Margin (38.1%) · EBITDA ($550K) · Trade Spend % (16.5%)

**Funcionalidades:**
- P&L simplificado (waterfall Venta Bruta → Net Revenue → EBITDA)
- P&L real completo desde `Finanzas BIS`: Gross Revenue, Descuentos Trade, Net Revenue, COGS, Gross Profit, G&A, Gastos Estructura, EBITDA, Gross Margin %, COGS % y EBITDA %.
- P&L mensual con selector de año, columna `Total período` según filtro YTD/QTD/U6M/MTD y columnas mensuales detectadas desde `Finanzas BIS`.
- Gráfico EBITDA mensual + margen (eje doble)
- Rentabilidad por SKU (Gross Margin, EBITDA, Trade Spend)
- Tabla de revenue + margen por canal con semáforo de rentabilidad
- Insights automáticos (alerta Espumante, oportunidad Aperitivo, warning E-commerce)
- Plan de acción pre-configurado y preguntas IA

**Mock data:** `src/data/mock-finanzas.ts`

---

### Trade Marketing (`/workspace/trade-marketing`)
**Status:** Implementado

ROI promocional, ejecución en PDV y gestión de activaciones.

**KPIs:** ROI Promocional (1.8x) · Trade Spend ($890K) · Activaciones (47) · Ejecución vs Target (71.2%)

**Funcionalidades:**
- Portfolio de promociones con filtro por estado (activa/planificada/completada)
- Detalle por promoción: mecánica, canal, SKU, ROI, uplift de volumen
- Gráfico ROI por mecánica (horizontal bar con coloring semafórico)
- Gráfico trend spend + ROI mensual (eje doble)
- Progress bars de ejecución por cadena vs target
- Insights automáticos (promo ROI negativo, mejor mecánica, gap ejecución)
- Plan de acción y preguntas IA

**Mock data:** `src/data/mock-trade.ts`

---

### Supply Chain (`/workspace/supply`)
**Status:** Implementado

Monitoreo de disponibilidad, OOS, OTIF y performance logística.

**KPIs:** OTIF (87.3%) · Fill Rate (91.2%) · OOS Rate (4.2%) · Cobertura promedio (4.8 sem)

**Funcionalidades:**
- Gráfico OTIF + Fill Rate mensual (líneas con área)
- OOS por canal (horizontal bar semafórico)
- Inventario + cobertura por SKU con progress bars y badge de riesgo
- Tabla PDVs críticos con riesgo de quiebre
- Tabla performance logística por distribuidor
- Insights automáticos (Gin Botánico riesgo crítico, tendencia OTIF, oportunidad canales)
- Plan de acción y preguntas IA

**Mock data:** `src/data/mock-supply.ts`

---

### RGM — Revenue Growth Management (`/workspace/rgm`)
**Status:** Implementado

Pricing, mix y elasticidad para optimización de revenue.

**KPIs:** Price Index (0.96) · ASP ($37.4/caja) · Mix Premium (23.1%) · Revenue Uplift ($180K)

**Funcionalidades:**
- Gráfico ASP real vs target (línea con target punteado)
- Gráfico mix premium vs standard (stacked bar)
- Tabla Price Index por SKU con elasticidad y potencial de ajuste
- Revenue por banda de precio con progress bars
- Simulador de escenarios de precio (5 escenarios)
- Insights automáticos (subpreciación, mix shift, portafolio)
- Plan de acción y preguntas IA

**Mock data:** `src/data/mock-rgm.ts`

---

### Planning (`/workspace/planning`)
**Status:** Implementado

Forecast de demanda, escenarios y proyecciones comerciales.

**KPIs:** Forecast Accuracy (76.3%) · Variance YTD (-2.6%) · Revenue H2 ($5.62M) · EBITDA H2 ($610K)

**Funcionalidades:**
- Selector interactivo de escenarios H2 (Pesimista/Base/Optimista) con probabilidades
- Gráfico Forecast vs Real por mes (cajas)
- Gráfico proyección de revenue por trimestre (3 líneas por escenario)
- Demand plan por SKU con Forecast Accuracy y badge de riesgo
- Timeline de hitos con estados (completado/en curso/pendiente)
- Insights automáticos (FA mínimo, escenario optimista, JBP Carrefour)
- Plan de acción y preguntas IA

**Mock data:** `src/data/mock-planning.ts`

---

### CRM (`/workspace/crm`)
**Status:** Implementado

Vista 360 de clientes, retención, NPS y oportunidades de crecimiento.

**KPIs:** Clientes Activos (1,396) · Clientes en Riesgo (87) · NPS (67) · Retención 12M (91.4%)

**Funcionalidades:**
- Gráfico evolución clientes activos + nuevos + perdidos (combo bar/line)
- Donut chart de revenue por canal
- Vista tabular top clientes con revenue, crecimiento, NPS y riesgo
- Vista de clientes en riesgo con probabilidad de churn y acción recomendada
- Segmentación por crecimiento (Champions/Growing/Stable/Declining)
- Insights automáticos (DIA churn, Gastronomía oportunidad, concentración)
- Plan de acción y preguntas IA

**Mock data:** `src/data/mock-crm.ts`

---

## Infraestructura compartida

### Estados globales de datasets
Nexus opera con tres estados de workspace:

- `empty`: no hay dataset activo. Todos los módulos muestran empty state contextual con CTA a Demo CPG o Fuentes de datos.
- `demo`: Demo CPG activa. Todos los módulos enterprise usan datasets mock consistentes del caso Andes Consumer Goods.
- `real`: archivo Excel/CSV real activo. Los módulos mantienen su misma UI y reemplazan la metadata/KPIs por datos resueltos desde `ProcessedDataset` y `semanticProfile`.

La regla aplica a Ventas, Sell-Through, Finanzas, Trade Marketing, Supply Chain, RGM, Planning y CRM. No existe una pantalla visual separada para demo y otra para dataset real; cambia la fuente de datos, no el layout. Proyectos, conversaciones, timelines e insights demo se mantienen disponibles como simulación de capa agéntica.

### Banner estándar de fuente activa
Todos los módulos usan `ModuleDataSourceBanner` para mostrar:

- nombre del dataset activo,
- tipo de fuente (`Demo CPG`, `Dataset real` o `Sin datos`),
- cantidad de fuentes/tablas,
- KPIs detectados,
- confianza semántica cuando aplica,
- CTA para cambiar fuente o cargar datos.

### Header y empty state estándar
Todos los módulos usan el mismo patrón de UX:

- Header: ícono, nombre, descripción clara, `Cargar datos` y `Nueva consulta`.
- Empty state: ícono del módulo, título claro, descripción de negocio, `Probar demo CPG` y `Cargar dataset`.

Se evita mostrar abreviaciones o chips técnicos en el empty state principal; esa información queda reservada para documentación o vistas avanzadas de fuentes.

### Dataset Engine
Todos los módulos consumen datos consistentes con el Demo CPG Portfolio 2025-2026 (Andes Consumer Goods). Los KPIs cierran matemáticamente:
- Sell-in: 144,100 cajas · Sell-out: 118,900 cajas (82.5% passthrough)
- Net Revenue: $5,390,000 · EBITDA: $550,000 (10.2% margin)

### Adapter Resumen Demo App
Implementado en `src/lib/file-processors/resumen-demo-app-adapter.ts`.

El engine detecta automáticamente Excels resumen con hojas `Ventas`, `SellThrough`, `Finanzas` y una hoja resumen tipo `Ventas Bis`/`Ventas Wizz`. Para ese formato no usa la estrategia granular legacy: prioriza `Ventas Bis` como tabla canónica de KPIs por período y toma `Ventas`, `SellThrough` y `Finanzas` como contexto complementario.

El adapter ignora filas vacías, marcas `X`, notas `Quitar`, textos aclaratorios y bloques sin patrón `Canal/SKU/KPI/período/valor`. Los KPIs detectados se entregan en el contrato existente `ProcessedDataset.salesKpis`, con metadata adicional (`sourceFormat: "resumen-demo-app"`, hoja primaria, hojas fuente, bloques ignorados y fuente de cada KPI).

### Action Plans (`/workspace/action-plans`)
Todos los módulos generan planes de acción via `useActionPlanStore`. Los planes se persisten en localStorage y son visibles en la página de Action Plans.

### Chat IA (`/workspace`)
Cada módulo incluye botón "Abrir en Chat IA" y preguntas sugeridas que redirigen al agente conversacional.

### Proyectos (`/workspace/projects/[id]`)
Los módulos pueden crear proyectos relacionados a sus insights y planes de acción.
La pestaña Resumen incluye `Generar presentación` / `Abrir presentación`; reutiliza el archivo generado, lo muestra en Archivos y en proyectos reales se habilita sólo con contexto suficiente.

---

## Rutas completas

| Módulo | Ruta |
|---|---|
| Chat principal | `/workspace` |
| Ventas | `/workspace/ventas` |
| Sell-Through | `/workspace/sell-through` |
| Finanzas | `/workspace/finanzas` |
| Trade Marketing | `/workspace/trade-marketing` |
| Supply Chain | `/workspace/supply` |
| RGM | `/workspace/rgm` |
| Planning | `/workspace/planning` |
| CRM | `/workspace/crm` |
| Action Plans | `/workspace/action-plans` |
| Conversaciones | `/workspace/conversations` |
| Proyectos | `/workspace/projects/[id]` |
| Settings | `/workspace/settings` |
| Data Sources | `/workspace/settings/data-sources` |

---

## Normalización de Áreas en Conversaciones

Las conversaciones usan una taxonomía centralizada en `src/data/business-areas.ts`.

- Las áreas se guardan como `areaIds` y `primaryAreaId`.
- Los labels visibles, dots, badges, short labels y rutas se derivan de la definición canónica.
- Los mocks demo se normalizan al cargar, migrando strings históricos como `Ventas`, `Trade`, `Sell-Through` o `Finanzas`.
- Las consultas nuevas se clasifican con `detectConversationAreas()` a partir del primer mensaje y pueden quedar asociadas a más de un área.
- El historial y los chats dentro de proyectos muestran badges consistentes y los filtros comparan IDs normalizados.

---

## Semantic Commercial Data Engine

Ruta principal: `/workspace/settings/data-sources`

El sistema soporta:
- Carga de archivos Excel/CSV con parsing y mappings
- Conexión a integraciones (Sheets, CRM, ERP, BI, Database)
- Demo CPG Portfolio 2025-2026 (activable en un click)
- Datasets procesados con KPIs, series temporales y dimensiones
- Estado global de dataset: `empty` / `demo` / `real`
- Active dataset source: `demo`, `file` o `integration`, con cambio explícito al activar Demo CPG o cargar archivo real

### Entity Resolution Layer (v2)

Implementado en `src/lib/file-processor-core.ts` y `src/lib/semantic-commercial-engine.ts`.

**Sell-out detection mejorada:**
- Nuevos aliases para `Vol_Cajas_Out` y variantes
- Detección por nombre de hoja (`Fact_Ventas_Sell_Out_y_Precios`) y por contenido semántico de columnas

**Resolución de nombres de SKU:**
- El engine detecta los campos `Marca`, `Formato`, `Categoria` en `Dim_Productos`
- Construye un `displayName` compuesto: `Marca + Formato` → "Coca Cola 473ml"
- Fallback: skuName si está presente, luego el ID del SKU
- La fact table prioriza el `displayName` del dimension table sobre su propia columna skuName

**Entity Label Overrides:**
- El usuario puede editar labels de productos/SKUs desde el modal de detalle en Fuentes de datos
- Los cambios se almacenan en `entityOverrides[]` en el dataset (en memoria)
- Los cambios NO modifican el archivo original
- El store expone `updateEntityLabel(source, override)` y `resolveProductDisplayName(dataset, skuId, fallback)`

**Filtros mejorados:**
- Los filtros de SKU en `/workspace/ventas` y otros módulos usan el `displayName` compuesto
- Nuevo campo `format` en el semantic engine (aliases: "formato", "presentacion", "empaque", "size")
