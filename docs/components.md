# Components — Nexus Prototype

## Layout

- `Sidebar`: navegación principal, proyectos, recientes, áreas, rutas secundarias y menús de gestión.
- `Topbar`: workspace activo, estado de datos, notificaciones y menú de usuario.
- `NexusLogo`: identidad visual compartida.

El sidebar mantiene secciones colapsables para Proyectos, Recientes y Áreas. Los menús de conversaciones/proyectos usan overlay fijo para no cortarse por el scroll del sidebar.

## Chat

- `ChatInput`: composer con adjunto real `type=file`, autosize y foco accesible redondeado.
- `MessageItem`: render de mensajes de usuario/asistente. Acepta prop `isStreaming` para activar `StreamingText` en el `content` del asistente.
  - `StreamingText` (interno): revela el texto caracter a caracter con un cursor pulsante hasta completarlo. Velocidad por defecto 38ms/5 chars.
- `MessageBlocks`: bloques estructurados: resumen ejecutivo, KPIs, insights, gráficos, recomendaciones, acciones y follow-ups.
- `AgentThinking`: pasos mock del agente. En `workspace/page.tsx` se alimenta con `getContextualAgentSteps(question)` para mostrar pasos específicos según el tipo de consulta.

## Proyectos y Conversaciones

- Acciones de conversación: abrir, renombrar, asignar a proyecto, archivar y eliminar.
- `AreaBadge`, `AreaDot`, `AreaList` y `ConversationAreaBadge`: renderizan áreas desde `src/data/business-areas.ts` para evitar labels y colores inconsistentes.
- Acciones de proyecto: editar metadata, crear consulta dentro del proyecto, archivar y eliminar con confirmación.
- `Resumen` incluye el CTA `Generar presentación` / `Abrir presentación`. Reutiliza el modal de deck existente, agrega el archivo generado a `Archivos` y no duplica presentaciones generadas.
- `/workspace/conversations` agrega búsqueda, filtros por estado/proyecto/área, confirmación para eliminar y feedback para archivar/restaurar.

## Onboarding

El paso de datos usa tres caminos principales:
- Subir archivo: CSV, Excel o reportes exportados.
- Conectar integración: modal por categorías con conexión mock.
- Probar demo CPG: carga `Demo CPG Portfolio 2025-2026`.

El skip vive como acción secundaria: "Continuar sin conectar datos".

## Data Sources

Data Sources muestra archivos/tablas cargadas e integraciones. Las integraciones usan badges profesionales sin emojis ni dependencias externas.

Cuando se carga un Excel Resumen Demo App, el modal de detalle y el banner consumen el mismo `ProcessedDataset` que cualquier archivo real. El formato queda indicado en `metadata.sourceFormat`, las hojas procesadas aparecen como fuentes administradas y los KPIs resumidos se muestran desde `salesKpis` sin componentes especiales.

## Planes de Acción

Los planes muestran insight origen, conversación origen, proyecto asociado, checklist, owner, prioridad, fecha objetivo y estado.

## Sell-Through

La ruta `/workspace/sell-through` compone componentes UI existentes (`Card`, `Button`, `Badge`, `Dropdown`, `Select`, `Input`) para una experiencia de command center:

- Mapa visual mock con puntos de PDV y selección de zona.
- Trazado funcional por drag sobre el mapa mock para agrupar PDVs.
- Panel lateral de KPIs de zona.
- Tablas de PDVs, productos y ranking de clientes.
- Comparador de SKU testigo vs SKU objetivo.
- Constructor de promoción con simulación financiera simple.
- Seguimiento de dinámicas con timeline semanal mock.

No usa Google Maps ni dependencias externas; el mapa es una visualización frontend con datos centralizados en `src/data/mock-sell-through.ts`. La selección de área sí calcula PDVs incluidos y actualiza las secciones analíticas.
# Componentes — actualización Sell-Through real

## GoogleMapsPDVMap

`src/components/workspace/google-maps-pdv-map.tsx` acepta PDVs demo y PDVs derivados de `GeoPdvFact`.

- Si el PDV trae `lat`/`lng`, usa coordenadas reales.
- Si no trae coordenadas, conserva el posicionamiento porcentual demo `x`/`y`.
- El marcador distingue comprador, potencial y no comprador.
- La ficha muestra nombre, canal, zona, dirección, estado, volumen, facturación, ticket promedio y frecuencia cuando existen.

## Sell-through Page

`src/app/workspace/sell-through/page.tsx` mantiene dos modos:

- `demo`: usa `src/data/mock-sell-through.ts`.
- `real`: usa resolvers de `src/lib/sell-through-real.ts` y no cae a mocks.

En modo real, los cards y gráficos muestran N/A o empty state cuando falta granularidad.

## ScrollPanel

`src/components/ui/scroll-panel.tsx` es el wrapper estándar para contenido largo en dashboards.

- Limita altura visual sin cortar contenido.
- Agrega scroll interno para tablas, rankings y listas largas.
- Se usa en Sell-through para evolución de facturación, evolución de volumen, sell-in vs sell-out, ranking SKU y tabla/ranking de PDVs.

## Finanzas

`/workspace/finanzas` mantiene el layout demo/real con los mismos widgets:

- `KpiCard` en dos filas: KPIs financieros principales y KPIs operativos/cobranza desde `Finanzas BIS`.
- P&L simplificado period-aware desde `pnlFromKpiFacts`.
- El P&L real muestra el bloque financiero completo de `Finanzas BIS`, incluyendo líneas de monto y porcentaje diferenciadas.
- La visual de P&L es una matriz con primera columna sticky, header sticky y scroll horizontal interno. El selector de año usa los años disponibles en el bloque mensual.
- Gráfico real de EBITDA mensual y EBITDA % desde `Finanzas BIS`.
- Gráfico real de Headcount agregado para período anterior vs actual; las áreas quedan como detalle, no como eje principal.
- Tabla real de canal con Net Revenue, EBITDA, Trade Spend y EBITDA %.
- Empty states compactos cuando falta período o granularidad.

En modo real no se muestran productos ni tablas mock de `mock-finanzas`; esos quedan sólo para Demo CPG.
