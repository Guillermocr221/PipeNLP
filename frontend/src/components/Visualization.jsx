export default function Visualization({ result }) {
  if (!result) {
    return (
      <section className="bg-slate-800 rounded-xl p-5">
        <h2 className="text-lg font-semibold text-slate-100 mb-3">3. Visualización</h2>
        <p className="text-slate-500 text-sm">Procesa texto para ver los resultados aquí.</p>
      </section>
    )
  }

  return (
    <section className="bg-slate-800 rounded-xl p-5 space-y-5">
      <h2 className="text-lg font-semibold text-slate-100">3. Visualización</h2>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total tokens', value: result.total_tokens ?? 0 },
          { label: 'Tokens únicos', value: result.tokens_unicos ?? 0 },
          { label: 'Token más frecuente', value: result.frecuencias?.[0]?.token ?? '-' },
        ].map(s => (
          <div key={s.label} className="bg-slate-900 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-violet-400 truncate">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Texto limpio + tokens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">Texto limpio</p>
          <div className="bg-slate-900 rounded-lg p-3 text-sm text-slate-200 max-h-48 overflow-y-auto whitespace-pre-wrap break-words font-mono">
            {result.texto_limpio || <span className="text-slate-600 italic">(vacío)</span>}
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">
            Tokens <span className="text-slate-600 normal-case">({result.tokens?.length ?? 0})</span>
          </p>
          <div className="bg-slate-900 rounded-lg p-3 max-h-48 overflow-y-auto">
            <div className="flex flex-wrap gap-1">
              {result.tokens?.slice(0, 300).map((t, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 bg-slate-700 text-violet-200 rounded text-xs font-mono"
                >
                  {t}
                </span>
              ))}
              {(result.tokens?.length ?? 0) > 300 && (
                <span className="text-slate-500 text-xs self-center">
                  …y {result.tokens.length - 300} más
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de frecuencias */}
      {result.frecuencias?.length > 0 && (
        <div>
          <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">
            Tabla de frecuencias —{' '}
            <span className="font-mono text-violet-400 normal-case">
              f(t) = count(t) / Σ count(tᵢ)
            </span>
          </p>
          <div className="overflow-x-auto rounded-lg border border-slate-700 max-h-72">
            <table className="text-xs w-full">
              <thead className="bg-slate-900 text-slate-400 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left w-10">#</th>
                  <th className="px-4 py-2 text-left">Token</th>
                  <th className="px-4 py-2 text-right">Conteo</th>
                  <th className="px-4 py-2 text-right">Frecuencia relativa</th>
                  <th className="px-4 py-2 text-left w-32">Barra</th>
                </tr>
              </thead>
              <tbody>
                {result.frecuencias.slice(0, 100).map((row, i) => {
                  const pct = Math.round((row.frecuencia / result.frecuencias[0].frecuencia) * 100)
                  return (
                    <tr key={i} className={i % 2 === 0 ? 'bg-slate-800' : 'bg-slate-900'}>
                      <td className="px-4 py-1.5 text-slate-500">{i + 1}</td>
                      <td className="px-4 py-1.5 font-mono text-violet-300">{row.token}</td>
                      <td className="px-4 py-1.5 text-right text-slate-200">{row.conteo}</td>
                      <td className="px-4 py-1.5 text-right text-slate-400">{row.frecuencia.toFixed(6)}</td>
                      <td className="px-4 py-1.5">
                        <div className="bg-slate-700 rounded-full h-1.5">
                          <div
                            className="bg-violet-500 h-1.5 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {result.frecuencias.length > 100 && (
            <p className="text-xs text-slate-500 mt-1">
              Mostrando top 100 de {result.frecuencias.length} tokens únicos.
            </p>
          )}
        </div>
      )}
    </section>
  )
}
