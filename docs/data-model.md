# Data Model — Nexus Prototype

El prototipo no procesa archivos reales ni consulta backend. El modelo se simula con datos en `src/data/` y Zustand/localStorage.

La fuente única de verdad del caso demo es `src/data/demo-cpg.ts`. `src/data/mock-sales.ts` sólo re-exporta esos datos para compatibilidad con componentes existentes.

## Dataset Demo

Nombre: **Demo CPG Portfolio 2025-2026**  
Empresa demo: **Andes Consumer Goods**  
Industria: CPG / Consumo Masivo

CPG describe la industria del caso, no una empresa llamada CPG.

## KPIs Base

| Métrica | Valor |
|---|---:|
| Sell-in YTD 2026 | 144.100 cajas |
| Sell-out YTD 2026 | 118.900 cajas |
| Net Revenue YTD 2026 | USD 5.390.000 |
| EBITDA YTD 2026 | USD 550.000 |
| Clientes directos activos | 1.396 |
| PDVs activos | 812 |
| Price Index promedio | 0.96 |
| Passthrough | 82,5% |

Cuentas clave del caso: Carrefour y Coto.

## Tablas Conceptuales

- `Dim_Productos`
- `Dim_Clientes_Directos`
- `Dim_Clientes_Indirectos`
- `Fact_Ventas_Sell_In`
- `Fact_Ventas_Sell_Out_y_Precios`
- `Fact_Finanzas_P&L`
- `Fact_Objetivos_Mensuales`
- `Fact_Ejecucion_Trade_Supply`
- `Fact_Promociones_Plan`
- `Dim_PDV_Universo_SellThrough`
- `Fact_SellThrough_PDV_SKU`
- `Control_Cobertura_Zona_PDV`
- `Control_Compradores_SKU`
- `Control_Mix_Real_vs_Objetivo`
- `Fact_Dinamicas_SellThrough`
- `Control_Objetivos_Mensual`
- `Control_DN_Distribuidor_Mensual`
- `Control_TopDown_2025_2026`
- `Diccionario_KPIs`

## Sell-Through / Clientes & PDVs

Fuente mock: `src/data/mock-sell-through.ts`.

Entidades principales:

- `SellThroughPdv`: PDVs reales y potenciales con zona, canal, distribuidor, estado comprador/no comprador/potencial, coordenadas mock de mapa, facturación, volumen, SKUs comprados, última compra, mix y oportunidad.
- `SellThroughZone`: zonas comerciales con bounds visuales para simular cuadrantes o vectores sobre el mapa.
- `SellThroughDistributor`: distribuidores mock y cobertura asignada.
- `SellThroughSku`: SKUs del caso Demo CPG enriquecidos con clientes compradores, DN real, objetivo, gap, volumen, facturación y tendencia.
- `SellThroughMixRow`: mix real vs objetivo por SKU/categoría.
- `SellThroughDynamic`: dinámicas/promociones para seguimiento con estado, fechas, PDVs objetivo/activados, volumen, facturación, margen, desvío y evolución semanal.

El módulo toma los totales, SKUs y series base de `demo-cpg.ts` para mantener consistencia con Andes Consumer Goods y el dataset **Demo CPG Portfolio 2025-2026**.

La acción `Crear proyecto con objetivos` transforma una selección de PDVs en un `Project` persistido por `chat-store`, con `ProjectKpi`, `ProjectGoal`, `ProjectInsight`, `ProjectNextStep`, brief y conversación asociada.

En Data Sources estas tablas aparecen como fuentes procesadas al cargar la demo.

## Reglas de Consistencia

- SKUs: sell-in, sell-out y Net Revenue deben sumar exactamente los KPIs oficiales.
- Canales: sell-in y sell-out deben sumar exactamente los KPIs oficiales.
- Series semanales: las 26 semanas deben cerrar contra sell-in 144.100 y sell-out 118.900.
- Series mensuales 2026: enero-junio debe cerrar contra los mismos totales YTD.
- Passthrough global: 118.900 / 144.100 = 82,5%.
- Waterfall: Venta Bruta - Bonificaciones - Descuentos - Trade Spend = Net Revenue; Net Revenue - COGS - Opex = EBITDA.

`validateDemoCpgData()` valida estas reglas y muestra warning en consola si encuentra diferencias.

## Entidades Persistidas

