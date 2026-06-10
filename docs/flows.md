# Flujos de la aplicación — Nexus

## Flujo 1 — Login

1. Usuario entra a `/login` (o es redirigido desde `/`)
2. Ingresa email + password
3. Se valida contra `MOCK_USER` y `MOCK_PASSWORD`
4. Si es correcto: `login(user)` en auth-store
5. Si `isOnboarded === false` → `/onboarding`
6. Si `isOnboarded === true` → `/workspace`

**Credenciales:** `mauro@cpgteam.com` / `nexus123`

## Flujo 2 — Registro

1. Usuario entra a `/register`
2. Completa nombre, email, empresa, cargo, password
3. Se crea usuario mock con `generateId()`
4. `login(user)` en auth-store
5. Redirige a `/onboarding`

## Flujo 3 — Onboarding (4 pasos)

**Paso 1:** Crear workspace — nombre, industria, tamaño, región.
**Paso 2:** Seleccionar áreas activas (8 opciones, múltiple).
**Paso 3:** Conectar datos comerciales — Subir archivo, Conectar integración, Probar demo CPG o Continuar sin conectar datos.
**Paso 4:** Confirmación → "Ir al cerebro comercial" → `/workspace`.

Al finalizar: `setWorkspace()`, `setActiveAreas()`, `setOnboarded(true)`.

## Flujo 4 — Primera entrada (sin datos)

Si `getWorkspaceDatasetState(...) === "empty"` → el workspace y todos los módulos muestran empty states con opciones:
- Activar Demo CPG (carga `loadDemo()` y deja `activeDatasetSource = "demo"`)
- Adjuntar archivo → `/workspace/settings/data-sources`
- Conectar fuente → `/workspace/settings/data-sources`

No se muestran KPIs, charts, dashboards, insights de módulo ni tablas mock mientras el estado global sea `empty`.

## Flujo 4b — Estados globales de dataset

1. `empty`: no hay dataset utilizable activo. Ventas, Sell-Through, Finanzas, Trade, Supply, RGM, Planning y CRM muestran onboarding contextual.
2. `demo`: el usuario activa Demo CPG. Todos los módulos renderizan sus datasets mock enterprise, coherentes con Andes Consumer Goods.
3. `real`: el usuario carga o reemplaza un Excel/CSV. `replaceFileDataset()` activa `fileDataset`, recalcula KPIs y los módulos usan `semanticProfile`/KPIs reales.

El chat usa respuestas demo sólo si la fuente activa es `demo`; usa respuestas de dataset real si hay `ProcessedDataset`; y usa respuesta sin datos si el estado es `empty`.

## Flujo 5 — Chat agéntico

1. Usuario escribe en `ChatInput` o hace click en pregunta sugerida
2. Se crea mensaje de usuario y se agrega al store
3. Si es el primer mensaje, `detectConversationAreas()` asigna `areaIds` y `primaryAreaId` usando la fuente única `src/data/business-areas.ts`.
4. `getContextualAgentSteps(question)` genera pasos específicos según el tipo de pregunta (YoY, EBITDA, sell-through, canal, cobranza, 90 días, margen). Si no hay match, cae al `AGENT_STEPS` genérico.
5. Se muestran los pasos con delays aleatorios (300-520ms c/u)
6. Routing de respuesta (en orden de prioridad):
   - `getAdvisoryResponse(question)` — flujo guiado demo Caso 1 CPG: primero revisa preguntas YoY del guion (ACT1_YOY, ACT2A_YOY, ACT3_YOY, ACT4A_EBITDA_WHY, ACT4B_90DAYS_YOY), luego preguntas vs-presupuesto (ACT1/2/3/4 originales)
   - `getResponseForQuestion(question)` — respuestas genéricas (passthrough, portafolio, T2T, RGM, Supply, EBITDA, Trade, Forecast)
   - `generateRealDataResponse()` — dataset cargado por archivo
   - `generateNoDataResponse()` — sin fuente activa
7. Si la respuesta tiene `content` (texto introductorio), se activa streaming word-by-word en `MessageItem` vía `streamingMessageId` state
8. Se renderiza respuesta con `MessageBlocks` (kpi-strip, advisory-response, follow-up-questions / executive-summary, chart, recommendations, etc.)

### Sub-flujo — Respuestas del guion Caso 1 CPG

Las respuestas YoY están en `src/data/demo-advisory-flow.ts` y siguen la narrativa del guion demo:

| Acto | Pregunta clave | Response |
|------|---------------|---------|
| 1 | "¿Cómo estamos vs el año pasado en los KPIs?" | ACT1_YOY |
| 2a | "¿En qué canal está concentrado el crecimiento?" | ACT2A_YOY |
| 2b | "¿Hay problemas de cobranza?" | ACT2B_COBRANZA |
| 3 | "¿En qué zonas tenemos el peor sell-through?" | ACT3_YOY |
| 4a | "¿Por qué el EBITDA creció 51%?" | ACT4A_EBITDA_WHY |
| 4b | "¿Cuál es la prioridad para los próximos 90 días?" | ACT4B_90DAYS_YOY |

