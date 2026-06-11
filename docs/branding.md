# Nexus Brand Identity

## What is Nexus?

**Nexus** is the commercial intelligence layer for CPG revenue teams. It sits at the intersection of data, AI, and business strategy — transforming raw commercial data into decisions that move the needle.

The name **Nexus** (from Latin: *connection*, *binding*) represents the connective tissue between:
- Data and insight
- Analysis and action
- Teams and decisions

**Tagline:** *Cerebro Comercial* — The commercial brain.

---

## Mission

Empower CPG revenue teams to make faster, better-informed decisions by putting the analytical power of a seasoned commercial analyst in every manager's hands — through natural language, not dashboards.

---

## Target User

**Commercial managers in CPG companies:**
- Revenue managers, trade marketing, finance
- Work with sell-in, sell-out, trade spend, channel data
- Need answers fast, not analysis frameworks
- Move between Excel, PowerPoint, and WhatsApp constantly
- Frustrated by BI tools that require a data analyst intermediary

Nexus speaks their language. It understands "¿por qué cayó el sell-out en supermercados?" as well as any analyst would.

---

## Personality

| Trait | What it means | What it looks like |
|---|---|---|
| **Premium** | Commands respect. Feels expensive. | Dark, refined UI. No clutter. Intentional whitespace. |
| **Analytical** | Data-forward. Numbers are the heroes. | Large KPI values. Charts front and center. Minimal decorative elements. |
| **Modern** | Cutting-edge without being gimmicky. | Smooth animations. AI-native interactions. Clean iconography. |
| **Executive** | Speaks the language of business. | Revenue terms, not tech jargon. Spanish business vocabulary. |
| **Trustworthy** | Consistent, precise, reliable. | Predictable patterns. No surprises. Clear error states. |
| **Empowering** | Makes the complex simple. | Plain-language AI explanations. Actionable insights. |

