# Roadmap — Nexus

## Fase 1 — Prototipo frontend mock (ACTUAL)

- [x] Autenticación simulada (login, registro)
- [x] Onboarding
- [x] Chat agéntico con respuestas mockeadas
- [x] Módulo Ventas con KPIs, gráficos y tabla de SKUs
- [x] Gestión de fuentes de datos (archivos + integraciones)
- [x] Semantic Commercial Data Engine frontend para XLSX/CSV reales (áreas, KPIs, entidades, mappings, relaciones)
- [x] Settings (perfil, workspace, miembros, seguridad)
- [x] Proyectos y conversaciones con persistencia local
- [x] Diseño premium dark con tokens centralizados

## Fase 2 — Backend y auth real

- [ ] Auth con NextAuth.js o Clerk (Google, email magic link)
- [ ] Base de datos (PostgreSQL via Prisma o Supabase)
- [ ] API routes para workspace, usuarios, proyectos
- [ ] Multitenancy básico por workspace

## Fase 3 — Conexión real a fuentes de datos

- [ ] Upload real de archivos Excel/CSV con procesamiento server-side
- [ ] Integración OAuth con Google Sheets
- [ ] Connector para HubSpot CRM
- [ ] Base SQL con editor de queries
- [ ] Pipeline de normalización de datos

## Fase 4 — Motor agéntico real

- [ ] Integración con Claude API (Anthropic)
- [ ] Sistema de herramientas (tool use) para consultar datasets
- [ ] Parser de intención comercial
- [ ] Generador de respuestas estructuradas (KPIs, charts, recs)
- [ ] Memoria conversacional por usuario y workspace
- [ ] Streaming de respuestas

## Fase 5 — Multiempresa y multitenant

- [ ] Aislamiento completo por organización
- [ ] Roles y permisos granulares por área y módulo
- [ ] Audit log de consultas y acciones
- [ ] SSO / SAML para empresas
- [ ] Admin panel de gestión

## Fase 6 — Exportaciones y presentaciones

- [ ] Generación de PDF de análisis
- [ ] Exportar a PowerPoint (presentaciones T2T)
- [ ] Exportar a Excel con datos y gráficos
- [ ] Compartir análisis con link público

## Fase 7 — Geo-inteligencia y ruteo

- [ ] Mapas de distribución por zona
- [ ] Ruteo de vendedores por cobertura
- [ ] Alertas geográficas de quiebres de stock
- [ ] Dashboard de cobertura por territorio