Cada respuesta YoY incluye un `content` intro de 1 línea que se muestra con streaming antes de los bloques.

## Flujo 6 — Módulo Ventas

Ruta: `/workspace/ventas`
- Header con filtros (período, producto, canal)
- 8 KPI cards
- 4 gráficos ECharts
- Tabla de SKUs con passthrough semáforo
- Panel de insights + acciones

## Flujo 6b — Módulo Sell-Through

Ruta: `/workspace/sell-through`

1. Usuario entra desde Áreas → Sell-Through.
2. Revisa `Resumen KPI` con filtros de período, SKU, canal, distribuidor y zona.
3. Cambia a `Mapa & PDVs`.
4. Usa `Trazar zona` para dibujar un rectángulo sobre el mapa mock, o `Usar zona demo` para aplicar una zona predefinida.
5. El panel lateral muestra KPIs de la zona: universo real, PDVs atendidos, compradores, no compradores, cobertura, facturación, volumen, mix, gap y oportunidad.
6. Revisa tabla de PDVs, productos con clientes compradores, ranking de clientes y mix real vs objetivo.
7. Selecciona SKU testigo y SKU objetivo para detectar PDVs recomendados.
8. Diseña una promoción mock y revisa revenue, volumen, margen, breakeven, ROI y recomendación.
9. Registra una dinámica para seguimiento semanal.
10. Opcionalmente crea un proyecto desde los KPIs de la zona; el proyecto queda con objetivos, KPIs, insights, próximos pasos y conversación asociada.

Todo el flujo es frontend/mock y no llama APIs externas.

## Flujo 6c — Módulos Enterprise y estado global

Los módulos Finanzas, Trade Marketing, Supply Chain, RGM, Planning, CRM y Sell-Through comparten el mismo gating:

1. Estado `empty`: renderizan `ModuleDatasetEmptyState`.
2. Estado `demo`: continúan con su dashboard mock específico.
3. Estado `real`: mantienen el mismo dashboard del módulo y reemplazan datos por KPIs/metadata resueltos desde el `ProcessedDataset`.

En estados `demo` y `real`, todos renderizan `ModuleDataSourceBanner` bajo el header del módulo. El banner evita headers divergentes entre Ventas, Sell-Through y el resto de módulos.

El header común de módulos siempre ofrece las mismas acciones: `Cargar datos` abre `/workspace/settings/data-sources` y `Nueva consulta` abre el chat principal. Los empty states mantienen el patrón común de Demo CPG o carga de dataset.

## Flujo 7b — Comportamiento por modo de dataset

### Modo `real` — dataset cargado por archivo

Cuando el usuario carga un archivo y `datasetState === "real"`:

**Ventas:**
- Si el dataset tiene `kpiFacts` (formato BIS): KPIs resueltos por período desde la capa canónica.
  - YTD → usa valores YTD del archivo con variación oficial del BIS.
  - QTD → columna Q1 del BIS.
  - U6M → columna U6M del BIS.
  - MTD → N/A (BIS no tiene ese corte).
- Si no tiene `kpiFacts` (formato genérico): calcula desde filas normalizadas con `calculateSalesKpis`.
- Labels de KPI sin "YTD" baked-in: "Sell-in", "Sell-out", "Net Revenue".
- Insights automáticos deshabilitados → se muestra aviso para usar el chat.

**Finanzas:**
- Las KPI cards financieras se sincronizan con el selector de año y período usando el bloque mensual de `Finanzas BIS`. Si el año seleccionado no tiene filas mensuales, las cards muestran `N/A` y no caen a otro año.
- Las cards superiores se muestran en dos filas: KPIs financieros y KPIs operativos/cobranza (`Dias_Cobro`, `Dias_Atraso`, `Monto_Factura_USD`, `Monto_Cobrado_USD`) cuando `Finanzas BIS` lo trae.
- El P&L real se construye como matriz mensual con `buildFinanzasPnlMatrix(dataset.financeMonthly, selectedYear, period)`. El filtro de año define las columnas mensuales visibles y el filtro de período define sólo la columna `Total período`. Incluye todas las líneas del bloque financiero de `Finanzas BIS`, separando montos de porcentajes. MTD muestra total N/A cuando no hay mes corriente claro, pero mantiene las columnas mensuales del año.
- EBITDA y margen usan la serie mensual real de `Finanzas BIS` (`Mes`, `EBITDA`, `EBITDA %`) y se filtran por período.
- El bloque visual de SKU se reemplaza en real por `Headcount` agregado, usando YTD/QTD/U6M según filtro y sumando las filas válidas del bloque comparativo de Finanzas BIS.
- Revenue por canal usa sólo datos reales disponibles: Net Revenue, EBITDA, Trade Spend y EBITDA % calculado.
- Si no hay insights reales, no se renderiza la sección de insights en modo real.

