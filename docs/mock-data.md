# Mock Data — Nexus Prototype

Todos los datos están en `src/data/`. Nunca hardcodear en JSX.

## mock-user.ts

Usuario demo del prototipo:
- Email: `mauro@cpgteam.com`
- Password: `nexus123`
- Nombre: Mauro Celani, Head of Revenue

## mock-workspace.ts

- `MOCK_WORKSPACE`: workspace base CPG Growth Team, entendido como equipo demo de consumo masivo
- `MOCK_MEMBERS`: 5 miembros con roles owner/admin/analyst/viewer
- `BUSINESS_AREAS`: áreas navegables derivadas de la fuente canónica `src/data/business-areas.ts`.

## business-areas.ts

Fuente única de verdad para áreas comerciales:

- IDs canónicos: `sales`, `sell_through`, `finance`, `trade_marketing`, `supply_chain`, `rgm`, `planning`.
- Labels, short labels, slugs, rutas, colores, iconos, descripciones y aliases.
- Helpers `normalizeAreaId()`, `normalizeAreaIds()` y `detectConversationAreas()` para migrar datos legacy y clasificar conversaciones nuevas.

## demo-cpg.ts / mock-sales.ts

Dataset **Demo CPG Portfolio 2025-2026** para **Andes Consumer Goods**. CPG es la industria/caso demo, no el nombre de la empresa.

`src/data/demo-cpg.ts` es la fuente única de verdad del caso demo. `src/data/mock-sales.ts` queda como capa de compatibilidad y re-exporta los datos de `demo-cpg.ts`.

KPIs base:
- Sell-in YTD 2026: 144.100 cajas
- Sell-out YTD 2026: 118.900 cajas
- Net Revenue YTD 2026: USD 5.390.000
- EBITDA YTD 2026: USD 550.000
- Clientes directos activos: 1.396
- PDVs activos: 812
- Price Index promedio: 0.96
- Passthrough: 82,5%
- Cuentas clave: Carrefour y Coto

Reglas de consistencia:
- La suma de SKUs debe cerrar exactamente con sell-in 144.100, sell-out 118.900 y Net Revenue USD 5.390.000.
- La suma por canal debe cerrar exactamente con sell-in 144.100 y sell-out 118.900.
- Las 26 semanas deben acumular sell-in 144.100 y sell-out 118.900.
- El passthrough global es 118.900 / 144.100 = 82,5%.
- El waterfall financiero cierra Venta Bruta - Bonificaciones - Descuentos - Trade Spend = Net Revenue; Net Revenue - COGS - Opex = EBITDA.
- `validateDemoCpgData()` verifica estos cierres y emite warning en consola si algo no coincide.

**SKUs:**
1. Espumante Brut — passthrough 53% (problema)
2. Aperitivo de Hierbas — passthrough 98%
3. Gin Botánico Premium — passthrough 81%
4. Cerveza Artesanal IPA — passthrough 92% (mejor)
5. Vino Malbec Reserva — passthrough 87%

**Canales:** Supermercados · Mayoristas · Cadenas Especializadas · Gastronomía · E-commerce

**Series temporales:** `SELL_IN_SERIES` y `SELL_OUT_SERIES` de 26 semanas, `MONTHLY_SELL_IN/OUT` con 2025 + YTD 2026.

**KPIs agregados:** `SALES_KPIS` (8 KPIs con valores, cambios y descripciones).

**Revenue waterfall:** `REVENUE_WATERFALL` — Venta Bruta → Bonif. → Desc. → Trade → Net Revenue → COGS → Opex → EBITDA.

## mock-data-sources.ts

