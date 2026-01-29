// =============================
// DNA Frontend Configuration
// All settings are centralized here for easy backend integration
// =============================

// =============================
// Backend Configuration
// Set enabled: true when backend is running
// =============================
export const BACKEND = {
  enabled: import.meta.env.VITE_BACKEND_ENABLED === 'true' || false, // Master switch - set to true to connect to backend
  baseUrl: import.meta.env.VITE_BACKEND_BASE_URL || 'http://127.0.0.1:8766', // HTTP REST API base URL
  wsUrl: import.meta.env.VITE_BACKEND_WS_URL || 'ws://127.0.0.1:8765', // WebSocket URL for realtime updates
  
  // Polling intervals (ms) - used when WebSocket unavailable
  polling: {
    stateIntervalMs: 1500, // How often to fetch full state
    visualizationIntervalMs: 1000, // How often to fetch viz params
    activityIntervalMs: 2500, // How often to fetch activity feed
    networkIntervalMs: 2000 // How often to fetch network topology
  },
  
  // API endpoint paths
  endpoints: {
    // Health & Status
    ping: '/api/ping', // Health check
    state: '/api/state', // Full DNA state snapshot
    
    // Visualization Control
    visualization: '/api/visualization', // AI-controlled viz parameters
    visualizationSnapshot: '/api/visualization_snapshot', // Static snapshot
    network: '/api/network', // Network nodes and links
    
    // AI Features
    tools: '/api/tools', // AI-generated tools
    activity: '/api/activity', // Activity feed / event stream
    chat: '/api/chat', // Chat endpoint for AI conversation
    thoughts: '/api/thoughts', // AI thought stream
    
    // Control
    reset: '/api/reset', // Reset AI state
    settings: '/api/settings', // Get/set learning parameters
    
    // Terminal
    terminalLogs: '/api/terminal-logs', // Terminal log stream
    terminalCommand: '/api/terminal-cmd' // Execute terminal command
  },
  
  // WebSocket message types (for future implementation)
  wsMessages: {
    // Outbound
    subscribe: 'subscribe', // Subscribe to updates
    unsubscribe: 'unsubscribe', // Unsubscribe
    command: 'command', // Send command
    chat: 'chat', // Send chat message
    
    // Inbound
    stateUpdate: 'state_update', // State changed
    networkUpdate: 'network_update', // Network topology changed
    vizUpdate: 'viz_update', // Visualization params changed
    activity: 'activity', // New activity event
    thought: 'thought', // New thought
    error: 'error' // Error message
  }
}

// =============================
// Window defaults (shared popup layout + style)
// =============================
export const WINDOW_DEFAULTS = {
  size: { width: 420, height: 520 },
  minSize: { width: 320, height: 260 },
  fontFamily: '"Space Grotesk", "Inter", -apple-system, sans-serif',
  fontSize: '13px',
  zIndex: 2000,
  glass: {
    background: 'rgba(12, 12, 20, 0.82)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    backdropFilter: 'blur(24px)',
    shadow: '0 0 0 1px rgba(255,255,255,0.04), 0 25px 60px rgba(0,0,0,0.5), 0 0 110px {themeColor}16, inset 0 1px 0 rgba(255,255,255,0.05)'
  },
  titleBar: {
    padding: '10px 16px',
    background: 'rgba(255,255,255,0.02)',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    titleColor: 'rgba(255,255,255,0.6)',
    titleSize: '13px',
    titleWeight: 500
  },
  closeButton: {
    size: 22,
    borderRadius: '6px',
    border: 'none',
    background: 'rgba(255,255,255,0.04)',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '12px'
  },
  badge: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: '10px',
    background: 'rgba(255,255,255,0.04)',
    padding: '2px 8px',
    borderRadius: '4px'
  },
  footer: {
    padding: '6px 14px',
    background: 'rgba(255,255,255,0.02)',
    borderTop: '1px solid rgba(255,255,255,0.04)',
    fontSize: '10px',
    color: 'rgba(255,255,255,0.25)'
  },
  resizeHandle: {
    color: 'rgba(255,255,255,0.15)'
  },
  actionButton: {
    base: {
      padding: '6px 10px',
      borderRadius: '8px',
      borderColor: 'rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.04)',
      color: 'rgba(255,255,255,0.7)',
      cursor: 'pointer',
      fontSize: '11px',
      fontWeight: 500
    }
  },
  layout: {
    terminal: {
      position: { x: 80, y: 60 },
      size: { width: 700, height: 500 },
      minSize: { width: 460, height: 340 }
    },
    visualization: {
      position: { x: 100, y: 80 },
      size: { width: 460, height: 600 },
      minSize: { width: 360, height: 420 }
    },
    activity: {
      position: { x: 120, y: 120 },
      size: { width: 520, height: 420 },
      minSize: { width: 360, height: 260 }
    },
    settings: {
      position: { x: 60, y: 60 },
      size: { width: 460, height: 560 },
      minSize: { width: 380, height: 400 }
    },
    tools: {
      position: { x: 120, y: 80 },
      size: { width: 820, height: 520 },
      minSize: { width: 520, height: 320 }
    },
    stats: {
      position: { x: 140, y: 90 },
      size: { width: 460, height: 520 },
      minSize: { width: 360, height: 320 }
    },
    chat: {
      position: (size) => ({ x: Math.max(20, window.innerWidth - size.width - 50), y: 120 }),
      size: { width: 420, height: 520 },
      minSize: { width: 320, height: 320 }
    }
  }
}

// =============================
// Stats panel defaults
// =============================
export const STATS_PANEL_DEFAULTS = {
  refreshLabel: 'Mock telemetry',
  sections: [
    { key: 'core', label: 'Core' },
    { key: 'db', label: 'DB Snapshot' },
    { key: 'engine', label: 'Engine' },
    { key: 'runtime', label: 'Runtime' }
  ]
}

