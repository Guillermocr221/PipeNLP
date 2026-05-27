import { useState } from 'react'

export default function Visualization({ result }) {
  const [activeTab, setActiveTab] = useState('resumen')
  const [frequencyLimit, setFrequencyLimit] = useState(25)

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

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'resumen', label: 'Resumen' },
          { key: 'comparacion', label: 'Comparación' },
          { key: 'tokens', label: 'Tokens' },
          { key: 'frecuencias', label: 'Frecuencias' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              activeTab === tab.key
                ? 'bg-violet-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'comparacion' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextBox title="Texto original" help="Texto ingresado antes de aplicar el pipeline." value={result.texto_original} />
          <TextBox title="Texto limpio" help="Resultado después de normalización y limpieza de símbolos." value={result.texto_limpio} />
          <TextBox title="Texto procesado final" help="Resultado después de tokenización y eliminación de stopwords." value={result.texto_procesado} />
        </div>
      )}

      {activeTab === 'tokens' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TokenList
          title="Tokens generados"
          help="Tokens obtenidos antes de quitar stopwords."
          tokens={result.tokens_generados ?? []}
        />
        <TokenList
          title="Tokens finales sin stopwords"
          help="Tokens finales después de eliminar las palabras vacías seleccionadas."
          tokens={result.tokens_sin_stopwords ?? result.tokens ?? []}
        />
        </div>
      )}

      {activeTab === 'frecuencias' && result.frecuencias?.length > 0 && (
        <div>
          <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
            <div>
              <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">
                Tabla de frecuencias —{' '}
                <span className="font-mono text-violet-400 normal-case">
                  f(t) = count(t) / Σ count(tᵢ)
                </span>
              </p>
              <p className="text-xs text-slate-500">
                La frecuencia relativa indica qué proporción representa cada token dentro del total de tokens procesados.
              </p>
            </div>
            <label className="text-xs text-slate-400">
              Mostrar top{' '}
              <select
                value={frequencyLimit}
                onChange={e => setFrequencyLimit(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200 focus:outline-none focus:border-violet-500"
              >
                {[10, 25, 50, 100].map(value => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </label>
          </div>
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
                {result.frecuencias.slice(0, frequencyLimit).map((row, i) => {
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
          {result.frecuencias.length > frequencyLimit && (
            <p className="text-xs text-slate-500 mt-1">
              Mostrando top {frequencyLimit} de {result.frecuencias.length} tokens únicos.
            </p>
          )}
        </div>
      )}

      {activeTab === 'resumen' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: 'Palabras originales', value: result.metrics?.palabras_originales ?? '-', subtitle: 'Antes del procesamiento' },
            { label: 'Tokens finales', value: result.total_tokens ?? 0, subtitle: 'Después de stopwords y limpieza' },
            { label: 'Tokens únicos', value: result.tokens_unicos ?? 0, subtitle: 'Vocabulario resultante' },
            { label: 'Stopwords eliminadas', value: result.metrics?.stopwords_eliminadas ?? 0, subtitle: 'Palabras vacías removidas' },
            { label: 'Reducción de tokens', value: `${result.metrics?.reduccion_porcentual ?? 0}%`, subtitle: 'Disminución respecto al texto original' },
            { label: 'Token más frecuente', value: result.frecuencias?.[0]?.token ?? '-', subtitle: 'Mayor aparición en el corpus' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-violet-400 truncate">{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
              <p className="text-xs text-slate-600 mt-1">{s.subtitle}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function TextBox({ title, help, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">{title}</p>
      {help && <p className="text-xs text-slate-500 mb-2">{help}</p>}
      <div className="bg-slate-900 rounded-lg p-3 text-sm text-slate-200 h-44 overflow-y-auto whitespace-pre-wrap break-words font-mono">
        {value || <span className="text-slate-600 italic">(vacío)</span>}
      </div>
    </div>
  )
}

function TokenList({ title, help, tokens }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-wide">
        {title} <span className="text-slate-600 normal-case">({tokens.length})</span>
      </p>
      {help && <p className="text-xs text-slate-500 mb-2">{help}</p>}
      <div className="bg-slate-900 rounded-lg p-3 h-56 overflow-y-auto">
        <div className="flex flex-wrap gap-1">
          {tokens.slice(0, 300).map((t, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 bg-slate-700 text-violet-200 rounded text-xs font-mono"
            >
              {t}
            </span>
          ))}
          {tokens.length === 0 && <span className="text-slate-600 italic text-sm">Sin tokens</span>}
          {tokens.length > 300 && (
            <span className="text-slate-500 text-xs self-center">
              …y {tokens.length - 300} más
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
