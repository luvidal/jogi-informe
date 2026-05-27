import type { InformePoliticasBlock, InformePoliticasCell } from './types'

function fmtCell(v: number | null, ratio: InformePoliticasCell['ratio']): string {
  if (v == null) return '—'
  if (ratio === 'edad_plazo') return String(Math.round(v))
  return `${(v * 100).toFixed(1)}%`
}

const STATE_LABEL: Record<InformePoliticasCell['state'], string> = {
  pass: 'Cumple',
  fail: 'No cumple',
  'missing-cap': 'Sin tope',
  'missing-value': 'Sin dato',
}

function PoliticasPill({ cell }: { cell: InformePoliticasCell }) {
  return (
    <span
      className={`informe-politicas__pill informe-politicas__pill--${cell.state}`}
      aria-label={STATE_LABEL[cell.state]}
    >
      <span className='informe-politicas__pill-num'>{fmtCell(cell.clientValue, cell.ratio)}</span>
      <span className='informe-politicas__pill-cmp'>≤</span>
      <span className='informe-politicas__pill-num'>{fmtCell(cell.cap, cell.ratio)}</span>
    </span>
  )
}

export interface PoliticasSectionProps {
  block: InformePoliticasBlock
}

/**
 * Políticas de Crédito — investor compliance matrix at the end of the PDF.
 * Rows = investors (status-tiered + sorted by host), columns = ratios.
 * Empty `rows` renders the empty-state summary (host has a company but no
 * configured investors).
 */
export function PoliticasSection({ block }: PoliticasSectionProps) {
  const colKeys: InformePoliticasCell['ratio'][] = block.rows[0]?.cells.map(c => c.ratio) ?? []
  const colLabels = block.rows[0]?.cells.map(c => c.ratioLabel) ?? []

  return (
    <div className='informe-politicas'>
      <p className='informe-politicas__summary'>{block.summary}</p>
      {block.rows.length === 0 ? null : (
        <table className='informe-politicas__table'>
          <thead>
            <tr>
              <th className='informe-politicas__th informe-politicas__th--label'>Inversionista</th>
              {colLabels.map((label, i) => (
                <th key={`${colKeys[i]}-${i}`} className='informe-politicas__th informe-politicas__th--num'>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, ri) => (
              <tr
                key={`${row.investorName}-${ri}`}
                className={`informe-politicas__row informe-politicas__row--${row.status}`}
              >
                <td className='informe-politicas__cell informe-politicas__cell--label'>{row.investorName}</td>
                {row.cells.map((cell, ci) => (
                  <td key={`${cell.ratio}-${ci}`} className='informe-politicas__cell informe-politicas__cell--num'>
                    <PoliticasPill cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