// =============================
// Visual defaults (theme + layout)
// All visualization parameters are backend-controllable
// =============================
export const VISUAL_DEFAULTS = {
  // Theme configuration - can be overridden by backend
  theme: {
    hex: '#474fc5', // Primary theme color
    rgb: [71, 79, 197], // RGB values
    node_colors: {}, // Per-node colors: { nodeId: [r,g,b] }
    
    // Dynamic theme evolution
    dynamics: {
      enabled: true, // Enable color evolution over time
      baseHue: 100, // Starting hue (0-360)
      hueRange: 100, // Total hue travel range
      hueSpeed: 0.0002, // Hue change speed (rad/ms)
      saturation: 0.7, // Base saturation (0-1)
      lightness: 0.6, // Base lightness (0-1)
      activityInfluence: 0.000005, // Activity effect on hue
      lightnessInfluence: 0.00005 // Activity effect on lightness
    }
  },
  
  // Visualization parameters - all AI-controllable
  // These can be overridden by localStorage saved defaults
  vizParams: {
    // === STRUCTURE SETTINGS (require network regeneration) ===
    nodeCount: 120, // Number of nodes in helix (affects performance)
    helixRadius: 2.5, // Helix radius
    helixHeight: 14, // Helix height (vertical span)
    helixTurns: 2.5, // Number of helix turns
    strandCount: 2, // Number of strands (2 = double helix)
    
    // === CORE MOTION ===
    rotationSpeed: 0.08, // Overall spin speed
    tilt: 0.06, // Helix tilt amount
    breathing: 0.03, // Scale breathing amplitude
    pulse: 0.3, // Pulse amount for glow
    intensity: 0.7, // Overall brightness (reduced for less glare)
    aliveFactor: 1.0, // Liveliness multiplier
    
    // === NODE APPEARANCE ===
    nodeSize: 1.0, // Base node size multiplier
    nodeBaseSize: 0.45, // Actual base size of core nodes
    glowSize: 1.6, // Outer glow size multiplier
    innerGlowSize: 0.9, // Inner glow size multiplier
    bloomIntensity: 0.35, // Bloom/glow multiplier (reduced)
    glowOpacity: 0.25, // Outer glow opacity
    innerGlowOpacity: 0.35, // Inner glow opacity
    coreOpacity: 0.9, // Core node opacity
    colorMode: 'activity', // activity | flow | energy | age | type
    showLabels: false, // Show node labels
    
    // === CONNECTION APPEARANCE ===
    connectionStyle: 'bezier', // line | bezier | curved
    linkOpacity: 0.5, // Connection opacity (reduced)
    linkWidth: 1.0, // Connection line width
    linkFlowSpeed: 2.0, // Signal flow speed
    linkFlowIntensity: 0.35, // Signal highlight intensity (reduced)
    linkCurvature: 0.35, // How curved links are (0 = straight, 1 = very curved)
    linkSegments: 24, // Curve quality (more = smoother but slower)
    
    // === DYNAMIC PARAMETERS ===
    energyRipple: 0.4, // Energy wave ripple effect (0-1)
    nodeDrift: 0.25, // Per-node random drift amount
    syncFactor: 0.7, // How synchronized nodes are (0-1)
    
    // === ORGANIC MOVEMENT ===
    helixWaveEnabled: true,
    helixWaveAmplitude: 0.5,
    helixWaveSpeed: 0.8,
    radialBreathingEnabled: true,
    radialBreathingAmplitude: 0.4,
    twistDynamicsEnabled: true,
    twistDynamicsAmplitude: 0.3,
    shapeMorphingEnabled: true,
    shapeMorphingAmplitude: 0.35,
    
    // === AI CONTROL TOGGLES (for when backend is connected) ===
    aiControlsRotation: false, // Let AI control rotation
    aiControlsPulse: false, // Let AI control pulse
    aiControlsIntensity: false, // Let AI control intensity
    aiControlsColor: false, // Let AI control color mode
    aiControlsMovement: false // Let AI control movement parameters
  },
  
  // Network generation defaults - clean helix structure
  network: {
    nodeCount: 120, // Nodes in the helix
    linkCount: 800, // Reasonable number of links
    connectionsPerNodeRange: [2, 6], // Moderate connections per node
    
    // Connectivity guarantees
    ensureConnectivity: {
      enabled: true,
      minLinksPerNode: 2,
      weightRange: [0.1, 0.4],
      activeChance: 0.6,
      uniqueTargets: true,
      maxAttempts: 10
    },
    
    // Random link generation
    extraRandomLinks: {
      enabled: true,
      perNodeRange: [2, 4],
      weightRange: [0.1, 0.5],
      activeChance: 0.5
    },
    
    // Proximity-based links - connect nearby nodes
    proximityLinks: {
      enabled: true,
      distance: 2.0,
      maxPerNode: 4,
      checkWindow: 20,
      weightRange: [0.2, 0.5],
      activeChance: 0.6
    }
  },
  
  // Neural rendering limits
  neural: {
    maxNodes: 250, // Maximum rendered nodes
    maxEdges: 2000, // Maximum rendered edges
    curveSegments: 20, // Segments per curved link
    offscreen: 9999, // Offscreen coordinate for hidden items
    
    // Event-driven visual twitches
    twitch: {
      enabled: true,
      impulse: 0.6,
      decay: 0.3,
      max: 0.9
    },
    
    // Energy wave effects
    energyWaves: {
      enabled: true,
      speed: 3, // Wave expansion speed
      decay: 0.5, // Wave intensity decay
      maxRadius: 8 // Maximum wave radius
    }
  },
  // DNA Strand structure configuration
  strand: {
    strandCount: 2, // Number of helix strands (2 for classic DNA)
    radius: 2.5, // Helix radius (increased for better visibility)
    height: 14, // Helix height (taller for more dramatic helix)
    turnsBase: 2.5, // Base number of turns
    turnsScale: 0.25, // Extra turns based on node count
    verticalPadding: 0, // Top/bottom margin
    ageAtBottom: 'older', // 'older' | 'newer' - which end is older
    orderByAge: true, // Sort nodes by ID (age)
    
    // Intensity falloff for depth effect
    bottomFalloffStart: 0.3, // Where falloff starts (0-1)
    bottomDisconnectThreshold: 0, // Disconnect links below this
    nodeFalloffMin: 0.5, // Minimum node intensity
    lineFalloffMin: 0.15, // Minimum line intensity
    variationScale: 0.3, // Random position variation
    
// Node grouping along strands - organic clusters
    grouping: {
      enabled: true,
      groupSize: 8, // Smaller groups for tighter clustering
      intraLinkDensity: 0.85, // High density within groups
      bridgeToNextGroup: true
    },

    // Spider web connections - organic mesh
    spiderWeb: {
      enabled: true, // Enable for denser organic web
      ringNeighbors: 8, // Connect to nearby rings
      diagonalSpan: 6, // Diagonal connections
      skipChance: 0.15, // Low skip for dense web
      weightRange: [0.2, 0.6],
      activeChance: 0.75
    },
    
    // Cross-strand connections (DNA base pairs) - organic bridges
    crossStrand: {
      enabled: true,
      weight: 1.5, // Stronger cross connections
      diagonalWeight: 0.8, // Stronger diagonal bridges
      skipEvery: 0 // Connect every node pair (0 = no skip)
    },
    
    // Bridge nodes on cross-strand links (disabled - creates center cluster)
    bridgeNodes: {
      enabled: false,
      chancePerSpan: 0.2,
      maxPerSpan: 1,
      jitter: 0.2,
      linkWeightRange: [0.3, 0.8],
      linkActiveChance: 0.6,
      maxTotalNodes: 200
    },
    
    // Sub-strands branching from main helix (disabled - creates clutter)
    subStrands: {
      enabled: false,
      perMainNodeChance: 0.1,
      nodesPerStrand: [2, 4],
      radius: 0.6,
      length: 0.5,
      twist: 2.0,
      linkWeightRange: [0.3, 0.6],
      parentLinkWeight: 0.7,
      maxTotalNodes: 200
    },
    
    // Helix end effects (disabled - creates noise)
    ends: {
      enabled: false,
      range: 0.1,
      radialJitter: 0.2,
      verticalJitter: 0.3,
      twistJitter: 0.3,
      extraNodesPerEnd: [2, 4],
      spawnChance: 0.2,
      maxTotalNodes: 180
    },
    
    // Radial layers (concentric helixes)
    radialLayers: 1,
    layerSpacing: 0.3,
    
    // Slice staggering at ends
    sliceEffect: {
      enabled: true,
      topSliceRatio: 0.2,
      bottomSliceRatio: 0.2,
      staggerAmount: 1.0,
      sliceTwist: 1.5
    },
    
    // Floating disconnected nodes (disabled - creates clutter)
    floatingNodes: {
      enabled: false,
      count: 20,
      explosionRadius: 3.0,
      dynamicMovement: true,
      movementSpeed: 0.6,
      movementAmplitude: 0.4,
      filterPoint: 0.5,
      maxTotalNodes: 200
    },
    
    // Organic movement configuration
    organicMovement: {
      enabled: true,
      
      // Vertical wave along helix
      helixWave: {
        enabled: true,
        amplitude: 0.8,  // Increased for more dramatic vertical movement
        speed: 1.0,
        frequency: 2.5
      },
      
      // Radial breathing expansion
      radialBreathing: {
        enabled: true,
        amplitude: 0.6,  // Increased for more visible breathing
        speed: 0.9,
        phaseOffset: 0.8
      },
      
      // Dynamic twist variation
      twistDynamics: {
        enabled: true,
        amplitude: 0.45,  // Increased for more organic twist
        speed: 0.8,
        frequency: 1.6
      },
      
      // Complex shape morphing
      shapeMorphing: {
        enabled: true,
        amplitude: 0.55,  // Increased for more organic deformation
        speed: 0.6,
        complexity: 4
      }
    },
    
    // Per-node randomization
    randomPhaseStrength: 0.05,
    randomVerticalJitter: 0.12,
    
    // Wobble effects
    radialWobble: {
      amplitude: 0.16,
      speed: 0.7,
      phase: 3.5
    },
    verticalWave: {
      amplitude: 0.16,
      speed: 0.7,
      phase: 2.8
    }
  }
}

