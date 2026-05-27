import { useState } from 'react'

export default function ExportPanel({ result }) {
  const [filename, setFilename] = useState('')
  const [saved, setSaved] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const hasData = result && result.tokens && result.tokens.length > 0

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
          texto_limpio: result.texto_limpio,
          tokens: result.tokens,
          total_tokens: result.total_tokens,
          tokens_unicos: result.tokens_unicos,
          frecuencias: result.frecuencias,
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

  if (!hasData) {
    return (
      <section className="bg-slate-800 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-slate-100 mb-2">4. Exportar</h2>
        <p className="text-slate-500 text-sm">Procesa texto para habilitar la exportación.</p>
      </section>
    )
  }

  return (
    <section className="bg-slate-800 rounded-xl p-5 space-y-4">
      <h2 className="text-lg font-semibold text-slate-100">4. Exportar resultado</h2>
      <p className="text-xs text-slate-400">
        Se guarda un archivo <span className="font-mono text-violet-400">.txt</span> con el texto limpio, los tokens y la tabla de frecuencias.
      </p>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-48">
          <label className="text-xs text-slate-400 mb-1 block">Nombre del archivo (sin extensión)</label>
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden focus-within:border-violet-500">
            <input
              value={filename}
              onChange={e => setFilename(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="resultado_nlp"
              className="flex-1 bg-transparent text-slate-100 px-3 py-2 text-sm focus:outline-none"
            />
            <span className="px-3 text-slate-500 text-sm select-none">.txt</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="px-5 py-2 bg-violet-700 hover:bg-violet-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition"
        >
          {loading ? 'Guardando...' : 'Guardar .txt'}
        </button>

        {saved && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar .txt
          </button>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {saved && (
        <p className="text-emerald-400 text-sm">
          Guardado: <span className="font-mono">{saved.filename}</span> — {saved.tokens} tokens
        </p>
      )}
    </section>
  )
}
