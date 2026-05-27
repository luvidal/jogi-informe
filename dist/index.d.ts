interface InformePerfilField {
    label: string;
    value: string;
    /** Hints "render outside the matrix as a stacked list" (Design layer; lift-and-shift ignores). */
    longText?: boolean;
}
interface InformePerfilSubsection {
    section: string;
    subsection?: string;
    fields: InformePerfilField[];
}
interface ColumnConfig {
    key: string;
    label: string;
    align?: 'left' | 'right' | 'center';
    width?: string;
    format?: 'currency' | 'integer' | 'text';
}
interface SituacionRow {
    [columnKey: string]: string | number | null | undefined;
}
interface InformeApplicant {
    role: 'titular' | 'codeudor';
    label: string;
    perfil: InformePerfilSubsection[];
    situacion: {
        deudas: {
            columns: ColumnConfig[];
            rows: SituacionRow[];
        };
        propiedades: {
            columns: ColumnConfig[];
            rows: SituacionRow[];
        };
        vehiculos: {
            columns: ColumnConfig[];
            rows: SituacionRow[];
        };
        inversiones: {
            columns: ColumnConfig[];
            rows: SituacionRow[];
        };
    };
}
interface InformeCallout {
    label: string;
    value: number | null;
    format: 'currency' | 'percent' | 'uf';
}
interface InformeResumenRow {
    label: string;
    values: Array<number | string | null>;
    type?: 'data' | 'subheader' | 'total' | 'grandtotal';
    format?: 'currency' | 'percent' | 'integer';
}
interface InformeResumenTable {
    title: string;
    headers: string[];
    rows: InformeResumenRow[];
}
type PoliticasRatio = 'div_renta' | 'carga_financiera' | 'deuda_precio_venta' | 'edad_plazo';
type PoliticasCellState = 'pass' | 'fail' | 'missing-cap' | 'missing-value';
type PoliticasRowStatus = 'compliant' | 'incomplete' | 'noncompliant';
interface InformePoliticasCell {
    ratio: PoliticasRatio;
    ratioLabel: string;
    /** Client-side computed value (percent ratios stored as decimals, edad+plazo as integer years). */
    clientValue: number | null;
    /** Investor max-cap — same scale as `clientValue`. */
    cap: number | null;
    state: PoliticasCellState;
}
interface InformePoliticasRow {
    investorName: string;
    status: PoliticasRowStatus;
    cells: InformePoliticasCell[];
}
interface InformePoliticasBlock {
    title: string;
    /** One-line headline (e.g. `2 de 5 inversionistas dispuestos a financiar`)
     *  or the empty-state CTA when the analyst's company has no configured
     *  investors. The host decides which copy to emit. */
    summary: string;
    rows: InformePoliticasRow[];
}
interface InformeInput {
    meta: {
        requestLabel: string;
        generatedAt: string;
        ufValue: number | null;
        ufDate?: string;
    };
    brand: {
        companyName?: string;
        logoUrl?: string;
        primary?: string;
        secondary?: string;
        accent?: string;
    };
    cliente: {
        nombre: string;
        rut: string;
    } | null;
    applicants: InformeApplicant[];
    resumen: {
        callouts: InformeCallout[];
        tables: InformeResumenTable[];
    };
    /** Políticas de Crédito — investor-vs-client compliance matrix. Rendered at
     *  the END of the PDF (page-break before). Omitted when the analyst has no
     *  company; present with `rows: []` when they have a company but no
     *  configured investors (renderer shows the empty-state CTA). */
    politicasCredito?: InformePoliticasBlock;
}

interface InformeProps {
    input: InformeInput;
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
declare function Informe({ input }: InformeProps): JSX.Element;

export { type ColumnConfig, Informe, type InformeApplicant, type InformeCallout, type InformeInput, type InformePerfilField, type InformePerfilSubsection, type InformePoliticasBlock, type InformePoliticasCell, type InformePoliticasRow, type InformeProps, type InformeResumenRow, type InformeResumenTable, type PoliticasCellState, type PoliticasRatio, type PoliticasRowStatus, type SituacionRow };