// =============================
// AI flow states (mock thinking states when backend disabled)
// Simulates different AI cognitive states
// These are PLACEHOLDERS for when the AI backend is connected
// When enabled, this simulates what AI control would look like
// =============================
export const AI_FLOW = {
  enabled: false, // DISABLED by default - only enable for AI backend integration demo
  intervalMs: 2600, // How often to shift states
  blend: 0.35, // Blend factor toward next state (0-1)
  
  // Cognitive states with visualization parameters
  states: [
    {
      name: 'consolidating',
      description: 'Integrating and organizing information',
      viz: { rotationSpeed: 0.06, pulse: 0.22, intensity: 0.8, aliveFactor: 0.7 }
    },
    {
      name: 'exploring',
      description: 'Actively seeking new patterns',
      viz: { rotationSpeed: 0.12, pulse: 0.4, intensity: 1.0, aliveFactor: 1.0 }
    },
    {
      name: 'reflecting',
      description: 'Deep contemplation and analysis',
      viz: { rotationSpeed: 0.04, pulse: 0.18, intensity: 0.75, aliveFactor: 0.6 }
    },
    {
      name: 'connecting',
      description: 'Building new neural connections',
      viz: { rotationSpeed: 0.1, pulse: 0.5, intensity: 0.95, aliveFactor: 1.2 }
    },
    {
      name: 'dreaming',
      description: 'Free association and creativity',
      viz: { rotationSpeed: 0.15, pulse: 0.35, intensity: 0.85, aliveFactor: 1.4 }
    }
  ]
}

// =============================
// Task-to-Visualization Mapping
// Maps AI activities/tasks to visualization states
// =============================
export const TASK_VIZ_MAPPING = {
  // Default fallback state
  default: {
    name: 'idle',
    description: 'Waiting for activity',
    viz: { rotationSpeed: 0.08, pulse: 0.2, intensity: 0.6, aliveFactor: 0.5 },
    network: { targetNodeCount: 15, targetLinkCount: 25, growthRate: 0.1, pruningRate: 0.05, linkStability: 0.995 }
  },

  // Learning activities - network grows as AI learns
  learning: {
    name: 'learning',
    description: 'Actively learning new information',
    viz: { rotationSpeed: 0.12, pulse: 0.4, intensity: 0.9, aliveFactor: 1.1 },
    network: { targetNodeCount: 25, targetLinkCount: 45, growthRate: 0.3, pruningRate: 0.02, linkStability: 0.985 }
  },
  studying: {
    name: 'studying',
    description: 'Deep study and analysis',
    viz: { rotationSpeed: 0.06, pulse: 0.25, intensity: 0.75, aliveFactor: 0.8 },
    network: { targetNodeCount: 20, targetLinkCount: 35, growthRate: 0.2, pruningRate: 0.03, linkStability: 0.99 }
  },
  reading: {
    name: 'reading',
    description: 'Processing text content',
    viz: { rotationSpeed: 0.08, pulse: 0.3, intensity: 0.7, aliveFactor: 0.9 },
    network: { targetNodeCount: 18, targetLinkCount: 30, growthRate: 0.15, pruningRate: 0.04, linkStability: 0.992 }
  },

  // Thinking activities - network consolidates and refines
  thinking: {
    name: 'thinking',
    description: 'Active cognitive processing',
    viz: { rotationSpeed: 0.1, pulse: 0.35, intensity: 0.85, aliveFactor: 1.0 },
    network: { targetNodeCount: 22, targetLinkCount: 40, growthRate: 0.08, pruningRate: 0.08, linkStability: 0.988 }
  },
  reasoning: {
    name: 'reasoning',
    description: 'Logical reasoning and problem solving',
    viz: { rotationSpeed: 0.07, pulse: 0.28, intensity: 0.8, aliveFactor: 0.7 },
    network: { targetNodeCount: 19, targetLinkCount: 32, growthRate: 0.05, pruningRate: 0.1, linkStability: 0.995 }
  },
  planning: {
    name: 'planning',
    description: 'Strategic planning and decision making',
    viz: { rotationSpeed: 0.05, pulse: 0.22, intensity: 0.65, aliveFactor: 0.6 },
    network: { targetNodeCount: 16, targetLinkCount: 28, growthRate: 0.03, pruningRate: 0.12, linkStability: 0.997 }
  },

  // Communication activities - network becomes more connected
  chatting: {
    name: 'chatting',
    description: 'Engaged in conversation',
    viz: { rotationSpeed: 0.11, pulse: 0.38, intensity: 0.88, aliveFactor: 1.2 },
    network: { targetNodeCount: 24, targetLinkCount: 50, growthRate: 0.25, pruningRate: 0.02, linkStability: 0.98 }
  },
  responding: {
    name: 'responding',
    description: 'Formulating responses',
    viz: { rotationSpeed: 0.09, pulse: 0.32, intensity: 0.78, aliveFactor: 0.95 },
    network: { targetNodeCount: 21, targetLinkCount: 38, growthRate: 0.18, pruningRate: 0.05, linkStability: 0.987 }
  },

  // Creative activities - network expands dramatically
  creating: {
    name: 'creating',
    description: 'Generating new content or ideas',
    viz: { rotationSpeed: 0.14, pulse: 0.45, intensity: 0.95, aliveFactor: 1.3 },
    network: { targetNodeCount: 30, targetLinkCount: 60, growthRate: 0.4, pruningRate: 0.01, linkStability: 0.975 }
  },
  writing: {
    name: 'writing',
    description: 'Composing text or code',
    viz: { rotationSpeed: 0.08, pulse: 0.3, intensity: 0.75, aliveFactor: 0.85 },
    network: { targetNodeCount: 23, targetLinkCount: 42, growthRate: 0.22, pruningRate: 0.03, linkStability: 0.983 }
  },

  // Memory activities - network consolidates
  remembering: {
    name: 'remembering',
    description: 'Accessing stored memories',
    viz: { rotationSpeed: 0.04, pulse: 0.18, intensity: 0.7, aliveFactor: 0.4 },
    network: { targetNodeCount: 14, targetLinkCount: 22, growthRate: 0.02, pruningRate: 0.15, linkStability: 0.998 }
  },
  consolidating: {
    name: 'consolidating',
    description: 'Strengthening memory connections',
    viz: { rotationSpeed: 0.06, pulse: 0.22, intensity: 0.8, aliveFactor: 0.7 },
    network: { targetNodeCount: 17, targetLinkCount: 28, growthRate: 0.04, pruningRate: 0.13, linkStability: 0.996 }
  },

  // Testing activities - network refines and optimizes
  testing: {
    name: 'testing',
    description: 'Running tests or evaluations',
    viz: { rotationSpeed: 0.13, pulse: 0.42, intensity: 0.92, aliveFactor: 1.1 },
    network: { targetNodeCount: 21, targetLinkCount: 36, growthRate: 0.06, pruningRate: 0.14, linkStability: 0.994 }
  },
  evaluating: {
    name: 'evaluating',
    description: 'Assessing performance or results',
    viz: { rotationSpeed: 0.07, pulse: 0.26, intensity: 0.72, aliveFactor: 0.75 },
    network: { targetNodeCount: 18, targetLinkCount: 31, growthRate: 0.04, pruningRate: 0.16, linkStability: 0.996 }
  },

  // Goal-oriented activities - network focuses and grows strategically
  pursuing_goal: {
    name: 'pursuing_goal',
    description: 'Working toward current objective',
    viz: { rotationSpeed: 0.12, pulse: 0.4, intensity: 0.9, aliveFactor: 1.0 },
    network: { targetNodeCount: 26, targetLinkCount: 48, growthRate: 0.28, pruningRate: 0.04, linkStability: 0.982 }
  },
  achieving: {
    name: 'achieving',
    description: 'Making progress toward goals',
    viz: { rotationSpeed: 0.15, pulse: 0.5, intensity: 1.0, aliveFactor: 1.4 },
    network: { targetNodeCount: 28, targetLinkCount: 55, growthRate: 0.35, pruningRate: 0.02, linkStability: 0.978 }
  }
}

