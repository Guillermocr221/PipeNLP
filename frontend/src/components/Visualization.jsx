import { useState, useMemo } from 'react'

// ── Icons ──────────────────────────────────────────────────────
const Ic = {
  Check:   (p) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Chev:    (p) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Sigma:   (p) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M18 5H6l7 7-7 7h12"/></svg>,
  Compare: (p) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>,
  Token:   (p) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="6" height="12" rx="1.5"/><rect x="11" y="6" width="4" height="12" rx="1.5"/><rect x="17" y="6" width="4" height="12" rx="1.5"/></svg>,
  Bars:    (p) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  Filter:  (p) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Hash:    (p) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
  Type:    (p) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>,
  Spark:   (p) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>,
}

function Metric({ label, value, delta, icon, accent }) {
  return (
    <div className="metric">
      <div className="metric-label">{icon}{label}</div>
      <div className="metric-value" style={accent ? { color: accent } : undefined}>{value}</div>
      {delta && <div className="metric-delta">{delta}</div>}
    </div>
  )
}

export default function Visualization({ result, opts }) {
  const [tab, setTab]               = useState('summary')
  const [topN, setTopN]             = useState(25)
  const [formulasOpen, setFormulasOpen] = useState(true)

  if (!result) {
    return (
      <div className="card">
        <div className="card-body" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ color: 'var(--text-mute)', fontSize: 13 }}>
            Procesa texto para ver los resultados aquí.
          </div>
        </div>
      </div>
    )
  }

  const freqData     = result.frecuencias ?? []
  const tokBefore    = result.tokens_generados ?? []
  const tokAfter     = result.tokens ?? result.tokens_sin_stopwords ?? []
  const freqShown    = freqData.slice(0, topN)
  const maxCount     = freqData[0]?.conteo || 1
  const topToken     = freqData[0]

  const metrics = result.metrics ?? {}
  const totalBefore  = tokBefore.length
  const totalAfter   = tokAfter.length
  const uniqueCount  = result.tokens_unicos ?? new Set(tokAfter).size
  const swRemoved    = metrics.stopwords_eliminadas ?? (totalBefore - totalAfter)
  const reduction    = metrics.reduccion_porcentual ?? (totalBefore > 0 ? ((totalBefore - totalAfter) / totalBefore * 100).toFixed(1) : 0)
  const wordsOrig    = metrics.palabras_originales ?? totalBefore

  // Which token values were kept (to highlight removed ones)
  const keptSet = useMemo(() => new Set(tokAfter.map(t => t.toLowerCase())), [tokAfter])

  const tabs = [
    { id: 'summary', label: 'Resumen',     count: 6,               icon: <Ic.Sigma s={13} /> },
    { id: 'compare', label: 'Comparación', count: 3,               icon: <Ic.Compare s={13} /> },
    { id: 'tokens',  label: 'Tokens',      count: tokAfter.length, icon: <Ic.Token s={13} /> },
    { id: 'freq',    label: 'Frecuencias', count: freqData.length, icon: <Ic.Bars s={13} /> },
  ]

  // Build formula lines from steps + opts
  const activeCount = [opts?.lowercase, opts?.stripNumbers, opts?.normalizeSpaces,
    opts?.removeSymbols, opts?.tokenize, opts?.removeStopwords].filter(Boolean).length

  const formulaLines = [
    opts?.lowercase      && { lbl: 'lowercase',      f: `T₁(s) = ⋃ᵢ toLower(sᵢ)   →   |s| = ${result.texto_original?.length ?? '?'}` },
    opts?.stripNumbers   && { lbl: 'strip_numbers',  f: 'T₂(s) = s.replace(/[0-9]+/g, " ")' },
    opts?.removeSymbols  && { lbl: 'strip_symbols',  f: `T₃(s) = { c ∈ s : c ∉ Σ }   |Σ| = ${opts.activeSymbols?.length ?? '?'}` },
    opts?.normalizeSpaces && { lbl: 'normalize',     f: 'T₄(s) = s.replace(/\\s+/g, " ").trim()' },
    opts?.tokenize       && { lbl: 'tokenize',       f: `T₅(s) = split(s, "${opts.tokenizeMode}")   →   |T| = ${totalBefore}` },
    opts?.removeStopwords && { lbl: 'remove_stop',   f: `T₆(T) = { t ∈ T : t ∉ W }   |T'| = ${totalAfter}` },
    { lbl: 'freq',        f: `P(tᵢ) = count(tᵢ) / |T'|   →   max = "${topToken?.token}" (${topToken?.conteo})` },
    { lbl: 'reduction',   f: `Δ = (|T| − |T'|) / |T| = ${reduction}%` },
  ].filter(Boolean)

  return (
    <div className="stack" style={{ gap: 16 }}>
      <div className="card">
        {/* Card header */}
        <div className="card-head" style={{ paddingBottom: 0, borderBottom: 'none', alignItems: 'flex-end' }}>
          <div>
            <div className="card-title">
              <Ic.Bars s={14} /> Visualización
              <span className="badge green" style={{ marginLeft: 8 }}><Ic.Check s={10} /> Pipeline ejecutado</span>
            </div>
            <div className="card-sub">
              Resultados sobre <span className="mono">{wordsOrig}</span> palabras de entrada
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          {tabs.map(t => (
            <button key={t.id} className={'tab' + (tab === t.id ? ' active' : '')} onClick={() => setTab(t.id)}>
              {t.icon}{t.label}<span className="count">{t.count}</span>
            </button>
          ))}
        </div>

        <div className="card-body">

          {/* ── Summary ── */}
          {tab === 'summary' && (
            <div className="grid-metrics">
              <Metric label="Palabras originales" value={wordsOrig}      delta="texto de entrada"           icon={<Ic.Type s={11} />} />
              <Metric label="Tokens finales"      value={totalAfter}     delta={`de ${totalBefore} pre-filtro`} icon={<Ic.Token s={11} />} accent="#c4b5fd" />
              <Metric label="Tokens únicos"       value={uniqueCount}    delta={`vocab ${(uniqueCount / (totalAfter || 1) * 100).toFixed(1)}%`} icon={<Ic.Hash s={11} />} />
              <Metric label="Stopwords eliminadas" value={swRemoved}     delta="palabras vacías"            icon={<Ic.Filter s={11} />} accent="#fcd34d" />
              <Metric label="Reducción"           value={reduction + '%'} delta="vs original"               icon={<Ic.Sigma s={11} />} accent="#86efac" />
              <Metric label="Token más frecuente" value={topToken ? `"${topToken.token}"` : '—'}
                delta={topToken ? `${topToken.conteo} apariciones` : '—'} icon={<Ic.Spark s={11} />} />
            </div>
          )}

          {/* ── Compare ── */}
          {tab === 'compare' && (
            <div className="grid-3">
              <div className="code-col">
                <div className="h">
                  <span>· Texto original</span>
                  <span className="mono">{result.texto_original?.length ?? 0} chars</span>
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.7, color: 'var(--text)' }}>
                  {result.texto_original || <em style={{ color: 'var(--text-mute)' }}>(vacío)</em>}
                </div>
              </div>
              <div className="code-col">
                <div className="h">
                  <span>· Texto limpio</span>
                  <span className="mono">{result.texto_limpio?.length ?? 0} chars</span>
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.7, color: 'var(--text-dim)' }}>
                  {result.texto_limpio || <em style={{ color: 'var(--text-mute)' }}>(vacío)</em>}
                </div>
              </div>
              <div className="code-col">
                <div className="h">
                  <span>· Texto procesado</span>
                  <span className="mono">{tokAfter.length} tokens</span>
                </div>
                <div style={{ fontSize: 12.5, lineHeight: 1.7 }}>
                  {tokAfter.map((t, i) => <span key={i} className="token kept">{t}</span>)}
                </div>
              </div>
            </div>
          )}

          {/* ── Tokens ── */}
          {tab === 'tokens' && (
            <div className="grid-2">
              <div className="code-col" style={{ maxHeight: 400 }}>
                <div className="h">
                  <span>
                    · Antes de stopwords{' '}
                    <span className="badge slate" style={{ marginLeft: 6 }}>{tokBefore.length}</span>
                  </span>
                  <span className="mono mute">tokenized</span>
                </div>
                <div>
                  {tokBefore.slice(0, 500).map((t, i) => {
                    const removed = opts?.removeStopwords && !keptSet.has(t.toLowerCase())
                    return <span key={i} className={'token' + (removed ? ' removed' : '')}>{t}</span>
                  })}
                  {tokBefore.length > 500 && (
                    <span className="mute" style={{ fontSize: 11 }}> …y {tokBefore.length - 500} más</span>
                  )}
                </div>
              </div>
              <div className="code-col" style={{ maxHeight: 400 }}>
                <div className="h">
                  <span>
                    · Después de stopwords{' '}
                    <span className="badge violet" style={{ marginLeft: 6 }}>{tokAfter.length}</span>
                  </span>
                  <span className="mono" style={{ color: '#86efac' }}>
                    {swRemoved > 0 ? `−${swRemoved}` : ''}
                  </span>
                </div>
                <div>
                  {tokAfter.slice(0, 500).map((t, i) => <span key={i} className="token kept">{t}</span>)}
                  {tokAfter.length > 500 && (
                    <span className="mute" style={{ fontSize: 11 }}> …y {tokAfter.length - 500} más</span>
                  )}
                  {tokAfter.length === 0 && (
                    <em style={{ color: 'var(--text-mute)', fontSize: 12 }}>Sin tokens</em>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Frequencies ── */}
          {tab === 'freq' && (
            <div>
              <div className="row between" style={{ marginBottom: 14 }}>
                <div className="row" style={{ gap: 8 }}>
                  <span className="mute" style={{ fontSize: 12 }}>Top</span>
                  <div className="row" style={{ gap: 4, padding: 3, background: 'var(--bg-1)', border: '1px solid var(--line)', borderRadius: 8 }}>
                    {[10, 25, 50, 100].map(n => (
                      <button
                        key={n}
                        onClick={() => setTopN(n)}
                        style={{
                          padding: '5px 12px', fontSize: 12, border: '1px solid',
                          borderColor: topN === n ? 'rgba(167,139,250,0.4)' : 'transparent',
                          background: topN === n ? 'var(--violet)' : 'transparent',
                          borderRadius: 6, color: topN === n ? 'white' : 'var(--text-dim)',
                          cursor: 'pointer', fontWeight: topN === n ? 600 : 400,
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <span className="mute" style={{ fontSize: 12 }}>
                    de <span className="mono" style={{ color: 'var(--text)' }}>{freqData.length}</span> tokens únicos
                  </span>
                </div>
              </div>
              <div style={{ border: '1px solid var(--line)', borderRadius: 9, overflow: 'hidden' }}>
                <table className="tbl">
                  <thead>
                    <tr>
                      <th style={{ width: 50 }}>#</th>
                      <th>Token</th>
                      <th style={{ width: 90, textAlign: 'right' }}>Conteo</th>
                      <th style={{ width: 110, textAlign: 'right' }}>Frecuencia</th>
                      <th style={{ width: '40%' }}>Distribución</th>
                    </tr>
                  </thead>
                  <tbody>
                    {freqShown.map((row, i) => (
                      <tr key={i}>
                        <td style={{ color: 'var(--text-mute)' }}>{String(i + 1).padStart(2, '0')}</td>
                        <td style={{ color: 'var(--text)', fontWeight: 500 }}>{row.token}</td>
                        <td style={{ textAlign: 'right', color: '#c4b5fd' }}>{row.conteo}</td>
                        <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>
                          {(row.frecuencia * 100).toFixed(2)}%
                        </td>
                        <td>
                          <div className="freq-bar">
                            <div className="freq-fill" style={{ width: (row.conteo / maxCount * 100) + '%' }} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Formulas panel ── */}
      <div className="formulas">
        <div className="formulas-head" onClick={() => setFormulasOpen(o => !o)}>
          <div className="row" style={{ gap: 8, flex: 1 }}>
            <Ic.Sigma s={14} />
            <span style={{ fontWeight: 600, fontSize: 13 }}>Fórmulas ejecutadas</span>
            <span className="mute mono" style={{ fontSize: 11 }}>· {activeCount} etapas</span>
          </div>
          <div style={{ color: 'var(--text-mute)', transform: formulasOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <Ic.Chev s={14} />
          </div>
        </div>
        {formulasOpen && (
          <div className="formulas-body">
            {formulaLines.map((row, i) => (
              <div key={i} className="fline">
                <span className="num">{String(i + 1).padStart(2, '0')}</span>
                <span className="step-lbl">[{row.lbl}]</span>
                <span style={{ flex: 1 }}>{row.f}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
