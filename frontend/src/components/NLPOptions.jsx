import { useState } from 'react'

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-0.5 rounded text-xs font-mono transition ${
        active
          ? 'bg-violet-700 text-white'
          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
      }`}
    >
      {label === '\t' ? '\\t' : label === '\n' ? '\\n' : label === '\r' ? '\\r' : label}
    </button>
  )
}

const TOKEN_HELP = {
  words: 'Divide el texto en palabras individuales. Es ideal para análisis de frecuencia de palabras.',
  all: 'Genera tokens para palabras y símbolos aislados. Es útil cuando los símbolos pueden aportar información al análisis.',
  chars: 'Genera un token por cada carácter. Es útil para análisis a nivel de carácter.',
}

export default function NLPOptions({
  defaultSymbols,
  defaultStopwords,
  options,
  onChange,
}) {
  const [symInput, setSymInput] = useState('')
  const [swInput, setSwInput] = useState('')

  const {
    cleanSymbols,
    selectedSymbols,
    extraSymbols,
    doTokenize,
    tokenMode,
    removeStopwords,
    extraStopwords,
    toLowercase,
    removeNumbers,
    normalizeSpaces,
  } = options

  const activeSymbols = selectedSymbols ?? []

  function toggleSymbol(sym) {
    const next = activeSymbols.includes(sym)
      ? activeSymbols.filter(s => s !== sym)
      : [...activeSymbols, sym]
    onChange({ ...options, selectedSymbols: next })
  }

  function addExtraSymbol() {
    const s = symInput.trim()
    if (s && !extraSymbols.includes(s)) {
      onChange({ ...options, extraSymbols: [...extraSymbols, s] })
    }
    setSymInput('')
  }

  function removeExtraSymbol(s) {
    onChange({ ...options, extraSymbols: extraSymbols.filter(x => x !== s) })
  }

  function addExtraStopword() {
    const words = swInput.split(/[\s,]+/).map(w => w.trim().toLowerCase()).filter(Boolean)
    const next = [...new Set([...extraStopwords, ...words])]
    onChange({ ...options, extraStopwords: next })
    setSwInput('')
  }

  function removeExtraStopword(w) {
    onChange({ ...options, extraStopwords: extraStopwords.filter(x => x !== w) })
  }

  return (
    <section className="bg-slate-800 rounded-xl p-5 space-y-5">
      <h2 className="text-lg font-semibold text-slate-100">2. Opciones NLP</h2>

      <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-4 space-y-3">
        <p className="text-slate-200 font-medium">Normalización básica</p>
        <div className="ml-6 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={toLowercase}
              onChange={e => onChange({ ...options, toLowercase: e.target.checked })}
              className="accent-violet-500 w-4 h-4"
            />
            <span className="text-sm text-slate-300">Convertir a minúsculas</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={removeNumbers}
              onChange={e => onChange({ ...options, removeNumbers: e.target.checked })}
              className="accent-violet-500 w-4 h-4"
            />
            <span className="text-sm text-slate-300">Eliminar números</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={normalizeSpaces}
              onChange={e => onChange({ ...options, normalizeSpaces: e.target.checked })}
              className="accent-violet-500 w-4 h-4"
            />
            <span className="text-sm text-slate-300">Normalizar espacios en blanco</span>
          </label>
        </div>
      </div>

      {/* Limpieza de símbolos */}
      <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-4 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={cleanSymbols}
            onChange={e => onChange({ ...options, cleanSymbols: e.target.checked })}
            className="accent-violet-500 w-4 h-4"
          />
          <span className="text-slate-200 font-medium">Limpiar símbolos</span>
        </label>

        {cleanSymbols && (
          <div className="ml-6 space-y-3">
            <p className="text-xs text-slate-400">Símbolos predefinidos seleccionables</p>
            <p className="text-xs text-slate-500">Haz clic sobre un símbolo para incluirlo o excluirlo de la limpieza.</p>
            <div className="flex flex-wrap gap-1.5">
              {defaultSymbols.map(sym => (
                <Chip
                  key={sym}
                  label={sym}
                  active={activeSymbols.includes(sym)}
                  onClick={() => toggleSymbol(sym)}
                />
              ))}
            </div>

            <div className="space-y-1.5">
              <p className="text-xs text-slate-400">Agregar símbolo inusual:</p>
              <div className="flex gap-2">
                <input
                  value={symInput}
                  onChange={e => setSymInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addExtraSymbol()}
                  placeholder="ej: § ° µ"
                  className="flex-1 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-violet-500"
                />
                <button
                  onClick={addExtraSymbol}
                  className="px-3 py-1.5 bg-violet-700 hover:bg-violet-600 text-white rounded-lg text-sm"
                >
                  +
                </button>
              </div>
              {extraSymbols.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {extraSymbols.map(s => (
                    <span
                      key={s}
                      className="flex items-center gap-1 px-2 py-0.5 bg-violet-900/50 border border-violet-600 text-violet-200 rounded text-xs"
                    >
                      {s}
                      <button onClick={() => removeExtraSymbol(s)} className="text-violet-400 hover:text-red-400 ml-0.5">✕</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tokenización */}
      <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-4 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={doTokenize}
            onChange={e => onChange({ ...options, doTokenize: e.target.checked })}
            className="accent-violet-500 w-4 h-4"
          />
          <span className="text-slate-200 font-medium">Tokenizar</span>
        </label>

        {doTokenize && (
          <div className="ml-6 space-y-3">
            <div className="flex flex-wrap gap-4">
              {[
                { value: 'words', label: 'Palabras (word_tokenize)' },
                { value: 'all', label: 'Palabras + símbolos (regexp_tokenize)' },
                { value: 'chars', label: 'Caracteres (list)' },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="tokenMode"
                    value={opt.value}
                    checked={tokenMode === opt.value}
                    onChange={() => onChange({ ...options, tokenMode: opt.value })}
                    className="accent-violet-500"
                  />
                  <span className="text-sm text-slate-300">{opt.label}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-slate-400">{TOKEN_HELP[tokenMode]}</p>
            <p className="text-xs text-slate-500">
              La tokenización se aplica sobre el texto resultante después de las opciones de limpieza seleccionadas. Si se activa “Limpiar símbolos”, los símbolos eliminados ya no aparecerán como tokens.
            </p>
          </div>
        )}
      </div>

      {/* Stopwords */}
      <div className="bg-slate-900/40 border border-slate-700 rounded-xl p-4 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={removeStopwords}
            onChange={e => onChange({ ...options, removeStopwords: e.target.checked })}
            className="accent-violet-500 w-4 h-4"
          />
          <span className="text-slate-200 font-medium">
            Eliminar stopwords
            <span className="ml-2 text-xs text-slate-500">
              ({defaultStopwords.length} predefinidas ES+EN)
            </span>
          </span>
        </label>

        {removeStopwords && (
          <div className="ml-6 space-y-2">
            <p className="text-xs text-slate-400">Agregar stopwords personalizadas separadas por coma o Enter.</p>
            <div className="flex gap-2">
              <input
                value={swInput}
                onChange={e => setSwInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addExtraStopword()}
                placeholder="ej: también, however, además"
                className="flex-1 bg-slate-900 text-slate-100 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={addExtraStopword}
                className="px-3 py-1.5 bg-violet-700 hover:bg-violet-600 text-white rounded-lg text-sm"
              >
                +
              </button>
            </div>
            {extraStopwords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {extraStopwords.map(w => (
                  <span
                    key={w}
                    className="flex items-center gap-1 px-2 py-0.5 bg-violet-900/50 border border-violet-600 text-violet-200 rounded text-xs"
                  >
                    {w}
                    <button onClick={() => removeExtraStopword(w)} className="text-violet-400 hover:text-red-400 ml-0.5">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