- `DEMO_FILES`: tablas/fuentes del dataset demo: Dim_Productos, Dim_Clientes_Directos, Dim_Clientes_Indirectos, Fact_Ventas_Sell_In, Fact_Ventas_Sell_Out_y_Precios, Fact_Finanzas_P&L, Fact_Objetivos_Mensuales, Fact_Ejecucion_Trade_Supply, Fact_Promociones_Plan, Control_Objetivos_Mensual, Control_DN_Distribuidor_Mensual, Control_TopDown_2025_2026, Diccionario_KPIs y tablas específicas de Sell-Through.
- Tablas Sell-Through de la demo: Dim_PDV_Universo_SellThrough, Fact_SellThrough_PDV_SKU, Control_Cobertura_Zona_PDV, Control_Compradores_SKU, Control_Mix_Real_vs_Objetivo, Fact_Dinamicas_SellThrough.
- `INTEGRATIONS`: 8 integraciones (Google Sheets y CSV conectados, el resto desconectados)

## module-dataset-state.ts

Define la configuración de estado por módulo enterprise:

- Identidad del módulo, copy de empty state y datasets compatibles.
- Áreas semánticas esperadas por módulo.
- KPIs semánticos esperados por módulo.
- Helper `realDatasetKpisForModule()` para convertir KPIs reales detectados en cards compatibles con `KpiCard`.

Esta capa evita hardcodear decisiones de estado en JSX y permite que Finanzas, Trade, Supply, RGM, Planning, CRM y Sell-Through compartan la misma lógica `empty/demo/real`.

Cuando el estado es `real`, `resolveModuleKpis()` intenta tomar KPIs numéricos del `ProcessedDataset`. Si el engine no pudo calcular KPIs accionables para ese módulo, conserva los KPIs demo como fallback visual para no cambiar la estructura del dashboard.

## Datasets reales cargados por usuario

Los XLSX/XLS/CSV reales se procesan en runtime desde `src/lib/file-processor-core.ts`.

El resultado no se hardcodea en `src/data/`: se guarda como `fileDataset` en memoria dentro de `data-source-store` y se acompaña con filas de `DataFile` para la tabla de Fuentes. En localStorage persiste la metadata de fuentes, pero las filas normalizadas del archivo real se pierden al recargar la página, consistente con el prototipo sin backend.

La carga real agrega `semanticProfile` con áreas, KPIs, entidades, tablas y relaciones detectadas. Demo CPG e integraciones mock siguen usando sus datasets simulados existentes.

### Excel Resumen Demo App

El archivo `Resumen Info Demo App` es un formato real/resumido para alimentar la demo, no un mock hardcodeado. Se procesa en runtime con `src/lib/file-processors/resumen-demo-app-adapter.ts`.

Hojas reconocidas:
- `Ventas`
- `SellThrough`
- `Finanzas`
- `Ventas Bis` como fuente canónica resumida

KPIs que puede extraer: Sell-in, Sell-out, Passthrough, Net Revenue, Gross Revenue, EBITDA, Gross Profit, COGS, Trade Spend, Opex/G&A, clientes compradores, Foto Éxito, PDVs activos/universo y distribución numérica si está presente. Las variaciones se leen desde las columnas del Excel (`YTD 26 vs YTD 25 %`, variaciones de período o budget disponibles), normalizando `0.14`, `14` y `14%` a 14%.

Para Sell-through, `SellThrough Bis` es la fuente real del módulo: alimenta KPIs, ranking SKU, evolución de facturación, evolución de volumen y sell-in vs sell-out con passthrough. Si un KPI como mix, margen u oportunidad no existe, el módulo muestra N/A.

### Excel PDV geográfico

Los archivos con columnas de PDV geográfico se procesan con `src/lib/file-processors/pdv-geo-adapter.ts`.

El caso actual `PDV_Retiro_Recoleta.xlsx` aporta:
- PDVs reales de Retiro/Recoleta con latitud y longitud,
- zona, canal, dirección y estado,
- volumen mensual, facturación mensual, ticket promedio y frecuencia,
- resumen de atendidos/no atendidos por zona y canal.

Estos datos viven en `ProcessedDataset.geoPdvFacts` y se usan sólo en modo real. Demo CPG conserva `mock-sell-through.ts`.

No se persisten datos finales en `src/data/`; el resultado vive como `fileDataset` en memoria y mantiene `metadata.sourceFormat = "resumen-demo-app"`.

