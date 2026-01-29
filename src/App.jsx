import React, { useState, useEffect, useCallback, Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import NeuralNetwork from './components/NeuralNetwork'
import ChatPanel from './components/ChatPanel'
import StatusBar from './components/StatusBar'
import SettingsPanel from './components/SettingsPanel'
import ThoughtBubble from './components/ThoughtBubble'
import ActivityLog from './components/ActivityLog'
import TerminalWindow from './components/TerminalWindow'
import ToolsPanel from './components/ToolsPanel'
import VisualizationWindow from './components/VisualizationWindow'
import StatsWindow from './components/StatsWindow'
import useBackendIntegration from './hooks/useBackendIntegration'
import {
  BACKEND,
  VISUAL_DEFAULTS,
  AI_FLOW,
  TASK_VIZ_MAPPING,
  mapTaskToVisualization,
  STATS_DEFAULTS,
  MOCK_DATA,
  clamp,
  createInitialState,
  createDummyNetwork,
  evolveDummyNetwork
} from './config/appDefaults'

const hslToRgb = (h, s, l) => {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const hp = h / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  let r = 0
  let g = 0
  let b = 0
  if (hp >= 0 && hp < 1) {
    r = c
    g = x
  } else if (hp >= 1 && hp < 2) {
    r = x
    g = c
  } else if (hp >= 2 && hp < 3) {
    g = c
    b = x
  } else if (hp >= 3 && hp < 4) {
    g = x
    b = c
  } else if (hp >= 4 && hp < 5) {
    r = x
    b = c
  } else if (hp >= 5 && hp < 6) {
    r = c
    b = x
  }
  const m = l - c / 2
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ]
}