// =============================
// Task to Visualization Mapper
// Maps AI task/activity strings to visualization states
// =============================
export const mapTaskToVisualization = (taskString) => {
  if (!taskString) return TASK_VIZ_MAPPING.default

  // Normalize task string (lowercase, remove spaces/special chars)
  const normalized = taskString.toLowerCase().replace(/[^a-z]/g, '')

  // Direct mapping for exact matches
  if (TASK_VIZ_MAPPING[normalized]) {
    return TASK_VIZ_MAPPING[normalized]
  }

  // Fuzzy matching for partial matches
  for (const [key, mapping] of Object.entries(TASK_VIZ_MAPPING)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return mapping
    }
  }

  // Keyword-based mapping
  const keywords = {
    learn: 'learning',
    study: 'studying',
    read: 'reading',
    think: 'thinking',
    reason: 'reasoning',
    plan: 'planning',
    chat: 'chatting',
    respond: 'responding',
    create: 'creating',
    write: 'writing',
    remember: 'remembering',
    consolidate: 'consolidating',
    test: 'testing',
    evaluate: 'evaluating',
    goal: 'pursuing_goal',
    achieve: 'achieving'
  }

  for (const [keyword, mappingKey] of Object.entries(keywords)) {
    if (normalized.includes(keyword)) {
      return TASK_VIZ_MAPPING[mappingKey]
    }
  }

  // Default fallback
  return TASK_VIZ_MAPPING.default
}

// =============================
// Visualization presets
// User-selectable visualization themes
// =============================
export const VISUAL_PRESETS = {
  dnaHelix: {
    label: 'DNA Helix',
    icon: '🧬',
    description: 'Classic double helix visualization',
    params: {
      rotationSpeed: 0.1,
      tilt: 0.1,
      breathing: 0.02,
      pulse: 0.25,
      intensity: 0.7,
      connectionStyle: 'bezier',
      nodeSize: 1.0,
      bloomIntensity: 0.5,
      showLabels: false,
      colorMode: 'activity',
      aliveFactor: 0.8,
      energyRipple: 0.4,
      nodeDrift: 0.2,
      syncFactor: 0.8
    }
  },
  galaxy: {
    label: 'Galaxy',
    icon: '🌌',
    description: 'Cosmic swirling motion',
    params: {
      rotationSpeed: 0.05,
      tilt: 0.25,
      breathing: 0.08,
      pulse: 0.4,
      intensity: 0.9,
      connectionStyle: 'curved',
      nodeSize: 1.3,
      bloomIntensity: 0.8,
      showLabels: false,
      colorMode: 'flow',
      aliveFactor: 1.2,
      energyRipple: 0.6,
      nodeDrift: 0.5,
      syncFactor: 0.5
    }
  },
  neural: {
    label: 'Neural',
    icon: '🧠',
    description: 'Brain-like neural network',
    params: {
      rotationSpeed: 0.02,
      tilt: 0.05,
      breathing: 0.05,
      pulse: 0.15,
      intensity: 0.6,
      connectionStyle: 'bezier',
      nodeSize: 1.5,
      bloomIntensity: 0.3,
      showLabels: false,
      colorMode: 'type',
      aliveFactor: 1.0,
      energyRipple: 0.7,
      nodeDrift: 0.15,
      syncFactor: 0.6
    }
  },
  energy: {
    label: 'Energy',
    icon: '⚡',
    description: 'High-energy pulsing visualization',
    params: {
      rotationSpeed: 0.15,
      tilt: 0.08,
      breathing: 0.06,
      pulse: 0.5,
      intensity: 1.0,
      connectionStyle: 'line',
      nodeSize: 0.9,
      bloomIntensity: 0.9,
      showLabels: false,
      colorMode: 'energy',
      aliveFactor: 1.5,
      energyRipple: 0.9,
      nodeDrift: 0.4,
      syncFactor: 0.3
    }
  },
  calm: {
    label: 'Calm',
    icon: '🌊',
    description: 'Slow, peaceful motion',
    params: {
      rotationSpeed: 0.02,
      tilt: 0.02,
      breathing: 0.04,
      pulse: 0.15,
      intensity: 0.5,
      connectionStyle: 'bezier',
      nodeSize: 1.2,
      bloomIntensity: 0.4,
      showLabels: false,
      colorMode: 'age',
      aliveFactor: 0.6,
      energyRipple: 0.2,
      nodeDrift: 0.1,
      syncFactor: 0.9
    }
  },
  matrix: {
    label: 'Matrix',
    icon: '💚',
    description: 'Digital rain aesthetic',
    params: {
      rotationSpeed: 0.0,
      tilt: 0.0,
      breathing: 0.0,
      pulse: 0.5,
      intensity: 1.0,
      connectionStyle: 'line',
      nodeSize: 0.7,
      bloomIntensity: 1.0,
      showLabels: false,
      colorMode: 'energy',
      aliveFactor: 0.6,
      energyRipple: 0.3,
      nodeDrift: 0.0,
      syncFactor: 1.0
    }
  }
}

// =============================
// Settings defaults
// Learning and system parameters - all backend-controllable
// =============================
export const SETTINGS_DEFAULTS = {
  // Feature toggles
  autoSearch: true, // Auto browse/learn toggle
  codeGenEnabled: false, // Enable code generation
  memoryConsolidation: true, // Consolidate memory
  selfPruning: true, // Prune unused memory
  
  // Learning parameters (all 0-1 range unless noted)
  params: {
    learningRate: 0.03, // How fast to learn
    spontaneousRate: 0.002, // Random exploration rate
    growthThreshold: 0.7, // Trigger for network growth
    pruningThreshold: 0.005, // Trigger for pruning unused
    decayRate: 0.05, // Memory decay speed
    curiosity: 0.5, // Exploration vs exploitation
    creativity: 0.5, // Novel connection generation
    focus: 0.5 // Attention concentration
  },
  
  // Ranges for UI sliders
  paramRanges: {
    learningRate: { min: 0.001, max: 0.1, step: 0.001 },
    spontaneousRate: { min: 0, max: 0.01, step: 0.0001 },
    growthThreshold: { min: 0.3, max: 0.95, step: 0.05 },
    pruningThreshold: { min: 0.001, max: 0.05, step: 0.001 },
    decayRate: { min: 0.01, max: 0.2, step: 0.01 },
    curiosity: { min: 0, max: 1, step: 0.05 },
    creativity: { min: 0, max: 1, step: 0.05 },
    focus: { min: 0, max: 1, step: 0.05 }
  }
}

// =============================
// Stats defaults
// =============================
export const STATS_DEFAULTS = {
  status: 'live', // status indicator
  statusMessage: 'awake', // short status text
  feeling: 'curiosity', // current feeling label
  feelingDescription: 'Running in standalone mode', // feeling detail
  currentThought: 'Observing the mock network.', // latest thought
  thoughtCount: 12, // number of thoughts
  age: 1800, // age in seconds
  stepCount: 4200, // steps processed
  nodeCount: 72, // nodes in state stats
  connectionCount: 140, // connections in state stats
  vocabularyCount: 2400, // learned vocabulary size
  toolsCount: 3, // tool count
  intelligence: 0.78, // intelligence score (0..1)
  state: {
    activity_level: 0.55, // activity level (0..1)
    coherence: 0.62, // coherence (0..1)
    entropy: 0.38, // entropy (0..1)
    curiosity: 0.72, // curiosity (0..1)
    contentment: 0.44 // contentment (0..1)
  },
  db_stats: {
    nodes: 72, // db nodes
    connections: 140, // db connections
    vocabulary: 2400, // db vocabulary
    tools: 3, // db tools
    last_activity: 0 // last activity timestamp
  },
  engine_stats: {
    input_size: 512, // model input size
    output_size: 128, // model output size
    hidden_layers: [256, 128, 64], // hidden layer sizes
    embeddings: 128 // embedding dimension
  }
}

