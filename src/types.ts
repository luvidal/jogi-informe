// @jogi/informe — public input contract.
//
// `InformeInput` is the data the host (jogi main app) ships to <Informe />.
// It is plain-JSON; the satellite never imports domain code or schemas.

export interface InformePerfilField {
  label: string
  value: string
  /** Hints "render outside the matrix as a stacked list" (Design layer; lift-and-shift ignores). */
  longText?: boolean
}

export interface InformePerfilSubsection {
  section: string
  subsection?: string
  fields: InformePerfilField[]
}

export interface ColumnConfig {
  key: string
  label: string
  align?: 'left' | 'right' | 'center'
  width?: string
  format?: 'currency' | 'integer' | 'text'
}

export interface SituacionRow {
  [columnKey: string]: string | number | null | undefined
}

export interface InformeApplicant {
  role: 'titular' | 'codeudor'
  label: string
  perfil: InformePerfilSubsection[]
  situacion: {
    deudas:      { columns: ColumnConfig[]; rows: SituacionRow[] }
    propiedades: { columns: ColumnConfig[]; rows: SituacionRow[] }
    vehiculos:   { columns: ColumnConfig[]; rows: SituacionRow[] }
    inversiones: { columns: ColumnConfig[]; rows: SituacionRow[] }
  }
}

export interface InformeCallout {
  label: string
  value: number | null
  format: 'currency' | 'percent' | 'uf'
}

export interface InformeResumenRow {
  label: string
  values: Array<number | string | null>
  type?: 'data' | 'subheader' | 'total' | 'grandtotal'
  format?: 'currency' | 'percent' | 'integer'
}

export interface InformeResumenTable {
  title: string
  headers: string[]
  rows: InformeResumenRow[]
}

export type PoliticasRatio = 'div_renta' | 'carga_financiera' | 'deuda_precio_venta' | 'edad_plazo'
export type PoliticasCellState = 'pass' | 'fail' | 'missing-cap' | 'missing-value'
export type PoliticasRowStatus = 'compliant' | 'incomplete' | 'noncompliant'

export interface InformePoliticasCell {
  ratio: PoliticasRatio
  ratioLabel: string
  /** Client-side computed value (percent ratios stored as decimals, edad+plazo as integer years). */
  clientValue: number | null
  /** Investor max-cap — same scale as `clientValue`. */
  cap: number | null
  state: PoliticasCellState
}

export interface InformePoliticasRow {
  investorName: string
  status: PoliticasRowStatus
  cells: InformePoliticasCell[]
}

export interface InformePoliticasBlock {
  title: string
  /** One-line headline (e.g. `2 de 5 inversionistas dispuestos a financiar`)
   *  or the empty-state CTA when the analyst's company has no configured
   *  investors. The host decides which copy to emit. */
  summary: string
  rows: InformePoliticasRow[]
}

export interface InformeInput {
  meta: {
    requestLabel: string
    generatedAt: string
    ufValue: number | null
    ufDate?: string
  }
  brand: {
    companyName?: string
    logoUrl?: string
    primary?: string
    secondary?: string
    accent?: string
  }
  cliente: { nombre: string; rut: string } | null
  applicants: InformeApplicant[]
  resumen: {
    callouts: InformeCallout[]
    tables: InformeResumenTable[]
  }
  /** Políticas de Crédito — investor-vs-client compliance matrix. Rendered at
   *  the END of the PDF (page-break before). Omitted when the analyst has no
   *  company; present with `rows: []` when they have a company but no
   *  configured investors (renderer shows the empty-state CTA). */
  politicasCredito?: InformePoliticasBlock
}
