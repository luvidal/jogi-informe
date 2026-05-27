import { analyzeColor } from './contrast'
import { HeaderBand, RosterChips } from './header'
import { Callouts } from './callouts'
import { PerfilMatrix } from './perfilmatrix'
import { SituacionTables } from './situaciontables'
import { ResumenSection } from './resumensection'
import { PoliticasSection } from './politicassection'
import { Footer, SectionTitle } from './primitives'
import type { InformeInput } from './types'
import './informe.css'

function brandStyle(brand: InformeInput['brand']): React.CSSProperties {
  const primary = analyzeColor(brand.primary)
  const secondary = analyzeColor(brand.secondary)
  const accent = analyzeColor(brand.accent)
  // Accent-only primary (mid-luminance brand color) falls back to secondary as
  // the band color; the analyzed primary is still kept for fine-line accents.
  const effectivePrimary = primary.accentOnly ? secondary : primary
  return {
    ['--informe-primary' as string]: effectivePrimary.hex,
    ['--informe-secondary' as string]: secondary.hex,
    ['--informe-accent' as string]: accent.hex,
    ['--informe-on-primary' as string]: effectivePrimary.foreground,
    ['--informe-on-accent' as string]: accent.foreground,
  } as React.CSSProperties
}

export interface InformeProps {
  input: InformeInput
}

/**
 * Top-level composition. Three major groups separated by `break-before: page`
 * in CSS, content inside each group flows freely:
 *
 *   Page 1 — Resumen group: header + callouts + roster chips + 3 Resumen tables
 *   Page 2+ — Perfil group: matrix (N≤3) or stacked (N≥4)
 *   Page 3+ — Situación group: 4 category-grouped tables (Persona col at N>1)
 *
 * Brand colors flow in via `input.brand` → CSS variables; the rest is
 * presentation. No fetch, no calc, no state.
 */
export function Informe({ input }: InformeProps): JSX.Element {
  return (
    <article className='informe-root' style={brandStyle(input.brand)}>
      <section className='informe-page informe-page--first informe-group informe-group--resumen'>
        <HeaderBand meta={input.meta} brand={input.brand} cliente={input.cliente} />
        <Callouts callouts={input.resumen.callouts} />
        <RosterChips applicants={input.applicants} />
        <SectionTitle eyebrow='Resumen' subtitle='Síntesis financiera de la solicitud'>
          Resumen Financiero
        </SectionTitle>
        <ResumenSection tables={input.resumen.tables} />
      </section>

      <section className='informe-page informe-group informe-group--perfil'>
        <SectionTitle
          eyebrow='Perfil'
          subtitle={
            input.applicants.length === 1
              ? 'Antecedentes personales, laborales y comerciales'
              : `Antecedentes comparados — ${input.applicants.length} solicitantes`
          }
        >
          Perfil
        </SectionTitle>
        <PerfilMatrix applicants={input.applicants} />
      </section>

      <section className='informe-page informe-group informe-group--situacion'>
        <SectionTitle
          eyebrow='Situación'
          subtitle={
            input.applicants.length === 1
              ? 'Deudas, propiedades, vehículos e inversiones'
              : 'Por categoría, agrupando a todos los solicitantes'
          }
        >
          Situación Patrimonial
        </SectionTitle>
        <SituacionTables applicants={input.applicants} />
      </section>

      {input.politicasCredito && (
        <section className='informe-page informe-group informe-group--politicas'>
          <SectionTitle
            eyebrow='Políticas de Crédito'
            subtitle='Topes por inversionista vs. indicadores del cliente'
          >
            {input.politicasCredito.title}
          </SectionTitle>
          <PoliticasSection block={input.politicasCredito} />
        </section>
      )}

      <Footer companyName={input.brand.companyName ?? null} />
    </article>
  )
}

export default Informe