- Auth: usuario, sesión y onboarding en `nexus-auth`.
- Workspace: workspace y áreas activas en `nexus-workspace`.
- Chat: conversaciones, proyectos y mensajes por conversación en `nexus-chat`.
- Data Sources: archivos, integraciones y demo cargada en `nexus-data-sources`.
- Planes de acción: planes, tareas y estados en `nexus-action-plans`.
- UI: secciones colapsadas del sidebar en `nexus-ui`.

## Áreas Comerciales

La fuente única de verdad de áreas comerciales es `src/data/business-areas.ts`.

Cada área tiene:

- `id`: identificador canónico (`sales`, `sell_through`, `finance`, `trade_marketing`, `supply_chain`, `rgm`, `planning`).
- `label` y `shortLabel`: nombres de presentación.
- `slug` y `routeId`: compatibilidad con rutas y módulos (`ventas`, `sell-through`, `finanzas`, etc.).
- `color`, `icon`, `description` y `aliases`: metadata para UI y detección automática.

Las conversaciones usan `areaIds: BusinessAreaId[]` y `primaryAreaId?: BusinessAreaId`. Los campos `area` y `scope` se mantienen sólo como compatibilidad derivada para código legacy: no son la fuente principal.

`normalizeAreaId()` migra strings históricos como `Ventas`, `ventas`, `Trade`, `Trade Marketing`, `Sell Through`, `Finanzas` o `Finance` a IDs canónicos. `detectConversationAreas()` analiza el primer mensaje y puede devolver una o varias áreas cuando la consulta cruza dominios.

## Estado Global de Dataset

`data-source-store` expone una fuente de verdad para saber qué datos gobiernan el workspace:

```ts
type WorkspaceDatasetState = "empty" | "demo" | "real";
type DatasetSource = "file" | "integration" | "demo";
```

Reglas:

- `empty`: no existe fuente lógica activa con dataset utilizable. Los módulos no renderizan KPIs ni charts mock.
- `demo`: `activeDatasetSource === "demo"` y `hasDemoLoaded === true`. Los módulos usan Demo CPG y sus mocks enterprise.
- `real`: `activeDatasetSource === "file"` con `fileDataset`, o `activeDatasetSource === "integration"` con `integrationDataset`. Los módulos usan el `ProcessedDataset` activo sin cambiar de layout visual.

Los archivos reales viven en memoria (`fileDataset`) y las filas se pierden al recargar por no existir backend. La metadata de fuentes puede persistir, pero no alcanza para considerar el workspace como `real` si no hay dataset procesado disponible.

La capa `src/data/module-dataset-state.ts` separa datos de presentación: define áreas/KPIs esperados por módulo y expone `resolveModuleKpis()` para inyectar KPIs reales cuando existen, conservando la misma estructura de dashboard.

## Semantic Dataset Profile

`ProcessedDataset` puede incluir `semanticProfile`, generado al cargar un Excel/CSV real.

Campos principales:

- `areas`: áreas comerciales detectadas (`sales`, `sell-through`, `finance`, `trade-marketing`, `supply-chain`, `rgm`, `planning`, `crm`, `master-data`, `control`).
- `entities`: entidades como SKU, producto, cliente, PDV, canal, región, distribuidor, categoría, factura y cuenta contable.
- `kpis`: métricas detectadas como sell-in, sell-out, sell-through, Net Revenue, Gross Revenue, EBITDA, Gross Margin, COGS, Opex, Trade Spend, Passthrough, Price Index, ASP, DN, Inventory, Fill Rate, OTIF, DSO, ROI promo y Share of Shelf.
- `tables`: perfil de cada hoja, con fila de header detectada, rol (`fact`, `dimension`, `kpi`, `bridge`, `control`, `staging`) y dominio.
- `relationships`: relaciones inferidas por claves compartidas y linaje KPI/fact-dimension.
- `quality`: columnas mapeadas, no mapeadas, confianza y warnings.

Los modelos normalizados existentes (`salesData`, `salesKpis`, `availableFilters`) se mantienen para que los módulos actuales sigan funcionando. El perfil semántico prepara la plataforma para módulos adicionales sin hardcodear el Excel real.

## Formato Resumen Demo App

Los Excels tipo **Resumen Info Demo App** se procesan con un adapter específico antes del pipeline legacy. Se detectan por la combinación normalizada de hojas `Ventas`, `SellThrough`, `Finanzas` y una hoja resumen de ventas (`Ventas Bis`, `Ventas Wizz` o variante equivalente).

La hoja primaria es `Ventas Bis` cuando existe. El adapter lee la tabla con columnas `Canal`, `SKU`, `KPI`, `YTD 25`, `YTD 26`, variación YTD y cortes `MA`, `Q1`, `U6M`. No interpreta notas visuales como datos: ignora `Quitar`, marcas `X`, filas vacías, aclaraciones y bloques que no tengan patrón de métrica/período/valor.

