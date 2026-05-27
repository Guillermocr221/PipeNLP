import { useState, useRef } from 'react'

const SAMPLE_TEXT = `El procesamiento de Lenguaje Natural (NLP) es un campo de la Inteligencia Artificial que estudia las interacciones entre las computadoras y el lenguaje humano. En 2024, los modelos NLP procesaron más de 1500 millones de textos diariamente; ¿impresionante, verdad?

Las técnicas modernas incluyen: tokenización, lematización, stemming, y embeddings vectoriales. Cada técnica resuelve un problema específico — por ejemplo, la tokenización segmenta el texto en unidades llamadas tokens.

Herramientas populares: NLTK, spaCy, Hugging Face Transformers. ¡La elección depende del caso de uso! Muchos investigadores combinan estas librerías con frameworks como PyTorch o TensorFlow para entrenar redes neuronales profundas.

Un pipeline típico de preprocesamiento incluye 5 pasos: 1) limpieza, 2) normalización, 3) tokenización, 4) eliminación de stopwords y 5) vectorización. Cada paso reduce la dimensionalidad y mejora la calidad del modelo.`

// ── Icons ──────────────────────────────────────────────────────
const UploadIcon = () => (
  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
)
const TypeIcon = ({ s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/>
    <line x1="12" y1="4" x2="12" y2="20"/>
  </svg>
)
const HashIcon = ({ s = 11 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/>
    <line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
  </svg>
)
const SparkIcon = ({ s = 12 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
  </svg>
)
const TrashIcon = ({ s = 12 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/>
  </svg>
)
const FileIcon = ({ s = 11 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
)

export default function DataInput({ text, setText }) {
  const [dragOver, setDragOver] = useState(false)
  const [filename, setFilename] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const fileRef = useRef(null)

  const charCount = text.length
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const lineCount = text ? text.split('\n').length : 0

  function handleFile(file) {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.txt')) {
      setLoadError('Formato no permitido. Solo se aceptan archivos .txt.')
      return
    }
    setLoadError(null)
    setFilename(file.name)
    const reader = new FileReader()
    reader.onload = (e) => setText(String(e.target.result || ''))
    reader.readAsText(file, 'utf-8')
  }

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  function clearAll() {
    setText('')
    setFilename(null)
    setLoadError(null)
  }

  return (
    <div className="grid-2">
      {/* ── Editor card ── */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">
              <TypeIcon s={14} /> Editor de texto
            </div>
            <div className="card-sub">Pega o escribe tu corpus. El texto se conserva entre pasos.</div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn-sm btn-ghost" onClick={() => { setText(SAMPLE_TEXT); setFilename(null); }}>
              <SparkIcon s={12} /> Cargar ejemplo
            </button>
            <button
              className="btn btn-sm btn-ghost"
              onClick={clearAll}
              disabled={!text}
              style={{ opacity: text ? 1 : 0.5 }}
            >
              <TrashIcon s={12} /> Limpiar texto
            </button>
          </div>
        </div>
        <div className="card-body">
          <textarea
            className="textarea"
            placeholder={"Escribe o pega tu texto aquí…\n\nEjemplo: artículos, reseñas, transcripciones, logs."}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="row between" style={{ marginTop: 12 }}>
            <div className="row" style={{ gap: 8 }}>
              <span className="badge slate"><HashIcon s={11} /> {charCount.toLocaleString()} caracteres</span>
              <span className="badge slate"><TypeIcon s={11} /> {wordCount.toLocaleString()} palabras</span>
              <span className="badge slate">{lineCount.toLocaleString()} líneas</span>
            </div>
            {filename && (
              <span className="badge green"><FileIcon s={11} /> {filename}</span>
            )}
          </div>
          {loadError && (
            <div style={{ marginTop: 8, color: 'var(--red)', fontSize: 12 }}>{loadError}</div>
          )}
        </div>
      </div>

      {/* ── Upload card ── */}
      <div className="card">
        <div className="card-head">
          <div>
            <div className="card-title">
              <UploadIcon /> Carga de archivo
            </div>
            <div className="card-sub">Arrastra un archivo .txt o selecciónalo manualmente.</div>
          </div>
        </div>
        <div className="card-body">
          <div
            className={'dropzone' + (dragOver ? ' over' : '')}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'var(--violet-soft)',
              display: 'grid', placeItems: 'center',
              margin: '0 auto 12px', color: '#c4b5fd',
            }}>
              <UploadIcon />
            </div>
            <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>Arrastra tu archivo aquí</div>
            <div className="mute" style={{ fontSize: 12, marginTop: 4 }}>
              o haz clic para examinar · formatos: <span className="mono">.txt</span> · máx 5 MB
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".txt"
              hidden
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>

          <div className="divider" />

          <div className="stack" style={{ gap: 8 }}>
            <div className="row between" style={{ fontSize: 12 }}>
              <span className="mute">Encoding</span>
              <span className="mono">UTF-8</span>
            </div>
            <div className="row between" style={{ fontSize: 12 }}>
              <span className="mute">Idioma</span>
              <span className="mono">es / en</span>
            </div>
            <div className="row between" style={{ fontSize: 12 }}>
              <span className="mute">Stopwords</span>
              <span className="mono">bilingüe</span>
            </div>
          </div>

          <div style={{
            marginTop: 16, padding: '12px 14px',
            background: 'rgba(56,189,248,0.05)',
            border: '1px solid rgba(56,189,248,0.18)',
            borderRadius: 9, fontSize: 12, color: 'var(--text-dim)',
          }}>
            <strong style={{ color: '#7dd3fc' }}>Tip:</strong> también puedes pegar texto multilinea directamente en el editor. Los saltos de línea se preservarán hasta el paso de tokenización.
          </div>
        </div>
      </div>
    </div>
  )
}
