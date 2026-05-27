import { useState, useEffect } from 'react'
import DataInput from './components/DataInput'
import NLPOptions from './components/NLPOptions'
import FormulaDisplay from './components/FormulaDisplay'
import Visualization from './components/Visualization'
import ExportPanel from './components/ExportPanel'

const DEFAULT_OPTIONS = {
  cleanSymbols: true,
  selectedSymbols: null,
  extraSymbols: [],
  doTokenize: true,
  tokenMode: 'words',
  removeStopwords: true,
  extraStopwords: [],
}

export default function App() {
  const [inputMode, setInputMode] = useState('text')
  const [text, setText] = useState('')
  const [options, setOptions] = useState(DEFAULT_OPTIONS)
  const [defaultSymbols, setDefaultSymbols] = useState([])
  const [defaultStopwords, setDefaultStopwords] = useState([])
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(data => {
        setDefaultSymbols(data.symbols ?? [])
        setDefaultStopwords(data.stopwords ?? [])
        setOptions(prev => ({ ...prev, selectedSymbols: data.symbols ?? [] }))
      })
      .catch(() => {})
  }, [])

  async function handleProcess() {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const syms = options.selectedSymbols ?? defaultSymbols
      const allSyms = [...new Set([...syms, ...options.extraSymbols])]
      const res = await fetch('/api/process/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          clean_symbols: options.cleanSymbols,
          extra_symbols: options.extraSymbols,
          selected_symbols: allSyms,
          do_tokenize: options.doTokenize,
          token_mode: options.tokenMode,
          remove_stopwords: options.removeStopwords,
          extra_stopwords: options.extraStopwords,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      setResult(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <h1 className="text-xl font-bold text-violet-400">NLP Pipeline</h1>
        <p className="text-sm text-slate-400">Visualización y preprocesamiento de texto</p>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {/* 1. Ingreso */}
        <DataInput
          text={text}
          onTextChange={setText}
          inputMode={inputMode}
          setInputMode={setInputMode}
        />

        {/* 2. Opciones NLP + Fórmulas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <NLPOptions
              defaultSymbols={defaultSymbols}
              defaultStopwords={defaultStopwords}
              options={options}
              onChange={setOptions}
            />
          </div>
          <div>
            <FormulaDisplay steps={result?.steps ?? []} />
          </div>
        </div>

        {/* Botón procesar */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleProcess}
            disabled={loading || !text.trim()}
            className="px-8 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition text-sm"
          >
            {loading ? 'Procesando...' : 'Procesar'}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {/* 3. Visualización */}
        <Visualization result={result} />

        {/* 4. Exportar */}
        <ExportPanel result={result} />
      </main>
    </div>
  )
}
