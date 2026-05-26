# @jogi/informe — Printable Informe Satellite

Pure-presentation React component that renders a designer-grade printable informe (formerly "dossier") from a pre-computed `InformeInput`. Extracted from [jogi](../jogi) to isolate layout, theming, and print CSS from the data-producer host.

## Compact Instructions

When compacting, preserve: file paths changed, errors found, decisions made, contract changes. Drop: full file contents already read, tool output bodies.

## Communication Style

- **No emotional validation** — never say "I understand your frustration". Results matter, not words.
- **No excessive apologies** — don't apologize repeatedly. Fix the problem.
- **Be direct** — state facts, propose solutions, execute. Skip the fluff.
- **Ask for input** — when stuck or facing multiple approaches, ask rather than guessing.

## Tech Stack

- **TypeScript** + **React** (peer dep, ">=18")
- **tsup** for bundling (ESM + CJS + .d.ts)
- **Vitest** + **happy-dom** for unit + HTML-structure snapshot tests
- **Peers allowed**: `@jogi/reports` for pure formatters (`displayCurrencyCompact`). No domain code.

## Project Structure

```
src/
├── index.ts              # Re-export hub: <Informe>, InformeInput, ColumnConfig, SituacionRow
├── informe.tsx           # Top-level composition
├── header.tsx            # Compact header band / cover
├── perfilmatrix.tsx      # Perfil matrix renderer (with longText escape hatch)
├── situaciontables.tsx   # Category-grouped Situación tables
├── resumensection.tsx    # Page-1 callouts + 3 Resumen tables
├── primitives.tsx        # SectionTitle, DataTable, FieldGrid, Footer, etc.
├── contrast.ts           # Foreground-vs-background contrast picker
├── informe.css           # All print CSS (.informe-* prefix)
└── types.ts              # InformeInput, ColumnConfig, SituacionRow
```

## Code Rules

1. **File naming** → lowercase, no hyphens/underscores
2. **No `@/` imports** → relative within `src/`
3. **No domain leakage** — no `@jogi/situacion`, no `data/*.json`, nothing from `app/`. Inputs are plain JSON; brand colors are hex strings.
4. **Pure presentation** — no fetch, no calc, no React state beyond UI.
5. **API stability** — exported props and named exports must stay backward-compatible with jogi's call sites. Breaking changes update the host in the same handoff.
6. **CLAUDE.md maintenance** — update on contract/behavior changes.
7. **Test coverage** — HTML-structure snapshot tests for N=1, 2, 3 applicants.

## Commands

```bash
npm run build        # Build dist/ (ESM + CJS + types)
npm run dev          # Build in watch mode
npm test             # Run unit + snapshot tests
npm run test:watch   # Watch mode
```

## Consumer Integration

```json
"@jogi/informe": "github:luvidal/jogi-informe#<sha>"
```

Host calls:
```tsx
import { Informe } from '@jogi/informe'
import { toInformeInput } from './toinformeinput'

<Informe input={toInformeInput(snapshot)} />
```