## mock-sell-through.ts

Mock data del módulo `/workspace/sell-through`, conectado conceptualmente a Demo CPG:

- Zonas comerciales de CABA: Palermo/Colegiales, Recoleta/Retiro, Caballito/Almagro.
- Distribuidores ficticios: Distribuidora Norte SA, Bebidas Elite, Distribuidora Centro SRL, Grupo Bebidas.
- PDVs reales y potenciales con estado comprador/no comprador/potencial, canal, zona, distribuidor, coordenadas mock, facturación, volumen, SKUs comprados, mix y oportunidad.
- SKUs derivados de `demo-cpg.ts` con clientes compradores, distribución real, objetivo, gap, volumen, facturación y tendencia.
- Mix real vs objetivo por SKU.
- Mecánicas promocionales y dinámicas demo para seguimiento semanal.
- `SELL_THROUGH_REFERENCE_KPIS`: fallback visual demo/referencial usado con dataset real cuando faltan esos campos: mix `73% / 84%`, margen `36%` y oportunidad `USD 244K`.

## mock-finanzas.ts

- `FINANCE_MONTHLY_DEMO`: P&L mensual demo con años 2025 y 2026 para mantener la misma matriz visual que el dataset real cuando Demo CPG está activa.

## mock-conversations.ts

- `MOCK_PROJECTS`: 4 proyectos (Q2 Análisis, Recuperación Supermercados, War Room, Trade Spend Review)
- `MOCK_CONVERSATIONS`: conversaciones demo normalizadas con `areaIds` y `primaryAreaId`; `area` queda derivado como compatibilidad visual.
- `SUGGESTED_QUESTIONS`: 6 preguntas sugeridas en el home
- `AGENT_STEPS`: 6 pasos genéricos del agente (fallback)
- `getContextualAgentSteps(question)`: devuelve pasos específicos según el tipo de pregunta (YoY, EBITDA, sell-through, canal, cobranza, 90 días, margen). Si no hay match cae al listado genérico `AGENT_STEPS`.
- `MOCK_INITIAL_MESSAGE`: mensaje de bienvenida con KPIs YoY reales del guion (NR +31,4%, EBITDA +50,8%, passthrough 65,7%) y señal de tensión de passthrough.
- `generatePassthroughResponse()`: respuesta completa para consultas sobre passthrough/Espumante
- `generatePortfolioResponse()`: respuesta para consultas sobre estado del portafolio
- `generateGenericResponse(question)`: respuesta genérica para cualquier otra consulta

## demo-advisory-flow.ts

Respuestas guionadas del Caso 1 CPG (Andes Consumer Goods) alineadas al guion demo de 15 minutos.

**Respuestas YoY** (se evalúan con prioridad sobre las vs-budget):

| Constante | Acto | Pregunta clave |
|-----------|------|----------------|
| `ACT1_YOY` | 1 | KPIs vs año anterior — NR +31,4%, EBITDA +50,8%, passthrough 65,7% |
| `ACT2A_YOY` | 2a | Canal con mayor concentración de crecimiento |
| `ACT3_YOY` | 3 | Zonas con peor sell-through y ejecución geográfica |
| `ACT4A_EBITDA_WHY` | 4a | Por qué EBITDA creció 51% vs NR 31% (COGS -3,7pp + apalancamiento opex) |
| `ACT4B_90DAYS_YOY` | 4b | Prioridades concretas para los próximos 90 días |

**Respuestas vs-budget** (fallback legacy, se mantienen para compatibilidad):
`ACT1`, `ACT2A`, `ACT2B_COBRANZA`, `ACT3`, `ACT4A`, `ACT4B`.

`getAdvisoryResponse(question)` evalúa primero las preguntas YoY del guion; sólo si no hay match busca entre las vs-budget. Cada respuesta que recibe `content` en `buildAdvisoryMessage()` activa la animación de streaming word-by-word en `MessageItem`.
