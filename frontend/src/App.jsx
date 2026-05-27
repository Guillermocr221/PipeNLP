import { useState, useEffect } from 'react'
import DataInput from './components/DataInput'
import NLPOptions from './components/NLPOptions'
import Visualization from './components/Visualization'
import ExportPanel from './components/ExportPanel'

// ── Icons ─────────────────────────────────────────────────────
const Ic = {
  Check: (p) => (
    <svg width={p.s || 14} height={p.s || 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Play: (p) => (
    <svg width={p.s || 14} height={p.s || 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
    </svg>
  ),
  Reset: (p) => (
    <svg width={p.s || 14} height={p.s || 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  ),
}

// ── Default symbols from design ────────────────────────────────
const DESIGN_SYMBOLS = [
  '.', ',', ';', ':', '!', '?', '¿', '¡', '"', "'", '“', '”',
  '(', ')', '[', ']', '{', '}', '—', '–', '-', '_',
  '/', '\\', '|', '@', '#', '$', '%', '&', '*', '+', '=',
  '<', '>', '~', '`', '^', '°', '€', '£', '·'
]

const DEFAULT_OPTS = {
  lowercase: true,
  stripNumbers: true,
  normalizeSpaces: true,
  removeSymbols: true,
  activeSymbols: [...DESIGN_SYMBOLS],
  extraSymbols: [],
  tokenize: true,
  tokenizeMode: 'words',
  removeStopwords: true,
  customStopwords: [],
}

export default function App() {
  const [step, setStep]           = useState(1)
  const [processed, setProcessed] = useState(false)
  const [text, setText]           = useState('')
  const [opts, setOpts]           = useState(DEFAULT_OPTS)
  const [defaultSymbols, setDefaultSymbols]     = useState(DESIGN_SYMBOLS)
  const [defaultStopwords, setDefaultStopwords] = useState([])
  const [result, setResult]       = useState(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)

  // Load defaults from API
  useEffect(() => {
    fetch('/api/config')
      .then(r => r.json())
      .then(data => {
        const syms = data.symbols ?? DESIGN_SYMBOLS
        const stops = data.stopwords ?? []
        setDefaultSymbols(syms)
        setDefaultStopwords(stops)
        setOpts(prev => ({ ...prev, activeSymbols: syms }))
      })
      .catch(() => {})
  }, [])

  async function handleProcess() {
    if (!text.trim()) {
      setError('Debe ingresar texto o cargar un archivo antes de procesar.')
      return
    }
    const anyActive = opts.lowercase || opts.stripNumbers || opts.normalizeSpaces ||
      opts.removeSymbols || opts.tokenize || opts.removeStopwords
    if (!anyActive) {
      setError('Debe seleccionar al menos una opción de preprocesamiento.')
      return
    }
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const tokenModeMap = { 'words+symbols': 'all' }
      const apiMode = tokenModeMap[opts.tokenizeMode] ?? opts.tokenizeMode

      const res = await fetch('/api/process/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          clean_symbols:    opts.removeSymbols,
          selected_symbols: opts.activeSymbols,
          extra_symbols:    opts.extraSymbols,
          do_tokenize:      opts.tokenize,
          token_mode:       apiMode,
          remove_stopwords: opts.removeStopwords,
          extra_stopwords:  opts.customStopwords,
          to_lowercase:     opts.lowercase,
          remove_numbers:   opts.stripNumbers,
          normalize_spaces: opts.normalizeSpaces,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      if ((data.tokens?.length ?? 0) === 0) {
        setError('No se encontraron tokens después del procesamiento.')
        setLoading(false)
        return
      }
      setResult(data)
      setProcessed(true)
      setStep(3)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setText('')
    setOpts({ ...DEFAULT_OPTS, activeSymbols: defaultSymbols })
    setResult(null)
    setError(null)
    setProcessed(false)
    setStep(1)
  }

  const steps = [
    { n: 1, t: 'Ingreso',       s: 'Carga el corpus' },
    { n: 2, t: 'Opciones',      s: 'Configura el pipeline' },
    { n: 3, t: 'Visualización', s: 'Inspecciona resultados' },
    { n: 4, t: 'Exportación',   s: 'Descarga artefactos' },
  ]

  function goNext() {
    if (step === 2) { handleProcess(); return }
    setStep(s => Math.min(4, s + 1))
  }
  function goPrev() { setStep(s => Math.max(1, s - 1)) }

  return (
    <div className="app">
      {/* ── Topbar ── */}
      <div className="topbar">
        <div className="brand">
          <div className="brand-mark" />
          <div>
            <div className="brand-name">PipeNLP</div>
            <div className="brand-sub">Pipeline de preprocesamiento NLP</div>
          </div>
        </div>
        <div className="topbar-right">
          <span className="pill"><span className="dot" /> sesión activa</span>
          <span className="pill">v1.0</span>
          <span className="pill">es · UTF-8</span>
        </div>
      </div>

      {/* ── Stepper ── */}
      <div className="stepper">
        {steps.map((s, i) => {
          const active = step === s.n
          const done = (processed && s.n < step) || (processed && s.n <= 2)
          return (
            <div key={s.n} style={{ display: 'contents' }}>
              <div
                className={'step' + (active ? ' active' : '') + (done ? ' done' : '')}
                onClick={() => setStep(s.n)}
              >
                <div className="step-num">
                  {done ? <Ic.Check s={13} /> : s.n}
                </div>
                <div className="step-label">
                  <div className="t">{s.t}</div>
                  <div className="s">{s.s}</div>
                </div>
              </div>
              {i < steps.length - 1 && <div className="step-sep">→</div>}
            </div>
          )
        })}
      </div>

      {/* ── Step content ── */}
      {step === 1 && (
        <DataInput text={text} setText={setText} />
      )}
      {step === 2 && (
        <NLPOptions
          opts={opts}
          setOpts={setOpts}
          defaultSymbols={defaultSymbols}
          defaultStopwords={defaultStopwords}
          onProcess={handleProcess}
          onReset={handleReset}
          loading={loading}
        />
      )}
      {step === 3 && (
        <Visualization result={result} opts={opts} />
      )}
      {step === 4 && (
        <ExportPanel result={result} text={text} opts={opts} />
      )}

      {/* ── Footer bar ── */}
      <div className="footer-bar">
        <div className="left">
          <span className="mute mono" style={{ fontSize: 11 }}>paso {step} de 4</span>
          {processed && (
            <span className="badge green"><Ic.Check s={11} /> pipeline ejecutado</span>
          )}
          {error && (
            <span style={{ color: 'var(--red)', fontSize: 12 }}>{error}</span>
          )}
        </div>
        <div className="right">
          <button
            className="btn btn-ghost"
            onClick={goPrev}
            disabled={step === 1}
            style={{ opacity: step === 1 ? 0.4 : 1 }}
          >
            ← Anterior
          </button>
          <button
            className="btn btn-primary"
            onClick={goNext}
            disabled={step === 4 || (step !== 2 && step === 3 && !processed)}
            style={{ opacity: step === 4 ? 0.4 : 1 }}
          >
            {step === 2
              ? loading
                ? 'Procesando…'
                : <><Ic.Play s={12} /> Procesar</>
              : 'Siguiente →'}
          </button>
        </div>
      </div>
    </div>
  )
}