// =============================
// Consolidated Mock Data
// All dummy/mock/placeholder values for easy backend replacement
// =============================
export const MOCK_DATA = {
  // Network simulation parameters
  simulation: {
    pulse: {
      intervalMs: 900,
      activationJitter: 0.38,
      activeChance: 0.65
    },
    mutation: {
      intervalMs: 3800,
      addProbability: 0.4,
      removeProbability: 0.35,
      minNodes: 2,
      maxNodes: VISUAL_DEFAULTS.network.nodeCount + 50,
      linkCount: VISUAL_DEFAULTS.network.linkCount,
      linksPerNewNode: [3, 10],
      updateNodesOnRelink: true,
      linkUpdate: {
        influence: 0.35,
        jitter: 0.18,
        activeThreshold: 0.45,
        activeBoostChance: 0.15
      }
    },
    // State change parameters for mock simulation
    stateChanges: {
      activity_level: { range: [0.05, 0.95], variance: 0.08 },
      coherence: { range: [0.3, 0.95], variance: 0.06 },
      entropy: { range: [0.2, 0.8], variance: 0.04 },
      curiosity: { range: [0.3, 0.95], variance: 0.07 },
      contentment: { range: [0.2, 0.9], variance: 0.05 }
    },
    stepIncrementRange: [20, 50],
    thoughtProbability: 0.7, // Probability of incrementing thought count
    thoughtChangeProbability: 0.85 // Probability of changing current thought
  },

  // UI timing and randomization
  timing: {
    activityIntervalMs: 3800,
    thoughtBubble: {
      initialDelayMs: 2500,
      intervalRangeMs: [12000, 20000], // min, max
      visibleDurationRangeMs: [8000, 12000], // min, max
      fadeDelayRangeMs: [0, 3000] // min, max
    },
    statusUpdateIntervalMs: 15000
  },

  // Content and responses
  content: {
    thoughts: [
      'Exploring patterns in the mock network.',
      'Stabilizing activity across the helix.',
      'Simulating memory consolidation.',
      'Tracing new connections for clarity.',
      'Running in local standalone mode.',
      'Refining structure with dummy inputs.',
      'No backend detected. Rendering mock thoughts.',
      'Maintaining coherence with dummy inputs.',
      'Processing local simulation data.',
      'Optimizing neural pathways.'
    ],
    chatReplies: [
      'Acknowledged. Running locally with mock data.',
      'Signal received. Simulating response.',
      'Processing… returning a placeholder insight.',
      'Local mode active. No backend connected.',
      'All systems nominal. Dummy output delivered.',
      'Mock response generated successfully.',
      'Simulation parameters updated.',
      'Local processing complete.'
    ],
    activityEvents: [
      { event_type: 'thought_written', details: { thought: 'Initializing local state.' } },
      { event_type: 'words_learned', details: { count: 24, total: 2400 } },
      { event_type: 'autonomous_learn', details: { topic: 'UI hydration' } },
      { event_type: 'learned_response_pattern', details: { pattern_type: 'mock-response' } },
      { event_type: 'network_growth', details: { nodes_added: 3, links_added: 8 } },
      { event_type: 'memory_consolidation', details: { patterns_reinforced: 12 } },
      { event_type: 'pattern_recognition', details: { confidence: 0.87 } }
    ]
  },

  // AI-generated tools (functions the AI can create)
  tools: [
    {
      name: 'pattern_summarizer',
      description: 'Summarizes recent activity patterns for diagnostics.',
      code: 'def summarize(patterns):\n    return {"count": len(patterns), "sample": patterns[:3]}',
      use_count: 42,
      enabled: true
    },
    {
      name: 'signal_normalizer',
      description: 'Normalizes signal ranges for steady visualization.',
      code: 'def normalize(values):\n    mn, mx = min(values), max(values)\n    return [(v - mn) / (mx - mn + 1e-6) for v in values]',
      use_count: 18,
      enabled: true
    },
    {
      name: 'fallback_router',
      description: 'Routes requests to local mock handlers.',
      code: 'def route(command):\n    return {"status": "mock", "command": command}',
      use_count: 7,
      enabled: true
    }
  ],

  // State and status values
  state: {
    currentTask: 'exploring',
    feeling: 'curious',
    activityLevel: 0.7,
    memoryUsage: 0.45,
    processingLoad: 0.6
  },

  // Network generation parameters
  network: {
    initialNodeCount: 15,
    initialLinkCount: 25,
    evolutionBlend: 0.35
  },

  // Helper functions for generating mock data
  generators: {
    // Generate random activity event
    randomActivity: () => {
      const now = Math.floor(Date.now() / 1000)
      const event = MOCK_DATA.content.activityEvents[
        Math.floor(Math.random() * MOCK_DATA.content.activityEvents.length)
      ]
      return {
        timestamp: now - Math.floor(Math.random() * 60), // Within last minute
        ...event
      }
    },

    // Generate random thought
    randomThought: () => {
      return MOCK_DATA.content.thoughts[
        Math.floor(Math.random() * MOCK_DATA.content.thoughts.length)
      ]
    },

    // Generate random chat reply
    randomChatReply: () => {
      return MOCK_DATA.content.chatReplies[
        Math.floor(Math.random() * MOCK_DATA.content.chatReplies.length)
      ]
    },

    // Generate random timing
    randomTiming: (range) => {
      return range[0] + Math.random() * (range[1] - range[0])
    },

    // Generate random state changes for simulation
    randomStateChange: (currentValue, range, variance) => {
      return clamp(currentValue + (Math.random() - 0.5) * variance, range[0], range[1])
    },

    // Generate random step count increment
    randomStepIncrement: () => {
      return Math.floor(MOCK_DATA.simulation.stepIncrementRange[0] + 
                       Math.random() * (MOCK_DATA.simulation.stepIncrementRange[1] - MOCK_DATA.simulation.stepIncrementRange[0]))
    },

    // Generate random thought count increment (0 or 1)
    randomThoughtIncrement: () => {
      return Math.random() > MOCK_DATA.simulation.thoughtProbability ? 0 : 1
    },

    // Generate random thought change probability
    shouldChangeThought: () => {
      return Math.random() > MOCK_DATA.simulation.thoughtChangeProbability
    }
  }
}

// =============================
// Legacy aliases for backward compatibility
// TODO: Remove these after updating all imports
// =============================
export const MOCK_CONTENT = MOCK_DATA.content
export const MOCK_SIMULATION = MOCK_DATA.simulation

// =============================
// Helpers
// =============================
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

const computeApproxPositions = (nodes) => {
  const strandCfg = VISUAL_DEFAULTS.strand || {}
  const strandCount = Math.max(1, strandCfg.strandCount || 2)
  const radialLayers = Math.max(1, strandCfg.radialLayers || 1)
  const layerSpacing = strandCfg.layerSpacing ?? 0
  const helixRadius = strandCfg.radius ?? 1.2
  const helixHeight = strandCfg.height ?? 8
  const verticalPadding = strandCfg.verticalPadding ?? 0
  const turnsBase = strandCfg.turnsBase ?? 1
  const turnsScale = strandCfg.turnsScale ?? 0
  const variationScale = strandCfg.variationScale ?? 0
  const randomPhaseStrength = strandCfg.randomPhaseStrength ?? 0
  const randomVerticalJitter = strandCfg.randomVerticalJitter ?? 0
  const total = nodes.length
  const denom = Math.max(1, total - 1)

  const hashToUnit = (value) => {
    const str = String(value ?? '')
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) | 0
    }
    return (Math.abs(hash) % 1000) / 1000
  }

  return nodes.map((node, index) => {
    if (node && node.forcePosition && typeof node.x === 'number' && typeof node.y === 'number' && typeof node.z === 'number') {
      return [node.x, node.y, node.z]
    }
    const tBase = index / denom
    const tRaw = strandCfg.ageAtBottom === 'newer' ? 1 - tBase : tBase
    const t = clamp(tRaw, verticalPadding, 1 - verticalPadding)
    const intelligenceLevel = Math.min(1, total / 100)
    const turnsPerHelix = turnsBase + intelligenceLevel * turnsScale
    const strand = index % strandCount
    const layerIndex = radialLayers > 1 ? Math.floor(index / strandCount) % radialLayers : 0
    const angleOffset = (strand * 2 * Math.PI / strandCount)
    const phaseJitter = (hashToUnit(node.id) - 0.5) * randomPhaseStrength
    const angle = t * turnsPerHelix * Math.PI * 2 + angleOffset + phaseJitter
    const layerRadius = helixRadius + layerIndex * layerSpacing
    const variation = (node.activation || 0) * variationScale
    const endsCfg = strandCfg.ends || {}
    const endRange = endsCfg.enabled ? (endsCfg.range ?? 0) : 0
    const endFactor = endRange > 0 ? Math.max(0, (endRange - Math.min(t, 1 - t)) / endRange) : 0
    const endRadial = (endsCfg.radialJitter ?? 0) * endFactor
    const endTwist = (endsCfg.twistJitter ?? 0) * endFactor

    const x = Math.cos(angle + endTwist) * (layerRadius + endRadial) + variation * Math.sin(index)
    const z = Math.sin(angle + endTwist) * (layerRadius + endRadial) + variation * Math.cos(index)
    const verticalJitter = (hashToUnit(`${node.id}-y`) - 0.5) * randomVerticalJitter
    const endVertical = (endsCfg.verticalJitter ?? 0) * endFactor
    const y = (t - 0.5) * helixHeight + verticalJitter + (hashToUnit(`${node.id}-ey`) - 0.5) * endVertical
    return [x, y, z]
  })
}

