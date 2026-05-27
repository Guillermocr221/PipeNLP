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
  toLowercase: false,
  removeNumbers: false,
  normalizeSpaces: true,
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

  function handleReset() {
    setInputMode('text')
    setText('')
    setOptions({ ...DEFAULT_OPTIONS, selectedSymbols: defaultSymbols })
    setResult(null)
    setError(null)
  }

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
    if (!text.trim()) {
      setError('Debe ingresar texto o cargar un archivo antes de procesar.')
      return
    }
    if (!options.cleanSymbols && !options.doTokenize && !options.removeStopwords && !options.toLowercase && !options.removeNumbers && !options.normalizeSpaces) {
      setError('Debe seleccionar al menos una opción de preprocesamiento.')
      return
    }
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
          to_lowercase: options.toLowercase,
          remove_numbers: options.removeNumbers,
          normalize_spaces: options.normalizeSpaces,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setResult(data)
      if ((data.tokens?.length ?? 0) === 0) {
        setError('No se encontraron tokens después del procesamiento.')
      }
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
        <p className="text-sm text-slate-400">Herramienta de preprocesamiento de texto para minería de datos</p>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        <FlowSteps result={result} />

        {/* 1. Ingreso */}
        <DataInput
          text={text}
          onTextChange={setText}
          inputMode={inputMode}
          setInputMode={setInputMode}
        />

        {/* 2. Opciones NLP + Fórmulas */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <NLPOptions
              defaultSymbols={defaultSymbols}
              defaultStopwords={defaultStopwords}
              options={options}
              onChange={setOptions}
            />
          </div>
          <div className="lg:col-span-2">
            <FormulaDisplay steps={result?.steps ?? []} />
          </div>
        </div>

        {/* Botón procesar */}
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={handleProcess}
            disabled={loading || !text.trim()}
            className="px-8 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition text-sm"
          >
            {loading ? 'Procesando...' : 'Procesar'}
          </button>
          <button
            onClick={handleReset}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium rounded-xl transition text-sm"
          >
            Reiniciar pipeline
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {result && <StatusBadges result={result} />}

        {/* 3. Visualización */}
        <Visualization result={result} />

        {/* 4. Exportar */}
        <ExportPanel result={result} />
      </main>
    </div>
  )
}

function FlowSteps({ result }) {
  const steps = ['1. Ingreso', '2. Opciones', '3. Visualización', '4. Exportación']
  return (
    <section className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full border ${result || index < 2 ? 'bg-violet-900/40 border-violet-700 text-violet-200' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              {step}
            </span>
            {index < steps.length - 1 && <span className="text-slate-600">→</span>}
          </div>
        ))}
      </div>
    </section>
  )
}

function StatusBadges({ result }) {
  const badges = [
    'Texto procesado correctamente',
    result.configuracion?.remove_stopwords ? 'Stopwords aplicadas' : 'Stopwords desactivadas',
    result.configuracion?.clean_symbols ? 'Símbolos eliminados' : 'Limpieza de símbolos desactivada',
    'Dataset listo para exportar',
  ]
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map(badge => (
        <span key={badge} className="px-3 py-1 bg-emerald-900/40 border border-emerald-700 text-emerald-200 rounded-full text-xs">
          ✓ {badge}
        </span>
      ))}
    </div>
  )
}
