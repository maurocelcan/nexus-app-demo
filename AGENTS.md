<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Nexus Prototype — Instrucciones para agentes

## Primero leer

1. `CLAUDE.md` — stack, comandos, arquitectura, convenciones
2. `docs/product-vision.md` — qué es Nexus y para quién
3. `docs/architecture.md` — estructura técnica detallada

## Reglas de trabajo

- **No hardcodear datos de negocio en JSX.** Usar `src/data/`.
- **No hardcodear colores literales.** Usar tokens del tema Tailwind v4.
- **No crear backend real**, no usar APIs externas.
- **No agregar dependencias** sin justificar y documentar.
- Respetar separación de responsabilidades: tipos en `types/`, mocks en `data/`, lógica de estado en `stores/`.
- Usar componentes reutilizables de `src/components/ui/` en lugar de crear elementos ad-hoc.
- Mantener responsive en todos los breakpoints (mobile-first).
- Actualizar docs en `docs/` si se cambia arquitectura o flujos principales.
- Correr `npm run build` y `npx tsc --noEmit` antes de declarar tarea completa.

## Convenciones de código

- `"use client"` en la primera línea de cualquier componente que use hooks.
- Server Components no llevan `"use client"`.
- Exports nombrados en componentes de librería, default export en pages.
- `cn()` de `src/lib/utils.ts` para combinar clases Tailwind.
- `generateId()` para IDs únicos. `sleep()` para simular latencia.

## Lógica de auth mock

- Login: comparar con `MOCK_USER` y `MOCK_PASSWORD` de `src/data/mock-user.ts`.
- Estado persistido con Zustand persist en localStorage (`nexus-auth`).
- Redirigir a `/onboarding` si `isOnboarded === false`, a `/workspace` si ya onboarded.

## Simulación de comportamiento agéntico

El chat simula un flujo multi-step:
1. Mostrar pasos de `AGENT_STEPS` de `src/data/mock-conversations.ts` uno a uno con delay.
2. Detectar intención en la pregunta (passthrough, portafolio, genérico).
3. Devolver `Message` con `blocks[]` generados por `generatePassthroughResponse()`, etc.
4. Los bloques se renderizan en `MessageBlocks` por tipo: executive-summary, kpi-strip, chart, recommendations, etc.