const addBridgeNodes = (nodes) => {
  const strandCfg = VISUAL_DEFAULTS.strand || {}
  const bridgeCfg = strandCfg.bridgeNodes || {}
  if (bridgeCfg.enabled !== true) return nodes

  const maxTotalNodes = bridgeCfg.maxTotalNodes ?? Infinity
  if (nodes.length >= maxTotalNodes) return nodes

  const baseNodes = nodes.filter(node => node && node.layer !== 'bridge' && node.layer !== 'end-noise' && node.layer !== 'sub-strand')
  const positions = computeApproxPositions(baseNodes)
  const strandCount = Math.max(1, strandCfg.strandCount || 2)
  const strands = Array.from({ length: strandCount }, () => [])
  baseNodes.forEach((node, idx) => {
    strands[idx % strandCount].push({ node, idx })
  })

  const lengths = strands.map(strand => strand.length)
  const maxLen = lengths.length ? Math.max(...lengths) : 0
  const chance = bridgeCfg.chancePerSpan ?? 0.3
  const maxPerSpan = Math.max(1, bridgeCfg.maxPerSpan || 1)
  const jitter = bridgeCfg.jitter ?? 0.1

  const bridges = []
  for (let i = 0; i < maxLen; i++) {
    for (let s = 0; s < strandCount; s++) {
      const a = strands[s][i]
      const b = strands[(s + 1) % strandCount][i]
      if (!a || !b) continue
      if (Math.random() > chance) continue

      for (let k = 0; k < maxPerSpan; k++) {
        if (nodes.length + bridges.length >= maxTotalNodes) break
        const posA = positions[a.idx] || [0, 0, 0]
        const posB = positions[b.idx] || [0, 0, 0]
        const mid = [
          (posA[0] + posB[0]) / 2,
          (posA[1] + posB[1]) / 2,
          (posA[2] + posB[2]) / 2
        ]
        const nodeId = `b-${a.node.id}-${b.node.id}-${i}-${Math.floor(Math.random() * 9999)}`
        bridges.push({
          id: nodeId,
          activation: Math.random() * 0.6,
          active: Math.random() > 0.4,
          layer: 'bridge',
          parentA: a.node.id,
          parentB: b.node.id,
          x: mid[0] + (Math.random() - 0.5) * jitter,
          y: mid[1] + (Math.random() - 0.5) * jitter,
          z: mid[2] + (Math.random() - 0.5) * jitter,
          forcePosition: true
        })
      }
    }
  }

  return nodes.concat(bridges)
}

const addEndNoiseNodes = (nodes) => {
  const strandCfg = VISUAL_DEFAULTS.strand || {}
  const endsCfg = strandCfg.ends || {}
  if (endsCfg.enabled !== true) return nodes

  const maxTotalNodes = endsCfg.maxTotalNodes ?? Infinity
  if (nodes.length >= maxTotalNodes) return nodes

  const baseNodes = nodes.filter(node => node && node.layer !== 'bridge' && node.layer !== 'end-noise')
  const positions = computeApproxPositions(baseNodes)
  const total = baseNodes.length
  if (total === 0) return nodes

  const [minExtra, maxExtra] = endsCfg.extraNodesPerEnd || [2, 6]
  const extraPerEnd = Math.floor(minExtra + Math.random() * (maxExtra - minExtra + 1))
  const range = Math.max(0.01, endsCfg.range ?? 0.15)
  const endCount = Math.max(1, Math.floor(total * range))
  const endIndices = [
    ...Array.from({ length: endCount }, (_, i) => i),
    ...Array.from({ length: endCount }, (_, i) => total - 1 - i)
  ]

  const noiseNodes = []
  for (let e = 0; e < extraPerEnd; e++) {
    if (nodes.length + noiseNodes.length >= maxTotalNodes) break
    const anchorIndex = endIndices[Math.floor(Math.random() * endIndices.length)]
    const anchor = baseNodes[anchorIndex]
    if (!anchor) continue
    const pos = positions[anchorIndex] || [0, 0, 0]
    const radialJitter = endsCfg.radialJitter ?? 0.3
    const verticalJitter = endsCfg.verticalJitter ?? 0.3
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * radialJitter
    noiseNodes.push({
      id: `e-${anchor.id}-${Math.floor(Math.random() * 9999)}`,
      activation: Math.random() * 0.5,
      active: Math.random() > 0.4,
      layer: 'end-noise',
      parentId: anchor.id,
      x: pos[0] + Math.cos(angle) * radius,
      y: pos[1] + (Math.random() - 0.5) * verticalJitter,
      z: pos[2] + Math.sin(angle) * radius,
      forcePosition: true
    })
  }

  return nodes.concat(noiseNodes)
}

const addFloatingNodes = (nodes) => {
  const strandCfg = VISUAL_DEFAULTS.strand || {}
  const floatingCfg = strandCfg.floatingNodes || {}
  if (floatingCfg.enabled !== true) return nodes

  const maxTotalNodes = floatingCfg.maxTotalNodes ?? Infinity
  if (nodes.length >= maxTotalNodes) return nodes

  const count = floatingCfg.count ?? 50
  const explosionRadius = floatingCfg.explosionRadius ?? 2.5
  const helixHeight = strandCfg.height ?? 10
  const floatingNodes = []

  for (let i = 0; i < count; i++) {
    if (nodes.length + floatingNodes.length >= maxTotalNodes) break
    // Position floating nodes in a spherical/cylindrical cloud around the helix
    const angle = Math.random() * Math.PI * 2
    const radiusScale = 0.5 + Math.random() * 0.5 // Between 50-100% of explosion radius
    const radius = explosionRadius * radiusScale
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius
    const y = (Math.random() - 0.5) * helixHeight * 1.2 // Extend slightly beyond helix height
    
    floatingNodes.push({
      id: `f-${Math.floor(Math.random() * 999999)}`,
      activation: Math.random() * 0.8,
      active: Math.random() > 0.3,
      layer: 'floating',
      x: x,
      y: y,
      z: z,
      forcePosition: true
    })
  }

  return nodes.concat(floatingNodes)
}

const addSubStrandNodes = (nodes, targetIds = null) => {
  const strandCfg = VISUAL_DEFAULTS.strand || {}
  const subCfg = strandCfg.subStrands || {}
  if (subCfg.enabled !== true) return nodes

  const maxTotalNodes = subCfg.maxTotalNodes ?? Infinity
  if (nodes.length >= maxTotalNodes) return nodes

  const baseNodes = nodes.filter(node => node && node.layer !== 'bridge' && node.layer !== 'end-noise' && node.layer !== 'sub-strand')
  const positions = computeApproxPositions(baseNodes)
  const perChance = subCfg.perMainNodeChance ?? 0.1
  const [minCount, maxCount] = subCfg.nodesPerStrand || [2, 4]
  const radius = subCfg.radius ?? 0.2
  const length = subCfg.length ?? 0.5
  const twist = subCfg.twist ?? 3.5

  const subNodes = []
  baseNodes.forEach((node, idx) => {
    if (targetIds && !targetIds.has(node.id)) return
    if (Math.random() > perChance) return
    if (nodes.length + subNodes.length >= maxTotalNodes) return

    const count = Math.floor(minCount + Math.random() * (maxCount - minCount + 1))
    const basePos = positions[idx] || [0, 0, 0]
    const axisAngle = Math.random() * Math.PI * 2
    const axis = [Math.cos(axisAngle), (Math.random() - 0.5) * 0.4, Math.sin(axisAngle)]

    for (let i = 0; i < count; i++) {
      if (nodes.length + subNodes.length >= maxTotalNodes) break
      const t = count > 1 ? i / (count - 1) : 0
      const swirl = twist * t
      const offsetRadius = radius * (0.6 + Math.random() * 0.4)
      const dx = axis[0] * (t - 0.5) * length + Math.cos(swirl) * offsetRadius
      const dy = axis[1] * (t - 0.5) * length + Math.sin(swirl) * offsetRadius * 0.6
      const dz = axis[2] * (t - 0.5) * length + Math.sin(swirl + 1.7) * offsetRadius
      subNodes.push({
        id: `ss-${node.id}-${i}-${Math.floor(Math.random() * 9999)}`,
        activation: Math.random() * 0.6,
        active: Math.random() > 0.4,
        layer: 'sub-strand',
        parentId: node.id,
        x: basePos[0] + dx,
        y: basePos[1] + dy,
        z: basePos[2] + dz,
        forcePosition: true
      })
    }
  })

  return nodes.concat(subNodes)
}