**Sell-Through:**
- En modo real, el módulo usa `sellThroughKpisFromDataset()` para los KPIs del header.
- El resumen usa `SellThrough Bis` para Net Revenue, Sell Out, clientes compradores, Foto Éxito, evolución, sell-in vs sell-out y ranking SKU.
- Si el archivo real no trae mix, margen u oportunidad PDV, el resumen conserva los datos demo/referenciales solicitados por cliente: `73% / 84%`, `36%` y `USD 244K`, con tooltip aclaratorio.
- El mapa usa `geoPdvFacts` del archivo `PDV_Retiro_Recoleta.xlsx` cuando existe.
- Los filtros de dataset real salen sólo del archivo real: SKUs/canales desde BIS y zonas/canales desde PDV. No se muestran SKUs ni zonas demo.
- Si no hay PDV real, `Mapa & PDVs` muestra vacío; no se inyectan puntos demo.
- Los gráficos reaccionan a filtros sólo cuando existe granularidad. Si el usuario filtra por zona o distribuidor y BIS no tiene serie temporal para esa dimensión, se muestra un mensaje contextual en lugar de reutilizar agregados.
- El constructor promocional calcula volumen necesario para sostener masa de contribución a partir de precio actual, precio promo, margen objetivo, mecánica y PDVs objetivo. En modo real se precarga desde la selección geográfica; si falta granularidad, queda en modo manual.

**Regla crítica:** `resolveModuleKpis` nunca hace fallback silencioso a demoKpis en modo real.
Si no hay datos reales, emite tarjetas N/A con razón explicativa.

## Flujo 7 — Adjuntar archivo

Desde `/workspace/settings/data-sources`:
1. Click "Adjuntar archivo"
2. Selección de XLSX/XLS/CSV.
3. Nexus lee hojas. Si detecta el formato Resumen Demo App (`Ventas`, `SellThrough`, `Finanzas`, `Ventas Bis` o variante), procesa `Ventas Bis` con el adapter específico y usa las demás hojas como contexto.
4. Si no es Resumen Demo App, sigue el pipeline legacy/semántico: detecta headers, tablas, áreas de negocio, KPIs, entidades y relaciones.
5. El modal muestra preview de KPIs, áreas detectadas, entidades, relaciones y mapeo de columnas editable.
6. El usuario puede ajustar mappings y reprocesar cuando aplica.
7. Al continuar se genera un `ProcessedDataset` normalizado y se activa como `fileDataset`.
8. Las hojas aparecen en “Fuentes administradas” con área/categoría detectada.

Si el usuario carga `Resumen Info Demo App` y luego un archivo geográfico de PDVs compatible, Nexus los combina como fuentes complementarias. Para otros archivos reales, reemplaza el dataset activo y refresca las fuentes administradas.

## Flujo 8 — Conectar integración

Desde `/workspace/settings/data-sources`:
1. Click "Conectar" en card de integración
2. Simula 1.5s de conexión
3. Status cambia a "Conectado" con fecha de conexión
4. Disponible "Sincronizar" y "Desconectar"

Desde onboarding:
1. Click "Conectar integración"
2. Modal con categorías: Hojas de cálculo, CRM, ERP, BI, Base de datos, Otra fuente
3. Selección de una integración conocida o fuente custom
4. "Conectar mock" agrega una integración conectada a Zustand/localStorage

## Flujo 11 — Proyectos y conversaciones

- Sidebar muestra Proyectos, Recientes y Áreas con secciones colapsables persistidas en `nexus-ui`.
- Recientes muestra máximo 5 conversaciones y link "Ver todos".
- `/workspace/conversations` lista todas las conversaciones con búsqueda y filtros por estado, proyecto y área.
- Los filtros por área usan IDs canónicos normalizados, no labels libres.
- Acciones de conversación: abrir, renombrar, asignar a proyecto con modal centrado, archivar/restaurar con feedback y eliminar con confirmación.
- Acciones de proyecto: editar nombre/descripción/área/objetivo/owner, crear nueva consulta dentro, archivar y eliminar.
- Al eliminar proyecto con conversaciones se elige entre dejarlas sin proyecto o eliminarlas.
- En la pestaña Resumen de proyecto hay un acceso directo para generar o abrir una presentación. En proyectos Demo CPG siempre está disponible y reutiliza el archivo generado si ya existe. En proyectos reales sólo se habilita cuando hay conversaciones, insights, objetivos, KPIs, brief u otro contexto suficiente.

## Flujo 12 — Planes de acción

Un plan convierte insights en tareas accionables para seguimiento comercial.

- Se crea desde el chat o desde Ventas.
- Puede asociarse a proyecto y conversación.
- Se ve en `/workspace/action-plans`.
- Permite marcar tareas completadas y cambiar estado: Borrador, En curso, Completado, Bloqueado.

## Flujo 9 — Settings

Tabs: Perfil · Workspace · Miembros · Seguridad · Apariencia
- Perfil: editar nombre, email, empresa, cargo, idioma, zona horaria
- Workspace: nombre, industria, región, áreas activas
- Miembros: lista + invitar mock
- Seguridad: cambiar password mock + sesiones + logout
- Apariencia: tema dark fijo + tokens de color

## Flujo 10 — Logout

Disponible en:
- Topbar → avatar → dropdown → "Cerrar sesión"
- Settings → Seguridad → "Cerrar sesión"

Acción: `logout()` → `router.push('/login')`