### What Nexus is NOT
- Not a traditional BI dashboard (no drag-and-drop report builders)
- Not a chatbot (it's an analytical agent with commercial expertise)
- Not consumer-grade (no playful colors, no emoji in UI, no rounded cartoon aesthetics)
- Not academic (no jargon, no footnotes, no methodology explanations)

---

## Visual Identity

### Logo

The Nexus logo uses the `public/logo_nexus.svg` asset: an orbital connected-node mark in white. It visualises the core brand metaphor: commercial signals connected into intelligence.

**Construction:**
- Source asset: `public/logo_nexus.svg`
- Bounding box: 1000×1000 viewBox
- Outer circular orbit with three crossing elliptical paths
- Four node dots distributed around the system
- Fill/stroke: white, designed for dark backgrounds

**Usage rules:**
- Always on dark backgrounds (`background` or `surface`)
- Minimum icon size: 24px; minimum full lockup: 80px
- Never recolor, rotate, stretch, or add effects
- Clear space: minimum 50% of icon width on all sides
- Wordmark: "Nexus" in Geist Sans bold, "Cerebro Comercial" in Geist Sans regular, 6px tracking (text-xs tracking-widest uppercase)

**Sizes:**
- `sm`: icon 24px — top of mobile nav, favicon
- `md`: icon 32px — desktop sidebar header (default)
- `lg`: icon 40px — landing page, onboarding

### Color System

#### Primary: Nexus Purple `#8B5CF6`
The signature color of the Nexus brand. It signals intelligence, depth, and premium positioning.

Use for:
- All primary call-to-action buttons
- AI agent avatar / message backgrounds
- Active navigation states
- Focus rings and selection indicators
- Chart series 1 (sell-in, primary metric)

Never use for: decorative backgrounds, large filled areas (too saturated), text on light backgrounds.

#### Accent: Insight Teal `#00E0B8`
The second brand color. It signals live data, fresh connections, and key insights.

Use for:
- Live data / connected source indicators
- Chart series 2 (sell-out, secondary metric)
- Special highlights and callouts
- The Nexus logo gradient endpoint

Never use for: error states, warnings, or primary actions (reserved for purple).

#### Dark Surface Scale
Six steps of near-black create depth and hierarchy:

```
#050509  background   ← App root (the void)
#0B0B10  surface      ← Default panels and cards
#12121A  elevated     ← Inputs, modals, elevated cards
#181824  soft         ← Hover fills
#1C1C2C  hover        ← Active hover state
#27273A  border       ← Lines, separators
```

Think of surfaces as layers of glass on a dark surface — each step slightly closer to the light.

#### Semantic Colors

| Color | Value | Signal |
|---|---|---|
| Success | `#10B981` | Positive trend, goal achieved, completed |
| Danger | `#FB7185` | Negative trend, error, at-risk, destructive action |
| Warning | `#FACC15` | Caution, pending, needs attention |
| Info | `#38BDF8` | Neutral information, data annotation |

**Usage rule:** Semantic colors appear only at 15% opacity for backgrounds, 100% for text/icons, 25% for borders. Never fill large areas with semantic colors.

---

## Typography

### Primary Typeface: Geist Sans

Chosen for:
- Technical precision — clean, geometric, data-friendly
- Premium positioning — Vercel's brand face signals modern dev excellence
- Excellent legibility at small sizes (critical for dense data UIs)
- No decorative elements — pure function

**Weights in use:** 400 (regular), 500 (medium), 600 (semibold), 700 (bold).

### Monospace: Geist Mono
For code blocks, dataset previews, API keys, and technical metadata.

### Number Typography
Metrics and KPI values always appear in **bold, tabular figures**. Numbers are the message — they are never secondary.

- Hero KPIs: `text-metric-xl font-bold` (40px)
- Standard KPIs: `text-metric-lg font-bold` (32px) or `text-2xl font-bold` (24px)
- Change indicators: `text-xs font-medium` with trend icon

### Label Convention
Category labels, field names, and section titles use **uppercase + tracked** styling to visually separate metadata from content:

```
text-xs font-medium text-text-muted uppercase tracking-wide
```

---

## Voice & Tone

Nexus speaks **Spanish (es-AR)** throughout. All UI copy, AI responses, labels, and onboarding use Argentine Spanish business vocabulary.

### Principles

1. **Brevity over completeness** — Say it in 5 words if 10 are possible.
2. **Action over description** — "Ver análisis" not "Haz clic aquí para ver el análisis completo".
3. **Confidence, not hedging** — "El sell-out cayó 8%" not "Podría ser que el sell-out haya caído alrededor del 8%".
4. **Business vocabulary** — Sell-in, sell-out, passthrough, trade spend, EBITDA, JBP — not translations.

### Tone by Context

| Context | Tone | Example |
|---|---|---|
| Empty states | Encouraging, actionable | "Conectá tu primera fuente de datos para empezar a analizar." |
| Errors | Clear, matter-of-fact | "No pudimos procesar el archivo. Revisá el formato e intentá de nuevo." |
| AI responses | Expert, direct | "El sell-out en supermercados cayó 8,3% vs. el mismo período. La caída se concentra en la categoría bebidas (-14%)." |
| Success | Brief, confident | "Archivo procesado correctamente." |
| Onboarding | Warm, guiding | "Nexus conecta tus fuentes comerciales y te ayuda a entender qué está pasando en tu negocio." |
| Buttons | Imperative verbs | "Crear proyecto", "Ver análisis", "Conectar fuente", "Descargar reporte" |

### Anti-patterns in copy
- ❌ "¡Excelente! Tu archivo fue subido exitosamente." (exclamation marks, filler praise)
- ❌ "Por favor ingresá tu email para continuar." ("Por favor" is filler)
- ❌ "Hacé clic aquí" (vague directives)
- ❌ "Esta sección está actualmente en desarrollo." (expose implementation details)
- ✅ "Subí tu archivo." (direct imperative)
- ✅ "Ingresá tu email." (clean, direct)
- ✅ "Conectar fuente" (button label = verb phrase)

---

## Anti-Patterns (Visual)

Avoid these to maintain brand consistency:

| ❌ Don't | ✅ Do |
|---|---|
| Light backgrounds or white cards | Dark surfaces only |
| Gradients (except logo + chart fills) | Solid colors |
| Emoji in product UI | Lucide icons |
| Multiple icon libraries mixed | Lucide React exclusively |
| Rounded corners > 20px | Max `rounded-2xl` (20px) |
| More than 2 font weights per component | Pair bold + regular or medium + muted |
| Hardcoded hex colors in components | CSS token utility classes |
| Decorative illustrations | Data visualisations as the visual |
| Bright full-opacity semantic colors as fills | 15% opacity fills with full-opacity text |

---

## Platform Identity

### In Context

Nexus is a **B2B SaaS product** used in business settings:
- On a laptop during a commercial review meeting
- On a tablet while walking a retail floor
- Sent as a screenshot in a WhatsApp or Teams group
- Presented on a screen in a revenue planning session

Every design decision should hold up in these contexts. The dark theme reduces eye strain in meeting rooms. The high-contrast data presentation works on projected screens. The premium aesthetic commands respect in executive presentations.

### Relationship to Data

Data is never decorative in Nexus. Every chart, number, and label exists because it informs a decision. The UI chrome exists to frame and deliver data — not to compete with it.

This means:
- UI elements use low-contrast, muted colors
- Data elements use high-contrast, brand colors
- Empty space is intentional — it lets data breathe
- Animations are purposeful — they guide attention, not entertain
