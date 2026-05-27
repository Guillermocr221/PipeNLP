import { useState, useMemo } from 'react'

// ── Icons ──────────────────────────────────────────────────────
const Ic = {
  Doc:      (p) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Table:    (p) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>,
  Download: (p) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Save:     (p) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>,
  Check:    (p) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
}

// ── CSV column definitions (token-level) ───────────────────────
const CSV_COLUMNS = {
  'Identificadores': [
    { id: 'idx',            label: 'idx',            desc: 'Índice del token' },
    { id: 'doc_id',         label: 'doc_id',         desc: 'ID del documento' },
  ],
  'Contenido': [
    { id: 'token',          label: 'token',          desc: 'Token procesado' },
    { id: 'token_original', label: 'token_original', desc: 'Forma original' },
    { id: 'normalized',     label: 'normalized',     desc: 'Forma normalizada' },
    { id: 'length',         label: 'length',         desc: 'Largo en caracteres' },
  ],
  'Estadísticas': [
    { id: 'count',          label: 'count',          desc: 'Apariciones globales' },
    { id: 'freq',           label: 'freq',           desc: 'Frecuencia relativa' },
    { id: 'rank',           label: 'rank',           desc: 'Ranking por frecuencia' },
    { id: 'is_stopword',    label: 'is_stopword',    desc: 'Booleano stopword' },
  ],
}

const DEFAULT_SELECTED = new Set(['idx', 'token', 'token_original', 'count', 'freq', 'rank'])

function today() {
  return new Date().toISOString().slice(0, 10)
}