`SalesKpis` mantiene los campos existentes y agrega campos opcionales para KPIs resumidos:

- `grossRevenue`, `grossRevenueVarPct`
- `buyerCustomers`, `buyerCustomersVarPct`
- `buyerPdvs`, `buyerPdvsVarPct`
- `numericDistribution`, `numericDistributionVarPct`
- `grossMargin`, `grossMarginVarPct`
- `cogsPct`, `cogsPctVarPct`
- `asp`, `aspVarPct`
- `tradeSpend`, `tradeSpendVarPct`
- `opex`, `opexVarPct`

`ProcessedDataset.metadata` puede incluir `sourceFormat`, `sourceSheets`, `primarySheet`, `ignoredBlocks`, `detectedKpis`, `warnings` y `kpiSources`.

## Capa Canónica de KPI Facts

`ProcessedDataset` incluye `kpiFacts?: CommercialKpiFact[]`, generado por el adapter BIS y futuros adapters específicos.

Cada `CommercialKpiFact` tiene:
- `key`: clave semántica (`sellInVolume`, `netRevenue`, `ebitda`, etc.)
- `label`: etiqueta legible
- `period`: `"YTD" | "QTD" | "U6M" | "MA" | "MTD"` — el corte temporal
- `year`: año de referencia (2026)
- `value`, `priorValue`: valor del período actual y del año anterior
- `variationPct`: variación % vs año anterior (desde el archivo para YTD; calculada para otros)
- `unit`: `"currency" | "volume" | "ratio" | "count" | "pct"`
- `grain`: granularidad (`TOTAL`, `SKU`, `CANAL`, `PDV`, etc.)
- `sourceSheet`: hoja de origen
- `isAvailable`: `false` si el archivo no tiene dato para ese período/granularidad
- `unavailableReason`: texto para mostrar al usuario cuando no hay dato

### Helpers (`src/lib/kpi-facts.ts`)

- `resolveKpiFact(kpiFacts, key, period, grain?)` — busca el mejor fact
- `datasetHasKpiFacts(dataset)` — booleano, para saber si usar la capa canónica
- `kpisFromKpiFacts(dataset, period)` — SalesKpi[] para el módulo Ventas, resueltos por período
- `finanzasKpisFromDataset(dataset, period)` — SalesKpi[] para el módulo Finanzas
- `sellThroughKpisFromDataset(dataset, period)` — SalesKpi[] para Sell-Through
- `filterPeriodToFactPeriod(period)` — mapea el período de UI al período BIS

### Builders financieros (`src/lib/finanzas-real.ts`)

El módulo Finanzas consume `kpiFacts` con builders específicos:

- `pnlFromKpiFacts(dataset, period)` — arma el total period-aware desde `kpiFacts` para compatibilidad.
- `buildFinanzasPnlMatrix(rows, selectedYear, period)` — arma la matriz mensual de P&L desde `financeMonthly`, con años detectados dinámicamente, columnas mensuales del año seleccionado y columna `Total período`.
- `buildFinanzasKpisFromMonthly(rows, selectedYear, period, kpiFacts)` — arma las KPI cards financieras desde el mismo año/período del P&L mensual; para años sin datos devuelve cards `N/A` sin fallback.
- `buildFinanzasMonthlyEbitda(dataset, period)` — usa el bloque mensual real `Mes | EBITDA | EBITDA %` de `Finanzas BIS`.
- `buildFinanzasHeadcount(dataset, period)` — usa el bloque comparativo de `Headcount x área` y agrega las filas válidas para mostrar Headcount total período anterior vs actual.
- `buildFinanzasRevenueByChannel(dataset, period)` — usa `grain="CANAL"` para Net Revenue, EBITDA y Trade Spend por canal.

`Finanzas BIS` también aporta `Dias_Cobro`, `Dias_Atraso`, `Monto_Factura_USD`, `Monto_Cobrado_USD` y `Saldo_Abierto_USD` como `kpiFacts` financieros. Si el período no existe o la granularidad no está en BIS, los builders devuelven vacío y la UI muestra empty states. `financeMonthly` conserva el bloque mensual `Mes | Gross_Revenue | Descuentos_Trade | Net_Revenue | COGS | Gross_Profit | G&A | Gastos_Estructura | EBITDA | Gross_Margin_% | COGS_% | EBITDA %`. `cogsPct` conserva su nombre por compatibilidad, pero representa monto monetario de COGS cuando se usa en `SalesKpis`; en `CommercialKpiFact` existen claves separadas para `cogs` monto y `cogsPct` porcentaje.

