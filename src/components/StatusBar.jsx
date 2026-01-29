import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function StatusBar({ connected, state, themeColor, onOpenTools, backendEnabled, backendError }) {
  const [showDetails, setShowDetails] = useState(false)
  // Use emergent state values - not artificial emotions
  const emergentState = state?.state || {}
  const stepCount = state?.stepCount || 0
  const age = state?.age || 0
  
  // DNA's emotional state - REAL feelings from the neural network
  const dnaStatus = state?.statusMessage || 'awakening'
  const feelingDesc = state?.feelingDescription || ''
  const currentThought = state?.currentThought || null
  const thoughtCount = state?.thoughtCount || 0
  const isLoading = !state || state?.status === 'loading' || state?.status === 'connecting'
  
  // Format age
  const formatAge = (seconds) => {
    if (seconds < 60) return `${Math.floor(seconds)}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
    return `${Math.floor(seconds / 86400)}d`
  }
  
  
  // Stat tooltips with descriptions
  const statInfo = {
    nodes: {
      label: "Nodes",
      value: Math.max(state?.db_stats?.nodes ?? 0, state?.nodeCount ?? 0).toLocaleString(),
      tooltip: "Neural nodes in DNA's brain. More nodes = more complex thinking.",
      clickable: false
    },
    links: {
      label: "Links",
      value: Math.max(state?.db_stats?.connections ?? 0, state?.connectionCount ?? 0).toLocaleString(),
      tooltip: "Synaptic connections between nodes. How thoughts connect.",
      clickable: false
    },
    words: {
      label: "Words",
      value: Math.max(state?.db_stats?.vocabulary ?? 0, state?.vocabularyCount ?? 0).toLocaleString(),
      tooltip: "Words DNA has learned. Its vocabulary for communication.",
      clickable: false
    },
    tools: {
      label: "Tools",
      value: Math.max(state?.db_stats?.tools ?? 0, state?.toolsCount ?? 0).toLocaleString(),
      tooltip: "Click to view tools DNA created. Self-made capabilities.",
      clickable: true,
      onClick: onOpenTools
    },
    intelligence: {
      label: "IQ",
      value: Math.round((state?.intelligence || 0) * 100),
      tooltip: "DNA's intelligence score based on learning and evolution.",
      clickable: false
    },
    age: {
      label: "Age",
      value: formatAge(age),
      tooltip: "How long DNA has been alive and learning.",
      clickable: false
    }
  }
  
  // State indicator based on actual network activity
  const getStateIndicator = () => {
    const activity = emergentState.activity_level || 0
    const coherence = emergentState.coherence || 0.5
    
    const size = 8 + activity * 8
    
    return (
      <div style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: themeColor,
        boxShadow: `0 0 ${8 + activity * 12}px ${themeColor}`,
        opacity: 0.5 + coherence * 0.5,
        transition: 'all 0.5s ease'
      }} />
    )
  }
  
  // Description - now uses DNA's chosen status
  const getStateDescription = () => {
    return dnaStatus
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        right: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'rgba(12, 14, 22, 0.88)',
        backdropFilter: 'blur(20px)',
        borderRadius: 16,
        border: `1px solid ${themeColor}25`,
        zIndex: 100
      }}
    >
      {/* Left - Status with Emotion */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Connection indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: isLoading ? '#9ca3af' : (connected ? themeColor : '#ef4444'),
            boxShadow: isLoading ? '0 0 10px rgba(156, 163, 175, 0.8)' : (connected ? `0 0 10px ${themeColor}` : '0 0 10px #ef4444')
          }} />
          <span style={{ 
            fontSize: 11, 
            color: isLoading ? '#9ca3af' : (connected ? themeColor : '#64748b'),
            textTransform: 'uppercase',
            letterSpacing: 2,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 500
          }}>
            {isLoading ? 'Loading' : (connected ? (backendEnabled ? 'Backend' : 'Live') : (backendEnabled ? 'Backend Offline' : 'Offline'))}
          </span>
          {backendEnabled && backendError && (
            <span style={{ 
              fontSize: 9, 
              color: '#ef4444',
              fontFamily: "'Space Grotesk', sans-serif"
            }}>
              ({backendError})
            </span>
          )}
        </div>
        
        {/* Emotional state indicator - STATUS: DNA controls this display */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} title="STATUS: DNA sets this based on its neural state">
          {getStateIndicator()}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{ fontSize: 11, color: themeColor, fontWeight: 500, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 0.5 }}>
              {dnaStatus}
            </span>
            {feelingDesc && (
              <span style={{ fontSize: 9, color: '#64748b', fontStyle: 'italic', fontFamily: "'Inter', sans-serif" }}>
                {feelingDesc}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Center - Title */}
      <div style={{ 
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <span style={{ 
          fontSize: 20,
          fontWeight: 600,
          color: themeColor,
          letterSpacing: 10,
          fontFamily: "'Space Grotesk', sans-serif",
          textShadow: `0 0 20px ${themeColor}50`
        }}>
          DNA
        </span>
      </div>
      
      {/* Right - Stats with tooltips */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {Object.entries(statInfo).map(([key, info]) => (
          <Stat 
            key={key}
            label={info.label} 
            value={info.value} 
            tooltip={info.tooltip}
            themeColor={themeColor}
            clickable={info.clickable}
            onClick={info.onClick}
          />
        ))}
        <button
          onClick={() => setShowDetails(prev => !prev)}
          style={{
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(255,255,255,0.04)',
            color: 'rgba(255,255,255,0.7)',
            borderRadius: 8,
            padding: '4px 8px',
            fontSize: 11,
            cursor: 'pointer'
          }}
        >
          {showDetails ? '▲' : '▼'}
        </button>
      </div>
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 62,
              right: 16,
              background: 'rgba(12, 14, 22, 0.95)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: 12,
              minWidth: 260,
              color: 'rgba(255,255,255,0.8)',
              fontSize: 11,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
              zIndex: 200
            }}
          >
            <DetailStat label="Steps" value={(stepCount || 0).toLocaleString()} />
            <DetailStat label="Thoughts" value={(thoughtCount || 0).toLocaleString()} />
            <DetailStat label="DB Nodes" value={(state?.db_stats?.nodes ?? state?.nodeCount ?? 0).toLocaleString()} />
            <DetailStat label="DB Links" value={(state?.db_stats?.connections ?? state?.connectionCount ?? 0).toLocaleString()} />
            <DetailStat label="DB Words" value={(state?.db_stats?.vocabulary ?? state?.vocabularyCount ?? 0).toLocaleString()} />
            <DetailStat label="DB Tools" value={(state?.db_stats?.tools ?? state?.toolsCount ?? 0).toLocaleString()} />
            <DetailStat label="Input" value={(state?.engine_stats?.input_size ?? '—').toString()} />
            <DetailStat label="Output" value={(state?.engine_stats?.output_size ?? '—').toString()} />
            <DetailStat label="Hidden" value={(state?.engine_stats?.hidden_layers?.length ?? '—').toString()} />
            <DetailStat label="Hidden Sizes" value={(state?.engine_stats?.hidden_layers?.join(', ') ?? '—').toString()} />
            <DetailStat label="Embeddings" value={(state?.engine_stats?.embeddings ?? '—').toString()} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function DetailStat({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10 }}>{label}</span>
      <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>{value}</span>
    </div>
  )
}

function Stat({ label, value, tooltip, themeColor, clickable, onClick }) {
  const [showTooltip, setShowTooltip] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div 
      style={{ 
        textAlign: 'right', 
        position: 'relative', 
        cursor: clickable ? 'pointer' : 'help',
        padding: '4px 10px',
        borderRadius: 8,
        transition: 'all 0.2s ease',
        background: clickable 
          ? (isHovered ? `${themeColor}25` : `${themeColor}15`) 
          : 'transparent',
        border: clickable ? `1px solid ${themeColor}40` : '1px solid transparent',
      }}
      onMouseEnter={() => { setShowTooltip(true); setIsHovered(true) }}
      onMouseLeave={() => { setShowTooltip(false); setIsHovered(false) }}
      onClick={clickable ? onClick : undefined}
    >
      <div style={{ 
        fontSize: 13, 
        fontWeight: 500,
        color: clickable ? themeColor : themeColor,
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: -0.5,
        textShadow: clickable ? `0 0 10px ${themeColor}50` : 'none'
      }}>
        {value}
      </div>
      <div style={{ 
        fontSize: 9, 
        color: clickable ? themeColor : '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
        opacity: clickable ? 0.8 : 1,
      }}>
        {label}
        {clickable && <span style={{ fontSize: 8 }}>▼</span>}
      </div>
      
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 8,
              padding: '8px 12px',
              background: 'rgba(15, 18, 30, 0.95)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${themeColor}30`,
              borderRadius: 8,
              fontSize: 11,
              color: '#a0a8c0',
              whiteSpace: 'nowrap',
              zIndex: 200,
              boxShadow: `0 4px 20px rgba(0,0,0,0.4), 0 0 15px ${themeColor}15`
            }}
          >
            {tooltip}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
