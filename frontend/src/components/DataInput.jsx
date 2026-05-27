import { useState } from 'react'

export default function DataInput({ text, onTextChange, inputMode, setInputMode }) {
  const [fileName, setFileName] = useState(null)
  const [fileStats, setFileStats] = useState(null)
  const [loadError, setLoadError] = useState(null)

  const textStats = getTextStats(text)

  function handleTextChange(e) {
    onTextChange(e.target.value)
  }

  function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.txt')) {
      setLoadError('Formato no permitido. Solo se aceptan archivos .txt.')
      setFileName(null)
      setFileStats(null)
      return
    }
    setLoadError(null)
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const content = ev.target.result
      onTextChange(content)
      setFileStats(getTextStats(content))
      setInputMode('text')
    }
    reader.readAsText(file, 'utf-8')
  }

  function clearText() {
    onTextChange('')
    setFileName(null)
    setFileStats(null)
    setLoadError(null)
  }

  return (
    <section className="bg-slate-800 rounded-xl p-5 space-y-4">
      <h2 className="text-lg font-semibold text-slate-100">1. Ingreso de datos</h2>

      <div className="flex gap-2">
        <button
          onClick={() => setInputMode('text')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
            inputMode === 'text'
              ? 'bg-violet-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Pegar texto
        </button>
        <button
          onClick={() => setInputMode('file')}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
            inputMode === 'file'
              ? 'bg-violet-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          Cargar archivo de texto (.txt)
        </button>
      </div>

      {inputMode === 'file' && (
        <div className="space-y-2">
          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-violet-500 transition">
            <svg className="w-8 h-8 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-slate-400 text-sm">
              {fileName ? fileName : 'Haz clic o arrastra un archivo de texto (.txt)'}
            </span>
            <span className="text-slate-600 text-xs mt-1">Solo se permiten archivos .txt</span>
            <input
              type="file"
              accept=".txt"
              className="hidden"
              onChange={handleFile}
            />
          </label>
          {loadError && <p className="text-red-400 text-xs">{loadError}</p>}
          {fileName && fileStats && !loadError && (
            <div className="text-emerald-400 text-xs space-y-0.5">
              <p>Archivo cargado: <span className="font-mono">{fileName}</span></p>
              <p>Caracteres: <span className="font-mono">{fileStats.characters}</span></p>
              <p>Palabras aproximadas: <span className="font-mono">{fileStats.words}</span></p>
            </div>
          )}
        </div>
      )}

      <textarea
        value={text}
        onChange={handleTextChange}
        placeholder={inputMode === 'file'
          ? 'El contenido del archivo cargado aparecerá aquí para su revisión.'
          : 'Pega aquí el texto que deseas preprocesar.'}
        rows={7}
        className="w-full bg-slate-900 text-slate-100 rounded-lg p-3 text-sm border border-slate-700 focus:outline-none focus:border-violet-500 resize-y font-mono"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {text.length > 0
            ? `${textStats.characters} caracteres · ${textStats.words} palabras aprox.`
            : 'Aún no se ha ingresado ni cargado texto.'}
        </p>
        {text.length > 0 && (
          <button
            onClick={clearText}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-xs font-medium transition"
          >
            Limpiar texto
          </button>
        )}
      </div>
    </section>
  )
}

function getTextStats(value) {
  const text = value ?? ''
  return {
    characters: text.length,
    words: text.trim().split(/\s+/).filter(Boolean).length,
  }
}