export default function ExportPanel({ result, text, opts }) {
  const [txtName, setTxtName]       = useState(`pipenlp_reporte_${today()}`)
  const [csvName, setCsvName]       = useState(`pipenlp_dataset_${today()}`)
  const [selectedCols, setSelectedCols] = useState(DEFAULT_SELECTED)
  const [saved, setSaved]           = useState(null)
  const [saving, setSaving]         = useState(false)
  const [saveError, setSaveError]   = useState(null)
  const [csvDone, setCsvDone]       = useState(false)

  const hasData = result && (result.tokens?.length ?? 0) > 0

  // Build token-level rows from frecuencias (one row per unique token)
  const tokenRows = useMemo(() => {
    if (!result?.frecuencias) return []
    return result.frecuencias.map((r, i) => ({
      idx:            i,
      doc_id:         'doc_001',
      token:          r.token,
      token_original: r.token,
      normalized:     r.token.toLowerCase(),
      length:         r.token.length,
      count:          r.conteo,
      freq:           r.frecuencia.toFixed(6),
      rank:           i + 1,
      is_stopword:    'false',
    }))
  }, [result])

  const allCols    = Object.values(CSV_COLUMNS).flat()
  const selectedList = allCols.filter(c => selectedCols.has(c.id))

  function toggleCol(id) {
    setSelectedCols(s => {
      const ns = new Set(s)
      if (ns.has(id)) ns.delete(id); else ns.add(id)
      return ns
    })
  }

  // Build TXT preview
  const freqData  = result?.frecuencias ?? []
  const tokAfter  = result?.tokens ?? []
  const metrics   = result?.metrics ?? {}
  const wordsOrig = metrics.palabras_originales ?? tokAfter.length
  const lineCount = text ? text.split('\n').length : 0
  const charCount = text?.length ?? 0
  const reduction = metrics.reduccion_porcentual ?? 0

  const pipelineSteps = [
    opts?.lowercase       && '  ✓ minúsculas',
    opts?.stripNumbers    && '  ✓ eliminar números',
    opts?.normalizeSpaces && '  ✓ normalizar espacios',
    opts?.removeSymbols   && `  ✓ limpiar símbolos (${opts.activeSymbols?.length ?? 0})`,
    opts?.tokenize        && `  ✓ tokenizar (${opts.tokenizeMode ?? 'words'})`,
    opts?.removeStopwords && `  ✓ stopwords (${opts.customStopwords?.length ?? 0} extra)`,
  ].filter(Boolean).join('\n')

  const top10Lines = freqData.slice(0, 10)
    .map((r, i) => `  ${String(i + 1).padStart(2)}. ${r.token.padEnd(20)} ${r.conteo}`)
    .join('\n')

  const txtPreview = `# PipeNLP · Reporte de procesamiento
# Generado: ${new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC

[ENTRADA]
  caracteres ........... ${charCount}
  palabras ............. ${wordsOrig}
  líneas ............... ${lineCount}

[PIPELINE]
${pipelineSteps || '  (ninguna operación activa)'}

[SALIDA]
  tokens totales ....... ${result?.total_tokens ?? 0}
  tokens únicos ........ ${result?.tokens_unicos ?? 0}
  reducción ............ ${reduction}%
  top token ............ "${freqData[0]?.token ?? '—'}" (${freqData[0]?.conteo ?? 0})

[TOP-10]
${top10Lines}`

  async function handleSave() {
    if (!hasData) return
    setSaving(true)
    setSaveError(null)
    setSaved(null)
    try {
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texto_original:     result.texto_original,
          texto_limpio:       result.texto_limpio,
          texto_procesado:    result.texto_procesado,
          tokens_generados:   result.tokens_generados,
          tokens_sin_stopwords: result.tokens_sin_stopwords,
          tokens:             result.tokens,
          total_tokens:       result.total_tokens,
          tokens_unicos:      result.tokens_unicos,
          frecuencias:        result.frecuencias,
          metrics:            result.metrics,
          configuracion:      result.configuracion,
          filename:           txtName.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      setSaved(await res.json())
    } catch (e) {
      setSaveError(e.message)
    } finally {
      setSaving(false)
    }
  }

  function handleDownloadTxt() {
    if (!saved) return
    window.location.href = `/api/export/${saved.filename}`
  }

  function escapeCsv(v) {
    const s = String(v ?? '')
    return `"${s.replaceAll('"', '""')}"`
  }

  function handleCsvDownload() {
    if (!hasData || selectedList.length === 0) return
    const headers = selectedList.map(c => c.label)
    const rows = tokenRows.map(row =>
      selectedList.map(c => escapeCsv(row[c.id])).join(',')
    )
    const csv = [headers.map(escapeCsv).join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href     = url
    link.download = `${csvName.trim() || 'pipenlp_dataset'}.csv`
    link.click()
    URL.revokeObjectURL(url)
    setCsvDone(true)
    setTimeout(() => setCsvDone(false), 2500)
  }

  if (!hasData) {
    return (
      <div className="card">
        <div className="card-body" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ color: 'var(--text-mute)', fontSize: 13 }}>
            Procesa texto para habilitar la exportación.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid-2" style={{ alignItems: 'start' }}>

      {/* ── TXT report card ── */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title"><Ic.Doc s={14} /> Reporte de procesamiento</div>
            <div className="card-sub">Resumen legible en formato <span className="mono">.txt</span> con métricas y configuración usada.</div>
          </div>
          <span className="badge slate">.txt</span>
        </div>
        <div className="card-body">
          <div className="stack" style={{ gap: 6 }}>
            <label className="mute" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nombre de archivo</label>
            <div className="row" style={{ gap: 6 }}>
              <input className="input" value={txtName} onChange={(e) => setTxtName(e.target.value)} style={{ flex: 1 }} />
              <span className="badge slate mono">.txt</span>
            </div>
          </div>

          {/* Preview */}
          <div className="code-col" style={{ marginTop: 14, maxHeight: 260, fontSize: 11.5, background: 'rgba(2,6,23,0.7)' }}>
            <div className="h" style={{ marginBottom: 8 }}>
              <span>· Preview</span>
              <span className="mono mute">{txtName}.txt</span>
            </div>
            {txtPreview}
          </div>

          <div className="row" style={{ gap: 8, marginTop: 14 }}>
            <button
              className="btn"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={handleSave}
              disabled={saving}
            >
              <Ic.Save s={13} /> {saving ? 'Guardando…' : 'Guardar'}
            </button>
            <button
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={saved ? handleDownloadTxt : handleSave}
              disabled={saving}
            >
              <Ic.Download s={13} /> Descargar .txt
            </button>
          </div>

          {saved && (
            <div className="badge green" style={{ marginTop: 10 }}>
              <Ic.Check s={11} /> Guardado · <span className="mono">{saved.filename}</span>
            </div>
          )}
          {saveError && (
            <div style={{ marginTop: 8, color: 'var(--red)', fontSize: 12 }}>{saveError}</div>
          )}
        </div>
      </div>

      {/* ── CSV dataset card ── */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title"><Ic.Table s={14} /> Dataset estructurado</div>
            <div className="card-sub">Selecciona columnas para exportar como dataset tabular.</div>
          </div>
          <span className="badge slate">.csv</span>
        </div>
        <div className="card-body">
          <div className="stack" style={{ gap: 10 }}>
            {Object.entries(CSV_COLUMNS).map(([cat, cols]) => (
              <div key={cat}>
                <div className="row between" style={{ marginBottom: 6 }}>
                  <div className="mute" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{cat}</div>
                  <span className="mono mute" style={{ fontSize: 11 }}>
                    {cols.filter(c => selectedCols.has(c.id)).length}/{cols.length}
                  </span>
                </div>
                <div className="stack" style={{ gap: 5 }}>
                  {cols.map(c => {
                    const on = selectedCols.has(c.id)
                    return (
                      <label
                        key={c.id}
                        className="row"
                        style={{
                          gap: 10, padding: '7px 10px', borderRadius: 7, border: '1px solid',
                          borderColor: on ? 'rgba(167,139,250,0.25)' : 'var(--line)',
                          background: on ? 'rgba(124,58,237,0.05)' : 'transparent',
                          cursor: 'pointer',
                        }}
                        onClick={() => toggleCol(c.id)}
                      >
                        <span className={'check' + (on ? ' on' : '')} />
                        <div style={{ flex: 1, lineHeight: 1.3 }}>
                          <div className="mono" style={{ fontSize: 12, color: on ? '#c4b5fd' : 'var(--text)' }}>{c.label}</div>
                          <div className="mute" style={{ fontSize: 11 }}>{c.desc}</div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="divider" />

          {/* CSV preview table */}
          <div className="mute" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
            Preview ({selectedList.length} columnas)
          </div>
          <div style={{ border: '1px solid var(--line)', borderRadius: 9, overflow: 'auto', maxHeight: 180 }}>
            <table className="tbl">
              <thead>
                <tr>
                  {selectedList.map(c => (
                    <th key={c.id} className="mono" style={{ whiteSpace: 'nowrap', fontSize: 10.5 }}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tokenRows.slice(0, 5).map((row, i) => (
                  <tr key={i}>
                    {selectedList.map(c => (
                      <td key={c.id} style={{ whiteSpace: 'nowrap' }}>
                        {String(row[c.id] ?? '').slice(0, 24)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="stack" style={{ gap: 6, marginTop: 14 }}>
            <label className="mute" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Nombre de archivo</label>
            <div className="row" style={{ gap: 6 }}>
              <input className="input" value={csvName} onChange={(e) => setCsvName(e.target.value)} style={{ flex: 1 }} />
              <span className="badge slate mono">.csv</span>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
            disabled={selectedList.length === 0}
            onClick={handleCsvDownload}
          >
            <Ic.Download s={13} />
            Descargar dataset ({tokenRows.length} filas × {selectedList.length} cols)
          </button>

          {csvDone && (
            <div className="badge green" style={{ marginTop: 10 }}>
              <Ic.Check s={11} /> Dataset CSV descargado correctamente.
            </div>
          )}
          {selectedList.length === 0 && (
            <div style={{ marginTop: 8, color: 'var(--red)', fontSize: 12 }}>
              Selecciona al menos una columna para exportar.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
