import { VISUAL_DEFAULTS, WINDOW_DEFAULTS, STATS_DEFAULTS, STATS_PANEL_DEFAULTS } from '../config/appDefaults'
import useFloatingWindow from '../hooks/useFloatingWindow'
import WindowFrame from './WindowFrame'

export default function StatsWindow({ isOpen, onClose, themeColor = VISUAL_DEFAULTS.theme.hex, state }) {
  const { position, size, isDragging, handleMouseDown, handleResizeMouseDown } = useFloatingWindow({
    initialPosition: WINDOW_DEFAULTS.layout.stats.position,
    initialSize: WINDOW_DEFAULTS.layout.stats.size,
    minSize: WINDOW_DEFAULTS.layout.stats.minSize
  })

  const snapshot = state || STATS_DEFAULTS
  const core = {
    status: snapshot.statusMessage || snapshot.status || 'idle',
    feeling: snapshot.feeling || 'neutral',
    age: snapshot.age || 0,
    steps: snapshot.stepCount || 0,
    thoughts: snapshot.thoughtCount || 0,
    intelligence: Math.round((snapshot.intelligence || 0) * 100)
  }

  const db = {
    nodes: snapshot.db_stats?.nodes ?? snapshot.nodeCount ?? 0,
    connections: snapshot.db_stats?.connections ?? snapshot.connectionCount ?? 0,
    vocabulary: snapshot.db_stats?.vocabulary ?? snapshot.vocabularyCount ?? 0,
    tools: snapshot.db_stats?.tools ?? snapshot.toolsCount ?? 0
  }

  const engine = {
    input: snapshot.engine_stats?.input_size ?? '—',
    output: snapshot.engine_stats?.output_size ?? '—',
    hiddenLayers: snapshot.engine_stats?.hidden_layers?.length ?? '—',
    hiddenSizes: snapshot.engine_stats?.hidden_layers?.join(', ') ?? '—',
    embeddings: snapshot.engine_stats?.embeddings ?? '—'
  }

  const runtime = {
    activity: snapshot.state?.activity_level ?? 0,
    coherence: snapshot.state?.coherence ?? 0,
    entropy: snapshot.state?.entropy ?? 0,
    curiosity: snapshot.state?.curiosity ?? 0,
    contentment: snapshot.state?.contentment ?? 0
  }

  const renderMetric = (label, value, unit) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
      <span style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
      <span style={{ color: themeColor, fontFamily: '"JetBrains Mono", monospace' }}>{value}{unit || ''}</span>
    </div>
  )

  const formatSeconds = (seconds) => {
    const total = Number(seconds) || 0
    const hours = Math.floor(total / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    const secs = Math.floor(total % 60)
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  const sections = [
    { key: 'core', label: 'Core', content: (
      <>
        {renderMetric('Status', core.status)}
        {renderMetric('Feeling', core.feeling)}
        {renderMetric('Age', formatSeconds(core.age))}
        {renderMetric('Steps', core.steps.toLocaleString())}
        {renderMetric('Thoughts', core.thoughts.toLocaleString())}
        {renderMetric('IQ', core.intelligence)}
      </>
    ) },
    { key: 'db', label: 'DB Snapshot', content: (
      <>
        {renderMetric('Nodes', db.nodes.toLocaleString())}
        {renderMetric('Links', db.connections.toLocaleString())}
        {renderMetric('Vocabulary', db.vocabulary.toLocaleString())}
        {renderMetric('Tools', db.tools.toLocaleString())}
      </>
    ) },
    { key: 'engine', label: 'Engine', content: (
      <>
        {renderMetric('Input', engine.input)}
        {renderMetric('Output', engine.output)}
        {renderMetric('Hidden Layers', engine.hiddenLayers)}
        {renderMetric('Hidden Sizes', engine.hiddenSizes)}
        {renderMetric('Embeddings', engine.embeddings)}
      </>
    ) },
    { key: 'runtime', label: 'Runtime', content: (
      <>
        {renderMetric('Activity', (runtime.activity * 100).toFixed(1), '%')}
        {renderMetric('Coherence', (runtime.coherence * 100).toFixed(1), '%')}
        {renderMetric('Entropy', (runtime.entropy * 100).toFixed(1), '%')}
        {renderMetric('Curiosity', (runtime.curiosity * 100).toFixed(1), '%')}
        {renderMetric('Contentment', (runtime.contentment * 100).toFixed(1), '%')}
      </>
    ) }
  ]

  return (
    <WindowFrame
      isOpen={isOpen}
      position={position}
      size={size}
      isDragging={isDragging}
      onMouseDown={handleMouseDown}
      onResizeMouseDown={handleResizeMouseDown}
      onClose={onClose}
      title="System Telemetry"
      themeColor={themeColor}
      badge={STATS_PANEL_DEFAULTS.refreshLabel}
      contentStyle={{ padding: 16, overflow: 'auto' }}
      footer={(
        <>
          <span>Mode: frontend mock</span>
          <span style={{ color: themeColor }}>Ready for API</span>
        </>
      )}
    >
      <div style={{ display: 'grid', gap: 12 }}>
        {sections.map(section => (
          <div
            key={section.key}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 12,
              padding: 12,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)'
            }}
          >
            <div style={{
              marginBottom: 8,
              fontSize: 11,
              color: themeColor,
              textTransform: 'uppercase',
              letterSpacing: 1
            }}>
              {section.label}
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              {section.content}
            </div>
          </div>
        ))}
      </div>
    </WindowFrame>
  )
}
