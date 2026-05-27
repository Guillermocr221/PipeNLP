import { useState } from 'react'

export default function FormulaDisplay({ steps = [] }) {
  const [open, setOpen] = useState(true)
  const active = steps.filter(s => !s.formula.includes('desactivado'))

  if (active.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-xl p-4">
        <button className="w-full text-left text-slate-500 text-sm italic">
          ▶ Ver fórmulas aplicadas
        </button>
        <p className="text-slate-600 text-xs mt-2">Procesa texto para visualizar los procedimientos aplicados.</p>
      </div>
    )
  }

  const labelMap = {
    minusculas: 'Minúsculas',
    numeros: 'Eliminación de números',
    limpieza: '🧹 Limpieza de símbolos',
    espacios: 'Normalización final de espacios',
    tokenizacion: '✂️ Tokenización',
    stopwords: '🚫 Filtro stopwords',
    frecuencia: '📊 Frecuencia relativa',
  }

  return (
    <div className="bg-slate-900 border border-violet-700/40 rounded-xl p-4 space-y-3">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">
          Fórmulas aplicadas
        </span>
        <span className="text-slate-500 text-xs">{open ? 'Ocultar' : 'Ver'}</span>
      </button>
      {open && steps.map((s, i) => (
        <div key={i} className="space-y-1">
          <p className="text-xs text-slate-400">{labelMap[s.step] ?? s.step}</p>
          <pre className="bg-slate-800 text-green-300 text-xs rounded-lg px-3 py-2 overflow-x-auto whitespace-pre-wrap break-all">
            {s.formula}
          </pre>
          {s.explanation && <p className="text-xs text-slate-500">{s.explanation}</p>}
        </div>
      ))}
    </div>
  )
}
