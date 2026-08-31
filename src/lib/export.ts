const escapeCsvCell = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`

export function safeFileName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function downloadCsv(fileName: string, headers: string[], rows: unknown[][]) {
  const contents = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\r\n')
  downloadBlob(fileName, new Blob([`\uFEFF${contents}`], { type: 'text/csv;charset=utf-8' }))
}

function downloadBlob(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

const escapeHtml = (value: unknown) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;')

export interface PrintableRow {
  label: string
  value: unknown
  detail?: unknown
}

export function openPrintableReport(input: {
  title: string
  subtitle?: string
  company?: string
  summary?: string
  rows: PrintableRow[]
}) {
  const rows = input.rows.map((row, index) => `
    <tr>
      <td class="number">${index + 1}</td>
      <td><strong>${escapeHtml(row.label)}</strong>${row.detail ? `<small>${escapeHtml(row.detail)}</small>` : ''}</td>
      <td>${escapeHtml(row.value)}</td>
    </tr>`).join('')

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(input.title)}</title>
    <style>
      *{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#17202a;margin:40px}header{border-bottom:3px solid #18b77a;padding-bottom:16px;margin-bottom:24px}h1{font-size:24px;margin:0 0 8px}.meta{color:#5f6b76;font-size:13px;line-height:1.5}.summary{margin:18px 0;padding:12px 16px;background:#eefbf5;border-left:4px solid #18b77a;font-weight:700}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#17202a;color:white;text-align:left;padding:10px}td{border:1px solid #dce2e7;padding:10px;vertical-align:top}.number{width:36px;color:#718096;text-align:center}small{display:block;color:#66737f;font-weight:400;margin-top:4px;white-space:pre-wrap}footer{margin-top:20px;color:#7b8791;font-size:10px}@media print{body{margin:16mm}.no-print{display:none}thead{display:table-header-group}tr{break-inside:avoid}}
    </style></head><body>
    <header><h1>${escapeHtml(input.title)}</h1><div class="meta">${input.subtitle ? `${escapeHtml(input.subtitle)}<br>` : ''}${input.company ? `Empresa: ${escapeHtml(input.company)}<br>` : ''}Generado: ${escapeHtml(new Date().toLocaleString('es-CO'))}</div></header>
    ${input.summary ? `<div class="summary">${escapeHtml(input.summary)}</div>` : ''}
    <table><thead><tr><th>#</th><th>Requisito / campo</th><th>Resultado</th></tr></thead><tbody>${rows}</tbody></table>
    <footer>Documento generado desde ADOC. Usa “Guardar como PDF” en el diálogo de impresión.</footer>
    </body></html>`

  const frame = document.createElement('iframe')
  frame.setAttribute('title', `Imprimir ${input.title}`)
  frame.style.position = 'fixed'
  frame.style.width = '1px'
  frame.style.height = '1px'
  frame.style.opacity = '0'
  frame.style.pointerEvents = 'none'
  document.body.appendChild(frame)

  const printWindow = frame.contentWindow
  if (!printWindow) {
    frame.remove()
    return false
  }
  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.document.title = input.title
  const cleanup = () => frame.remove()
  printWindow.addEventListener('afterprint', cleanup, { once: true })
  window.setTimeout(() => {
    printWindow.focus()
    printWindow.print()
  }, 100)
  window.setTimeout(cleanup, 60_000)
  return true
}