### Comportamiento por período

| Filtro UI | Período BIS | Fuente en Ventas Bis |
|---|---|---|
| YTD | YTD | Columnas YTD 25 / YTD 26 + var% del archivo |
| QTD | QTD | Columnas Q1 25 / Q1 26 |
| Últimos 6M | U6M | Columnas U6M 25 / U6M 26 |
| MTD | MTD | **N/A** — BIS no tiene corte mensual |
| Últimos 12M | — | **N/A** — no hay equivalente en BIS |

### Formato Resumen Demo App — Archivo BIS principal

El archivo importante es **Resumen Info Demo App (6).xlsx** (o variantes con número mayor).

- Detectado por: tener hojas `Ventas`, `SellThrough`, `Finanzas` + hoja BIS (`Ventas Bis`, `Ventas Wizz`, `Ventas Resumen`, etc.)
- El adapter BIS lee la hoja primaria (`Ventas Bis`) con columnas en posiciones fijas:
  - Col 0: Canal, Col 1: SKU, Col 2: KPI
  - Col 4: YTD 25, Col 5: YTD 26, Col 6: YTD% var
  - Col 11: MA 25, Col 12: MA 26
  - Col 13: Q1 25, Col 14: Q1 26
  - Col 15: U6M 25, Col 16: U6M 26
- Las tabs BIS son fuente de verdad. No se infiere de más.
- Si un KPI no existe para un período → `isAvailable: false` → muestra N/A en UI.
- Para Sell-Through, el adapter también lee `SellThrough Bis` cuando existe. Esa hoja alimenta KPIs de Sell-through, ranking SKU total, evolución de facturación/volumen y sell-in vs sell-out con passthrough.
- En Sell-Through real, los KPIs visuales `Mix real vs objetivo`, `Margen estimado` y `Oportunidad PDV` usan referencias demo centralizadas cuando el archivo no trae esos campos: `73% / 84%`, `36%` y `USD 244K`.

## Modelo Geográfico de PDV

Los archivos tipo **PDV Retiro-Recoleta** se detectan por columnas, no por nombre: `ID`, `Zona`, `Canal`, `Nombre PDV`, `Dirección`, `Latitud`, `Longitud`, `Estado`, volumen, facturación, ticket promedio y frecuencia.

`ProcessedDataset.geoPdvFacts` contiene `GeoPdvFact`:

- identidad y ubicación: `id`, `name`, `zone`, `channel`, `address`, `lat`, `lng`
- estado comercial: `status`, `isAttended`, `hasPurchase`
- métricas: `volume`, `revenue`, `averageTicket`, `visitFrequency`, `opportunity`
- trazabilidad: `sourceSheet`

Reglas:
- `isAttended` es verdadero si `Estado === "Atendido"` o si volumen/facturación son mayores a cero.
- `hasPurchase` es verdadero si volumen o facturación son mayores a cero.
- PDVs sin coordenadas se conservan para KPIs, pero se excluyen del mapa.
- Si falta oportunidad explícita, se calcula como volumen promedio de compradores por no compradores.

## Multiarchivo Real

`Resumen Info Demo App (6).xlsx` y `PDV_Retiro_Recoleta.xlsx` pueden convivir en `fileDataset`. Si se cargan ambos, el store combina:

- `kpiFacts` y series desde BIS,
- `geoPdvFacts` y filtros de zona/canal desde PDV,
- metadata y hojas procesadas sin pisar la fuente anterior.

### Regla Demo vs Dataset Real

| Estado | Comportamiento |
|---|---|
| `demo` | KPIs mock enterprise, insights mock, narrativa demo, gráficos prearmados |
| `real` | Solo datos reales + N/A si no existe, sin insights inventados, sin fallback demo silencioso |
| `empty` | Empty states, sin KPIs ni charts |

En `datasetMode = "real"`:
- `resolveModuleKpis` no cae silenciosamente en demoKpis; emite tarjetas N/A si no hay datos.
- Insights y recomendaciones mock no se muestran.
- El waterfall usa `salesKpis` reales cuando `grossRevenue` o `netRevenueYtd` están disponibles.

## Planes de Acción

Un plan de acción contiene nombre, objetivo, insight origen, owner, prioridad, fecha objetivo, estado, checklist y asociaciones opcionales a conversación/proyecto.
