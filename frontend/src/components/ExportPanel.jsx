import { useState } from 'react'

const CSV_COLUMNS = [
  { key: 'texto_original', label: 'Texto original', defaultChecked: true, getValue: result => result.texto_original ?? '' },
  { key: 'texto_limpio', label: 'Texto limpio', defaultChecked: true, getValue: result => result.texto_limpio ?? '' },
  { key: 'tokens', label: 'Tokens', defaultChecked: true, getValue: result => JSON.stringify(result.tokens_generados ?? result.tokens ?? []) },
  { key: 'tokens_sin_stopwords', label: 'Tokens sin stopwords', defaultChecked: true, getValue: result => JSON.stringify(result.tokens_sin_stopwords ?? result.tokens ?? []) },
  { key: 'texto_procesado', label: 'Texto procesado final', defaultChecked: true, getValue: result => result.texto_procesado ?? '' },
  { key: 'total_tokens', label: 'Total de tokens', defaultChecked: true, getValue: result => result.total_tokens ?? 0 },
  { key: 'tokens_unicos', label: 'Tokens únicos', defaultChecked: false, getValue: result => result.tokens_unicos ?? 0 },
  { key: 'frecuencias', label: 'Frecuencias', defaultChecked: false, getValue: result => JSON.stringify(result.frecuencias ?? []) },
  { key: 'configuracion', label: 'Configuración aplicada', defaultChecked: false, getValue: result => JSON.stringify(result.configuracion ?? {}) },
]

const DEFAULT_CSV_COLUMNS = CSV_COLUMNS.filter(col => col.defaultChecked).map(col => col.key)

const CSV_GROUPS = [
  { title: 'Datos principales', keys: ['texto_original', 'texto_limpio', 'texto_procesado'] },
  { title: 'Resultados del procesamiento', keys: ['tokens', 'tokens_sin_stopwords', 'total_tokens', 'tokens_unicos'] },
  { title: 'Trazabilidad', keys: ['frecuencias', 'configuracion'] },
]

export default function ExportPanel({ result }) {
  const [filename, setFilename] = useState('')
  const [saved, setSaved] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [csvSuccess, setCsvSuccess] = useState(false)
  const [csvColumns, setCsvColumns] = useState(DEFAULT_CSV_COLUMNS)

  const hasData = result && result.tokens && result.tokens.length > 0
  const selectedCsvColumns = CSV_COLUMNS.filter(col => csvColumns.includes(col.key))

  async function handleSave() {
    if (!hasData) return
    setLoading(true)
    setError(null)
    setSaved(null)
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texto_original: result.texto_original,
          texto_limpio: result.texto_limpio,
          texto_procesado: result.texto_procesado,
          tokens_generados: result.tokens_generados,
          tokens_sin_stopwords: result.tokens_sin_stopwords,
          tokens: result.tokens,
          total_tokens: result.total_tokens,
          tokens_unicos: result.tokens_unicos,
          frecuencias: result.frecuencias,
          metrics: result.metrics,
          configuracion: result.configuracion,
          filename: filename.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setSaved(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleDownload() {
    if (!saved) return
    window.location.href = `/api/export/${saved.filename}`
  }

  function toggleCsvColumn(key) {
    setCsvColumns(prev =>
      prev.includes(key) ? prev.filter(col => col !== key) : [...prev, key]
    )
  }

  function escapeCsv(value) {
    const text = String(value ?? '')
    return `"${text.replaceAll('"', '""')}"`
  }

  function handleCsvDownload() {
    if (!hasData || csvColumns.length === 0) return
    setCsvSuccess(false)
    const headers = ['id', ...selectedCsvColumns.map(col => col.key)]
    const row = [1, ...selectedCsvColumns.map(col => col.getValue(result))]
    const csv = [headers.map(escapeCsv).join(','), row.map(escapeCsv).join(',')].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename.trim() || 'dataset_procesado'}.csv`
    link.click()
    URL.revokeObjectURL(url)
    setCsvSuccess(true)
  }

  if (!hasData) {
    return (
      <section className="bg-slate-800 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-slate-100 mb-2">4. Exportar resultados y dataset procesado</h2>
        <p className="text-slate-500 text-sm">Procesa texto para habilitar la exportación.</p>
      </section>
    )
  }

  return (
    <section className="bg-slate-800 rounded-xl p-5 space-y-4">
      <h2 className="text-lg font-semibold text-slate-100">4. Exportar resultados y dataset procesado</h2>
      <p className="text-xs text-slate-400">
        El reporte <span className="font-mono text-violet-400">.txt</span> permite revisar los resultados del procesamiento. El dataset <span className="font-mono text-violet-400">.csv</span> conserva las columnas seleccionadas y puede utilizarse en etapas posteriores como vectorización o análisis textual.
      </p>

      <div className="bg-slate-900 rounded-lg p-3 space-y-2">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Columnas para el dataset CSV</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CSV_GROUPS.map(group => (
            <div key={group.title} className="border border-slate-800 rounded-lg p-3 space-y-2">
              <p className="text-xs font-semibold text-violet-300 uppercase tracking-wide">{group.title}</p>
              {group.keys.map(key => {
                const col = CSV_COLUMNS.find(item => item.key === key)
                return (
                  <label key={key} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={csvColumns.includes(key)}
                      onChange={() => toggleCsvColumn(key)}
                      className="accent-violet-500"
                    />
                    {col.label}
                  </label>
                )
              })}
            </div>
          ))}
        </div>
        {csvColumns.length === 0 && <p className="text-red-400 text-xs">Debe seleccionar al menos una columna para exportar el dataset.</p>}
      </div>

      {selectedCsvColumns.length > 0 && (
        <div className="bg-slate-900 rounded-lg p-3 space-y-2">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Vista previa del dataset CSV</p>
          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="text-xs w-full min-w-max">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="px-3 py-2 text-left">id</th>
                  {selectedCsvColumns.map(col => (
                    <th key={col.key} className="px-3 py-2 text-left">{col.key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="text-slate-300">
                  <td className="px-3 py-2 font-mono">1</td>
                  {selectedCsvColumns.map(col => (
                    <td key={col.key} className="px-3 py-2 max-w-48 truncate font-mono">
                      {String(col.getValue(result) ?? '')}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-end">
        <div>
          <label className="text-xs text-slate-400 mb-1 block">Nombre del archivo de salida</label>
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden focus-within:border-violet-500">
            <input
              value={filename}
              onChange={e => setFilename(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="resultado_nlp"
              className="flex-1 bg-transparent text-slate-100 px-3 py-2 text-sm focus:outline-none"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            No incluya extensión. La aplicación generará .txt o .csv según la opción elegida.
          </p>
        </div>

        <div className="flex flex-wrap lg:flex-nowrap gap-3 lg:justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="h-11 px-6 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition whitespace-nowrap"
          >
            {loading ? 'Guardando...' : 'Exportar reporte .txt'}
          </button>

          <button
            onClick={handleCsvDownload}
            disabled={csvColumns.length === 0}
            className="h-11 px-6 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-lg text-sm font-semibold transition whitespace-nowrap"
          >
            Exportar dataset .csv
          </button>

          {saved && (
            <button
              onClick={handleDownload}
              className="h-11 flex items-center gap-2 px-6 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar .txt
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {csvSuccess && <p className="text-emerald-400 text-sm">Dataset CSV generado correctamente.</p>}
      {saved && (
        <p className="text-emerald-400 text-sm">
          Reporte TXT generado correctamente. <span className="font-mono">{saved.filename}</span> — {saved.tokens} tokens
        </p>
      )}
    </section>
  )
}