const updateNodesFromLinks = (nodes, links, options = {}) => {
  const degree = new Map()
  const activeDegree = new Map()

  links.forEach((link) => {
    if (!link?.source || !link?.target) return
    degree.set(link.source, (degree.get(link.source) || 0) + 1)
    degree.set(link.target, (degree.get(link.target) || 0) + 1)
    if (link.active) {
      activeDegree.set(link.source, (activeDegree.get(link.source) || 0) + 1)
      activeDegree.set(link.target, (activeDegree.get(link.target) || 0) + 1)
    }
  })

  const influence = options.influence ?? 0.3
  const jitter = options.jitter ?? 0.15
  const activeThreshold = options.activeThreshold ?? 0.5
  const activeBoostChance = options.activeBoostChance ?? 0.1

  return nodes.map((node) => {
    const deg = degree.get(node.id) || 0
    const active = activeDegree.get(node.id) || 0
    const ratio = deg > 0 ? active / deg : 0
    const delta = (ratio - 0.5) * influence + (Math.random() - 0.5) * jitter
    return {
      ...node,
      activation: clamp((node.activation ?? 0.5) + delta, 0, 1),
      active: ratio > activeThreshold || Math.random() < activeBoostChance
    }
  })
}

const buildStrandLinks = (nodes, linkCount = VISUAL_DEFAULTS.network.linkCount) => {
  const ids = nodes.map(node => node.id)
  const linkSet = new Set()
  const links = []
  const extraRandom = VISUAL_DEFAULTS.network?.extraRandomLinks
  const extraEnabled = extraRandom?.enabled === true
  const connectionRange = VISUAL_DEFAULTS.network?.connectionsPerNodeRange
  const proximity = VISUAL_DEFAULTS.network?.proximityLinks
  const proximityEnabled = proximity?.enabled === true
  const strandCfg = VISUAL_DEFAULTS.strand || {}
  const groupingCfg = strandCfg.grouping || {}
  const connectivityCfg = VISUAL_DEFAULTS.network?.ensureConnectivity
  const connectivityEnabled = connectivityCfg?.enabled === true

  const degreeMap = new Map()

  const bumpDegree = (id) => {
    degreeMap.set(id, (degreeMap.get(id) || 0) + 1)
  }

  const pushLink = (source, target, weight = 0.3, active = Math.random() > 0.35) => {
    if (!source || !target || source === target) return
    const key = `${source}|${target}`
    if (linkSet.has(key)) return
    linkSet.add(key)
    links.push({ source, target, weight, active })
    bumpDegree(source)
    bumpDegree(target)
  }

  const strandCount = VISUAL_DEFAULTS.strand?.strandCount || 3
  const baseNodes = nodes.filter(node => node && node.layer !== 'bridge' && node.layer !== 'end-noise')
  const strands = Array.from({ length: strandCount }, () => [])
  baseNodes.forEach((node, idx) => {
    strands[idx % strandCount].push(node.id)
  })

  const spiderCfg = strandCfg.spiderWeb || {}
  const spiderEnabled = spiderCfg.enabled === true
  const crossCfg = strandCfg.crossStrand || {}
  const crossEnabled = crossCfg.enabled !== false

  // Grouped links within each strand
  const groupSize = Math.max(1, groupingCfg.groupSize || 1)
  const intraDensity = groupingCfg.intraLinkDensity ?? 1
  const bridgeGroups = groupingCfg.bridgeToNextGroup !== false
  const groupingEnabled = groupingCfg.enabled === true

  strands.forEach(strand => {
    // Always add a spine so every node is linked up the strand
    for (let i = 0; i < strand.length - 1; i++) {
      pushLink(strand[i], strand[i + 1], 0.6)
    }

    if (!groupingEnabled || groupSize <= 1) {
      return
    }

    for (let start = 0; start < strand.length; start += groupSize) {
      const group = strand.slice(start, start + groupSize)
      const anchor = group[0]

      // Connect nodes inside the group to the anchor
      for (let i = 1; i < group.length; i++) {
        if (Math.random() <= intraDensity) {
          pushLink(anchor, group[i], 0.6)
        }
      }

      // Bridge to next group
      if (bridgeGroups && start + groupSize < strand.length) {
        const nextAnchor = strand[start + groupSize]
        if (nextAnchor) {
          pushLink(anchor, nextAnchor, 0.5)
        }
      }
    }
  })

  const lengths = strands.map(strand => strand.length)
  const maxLen = lengths.length ? Math.max(...lengths) : 0
  if (crossEnabled) {
    const crossWeight = crossCfg.weight ?? 0.5
    const diagonalWeight = crossCfg.diagonalWeight ?? 0.45
    for (let i = 0; i < maxLen; i++) {
      for (let s = 0; s < strandCount; s++) {
        const current = strands[s][i]
        const nextStrand = strands[(s + 1) % strandCount][i]
        if (current && nextStrand) {
          pushLink(current, nextStrand, crossWeight)
        }
      }

      const nextIndex = i + 1
      for (let s = 0; s < strandCount; s++) {
        const current = strands[s][i]
        const diagonal = strands[(s + 1) % strandCount][nextIndex]
        if (current && diagonal) {
          pushLink(current, diagonal, diagonalWeight)
        }
      }
    }
  }

  if (spiderEnabled) {
    const ringNeighbors = Math.max(1, spiderCfg.ringNeighbors || 1)
    const diagonalSpan = Math.max(1, spiderCfg.diagonalSpan || 1)
    const skipChance = spiderCfg.skipChance ?? 0
    const weightMin = spiderCfg.weightRange?.[0] ?? 0.1
    const weightMax = spiderCfg.weightRange?.[1] ?? 0.35
    const activeChance = spiderCfg.activeChance ?? 0.5

    for (let i = 0; i < maxLen; i++) {
      for (let s = 0; s < strandCount; s++) {
        const current = strands[s][i]
        if (!current) continue

        for (let offset = 1; offset <= ringNeighbors; offset++) {
          const neighbor = strands[(s + offset) % strandCount][i]
          if (neighbor && Math.random() > skipChance) {
            const weight = weightMin + Math.random() * Math.max(0.0001, weightMax - weightMin)
            pushLink(current, neighbor, weight, Math.random() < activeChance)
          }
        }

        for (let span = 1; span <= diagonalSpan; span++) {
          const diagonal = strands[(s + 1) % strandCount][i + span]
          if (diagonal && Math.random() > skipChance) {
            const weight = weightMin + Math.random() * Math.max(0.0001, weightMax - weightMin)
            pushLink(current, diagonal, weight, Math.random() < activeChance)
          }
        }
      }
    }
  }

  const bridgeCfg = strandCfg.bridgeNodes || {}
  if (bridgeCfg.enabled) {
    const weightMin = bridgeCfg.linkWeightRange?.[0] ?? 0.2
    const weightMax = bridgeCfg.linkWeightRange?.[1] ?? 0.5
    const activeChance = bridgeCfg.linkActiveChance ?? 0.6
    nodes.forEach((node) => {
      if (node?.layer !== 'bridge') return
      const parents = [node.parentA, node.parentB].filter(Boolean)
      parents.forEach((parentId) => {
        const weight = weightMin + Math.random() * Math.max(0.0001, weightMax - weightMin)
        pushLink(parentId, node.id, weight, Math.random() < activeChance)
      })
    })
  }

  const subCfg = strandCfg.subStrands || {}
  if (subCfg.enabled) {
    const weightMin = subCfg.linkWeightRange?.[0] ?? 0.2
    const weightMax = subCfg.linkWeightRange?.[1] ?? 0.5
    const parentWeight = subCfg.parentLinkWeight ?? 0.6
    nodes.forEach((node) => {
      if (node?.layer !== 'sub-strand' || !node.parentId) return
      const weight = weightMin + Math.random() * Math.max(0.0001, weightMax - weightMin)
      pushLink(node.parentId, node.id, parentWeight)
      if (Math.random() < 0.5) {
        pushLink(node.parentId, node.id, weight)
      }
    })
    // Link sub-strand nodes in sequence per parent
    const byParent = new Map()
    nodes.forEach((node) => {
      if (node?.layer !== 'sub-strand' || !node.parentId) return
      const list = byParent.get(node.parentId) || []
      list.push(node)
      byParent.set(node.parentId, list)
    })
    byParent.forEach((list) => {
      for (let i = 0; i < list.length - 1; i++) {
        const weight = weightMin + Math.random() * Math.max(0.0001, weightMax - weightMin)
        pushLink(list[i].id, list[i + 1].id, weight)
      }
    })
  }

  const endsCfg = strandCfg.ends || {}
  if (endsCfg.enabled) {
    const weightMin = 0.15
    const weightMax = 0.4
    const activeChance = 0.5
    nodes.forEach((node) => {
      if (node?.layer !== 'end-noise' || !node.parentId) return
      const weight = weightMin + Math.random() * Math.max(0.0001, weightMax - weightMin)
      pushLink(node.parentId, node.id, weight, Math.random() < activeChance)
    })
  }

  if (extraEnabled && ids.length > 1) {
    const [minLinks, maxLinks] = connectionRange || extraRandom.perNodeRange || [1, 2]
    const weightMin = extraRandom.weightRange?.[0] ?? 0.1
    const weightMax = extraRandom.weightRange?.[1] ?? 0.35
    const activeChance = extraRandom.activeChance ?? 0.4
    ids.forEach((source) => {
      const extraCount = Math.floor(minLinks + Math.random() * (maxLinks - minLinks + 1))
      for (let i = 0; i < extraCount; i++) {
        const target = ids[Math.floor(Math.random() * ids.length)]
        const weight = weightMin + Math.random() * Math.max(0.0001, weightMax - weightMin)
        pushLink(source, target, weight, Math.random() < activeChance)
      }
    })
  }

  while (links.length < linkCount && ids.length > 1) {
    const source = ids[Math.floor(Math.random() * ids.length)]
    let target = ids[Math.floor(Math.random() * ids.length)]
    if (source === target) {
      target = ids[(ids.indexOf(source) + 1) % ids.length]
    }
    pushLink(source, target, 0.15 + Math.random() * 0.35)
  }

  if (proximityEnabled && ids.length > 1) {
    const distance = proximity.distance ?? 1
    const maxPerNode = proximity.maxPerNode ?? 2
    const windowSize = proximity.checkWindow ?? 8
    const weightMin = proximity.weightRange?.[0] ?? 0.1
    const weightMax = proximity.weightRange?.[1] ?? 0.35
    const activeChance = proximity.activeChance ?? 0.5
    const positions = computeApproxPositions(nodes)

    positions.forEach((pos, idx) => {
      const source = nodes[idx]?.id
      if (!source) return
      let added = 0
      const start = Math.max(0, idx - windowSize)
      const end = Math.min(positions.length - 1, idx + windowSize)
      for (let j = start; j <= end; j++) {
        if (j === idx) continue
        const target = nodes[j]?.id
        if (!target) continue
        const dx = pos[0] - positions[j][0]
        const dy = pos[1] - positions[j][1]
        const dz = pos[2] - positions[j][2]
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (dist <= distance) {
          const weight = weightMin + Math.random() * Math.max(0.0001, weightMax - weightMin)
          pushLink(source, target, weight, Math.random() < activeChance)
          added += 1
          if (added >= maxPerNode) break
        }
      }
    })
  }

  if (connectivityEnabled && ids.length > 1) {
    const minLinks = Math.max(1, connectivityCfg.minLinksPerNode || 1)
    const weightMin = connectivityCfg.weightRange?.[0] ?? 0.15
    const weightMax = connectivityCfg.weightRange?.[1] ?? 0.35
    const activeChance = connectivityCfg.activeChance ?? 0.5
    const uniqueTargets = connectivityCfg.uniqueTargets !== false
    const maxAttempts = Math.max(1, connectivityCfg.maxAttempts || 6)
    ids.forEach((source) => {
      const currentDegree = degreeMap.get(source) || 0
      if (currentDegree >= minLinks) return
      const needed = minLinks - currentDegree
      const usedTargets = new Set()
      let attempts = 0
      while (usedTargets.size < needed && attempts < maxAttempts) {
        attempts += 1
        const target = ids[Math.floor(Math.random() * ids.length)]
        if (target === source) continue
        if (uniqueTargets && usedTargets.has(target)) continue
        const weight = weightMin + Math.random() * Math.max(0.0001, weightMax - weightMin)
        pushLink(source, target, weight, Math.random() < activeChance)
        usedTargets.add(target)
      }
    })
  }

  return links.slice(0, linkCount)
}

