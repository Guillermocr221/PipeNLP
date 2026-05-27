export default function FormulaDisplay({ steps = [] }) {
  const active = steps.filter(s => !s.formula.includes('desactivado'))

  if (active.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-slate-500 text-sm italic">
        Activa al menos un paso NLP para ver las fórmulas.
      </div>
    )
  }

  const labelMap = {
    limpieza: '🧹 Limpieza de símbolos',
    tokenizacion: '✂️ Tokenización',
    stopwords: '🚫 Filtro stopwords',
    frecuencia: '📊 Frecuencia relativa',
  }

  return (
    <div className="bg-slate-900 border border-violet-700/40 rounded-xl p-4 space-y-3">
      <p className="text-xs font-semibold text-violet-400 uppercase tracking-widest">
        Fórmulas aplicadas
      </p>
      {steps.map((s, i) => (
        <div key={i} className="space-y-1">
          <p className="text-xs text-slate-400">{labelMap[s.step] ?? s.step}</p>
          <pre className="bg-slate-800 text-green-300 text-xs rounded-lg px-3 py-2 overflow-x-auto whitespace-pre-wrap break-all">
            {s.formula}
          </pre>
        </div>
      ))}
    </div>
  )
}
