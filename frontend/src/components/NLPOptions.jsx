import { useState } from 'react'

// ── Icons ──────────────────────────────────────────────────────
const ChevIcon = ({ s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)
const FilterIcon = ({ s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
)
const SigmaIcon = ({ s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 5H6l7 7-7 7h12" />
  </svg>
)
const XIcon = ({ s = 11 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
const PlusIcon = ({ s = 12 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const PlayIcon = ({ s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
  </svg>
)
const ResetIcon = ({ s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
)
const CheckIcon = ({ s = 10 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

// ── Pipeline section wrapper ────────────────────────────────────
function PipeSection({ num, title, hint, open, onToggle, enabled, onToggleEnabled, children }) {
  return (
    <div className={'section' + (open ? ' open' : '')}>
      <div className="section-head" onClick={onToggle}>
        <div className="section-num">{num}</div>
        <div
          className={'check' + (enabled ? ' on' : '')}
          onClick={(e) => { e.stopPropagation(); onToggleEnabled?.() }}
        />
        <div className="section-title">{title}</div>
        {hint && <div className="mute mono" style={{ fontSize: 11 }}>{hint}</div>}
        <div className="section-chev"><ChevIcon s={16} /></div>
      </div>
      {open && <div className="section-body">{children}</div>}
    </div>
  )
}

export default function NLPOptions({
  opts, setOpts,
  defaultSymbols, defaultStopwords,
  onProcess, onReset, loading,
}) {
  const [openSections, setOpenSections] = useState({ 1: false, 2: false, 3: false, 4: true, 5: true, 6: true })
  const [newSymbol, setNewSymbol] = useState('')
  const [newStop, setNewStop]     = useState('')

  const toggle = (key) => setOpts(o => ({ ...o, [key]: !o[key] }))
  const toggleSection = (n) => setOpenSections(s => ({ ...s, [n]: !s[n] }))

  const allSymbols = [...new Set([...defaultSymbols, ...opts.extraSymbols])]

  function toggleSymbol(sym) {
    setOpts(o => {
      const s = new Set(o.activeSymbols)
      if (s.has(sym)) s.delete(sym); else s.add(sym)
      return { ...o, activeSymbols: [...s] }
    })
  }

  function addSymbol() {
    if (!newSymbol.trim()) return
    const chars = newSymbol.split('').filter(c => c.trim())
    setOpts(o => ({
      ...o,
      extraSymbols: [...new Set([...o.extraSymbols, ...chars])],
      activeSymbols: [...new Set([...o.activeSymbols, ...chars])],
    }))
    setNewSymbol('')
  }

  function removeExtraSymbol(sym) {
    setOpts(o => ({
      ...o,
      extraSymbols: o.extraSymbols.filter(s => s !== sym),
      activeSymbols: o.activeSymbols.filter(s => s !== sym),
    }))
  }

  function addStop() {
    if (!newStop.trim()) return
    const words = newStop.toLowerCase().split(/[\s,]+/).filter(Boolean)
    setOpts(o => ({ ...o, customStopwords: [...new Set([...o.customStopwords, ...words])] }))
    setNewStop('')
  }

  function removeStop(w) {
    setOpts(o => ({ ...o, customStopwords: o.customStopwords.filter(s => s !== w) }))
  }

  const activeCount = [opts.lowercase, opts.stripNumbers, opts.normalizeSpaces,
    opts.removeSymbols, opts.tokenize, opts.removeStopwords].filter(Boolean).length

  const totalStops = defaultStopwords.length + opts.customStopwords.length

  // Build pseudocode preview
  const pseudocode = [
    'text = input',
    opts.lowercase     && 'text = text.lower()',
    opts.stripNumbers  && 'text = re.sub(r"\\d+", " ", text)',
    opts.removeSymbols && `text = strip_symbols(text, n=${opts.activeSymbols.length})`,
    opts.normalizeSpaces && 'text = re.sub(r"\\s+", " ", text).strip()',
    opts.tokenize      && `tokens = tokenize(text, mode="${opts.tokenizeMode}")`,
    opts.removeStopwords && `tokens = [t for t in tokens\n          if t not in stop_${totalStops}]`,
    'return tokens',
  ].filter(Boolean).join('\n')

  return (
    <div className="grid-2" style={{ gridTemplateColumns: '1.4fr 1fr', alignItems: 'start' }}>

      {/* ── Left: pipeline sections ── */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title"><FilterIcon s={14} /> Pipeline de procesamiento</div>
            <div className="card-sub">Las operaciones se ejecutan en orden, de arriba a abajo.</div>
          </div>
          <span className="badge violet">{activeCount} / 6 activas</span>
        </div>
        <div className="card-body" style={{ padding: 14 }}>

          <PipeSection num="1" title="Convertir a minúsculas" hint="lowercase()"
            open={openSections[1]} onToggle={() => toggleSection(1)}
            enabled={opts.lowercase} onToggleEnabled={() => toggle('lowercase')}>
            <div className="mute" style={{ fontSize: 12 }}>
              Aplica <span className="mono" style={{ color: 'var(--mono-green)' }}>str.lower()</span> a todo el texto antes de la tokenización. Recomendado para reducir cardinalidad del vocabulario.
            </div>
          </PipeSection>

          <PipeSection num="2" title="Eliminar números" hint={'regex /\\d+/'}
            open={openSections[2]} onToggle={() => toggleSection(2)}
            enabled={opts.stripNumbers} onToggleEnabled={() => toggle('stripNumbers')}>
            <div className="mute" style={{ fontSize: 12 }}>
              Reemplaza secuencias numéricas por espacios. Útil para análisis temáticos donde los números no aportan significado.
            </div>
          </PipeSection>

          <PipeSection num="3" title="Normalizar espacios" hint="collapse + trim"
            open={openSections[3]} onToggle={() => toggleSection(3)}
            enabled={opts.normalizeSpaces} onToggleEnabled={() => toggle('normalizeSpaces')}>
            <div className="mute" style={{ fontSize: 12 }}>
              Colapsa múltiples espacios, tabs y saltos de línea en un único espacio. Aplica <span className="mono" style={{ color: 'var(--mono-green)' }}>trim()</span> al final.
            </div>
          </PipeSection>

          <PipeSection num="4" title="Limpiar símbolos" hint={`${opts.activeSymbols.length} activos`}
            open={openSections[4]} onToggle={() => toggleSection(4)}
            enabled={opts.removeSymbols} onToggleEnabled={() => toggle('removeSymbols')}>
            <div className="mute" style={{ fontSize: 12, marginBottom: 10 }}>
              Toca un chip para activar/desactivar su eliminación. Los símbolos activos se reemplazan por espacios.
            </div>
            <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
              {allSymbols.map(sym => {
                const on = opts.activeSymbols.includes(sym)
                const isExtra = opts.extraSymbols.includes(sym)
                return (
                  <span key={sym} className={'chip' + (on ? ' on' : '')} onClick={() => toggleSymbol(sym)}>
                    <span>{sym}</span>
                    {isExtra && (
                      <span className="chip-x" onClick={(e) => { e.stopPropagation(); removeExtraSymbol(sym) }}>
                        <XIcon s={11} />
                      </span>
                    )}
                  </span>
                )
              })}
            </div>
            <div className="row" style={{ marginTop: 12, gap: 8 }}>
              <input
                className="input"
                placeholder="Agregar símbolos extra (ej: §¶†‡)"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSymbol()}
                style={{ flex: 1 }}
              />
              <button className="btn btn-sm" onClick={addSymbol}><PlusIcon s={12} /> Agregar</button>
            </div>
            <div className="mute mono" style={{ fontSize: 11, marginTop: 8 }}>
              {opts.activeSymbols.length} de {allSymbols.length} símbolos serán eliminados
            </div>
          </PipeSection>

          <PipeSection num="5" title="Tokenizar" hint={opts.tokenizeMode}
            open={openSections[5]} onToggle={() => toggleSection(5)}
            enabled={opts.tokenize} onToggleEnabled={() => toggle('tokenize')}>
            <div className="mute" style={{ fontSize: 12, marginBottom: 10 }}>
              Define cómo segmentar el texto en unidades atómicas.
            </div>
            <div className="radio-group">
              {[
                { v: 'words',        t: 'Palabras',           d: 'word_tokenize()' },
                { v: 'words+symbols', t: 'Palabras + símbolos', d: 'regexp \\w+|[^\\w\\s]' },
                { v: 'chars',        t: 'Caracteres',          d: 'list(text)' },
              ].map(opt => (
                <label
                  key={opt.v}
                  className={'radio' + (opts.tokenizeMode === opt.v ? ' on' : '')}
                  onClick={() => setOpts(o => ({ ...o, tokenizeMode: opt.v }))}
                >
                  <span className="dotr" />
                  <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                    <span style={{ fontWeight: 500 }}>{opt.t}</span>
                    <span className="mono mute" style={{ fontSize: 10.5, marginTop: 2 }}>{opt.d}</span>
                  </span>
                </label>
              ))}
            </div>
          </PipeSection>

          <PipeSection num="6" title="Eliminar stopwords" hint={`${totalStops} en lista`}
            open={openSections[6]} onToggle={() => toggleSection(6)}
            enabled={opts.removeStopwords} onToggleEnabled={() => toggle('removeStopwords')}>
            <div className="mute" style={{ fontSize: 12, marginBottom: 10 }}>
              Lista base: <span className="mono" style={{ color: 'var(--text)' }}>{defaultStopwords.length}</span> stopwords en español+inglés. Agrega palabras adicionales para tu dominio.
            </div>
            <div className="row" style={{ gap: 8, marginBottom: 12 }}>
              <input
                className="input"
                placeholder="Agregar stopwords (separar por coma o espacio)"
                value={newStop}
                onChange={(e) => setNewStop(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addStop()}
                style={{ flex: 1 }}
              />
              <button className="btn btn-sm" onClick={addStop}><PlusIcon s={12} /> Agregar</button>
            </div>
            {opts.customStopwords.length > 0 && (
              <>
                <div className="mute" style={{ fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Personalizadas ({opts.customStopwords.length})
                </div>
                <div className="row" style={{ flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {opts.customStopwords.map(w => (
                    <span key={w} className="chip on">
                      {w}
                      <span className="chip-x" onClick={() => removeStop(w)}><XIcon s={11} /></span>
                    </span>
                  ))}
                </div>
              </>
            )}
            {defaultStopwords.length > 0 && (
              <details style={{ marginTop: 4 }}>
                <summary style={{ cursor: 'pointer', fontSize: 12, color: 'var(--text-dim)' }}>
                  Ver lista base ({defaultStopwords.length})
                </summary>
                <div className="row" style={{ flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                  {defaultStopwords.map(w => (
                    <span key={w} className="chip" style={{ opacity: 0.7 }}>{w}</span>
                  ))}
                </div>
              </details>
            )}
          </PipeSection>
        </div>
      </div>

      {/* ── Right: summary + pseudocode ── */}
      <div className="stack" style={{ gap: 16 }}>

        {/* Pipeline summary */}
        <div className="card">
          <div className="card-head">
            <div className="card-title"><SigmaIcon s={14} /> Resumen del pipeline</div>
          </div>
          <div className="card-body">
            <div className="stack" style={{ gap: 8 }}>
              {[
                ['1. Minúsculas',                     opts.lowercase],
                ['2. Sin números',                    opts.stripNumbers],
                ['3. Espacios normalizados',           opts.normalizeSpaces],
                [`4. Símbolos (${opts.activeSymbols.length})`, opts.removeSymbols],
                [`5. Tokenizar · ${opts.tokenizeMode}`, opts.tokenize],
                [`6. Stopwords (${totalStops})`,      opts.removeStopwords],
              ].map(([label, on], i) => (
                <div
                  key={i}
                  className="row between"
                  style={{
                    padding: '8px 10px', borderRadius: 8,
                    background: on ? 'rgba(124,58,237,0.06)' : 'rgba(2,6,23,0.4)',
                    border: '1px solid',
                    borderColor: on ? 'rgba(167,139,250,0.18)' : 'var(--line)',
                  }}
                >
                  <span style={{ fontSize: 12.5, color: on ? 'var(--text)' : 'var(--text-mute)' }}>{label}</span>
                  {on
                    ? <span className="badge violet"><CheckIcon s={10} /> ON</span>
                    : <span className="badge slate">OFF</span>
                  }
                </div>
              ))}
            </div>

            <div className="divider" />

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px 16px' }}
              onClick={onProcess}
              disabled={loading}
            >
              <PlayIcon s={13} /> {loading ? 'Procesando…' : 'Procesar'}
            </button>
            <button
              className="btn btn-ghost"
              style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
              onClick={onReset}
            >
              <ResetIcon s={13} /> Reiniciar pipeline
            </button>
          </div>
        </div>

        {/* Pseudocode preview */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Vista previa del flujo</div>
              <div className="card-sub">Pseudocódigo del pipeline configurado.</div>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <pre
              className="mono"
              style={{
                margin: 0, padding: '14px 18px', fontSize: 12, lineHeight: 1.8,
                color: 'var(--mono-green)', background: 'rgba(2,6,23,0.5)',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}
            >
              {pseudocode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