export const createInitialState = () => ({
  ...STATS_DEFAULTS,
  db_stats: {
    ...STATS_DEFAULTS.db_stats,
    last_activity: Date.now()
  },
  theme: VISUAL_DEFAULTS.theme
})

export const createDummyNetwork = (nodeCount = VISUAL_DEFAULTS.network.nodeCount, linkCount = VISUAL_DEFAULTS.network.linkCount) => {
  const nodes = Array.from({ length: nodeCount }, (_, i) => ({
    id: `n-${i}`,
    activation: Math.random() * 0.8,
    active: Math.random() > 0.4,
    layer: i < 6 ? 'input' : i > nodeCount - 7 ? 'output' : 'hidden'
  }))

  let expandedNodes = addBridgeNodes(nodes)
  expandedNodes = addSubStrandNodes(expandedNodes)
  expandedNodes = addEndNoiseNodes(expandedNodes)

  const links = buildStrandLinks(expandedNodes, linkCount)
  return { nodes: expandedNodes, links }
}

const getNextNodeId = (nodes) => {
  const indices = nodes
    .map(node => Number(String(node.id || '').replace('n-', '')))
    .filter(Number.isFinite)
  const maxId = indices.length ? Math.max(...indices) : nodes.length - 1
  return `n-${maxId + 1}`
}

export const evolveDummyNetwork = (prev, options = MOCK_SIMULATION) => {
  const pulse = options?.pulse || MOCK_SIMULATION.pulse
  const mutation = options?.mutation || MOCK_SIMULATION.mutation
  const mutationOnly = options?.mutationOnly === true

  const baseNodes = mutationOnly
    ? prev.nodes
    : prev.nodes.map(node => ({
      ...node,
      activation: clamp(node.activation + (Math.random() - 0.5) * pulse.activationJitter, 0, 1),
      active: Math.random() < pulse.activeChance
    }))

  let nodes = baseNodes

  if (Math.random() < mutation.addProbability && nodes.length < mutation.maxNodes) {
    const nextId = getNextNodeId(nodes)
    nodes = [
      ...nodes,
      {
        id: nextId,
        activation: Math.random() * 0.6,
        active: true,
        layer: nodes.length < 6 ? 'input' : 'hidden'
      }
    ]
  }

  if (Math.random() < mutation.removeProbability && nodes.length > mutation.minNodes) {
    const removeIndex = Math.floor(Math.random() * nodes.length)
    const removed = nodes[removeIndex]
    nodes = nodes.filter((node, idx) => {
      if (idx === removeIndex) return false
      if (removed && removed.layer !== 'bridge' && removed.layer !== 'end-noise' && removed.layer !== 'sub-strand' && removed.layer !== 'floating') {
        if (node.parentId === removed.id) return false
        if (node.parentA === removed.id || node.parentB === removed.id) return false
      }
      return true
    })
  }

  nodes = addBridgeNodes(nodes)
  nodes = addSubStrandNodes(nodes)
  if (Math.random() < (VISUAL_DEFAULTS.strand?.ends?.spawnChance ?? 0)) {
    nodes = addEndNoiseNodes(nodes)
  }
  nodes = addFloatingNodes(nodes)

  const links = buildStrandLinks(nodes, mutation.linkCount)
  const shouldUpdate = mutation.updateNodesOnRelink !== false
  const updatedNodes = shouldUpdate ? updateNodesFromLinks(nodes, links, mutation.linkUpdate) : nodes
  return { nodes: updatedNodes, links }
}