const rgbToHex = (rgb) => {
  const [r, g, b] = rgb.map((v) => Math.max(0, Math.min(255, v)))
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`
}

export default function App() {
  const [state, setState] = useState(() => createInitialState())

  const [showChat, setShowChat] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showActivity, setShowActivity] = useState(false)
  const [showTerminal, setShowTerminal] = useState(false)
  const [showTools, setShowTools] = useState(false)
  const [showViz, setShowViz] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [themeColor, setThemeColor] = useState(VISUAL_DEFAULTS.theme.hex)
  const [chatMessages, setChatMessages] = useState([])
  const [connected] = useState(true)
  const [toolsData] = useState(() => MOCK_DATA.tools)
  const [activityData, setActivityData] = useState(() => {
    const now = Math.floor(Date.now() / 1000)
    return MOCK_DATA.content.activityEvents.map((event, index) => ({
      timestamp: now - (index + 1) * 10,
      ...event
    }))
  })

  // Backend integration
  const {
    backendConnected,
    backendData,
    isLoading: backendLoading,
    error: backendError,
    sendChatMessage,
    wsConnected
  } = useBackendIntegration()

  // Visualization parameters - shared between SettingsPanel and NeuralNetwork
  // Load from localStorage on init
  const [vizParams, setVizParams] = useState(() => {
    try {
      const saved = localStorage.getItem('dna_viz_defaults')
      if (saved) {
        const parsed = JSON.parse(saved)
        console.log('[DNA] Loaded settings from localStorage:', Object.keys(parsed).length, 'params')
        return { ...VISUAL_DEFAULTS.vizParams, ...parsed }
      }
    } catch (e) {
      console.warn('[DNA] Failed to load settings from localStorage:', e)
    }
    return VISUAL_DEFAULTS.vizParams
  })

  // Network evolution parameters - controlled by AI tasks
  const [networkParams, setNetworkParams] = useState(() => ({
    targetNodeCount: VISUAL_DEFAULTS.network?.nodeCount ?? 15,
    targetLinkCount: VISUAL_DEFAULTS.network?.linkCount ?? 25,
    growthRate: 0.1,
    pruningRate: 0.05,
    linkStability: 0.95 // 0-1: how stable links are (higher = less likely to change)
  }))

  // Create network with current vizParams
  const createNetworkWithParams = useCallback(() => {
    const nodeCount = vizParams.nodeCount ?? VISUAL_DEFAULTS.vizParams.nodeCount ?? 120
    console.log('[DNA] Creating network with', nodeCount, 'nodes')
    return createDummyNetwork(nodeCount)
  }, [vizParams.nodeCount])

  const [networkState, setNetworkState] = useState(() => createDummyNetwork(VISUAL_DEFAULTS.vizParams.nodeCount ?? 120))

  // Simulate state changes (mock-only)
  useEffect(() => {
    if (BACKEND.enabled) return
    const startedAt = Date.now()
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000)
      setState(prev => {
        const activity = MOCK_DATA.generators.randomStateChange(
          prev?.state?.activity_level ?? 0.5,
          MOCK_DATA.simulation.stateChanges.activity_level.range,
          MOCK_DATA.simulation.stateChanges.activity_level.variance
        )
        const coherence = MOCK_DATA.generators.randomStateChange(
          prev?.state?.coherence ?? 0.6,
          MOCK_DATA.simulation.stateChanges.coherence.range,
          MOCK_DATA.simulation.stateChanges.coherence.variance
        )
        const entropy = MOCK_DATA.generators.randomStateChange(
          prev?.state?.entropy ?? 0.4,
          MOCK_DATA.simulation.stateChanges.entropy.range,
          MOCK_DATA.simulation.stateChanges.entropy.variance
        )
        const curiosity = MOCK_DATA.generators.randomStateChange(
          prev?.state?.curiosity ?? 0.7,
          MOCK_DATA.simulation.stateChanges.curiosity.range,
          MOCK_DATA.simulation.stateChanges.curiosity.variance
        )
        const contentment = MOCK_DATA.generators.randomStateChange(
          prev?.state?.contentment ?? 0.45,
          MOCK_DATA.simulation.stateChanges.contentment.range,
          MOCK_DATA.simulation.stateChanges.contentment.variance
        )

        return {
          ...prev,
          age: STATS_DEFAULTS.age + elapsed,
          stepCount: (prev?.stepCount ?? 0) + MOCK_DATA.generators.randomStepIncrement(),
          thoughtCount: (prev?.thoughtCount ?? 0) + MOCK_DATA.generators.randomThoughtIncrement(),
          currentThought: MOCK_DATA.generators.shouldChangeThought() ? MOCK_DATA.generators.randomThought() : prev?.currentThought,
          state: {
            activity_level: activity,
            coherence,
            entropy,
            curiosity,
            contentment
          },
          db_stats: {
            ...prev.db_stats,
            last_activity: Date.now()
          }
        }
      })
    }, 1200)

    return () => clearInterval(interval)
  }, [])

  // Simulate network pulsing (mock-only)
  useEffect(() => {
    if (BACKEND.enabled) return
    const interval = setInterval(() => {
      setNetworkState(prev => ({
        ...prev,
        nodes: prev.nodes.map(node => ({
          ...node,
          activation: clamp(node.activation + (Math.random() - 0.5) * MOCK_DATA.simulation.pulse.activationJitter, 0, 1),
          active: Math.random() < MOCK_DATA.simulation.pulse.activeChance
        }))
      }))
    }, MOCK_DATA.simulation.pulse.intervalMs)

    return () => clearInterval(interval)
  }, [])

  // Network evolution driven by AI tasks
  useEffect(() => {
    let rebuildCounter = 0
    const minRebuildInterval = 10 // Only rebuild links every 10 evolution cycles minimum

    const interval = setInterval(() => {
      setNetworkState(prev => {
        // Use task-driven parameters when available, fallback to mock simulation
        const evolutionParams = {
          pulse: MOCK_DATA.simulation.pulse,
          mutation: {
            ...MOCK_DATA.simulation.mutation,
            // Override with task-driven parameters
            minNodes: Math.max(2, Math.floor(networkParams.targetNodeCount * 0.5)),
            maxNodes: Math.max(networkParams.targetNodeCount + 10, networkParams.targetNodeCount * 1.5),
            linkCount: networkParams.targetLinkCount,
            addProbability: networkParams.growthRate,
            removeProbability: networkParams.pruningRate
          },
          mutationOnly: true
        }

        let next = evolveDummyNetwork(prev, evolutionParams)
        let linksRebuilt = false

        // Check if nodes changed (added or removed)
        const nodesChanged = next.nodes.length !== prev.nodes.length ||
                           !next.nodes.every(node => prev.nodes.some(prevNode => prevNode.id === node.id))

        // Only rebuild links if:
        // 1. Nodes actually changed (requiring link restructuring), OR
        // 2. Enough time has passed AND random chance based on stability
        const shouldRebuildLinks = nodesChanged ||
                                 (rebuildCounter >= minRebuildInterval && Math.random() > networkParams.linkStability)

        if (!shouldRebuildLinks && prev.links && prev.links.length > 0) {
          // Keep existing links but update node references if nodes changed
          const existingLinks = prev.links.filter(link => {
            // Check if both source and target nodes still exist
            const sourceExists = next.nodes.some(node => node.id === link.source)
            const targetExists = next.nodes.some(node => node.id === link.target)
            return sourceExists && targetExists
          })

          // If we have enough existing links, use them; otherwise rebuild
          if (existingLinks.length >= Math.floor(networkParams.targetLinkCount * 0.6)) {
            next = { ...next, links: existingLinks }
          } else {
            // Force rebuild if we don't have enough valid links
            linksRebuilt = true
            rebuildCounter = 0
          }
        } else if (shouldRebuildLinks) {
          linksRebuilt = true
          rebuildCounter = 0
        }

        if (!linksRebuilt) {
          rebuildCounter++
        }

        window.dispatchEvent(new CustomEvent('dna-network-update', {
          detail: {
            kind: 'ai-driven-evolution',
            nodeCount: next.nodes.length,
            linkCount: next.links.length,
            targetNodes: networkParams.targetNodeCount,
            targetLinks: networkParams.targetLinkCount,
            linkStability: networkParams.linkStability,
            linksRebuilt,
            nodesChanged,
            rebuildCounter
          }
        }))
        return next
      })
    }, MOCK_DATA.simulation.mutation.intervalMs)

    return () => clearInterval(interval)
  }, [networkParams])

  // Simulate activity feed (mock-only)
  useEffect(() => {
    if (BACKEND.enabled) return
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000)
      const eventOptions = [
        { event_type: 'thought_written', details: { thought: randomFrom(MOCK_DATA.content.thoughts) } },
        { event_type: 'words_learned', details: { count: Math.floor(5 + Math.random() * 12), total: STATS_DEFAULTS.vocabularyCount + Math.floor(Math.random() * 80) } },
        { event_type: 'autonomous_learn', details: { topic: 'local cache refresh' } }
      ]

      const nextEvent = { timestamp: now, ...randomFrom(eventOptions) }
      setActivityData(prev => [...prev.slice(-98), nextEvent])
    }, 3800)

    return () => clearInterval(interval)
  }, [])

  // AI Task-Driven Visualization
  // Responds to actual AI tasks when backend is connected, falls back to mock cycling
  useEffect(() => {
    // Skip if no AI controls are enabled
    if (!vizParams.aiControlsRotation && !vizParams.aiControlsPulse &&
        !vizParams.aiControlsIntensity && !vizParams.aiControlsMovement) {
      return
    }

    let interval
    let lastTaskState = null

    const updateVisualizationFromTask = () => {
      let targetState = null

      // Priority 1: Use backend task data if available
      if (BACKEND.enabled && backendConnected && backendData?.state?.current_task) {
        targetState = mapTaskToVisualization(backendData.state.current_task)
      }
      // Priority 2: Use backend activity data if available
      else if (BACKEND.enabled && backendConnected && backendData?.activity?.length > 0) {
        const latestActivity = backendData.activity[backendData.activity.length - 1]
        const taskFromActivity = latestActivity?.event_type || latestActivity?.details?.task
        if (taskFromActivity) {
          targetState = mapTaskToVisualization(taskFromActivity)
        }
      }
      // Priority 3: Fall back to mock AI flow cycling if enabled
      else if (AI_FLOW.enabled && AI_FLOW.states?.length > 0) {
        const idx = Math.floor(Date.now() / AI_FLOW.intervalMs) % AI_FLOW.states.length
        targetState = AI_FLOW.states[idx]
      }

      // Skip if no target state found
      if (!targetState) return

      // Skip if state hasn't changed (prevents unnecessary updates)
      if (lastTaskState?.name === targetState.name) return
      lastTaskState = targetState

      const blend = clamp(AI_FLOW.blend ?? 0.3, 0, 1)

      // Update visualization parameters
      setVizParams(prev => {
        const updates = {}

        // Rotation - only if aiControlsRotation is enabled
        if (prev.aiControlsRotation) {
          updates.rotationSpeed = prev.rotationSpeed + (targetState.viz.rotationSpeed - prev.rotationSpeed) * blend
        }

        // Pulse - only if aiControlsPulse is enabled
        if (prev.aiControlsPulse) {
          updates.pulse = prev.pulse + (targetState.viz.pulse - prev.pulse) * blend
        }

        // Intensity - only if aiControlsIntensity is enabled
        if (prev.aiControlsIntensity) {
          updates.intensity = prev.intensity + (targetState.viz.intensity - prev.intensity) * blend
        }

        // Movement/aliveFactor - only if aiControlsMovement is enabled
        if (prev.aiControlsMovement) {
          updates.aliveFactor = prev.aliveFactor + (targetState.viz.aliveFactor - prev.aliveFactor) * blend
        }

        // Only apply if there are updates
        if (Object.keys(updates).length === 0) return prev
        return { ...prev, ...updates }
      })

      // Update network evolution parameters based on AI task
      if (targetState.network) {
        setNetworkParams(prev => {
          const updates = {}

          // Blend network parameters toward target state
          updates.targetNodeCount = prev.targetNodeCount + (targetState.network.targetNodeCount - prev.targetNodeCount) * blend
          updates.targetLinkCount = prev.targetLinkCount + (targetState.network.targetLinkCount - prev.targetLinkCount) * blend
          updates.growthRate = prev.growthRate + (targetState.network.growthRate - prev.growthRate) * blend
          updates.pruningRate = prev.pruningRate + (targetState.network.pruningRate - prev.pruningRate) * blend
          updates.linkStability = prev.linkStability + ((targetState.network.linkStability ?? 0.95) - prev.linkStability) * blend

          return { ...prev, ...updates }
        })
      }

      // Dispatch event for other components to react to state changes
      window.dispatchEvent(new CustomEvent('dna-network-update', {
        detail: {
          kind: targetState.name,
          description: targetState.description,
          source: backendConnected ? 'backend' : 'mock'
        }
      }))
    }

    // For backend-driven updates, poll more frequently
    if (BACKEND.enabled && backendConnected) {
      interval = setInterval(updateVisualizationFromTask, 1000) // Check every second
    }
    // For mock cycling, use the configured interval
    else if (AI_FLOW.enabled) {
      interval = setInterval(updateVisualizationFromTask, AI_FLOW.intervalMs)
    }

    // Initial update
    updateVisualizationFromTask()

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [backendConnected, backendData, vizParams.aiControlsRotation, vizParams.aiControlsPulse, vizParams.aiControlsIntensity, vizParams.aiControlsMovement])

  // Backend data synchronization
  useEffect(() => {
    if (backendData?.state) {
      setState(prev => ({ ...prev, ...backendData.state }))
    }
  }, [backendData?.state])

  useEffect(() => {
    if (backendData?.network) {
      setNetworkState(backendData.network)
      window.dispatchEvent(new CustomEvent('dna-network-update', { detail: { kind: 'backend-network' } }))
    }
  }, [backendData?.network])

  useEffect(() => {
    if (backendData?.activity) {
      setActivityData(backendData.activity)
    }
  }, [backendData?.activity])

  useEffect(() => {
    if (backendData?.visualization) {
      setVizParams(prev => ({ ...prev, ...backendData.visualization }))
    }
  }, [backendData?.visualization])

  // Slowly morph theme color based on DNA activity
  useEffect(() => {
    const dynamics = VISUAL_DEFAULTS.theme?.dynamics
    if (!dynamics || dynamics.enabled === false) return

    const interval = setInterval(() => {
      const activity = state?.state?.activity_level ?? 0.5
      const baseHue = dynamics.baseHue ?? 210
      const hueRange = dynamics.hueRange ?? 60
      const hueSpeed = dynamics.hueSpeed ?? 0.003
      const sat = dynamics.saturation ?? 0.6
      const baseLight = dynamics.lightness ?? 0.55
      const activityInfluence = dynamics.activityInfluence ?? 0.2
      const lightInfluence = dynamics.lightnessInfluence ?? 0.15

      const now = Date.now()
      const wave = Math.sin(now * hueSpeed)
      const hueShift = hueRange * wave + activity * hueRange * activityInfluence
      const hue = (baseHue + hueShift + 360) % 360
      const light = clamp(baseLight + (activity - 0.5) * lightInfluence, 0.2, 0.8)
      const rgb = hslToRgb(hue, sat, light)
      const hex = rgbToHex(rgb)

      setState(prev => ({
        ...prev,
        theme: {
          ...(prev?.theme || {}),
          hex,
          rgb
        }
      }))
    }, 120)

    return () => clearInterval(interval)
  }, [state?.state?.activity_level])

  // CSS variables
  useEffect(() => {
    const themeObj = state?.theme || { hex: themeColor, rgb: null }
    const hex = themeObj?.hex || themeColor
    document.documentElement.style.setProperty('--primary', hex)
    const rgb = themeObj?.rgb || null
    if (rgb && Array.isArray(rgb) && rgb.length >= 3) {
      document.documentElement.style.setProperty('--primary-rgb', `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`)
      document.documentElement.style.setProperty('--glow', `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.25)`)
    } else {
      document.documentElement.style.setProperty('--glow', `${hex}40`)
    }
    setThemeColor(hex)
  }, [state?.theme, themeColor])

  const send = useCallback((data) => {
    if (data?.type === 'get_thought') {
      const thought = {
        content: randomFrom(MOCK_DATA.content.thoughts),
        type: 'inner',
        feeling: state?.feeling || 'neutral'
      }
      window.dispatchEvent(new CustomEvent('dna-thought', { detail: thought }))
      return
    }

    if (data?.type === 'save_state' || data?.type === 'export_state') {
      const now = Math.floor(Date.now() / 1000)
      setActivityData(prev => [...prev.slice(-98), {
        timestamp: now,
        event_type: 'learned_response_pattern',
        details: { pattern_type: data.type === 'save_state' ? 'mock-save' : 'mock-export' }
      }])
    }
  }, [state?.feeling])

  const handleChat = useCallback(async (message) => {
    setChatMessages(prev => [...prev, {
      type: 'user',
      content: message,
      timestamp: Date.now()
    }])

    if (backendConnected) {
      try {
        const response = await sendChatMessage(message)
        setChatMessages(prev => [...prev, {
          type: 'dna',
          content: response.message || response.content || 'Response received',
          timestamp: Date.now()
        }])
      } catch (error) {
        console.error('Chat error:', error)
        setChatMessages(prev => [...prev, {
          type: 'dna',
          content: 'Sorry, I encountered an error processing your message.',
          timestamp: Date.now()
        }])
      }
    } else {
      // Mock response
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          type: 'dna',
          content: randomFrom(MOCK_DATA.content.chatReplies),
          timestamp: Date.now()
        }])
      }, 500 + Math.random() * 500)
    }
  }, [backendConnected, sendChatMessage])

  const handleFeed = useCallback((data, dataType = 'text') => {
    const now = Math.floor(Date.now() / 1000)
    setActivityData(prev => [...prev.slice(-98), {
      timestamp: now,
      event_type: 'autonomous_learn',
      details: { topic: dataType === 'url' ? 'custom_url' : 'manual_feed', sample: String(data).slice(0, 60) }
    }])
  }, [])

  const handleReset = useCallback((fast = false) => {
    setState(createInitialState())
    if (!fast) {
      setNetworkState(createDummyNetwork())
      setActivityData(() => {
        const now = Math.floor(Date.now() / 1000)
        return MOCK_DATA.content.activityEvents.map((event, index) => ({
          timestamp: now - (index + 1) * 10,
          ...event
        }))
      })
      setChatMessages([])
    }
  }, [])

  // Save all vizParams to localStorage
  const saveVizDefaults = useCallback(() => {
    try {
      const toSave = { ...vizParams }
      localStorage.setItem('dna_viz_defaults', JSON.stringify(toSave))
      console.log('[DNA] Saved settings to localStorage:', Object.keys(toSave).length, 'params')
    } catch (e) {
      console.error('[DNA] Failed to save settings:', e)
    }
  }, [vizParams])

  // Reset all settings to defaults and clear localStorage
  const resetVizDefaults = useCallback(() => {
    try {
      localStorage.removeItem('dna_viz_defaults')
      console.log('[DNA] Cleared localStorage, resetting to defaults')
    } catch (e) {
      console.warn('[DNA] Failed to clear localStorage:', e)
    }
    setVizParams({ ...VISUAL_DEFAULTS.vizParams })
  }, [])

  // Refresh network with current view settings (doesn't change structure)
  const refreshVizSnapshot = useCallback(() => {
    const nodeCount = vizParams.nodeCount ?? VISUAL_DEFAULTS.vizParams.nodeCount ?? 120
    setNetworkState(createDummyNetwork(nodeCount))
  }, [vizParams.nodeCount])

  // Regenerate network with new structure settings
  const regenerateNetwork = useCallback(() => {
    const nodeCount = vizParams.nodeCount ?? VISUAL_DEFAULTS.vizParams.nodeCount ?? 120
    console.log('[DNA] Regenerating network with', nodeCount, 'nodes')
    setNetworkState(createDummyNetwork(nodeCount))
  }, [vizParams.nodeCount])

  const { nodes, links } = networkState
  const isLoading = false
  const isOffline = false

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #08080c 0%, #0c0c14 50%, #08080c 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {(isOffline || isLoading) && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          background: isLoading ? 'rgba(156, 163, 175, 0.2)' : 'rgba(255, 100, 100, 0.2)',
          border: isLoading ? '1px solid rgba(156, 163, 175, 0.4)' : '1px solid rgba(255, 100, 100, 0.4)',
          borderRadius: 8,
          padding: '8px 16px',
          color: isLoading ? '#9ca3af' : '#ff6666',
          fontSize: 13,
          fontWeight: 500,
          backdropFilter: 'blur(10px)'
        }}>
          {isLoading ? '⏳ DNA LOADING - Initializing state...' : '⚠ DNA OFFLINE - Waiting for connection...'}
        </div>
      )}

      <Canvas
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        gl={{
          antialias: true,  // Enable antialiasing for smooth glow edges
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false
        }}
        dpr={Math.min(window.devicePixelRatio, 2)}  // Better quality on high-DPI screens
      >
        <PerspectiveCamera makeDefault position={[0, 2, 18]} fov={50} />  {/* Farther back to see full helix */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={5}    // Adjusted for helix scale
          maxDistance={50}   // Allow zooming far out to see the whole structure
        />

        <ambientLight intensity={0.1} />

        <Suspense fallback={null}>
          <NeuralNetwork
            nodes={nodes}
            links={links}
            theme={state?.theme || { hex: themeColor, rgb: [0, 0, 0] }}
            vizParams={vizParams}
            isOffline={isOffline}
            mockMode
          />
        </Suspense>
      </Canvas>

      <ThoughtBubble
        connected={connected}
        send={send}
        themeColor={themeColor}
        state={state}
        mockMode
      />

      <StatusBar
        connected={BACKEND.enabled ? backendConnected : connected}
        state={state}
        themeColor={themeColor}
        onOpenTools={() => setShowTools(true)}
        backendEnabled={BACKEND.enabled}
        backendError={backendError}
      />

      <div style={{
        position: 'absolute',
        bottom: 24,
        right: 24,
        display: 'flex',
        gap: 12,
        zIndex: 100
      }}>
        <ControlButton
          onClick={() => setShowTerminal(!showTerminal)}
          active={showTerminal}
          themeColor={themeColor}
          title="Terminal"
        >
          <TerminalIcon />
        </ControlButton>

        <ControlButton
          onClick={() => setShowViz(!showViz)}
          active={showViz}
          themeColor={themeColor}
          title="Visualization"
        >
          <VizIcon />
        </ControlButton>

        <ControlButton
          onClick={() => setShowActivity(!showActivity)}
          active={showActivity}
          themeColor={themeColor}
          title="Activity Log"
        >
          <ActivityIcon />
        </ControlButton>

        <ControlButton
          onClick={() => setShowSettings(!showSettings)}
          active={showSettings}
          themeColor={themeColor}
          title="Settings"
        >
          <SettingsIcon />
        </ControlButton>

        <ControlButton
          onClick={() => setShowChat(!showChat)}
          active={showChat}
          themeColor={themeColor}
          title="Chat"
        >
          <ChatIcon />
        </ControlButton>

        <ControlButton
          onClick={() => setShowStats(!showStats)}
          active={showStats}
          themeColor={themeColor}
          title="Stats"
        >
          <StatsIcon />
        </ControlButton>
      </div>

      <TerminalWindow
        isOpen={showTerminal}
        onClose={() => setShowTerminal(false)}
        themeColor={themeColor}
        mockMode
      />

      <VisualizationWindow
        isOpen={showViz}
        onClose={() => setShowViz(false)}
        themeColor={themeColor}
        vizParams={vizParams}
        setVizParams={setVizParams}
        onSaveDefaults={saveVizDefaults}
        onResetDefaults={resetVizDefaults}
        onRefreshViz={refreshVizSnapshot}
        onRegenerateNetwork={regenerateNetwork}
      />

      <ActivityLog
        isOpen={showActivity}
        onClose={() => setShowActivity(false)}
        themeColor={themeColor}
        activities={activityData}
      />

      <AnimatePresence>
        {showChat && (
          <ChatPanel
            messages={chatMessages}
            onSend={handleChat}
            onClose={() => setShowChat(false)}
            themeColor={themeColor}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            state={state}
            onFeed={handleFeed}
            onClose={() => setShowSettings(false)}
            themeColor={themeColor}
            send={send}
            vizParams={vizParams}
            setVizParams={setVizParams}
            mockMode
            onReset={handleReset}
          />
        )}
      </AnimatePresence>

      <ToolsPanel
        isOpen={showTools}
        onClose={() => setShowTools(false)}
        themeColor={themeColor}
        tools={toolsData.length > 0 ? toolsData : (state?.toolsData || [])}
      />

      <StatsWindow
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        themeColor={themeColor}
        state={state}
      />
    </div>
  )
}

function ControlButton({ children, onClick, active, themeColor }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        border: `1px solid ${active ? themeColor : 'rgba(255,255,255,0.1)'}`,
        background: active ? `${themeColor}20` : 'rgba(12, 14, 22, 0.8)',
        backdropFilter: 'blur(10px)',
        boxShadow: active ? `0 0 18px ${themeColor}40` : '0 0 14px var(--glow)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: active ? themeColor : '#64748b',
        transition: 'all 0.2s ease'
      }}
    >
      {children}
    </motion.button>
  )
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function TerminalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  )
}

function VizIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
    </svg>
  )
}

function ActivityIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function StatsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="4" y1="20" x2="20" y2="20" />
      <line x1="6" y1="16" x2="6" y2="10" />
      <line x1="12" y1="16" x2="12" y2="6" />
      <line x1="18" y1="16" x2="18" y2="12" />
    </svg>
  )
}
