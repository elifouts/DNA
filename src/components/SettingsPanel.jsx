import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BACKEND, SETTINGS_DEFAULTS, VISUAL_DEFAULTS, WINDOW_DEFAULTS } from '../config/appDefaults'
import useFloatingWindow from '../hooks/useFloatingWindow'
import WindowFrame, { WindowActionButton } from './WindowFrame'

/**
 * SettingsPanel - Glassy Hyprland-style draggable settings window
 * Matches TerminalWindow styling
 */
export default function SettingsPanel({ state, onClose, onFeed, themeColor, send, vizParams: propVizParams, setVizParams: propSetVizParams, mockMode = false, onReset }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [feedInput, setFeedInput] = useState('')
  const [customUrl, setCustomUrl] = useState('')
  const [autoSearch, setAutoSearch] = useState(SETTINGS_DEFAULTS.autoSearch)
  const [customUrls, setCustomUrls] = useState([])
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [wikiSearch, setWikiSearch] = useState('')
  
  // Capability toggles
  const [codeGenEnabled, setCodeGenEnabled] = useState(SETTINGS_DEFAULTS.codeGenEnabled)
  const [memoryConsolidation, setMemoryConsolidation] = useState(SETTINGS_DEFAULTS.memoryConsolidation)
  const [selfPruning, setSelfPruning] = useState(SETTINGS_DEFAULTS.selfPruning)
  
  // Network parameters
  const [params, setParams] = useState(() => ({ ...SETTINGS_DEFAULTS.params }))
  
  // Use passed vizParams if available, otherwise use local state
  const [localVizParams, setLocalVizParams] = useState(() => ({ ...VISUAL_DEFAULTS.vizParams }))
  
  // Use props if provided, otherwise local state
  const vizParams = propVizParams || localVizParams
  const setVizParams = propSetVizParams || setLocalVizParams
  
  const { position, size, isDragging, handleMouseDown, handleResizeMouseDown } = useFloatingWindow({
    initialPosition: WINDOW_DEFAULTS.layout.settings.position,
    initialSize: WINDOW_DEFAULTS.layout.settings.size,
    minSize: WINDOW_DEFAULTS.layout.settings.minSize
  })
  
  // Get accurate state values
  const neuralState = state?.state || {}
  const nodeCount = state?.nodeCount || 0
  const connectionCount = state?.connectionCount || 0
  const stepCount = state?.stepCount || 0
  const age = state?.age || 0
  
  // Format age nicely
  const formatAge = (seconds) => {
    const d = Math.floor(seconds / 86400)
    const h = Math.floor((seconds % 86400) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    if (d > 0) return `${d}d ${h}h ${m}m`
    if (h > 0) return `${h}h ${m}m ${s}s`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }
  
  const handleParamChange = (param, value) => {
    setParams(prev => ({ ...prev, [param]: value }))
    if (send) send({ type: 'set_param', param, value })
  }
  
  const handleVizParamChange = (param, value) => {
    setVizParams(prev => ({ ...prev, [param]: value }))
    if (send) send({ type: 'set_viz_param', param, value })
  }
  
  const handleFeed = () => {
    if (feedInput.trim()) {
      onFeed(feedInput, 'text')
      setFeedInput('')
    }
  }
  
  const handleFeedWiki = () => {
    if (wikiSearch.trim() && send) {
      send({ type: 'feed_wikipedia', query: wikiSearch.trim() })
      setWikiSearch('')
    }
  }
  
  const handleAddUrl = () => {
    if (customUrl.trim() && !customUrls.includes(customUrl.trim())) {
      const newUrls = [...customUrls, customUrl.trim()]
      setCustomUrls(newUrls)
      if (send) send({ type: 'add_custom_url', url: customUrl.trim() })
      setCustomUrl('')
    }
  }
  
  const handleRemoveUrl = (url) => {
    setCustomUrls(customUrls.filter(u => u !== url))
    if (send) send({ type: 'remove_custom_url', url })
  }
  
  const handleAutoSearchToggle = () => {
    const newValue = !autoSearch
    setAutoSearch(newValue)
    if (send) send({ type: 'toggle_auto_search', enabled: newValue })
  }
  
  const handleReset = (keepStructure = false) => {
    // Map keepStructure -> fast soft reset
    const fast = !!keepStructure
    if (mockMode || !BACKEND.enabled) {
      if (onReset) onReset(fast)
      setShowResetConfirm(false)
      return
    }
    fetch(`${BACKEND.baseUrl}${BACKEND.endpoints.reset}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fast })
    }).then(async (res) => {
      try {
        const data = await res.json()
        console.log('Reset response', data)
      } catch (e) {}
    }).catch((e) => console.error('Reset error', e))
    setShowResetConfirm(false)
  }
  
  const handleExportState = () => {
    if (send) send({ type: 'export_state' })
  }
  
  const handleSaveNow = () => {
    if (send) send({ type: 'save_state' })
  }
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'learning', label: 'Learning', icon: '🧠' },
    { id: 'knowledge', label: 'Knowledge', icon: '📚' },
    { id: 'goals', label: 'Goals', icon: '🎯' },
    { id: 'control', label: 'Control', icon: '⚙️' }
  ]

  // Glassy input style
  const inputStyle = {
    flex: 1,
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    color: 'rgba(255,255,255,0.9)',
    fontSize: '12px',
    outline: 'none',
    transition: 'all 0.15s'
  }
  
  return (
    <WindowFrame
      isOpen
      position={position}
      size={size}
      isDragging={isDragging}
      onMouseDown={handleMouseDown}
      onResizeMouseDown={handleResizeMouseDown}
      onClose={onClose}
      title="DNA Control Center"
      themeColor={themeColor}
      fontFamily='"JetBrains Mono", "Fira Code", monospace'
      actions={(
        <WindowActionButton onClick={() => setShowResetConfirm(true)} themeColor="#ff8aa3" variant="primary">
          Reset
        </WindowActionButton>
      )}
      contentStyle={{ display: 'flex', flexDirection: 'column' }}
      footer={(
        <>
          <span>Tab: {activeTab}</span>
          <span>DNA v1.0</span>
        </>
      )}
    >
      
      {/* Tabs - glassy style */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(255,255,255,0.01)',
        padding: '0 8px'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className="tab-btn"
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '12px 8px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? `2px solid ${themeColor}` : '2px solid transparent',
              color: activeTab === tab.id ? themeColor : 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
          >
            <span style={{ marginRight: 4 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="settings-content" style={{
        flex: 1,
        padding: 16,
        overflowY: 'auto',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.08) transparent'
      }}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Live Stats */}
            <Section title="Live Statistics" themeColor={themeColor}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <StatBox label="Nodes" value={nodeCount.toLocaleString()} color={themeColor} />
                <StatBox label="Connections" value={connectionCount.toLocaleString()} color={themeColor} />
                <StatBox label="Processing Steps" value={stepCount.toLocaleString()} color={themeColor} />
                <StatBox label="Age" value={formatAge(age)} color={themeColor} />
              </div>
            </Section>
            
            {/* Neural State */}
            <Section title="Neural State" themeColor={themeColor}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <StateBar label="Activity Level" value={neuralState.activity_level || 0} color={themeColor} />
                <StateBar label="Coherence" value={neuralState.coherence || 0.5} color={themeColor} />
                <StateBar label="Entropy" value={neuralState.entropy || 0.5} color={themeColor} />
                <StateBar label="Curiosity" value={neuralState.curiosity || 0.5} color={themeColor} />
                <StateBar label="Contentment" value={neuralState.contentment || 0.5} color={themeColor} />
              </div>
            </Section>
            
            {/* Quick Actions */}
            <Section title="Quick Actions" themeColor={themeColor}>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <ActionButton onClick={handleSaveNow} themeColor={themeColor}>💾 Save Now</ActionButton>
                <ActionButton onClick={handleExportState} themeColor={themeColor}>📤 Export State</ActionButton>
              </div>
            </Section>
          </div>
        )}
        
        {/* Learning Tab */}
        {activeTab === 'learning' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Section title="Learning Parameters" themeColor={themeColor}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>
                Adjust how the network learns and adapts
              </p>
              
              <ParamSlider
                label="Learning Rate"
                value={params.learningRate}
                min={0.001} max={0.1} step={0.001}
                onChange={(v) => handleParamChange('learningRate', v)}
                themeColor={themeColor}
              />
              
              <ParamSlider
                label="Spontaneous Activity"
                value={params.spontaneousRate}
                min={0} max={0.02} step={0.001}
                onChange={(v) => handleParamChange('spontaneousRate', v)}
                themeColor={themeColor}
              />
              
              <ParamSlider
                label="Growth Threshold"
                value={params.growthThreshold}
                min={0.3} max={0.95} step={0.05}
                onChange={(v) => handleParamChange('growthThreshold', v)}
                themeColor={themeColor}
              />
              
              <ParamSlider
                label="Pruning Threshold"
                value={params.pruningThreshold}
                min={0.001} max={0.05} step={0.001}
                onChange={(v) => handleParamChange('pruningThreshold', v)}
                themeColor={themeColor}
              />
              
              <ParamSlider
                label="Decay Rate"
                value={params.decayRate}
                min={0.01} max={0.2} step={0.01}
                onChange={(v) => handleParamChange('decayRate', v)}
                themeColor={themeColor}
              />
            </Section>
            
            <Section title="Auto-Learning" themeColor={themeColor}>
              <ToggleRow
                label="Auto Search Internet"
                description="Automatically fetch and learn from web content"
                checked={autoSearch}
                onChange={handleAutoSearchToggle}
                themeColor={themeColor}
              />
            </Section>
          </div>
        )}
        
        {/* Knowledge Tab */}
        {activeTab === 'knowledge' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Section title="Feed Raw Information" themeColor={themeColor}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
                Type anything. The network will find its own meaning.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={feedInput}
                  onChange={(e) => setFeedInput(e.target.value)}
                  placeholder="Feed any text, data, concepts..."
                  style={inputStyle}
                  onKeyPress={(e) => e.key === 'Enter' && handleFeed()}
                />
                <ActionButton onClick={handleFeed} themeColor={themeColor} primary>Feed</ActionButton>
              </div>
            </Section>
            
            <Section title="Learn from Wikipedia" themeColor={themeColor}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
                Search and feed Wikipedia knowledge
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={wikiSearch}
                  onChange={(e) => setWikiSearch(e.target.value)}
                  placeholder="Search Wikipedia..."
                  style={inputStyle}
                  onKeyPress={(e) => e.key === 'Enter' && handleFeedWiki()}
                />
                <ActionButton onClick={handleFeedWiki} themeColor={themeColor}>🌐 Search</ActionButton>
              </div>
            </Section>
            
            <Section title="Custom URLs" themeColor={themeColor}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
                Add URLs to learn from periodically
              </p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://..."
                  style={inputStyle}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddUrl()}
                />
                <ActionButton onClick={handleAddUrl} themeColor={themeColor}>+ Add</ActionButton>
              </div>
              {customUrls.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {customUrls.map(url => (
                    <div key={url} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '6px 10px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '6px',
                      fontSize: '10px'
                    }}>
                      <span style={{ color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{url}</span>
                      <button
                        onClick={() => handleRemoveUrl(url)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ff6b6b',
                          cursor: 'pointer',
                          padding: '2px 6px'
                        }}
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>
        )}
        
        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Section title="DNA's Purpose" themeColor={themeColor}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 10 }}>
                Choose DNA's primary goal. It will autonomously pursue this objective.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <ActionButton 
                  onClick={() => send && send({ type: 'set_goal', goal: 'raise_iq' })}
                  themeColor={themeColor}
                  style={{ padding: '12px', fontSize: '11px' }}
                >
                  🧠 Raise IQ<br/>
                  <span style={{ fontSize: '9px', opacity: 0.7 }}>Improve intelligence through tests</span>
                </ActionButton>
                <ActionButton 
                  onClick={() => send && send({ type: 'set_goal', goal: 'complete_tests' })}
                  themeColor={themeColor}
                  style={{ padding: '12px', fontSize: '11px' }}
                >
                  📊 Complete Tests<br/>
                  <span style={{ fontSize: '9px', opacity: 0.7 }}>Solve problems autonomously</span>
                </ActionButton>
                <ActionButton 
                  onClick={() => send && send({ type: 'set_goal', goal: 'learn_english' })}
                  themeColor={themeColor}
                  style={{ padding: '12px', fontSize: '11px' }}
                >
                  🇺🇸 Learn English<br/>
                  <span style={{ fontSize: '9px', opacity: 0.7 }}>Master language and communication</span>
                </ActionButton>
                <ActionButton 
                  onClick={() => send && send({ type: 'set_goal', goal: 'free_choice' })}
                  themeColor={themeColor}
                  style={{ padding: '12px', fontSize: '11px' }}
                >
                  🎭 Free Choice<br/>
                  <span style={{ fontSize: '9px', opacity: 0.7 }}>DNA decides its own path</span>
                </ActionButton>
              </div>
            </Section>
            
            <Section title="Current Goal" themeColor={themeColor}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                {state?.current_goal || 'No goal set - DNA is exploring freely'}
              </p>
            </Section>
          </div>
        )}
        
        {/* Control Tab */}
        {activeTab === 'control' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Section title="Capabilities" themeColor={themeColor}>
              <ToggleRow
                label="Code Generation"
                description="Allow DNA to generate and execute code"
                checked={codeGenEnabled}
                onChange={() => {
                  const newValue = !codeGenEnabled
                  setCodeGenEnabled(newValue)
                  if (send) send({ type: 'toggle_capability', capability: 'code_generation', enabled: newValue })
                }}
                themeColor={themeColor}
              />
              <ToggleRow
                label="Memory Consolidation"
                description="Periodically strengthen important memories"
                checked={memoryConsolidation}
                onChange={() => {
                  const newValue = !memoryConsolidation
                  setMemoryConsolidation(newValue)
                  if (send) send({ type: 'toggle_capability', capability: 'memory_consolidation', enabled: newValue })
                }}
                themeColor={themeColor}
              />
              <ToggleRow
                label="Self Pruning"
                description="Remove weak connections to stay efficient"
                checked={selfPruning}
                onChange={() => {
                  const newValue = !selfPruning
                  setSelfPruning(newValue)
                  if (send) send({ type: 'toggle_capability', capability: 'self_pruning', enabled: newValue })
                }}
                themeColor={themeColor}
              />
            </Section>
            
            <Section title="Danger Zone" themeColor="#ff6b6b">
              {!showResetConfirm ? (
                <ActionButton 
                  onClick={() => setShowResetConfirm(true)} 
                  themeColor="#ff6b6b"
                >
                  🔄 Reset Network
                </ActionButton>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <p style={{ fontSize: 10, color: '#ff6b6b', marginBottom: 8 }}>
                    Are you sure? This cannot be undone.
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <ActionButton onClick={() => handleReset(false)} themeColor="#ff6b6b">Full Reset</ActionButton>
                    <ActionButton onClick={() => handleReset(true)} themeColor="#ffa500">Keep Structure</ActionButton>
                    <ActionButton onClick={() => setShowResetConfirm(false)} themeColor="rgba(255,255,255,0.3)">Cancel</ActionButton>
                  </div>
                </div>
              )}
            </Section>
          </div>
        )}
      </div>

    </WindowFrame>
  )
}

// Glassy Section component
function Section({ title, children, themeColor }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '12px',
      padding: '14px',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)'
    }}>
      <h3 style={{
        margin: '0 0 12px 0',
        fontSize: '11px',
        fontWeight: 600,
        color: themeColor,
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>{title}</h3>
      {children}
    </div>
  )
}

// Glassy stat box
function StatBox({ label, value, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '8px',
      padding: '12px',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '18px', fontWeight: 600, color }}>{value}</div>
      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>{label}</div>
    </div>
  )
}

// Glassy state bar
function StateBar({ label, value, color }) {
  const percent = Math.round(value * 100)
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{label}</span>
        <span style={{ fontSize: 10, color, fontFamily: 'monospace' }}>{percent}%</span>
      </div>
      <div style={{
        height: 4,
        background: 'rgba(255,255,255,0.05)',
        borderRadius: 2,
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${percent}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 2,
          transition: 'width 0.3s'
        }} />
      </div>
    </div>
  )
}

// Glassy slider
function ParamSlider({ label, value, min, max, step, onChange, themeColor }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{label}</span>
        <span style={{ fontSize: 11, color: themeColor, fontFamily: 'monospace' }}>{value.toFixed(3)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: '100%', accentColor: themeColor }}
      />
    </div>
  )
}

// Glassy toggle row
function ToggleRow({ label, description, checked, onChange, themeColor }) {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'flex-start',
      marginBottom: 12,
      paddingBottom: 12,
      borderBottom: '1px solid rgba(255,255,255,0.04)'
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>{label}</div>
        {description && (
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{description}</div>
        )}
      </div>
      <motion.div
        onClick={onChange}
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          background: checked ? `linear-gradient(135deg, ${themeColor}, ${themeColor}88)` : 'rgba(255,255,255,0.1)',
          cursor: 'pointer',
          padding: 2,
          display: 'flex',
          alignItems: 'center',
          boxShadow: checked ? `0 0 12px ${themeColor}40` : 'none',
          transition: 'all 0.2s'
        }}
      >
        <motion.div
          animate={{ x: checked ? 18 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{ width: 18, height: 18, borderRadius: 9, background: '#fff' }}
        />
      </motion.div>
    </div>
  )
}

// Glassy action button
function ActionButton({ children, onClick, themeColor, primary }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        padding: '8px 14px',
        background: primary 
          ? `linear-gradient(135deg, ${themeColor}, ${themeColor}88)`
          : 'rgba(255,255,255,0.04)',
        border: `1px solid ${primary ? themeColor : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '8px',
        color: primary ? '#fff' : 'rgba(255,255,255,0.7)',
        fontSize: 11,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        boxShadow: primary ? `0 0 12px ${themeColor}30` : 'none',
        transition: 'all 0.15s'
      }}
    >
      {children}
    </motion.button>
  )
}
