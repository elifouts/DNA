import React, { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BACKEND, VISUAL_DEFAULTS, clamp } from '../config/appDefaults'

/*
 * ORGANIC DNA HELIX - A Living Neural Visualization
 * 
 * This creates a breathing, morphing double helix where:
 * - Nodes are organic orbs that pulse, breathe, and shift positions
 * - Links are living tendrils that flow between connected nodes
 * - The entire structure continuously evolves and refreshes
 * - Energy flows through the network like a living organism
 */

const CONFIG = VISUAL_DEFAULTS.neural
const STRAND_CONFIG = VISUAL_DEFAULTS.strand
const MAX_NODES = CONFIG.maxNodes
const MAX_EDGES = CONFIG.maxEdges
const CURVE_SEGMENTS = 24 // More segments for smoother organic curves
const OFFSCREEN = CONFIG.offscreen

// Line shader materials inspired by three.js custom attributes example
const lineVertexShader = `
  uniform float amplitude;
  uniform float time;
  attribute vec3 displacement;
  attribute vec3 customColor;
  varying vec3 vColor;

  void main() {
    vec3 newPosition = position + amplitude * displacement * sin(time + position.x * 0.01);
    vColor = customColor;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`

const lineFragmentShader = `
  uniform vec3 color;
  uniform float opacity;
  varying vec3 vColor;

  void main() {
    gl_FragColor = vec4(vColor * color, opacity);
  }
`

// Organic node class - each node has its own life cycle
class OrganicNode {
  constructor(id, index) {
    this.id = id
    this.index = index
    this.seed = this.hashToUnit(id)
    
    // Life cycle properties
    // All properties are deterministic based on id
    this.birthTime = this.hashToUnit(id + ':birth') * 10
    this.lifePhase = this.hashToUnit(id + ':life') * Math.PI * 2
    this.breathRate = 0.6 + this.hashToUnit(id + ':breath') * 0.8
    this.pulseRate = 1.5 + this.hashToUnit(id + ':pulse') * 1.5

    // Position modulation
    this.driftPhaseX = this.hashToUnit(id + ':dx') * Math.PI * 4
    this.driftPhaseY = this.hashToUnit(id + ':dy') * Math.PI * 2
    this.driftPhaseZ = this.hashToUnit(id + ':dz') * Math.PI * 2
    this.orbitPhase = this.hashToUnit(id + ':orbit') * Math.PI * 2
    this.orbitSpeed = 0.2 + this.hashToUnit(id + ':orbitspeed') * 0.3

    // Visual properties
    this.glowIntensity = 0.7 + this.hashToUnit(id + ':glow') * 0.6
    this.colorShift = this.hashToUnit(id + ':color') * 0.3

    // Morphing state
    this.morphPhase = this.hashToUnit(id + ':morph') * Math.PI * 6
    this.morphSpeed = 0.3 + this.hashToUnit(id + ':morphspeed') * 0.4
  }
  
  hashToUnit(value) {
    const str = String(value ?? '')
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) | 0
    }
    return (Math.abs(hash) % 10000) / 10000
  }
  
  // Get organic modulation at current time
  getModulation(time) {
    const age = time - this.birthTime
    const breath = Math.sin(time * this.breathRate + this.lifePhase)
    const pulse = Math.sin(time * this.pulseRate + this.lifePhase * 2) * 0.5 + 0.5
    const morph = Math.sin(time * this.morphSpeed + this.morphPhase)
    
    return {
      breath: breath * 0.3,
      pulse,
      morph: morph * 0.2,
      orbit: Math.sin(time * this.orbitSpeed + this.orbitPhase),
      glow: this.glowIntensity * (0.7 + pulse * 0.3)
    }
  }
}

// Organic link - living connection between nodes
class OrganicLink {
  constructor(sourceId, targetId) {
    this.sourceId = sourceId
    this.targetId = targetId
    this.seed = this.hashToUnit(`${sourceId}-${targetId}`)

    // All properties are deterministic based on source-target
    this.flowSpeed = 1.5 + this.hashToUnit(`${sourceId}-${targetId}:flow`) * 2.0
    this.flowPhase = this.hashToUnit(`${sourceId}-${targetId}:phase`) * Math.PI * 2
    this.pulseWidth = 0.15 + this.hashToUnit(`${sourceId}-${targetId}:pulse`) * 0.2

    // Organic curve properties
    this.curvature = 0.3 + this.hashToUnit(`${sourceId}-${targetId}:curv`) * 0.4
    this.wobbleSpeed = 0.5 + this.hashToUnit(`${sourceId}-${targetId}:wobspeed`) * 0.8
    this.wobblePhase = this.hashToUnit(`${sourceId}-${targetId}:wobphase`) * Math.PI * 4
    this.wobbleAmp = 0.1 + this.hashToUnit(`${sourceId}-${targetId}:wobamp`) * 0.15

    // Visual
    this.intensity = 0.6 + this.hashToUnit(`${sourceId}-${targetId}:intensity`) * 0.4
  }
  
  hashToUnit(value) {
    const str = String(value ?? '')
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) | 0
    }
    return (Math.abs(hash) % 10000) / 10000
  }
  
  // Get flow position (0-1) at current time
  getFlowPosition(time) {
    return ((time * this.flowSpeed + this.flowPhase) % (Math.PI * 2)) / (Math.PI * 2)
  }
  
  // Get organic wobble for curve control point
  getWobble(time) {
    return Math.sin(time * this.wobbleSpeed + this.wobblePhase) * this.wobbleAmp
  }
}

export default function NeuralNetwork({ 
  nodes = [], 
  links = [], 
  theme = VISUAL_DEFAULTS.theme, 
  vizParams: propVizParams, 
  isOffline = false 
}) {
  const groupRef = useRef()
  const pointsRef = useRef()
  const glowRef = useRef()
  const innerGlowRef = useRef()
  const linesRef = useRef()
  const pointsMaterialRef = useRef()
  const glowMaterialRef = useRef()
  const innerGlowMaterialRef = useRef()
  
  // Time and animation state
  const timeRef = useRef(0)
  const globalPhaseRef = useRef(0)
  const helixRotationRef = useRef(0)
  const breathCycleRef = useRef(0)
  
  // Organic entity caches
  const organicNodesRef = useRef(new Map())
  const organicLinksRef = useRef(new Map())
  const positionsRef = useRef(new Map())
  
  // Helix morph state
  const helixMorphRef = useRef({
    squeeze: 0,
    twist: 0,
    wave: 0,
    bulge: 0
  })
  
  // Get structure params from vizParams or fall back to config
  const strandConfig = STRAND_CONFIG || {}
  const getStructureParams = () => {
    return {
      helixHeight: propVizParams?.helixHeight ?? strandConfig.height ?? 14,
      helixRadius: propVizParams?.helixRadius ?? strandConfig.radius ?? 2.5,
      helixTurns: propVizParams?.helixTurns ?? strandConfig.turnsBase ?? 2.5,
      strandCount: propVizParams?.strandCount ?? strandConfig.strandCount ?? 2
    }
  }
  const structureParams = getStructureParams()
  const helixHeight = structureParams.helixHeight
  const helixRadius = structureParams.helixRadius
  const helixTurns = structureParams.helixTurns
  const strandCount = structureParams.strandCount
  const organicMovement = strandConfig.organicMovement || {}
  
  // Get or create organic node instance
  const getOrganicNode = (nodeId, index) => {
    if (!organicNodesRef.current.has(nodeId)) {
      organicNodesRef.current.set(nodeId, new OrganicNode(nodeId, index))
    }
    return organicNodesRef.current.get(nodeId)
  }
  
  // Get or create organic link instance  
  const getOrganicLink = (sourceId, targetId) => {
    const key = `${sourceId}->${targetId}`
    if (!organicLinksRef.current.has(key)) {
      organicLinksRef.current.set(key, new OrganicLink(sourceId, targetId))
    }
    return organicLinksRef.current.get(key)
  }

  // Sort and prepare nodes
  const layoutNodes = useMemo(() => {
    const list = (nodes || []).slice(0, MAX_NODES)
    if (!strandConfig.orderByAge) return list
    return [...list].sort((a, b) => {
      const aIdx = Number(String(a?.id || '').replace(/\D/g, '')) || 0
      const bIdx = Number(String(b?.id || '').replace(/\D/g, '')) || 0
      return aIdx - bIdx
    })
  }, [nodes, strandConfig.orderByAge])

  // Age mapping
  const ageMap = useMemo(() => {
    const map = new Map()
    const total = layoutNodes.length
    const denom = Math.max(1, total - 1)
    layoutNodes.forEach((node, idx) => {
      if (node?.id) map.set(node.id, idx / denom)
    })
    return map
  }, [layoutNodes])
  
  // Clean up old organic entities
  useEffect(() => {
    const currentIds = new Set(layoutNodes.map(n => n?.id).filter(Boolean))
    for (const id of organicNodesRef.current.keys()) {
      if (!currentIds.has(id)) {
        organicNodesRef.current.delete(id)
      }
    }
  }, [layoutNodes])

  // AI visualization control - all parameters from vizParams
  const [aiControl, setAiControl] = useState(() => ({
    rotation_speed: VISUAL_DEFAULTS.vizParams.rotationSpeed,
    tilt: VISUAL_DEFAULTS.vizParams.tilt,
    breathing: VISUAL_DEFAULTS.vizParams.breathing,
    pulse: VISUAL_DEFAULTS.vizParams.pulse,
    intensity: VISUAL_DEFAULTS.vizParams.intensity,
    node_size: VISUAL_DEFAULTS.vizParams.nodeSize,
    node_base_size: VISUAL_DEFAULTS.vizParams.nodeBaseSize ?? 0.45,
    glow_size: VISUAL_DEFAULTS.vizParams.glowSize ?? 1.6,
    inner_glow_size: VISUAL_DEFAULTS.vizParams.innerGlowSize ?? 0.9,
    bloom_intensity: VISUAL_DEFAULTS.vizParams.bloomIntensity,
    glow_opacity: VISUAL_DEFAULTS.vizParams.glowOpacity ?? 0.25,
    inner_glow_opacity: VISUAL_DEFAULTS.vizParams.innerGlowOpacity ?? 0.35,
    core_opacity: VISUAL_DEFAULTS.vizParams.coreOpacity ?? 0.9,
    color_mode: VISUAL_DEFAULTS.vizParams.colorMode,
    alive_factor: VISUAL_DEFAULTS.vizParams.aliveFactor,
    // Connection settings
    connection_style: VISUAL_DEFAULTS.vizParams.connectionStyle ?? 'bezier',
    link_opacity: VISUAL_DEFAULTS.vizParams.linkOpacity,
    link_flow_speed: VISUAL_DEFAULTS.vizParams.linkFlowSpeed,
    link_flow_intensity: VISUAL_DEFAULTS.vizParams.linkFlowIntensity,
    link_curvature: VISUAL_DEFAULTS.vizParams.linkCurvature ?? 0.35,
    link_segments: VISUAL_DEFAULTS.vizParams.linkSegments ?? 24,
    energy_ripple: VISUAL_DEFAULTS.vizParams.energyRipple ?? 0.4,
    node_drift: VISUAL_DEFAULTS.vizParams.nodeDrift ?? 0.25,
    sync_factor: VISUAL_DEFAULTS.vizParams.syncFactor ?? 0.7,
    // Organic movement
    helix_wave_enabled: VISUAL_DEFAULTS.vizParams.helixWaveEnabled ?? true,
    helix_wave_amplitude: VISUAL_DEFAULTS.vizParams.helixWaveAmplitude ?? 0.5,
    helix_wave_speed: VISUAL_DEFAULTS.vizParams.helixWaveSpeed ?? 0.8,
    radial_breathing_enabled: VISUAL_DEFAULTS.vizParams.radialBreathingEnabled ?? true,
    radial_breathing_amplitude: VISUAL_DEFAULTS.vizParams.radialBreathingAmplitude ?? 0.4,
    twist_dynamics_enabled: VISUAL_DEFAULTS.vizParams.twistDynamicsEnabled ?? true,
    twist_dynamics_amplitude: VISUAL_DEFAULTS.vizParams.twistDynamicsAmplitude ?? 0.3,
    shape_morphing_enabled: VISUAL_DEFAULTS.vizParams.shapeMorphingEnabled ?? true,
    shape_morphing_amplitude: VISUAL_DEFAULTS.vizParams.shapeMorphingAmplitude ?? 0.35
  }))
  
  const offlineMultiplier = isOffline ? 0.2 : 1.0
  
  // Update from props - comprehensive mapping
  useEffect(() => {
    if (propVizParams) {
      setAiControl(prev => ({
        ...prev,
        rotation_speed: propVizParams.rotationSpeed ?? prev.rotation_speed,
        tilt: propVizParams.tilt ?? prev.tilt,
        breathing: propVizParams.breathing ?? prev.breathing,
        pulse: propVizParams.pulse ?? prev.pulse,
        intensity: propVizParams.intensity ?? prev.intensity,
        node_size: propVizParams.nodeSize ?? prev.node_size,
        node_base_size: propVizParams.nodeBaseSize ?? prev.node_base_size,
        glow_size: propVizParams.glowSize ?? prev.glow_size,
        inner_glow_size: propVizParams.innerGlowSize ?? prev.inner_glow_size,
        bloom_intensity: propVizParams.bloomIntensity ?? prev.bloom_intensity,
        glow_opacity: propVizParams.glowOpacity ?? prev.glow_opacity,
        inner_glow_opacity: propVizParams.innerGlowOpacity ?? prev.inner_glow_opacity,
        core_opacity: propVizParams.coreOpacity ?? prev.core_opacity,
        color_mode: propVizParams.colorMode ?? prev.color_mode,
        alive_factor: propVizParams.aliveFactor ?? prev.alive_factor,
        // Connection settings
        connection_style: propVizParams.connectionStyle ?? prev.connection_style,
        link_opacity: propVizParams.linkOpacity ?? prev.link_opacity,
        link_flow_speed: propVizParams.linkFlowSpeed ?? prev.link_flow_speed,
        link_flow_intensity: propVizParams.linkFlowIntensity ?? prev.link_flow_intensity,
        link_curvature: propVizParams.linkCurvature ?? prev.link_curvature,
        link_segments: propVizParams.linkSegments ?? prev.link_segments,
        energy_ripple: propVizParams.energyRipple ?? prev.energy_ripple,
        node_drift: propVizParams.nodeDrift ?? prev.node_drift,
        sync_factor: propVizParams.syncFactor ?? prev.sync_factor,
        // Organic movement
        helix_wave_enabled: propVizParams.helixWaveEnabled ?? prev.helix_wave_enabled,
        helix_wave_amplitude: propVizParams.helixWaveAmplitude ?? prev.helix_wave_amplitude,
        helix_wave_speed: propVizParams.helixWaveSpeed ?? prev.helix_wave_speed,
        radial_breathing_enabled: propVizParams.radialBreathingEnabled ?? prev.radial_breathing_enabled,
        radial_breathing_amplitude: propVizParams.radialBreathingAmplitude ?? prev.radial_breathing_amplitude,
        twist_dynamics_enabled: propVizParams.twistDynamicsEnabled ?? prev.twist_dynamics_enabled,
        twist_dynamics_amplitude: propVizParams.twistDynamicsAmplitude ?? prev.twist_dynamics_amplitude,
        shape_morphing_enabled: propVizParams.shapeMorphingEnabled ?? prev.shape_morphing_enabled,
        shape_morphing_amplitude: propVizParams.shapeMorphingAmplitude ?? prev.shape_morphing_amplitude
      }))
    }
  }, [propVizParams])
  
  // Backend polling
  useEffect(() => {
    if (propVizParams || !BACKEND.enabled) return
    
    const fetchVisualization = async () => {
      try {
        const res = await fetch(`${BACKEND.baseUrl}${BACKEND.endpoints.visualization}`)
        if (res.ok) {
          const data = await res.json()
          setAiControl(prev => ({ ...prev, ...data }))
        }
      } catch (e) {}
    }
    
    fetchVisualization()
    const interval = setInterval(fetchVisualization, BACKEND.polling?.visualizationIntervalMs || 1000)
    return () => clearInterval(interval)
  }, [propVizParams])
  
  // Buffer arrays
  const targetPositions = useRef(new Float32Array(MAX_NODES * 3))
  const currentPositions = useRef(new Float32Array(MAX_NODES * 3))
  const targetColors = useRef(new Float32Array(MAX_NODES * 3))
  const currentColors = useRef(new Float32Array(MAX_NODES * 3))
  const targetSizes = useRef(new Float32Array(MAX_NODES))
  const currentSizes = useRef(new Float32Array(MAX_NODES))
  const targetLinePos = useRef(new Float32Array(MAX_EDGES * CURVE_SEGMENTS * 2 * 3))
  const currentLinePos = useRef(new Float32Array(MAX_EDGES * CURVE_SEGMENTS * 2 * 3))
  const targetLineCol = useRef(new Float32Array(MAX_EDGES * CURVE_SEGMENTS * 2 * 3))
  const currentLineCol = useRef(new Float32Array(MAX_EDGES * CURVE_SEGMENTS * 2 * 3))
  
  useEffect(() => {
    targetSizes.current.fill(1)
    currentSizes.current.fill(1)
  }, [])
  
  // Textures
  const glowTexture = useMemo(() => createOrganicGlowTexture(), [])
  
  // Colors
  const colorRef = useRef(new THREE.Color('#6699ff'))
  const targetColorRef = useRef(new THREE.Color('#6699ff'))
  const secondaryColorRef = useRef(new THREE.Color('#ff66aa'))
  const tertiaryColorRef = useRef(new THREE.Color('#66ffaa'))
  
  useEffect(() => {
    try {
      const hex = theme?.hex || '#6699ff'
      targetColorRef.current = new THREE.Color(hex)
      const hsl = {}
      targetColorRef.current.getHSL(hsl)
      secondaryColorRef.current.setHSL((hsl.h + 0.4) % 1, hsl.s * 0.9, hsl.l * 1.1)
      tertiaryColorRef.current.setHSL((hsl.h + 0.6) % 1, hsl.s * 0.7, hsl.l * 1.2)
    } catch {
      targetColorRef.current = new THREE.Color('#6699ff')
    }
  }, [theme])
  
  // Calculate organic node position
  const getOrganicPosition = (node, index, total, time) => {
    if (!node?.id) return [0, 0, 0]
    
    // Use forced position for floating/bridge nodes
    if (node.forcePosition && typeof node.x === 'number') {
      const organic = getOrganicNode(node.id, index)
      const mod = organic.getModulation(time)
      const aliveFactor = aiControl.alive_factor || 1.0
      
      // Add organic drift to forced positions
      const driftScale = 0.3 * aliveFactor
      return [
        node.x + Math.sin(time * 0.7 + organic.driftPhaseX) * driftScale,
        node.y + Math.cos(time * 0.5 + organic.driftPhaseY) * driftScale * 0.5,
        node.z + Math.sin(time * 0.6 + organic.driftPhaseZ) * driftScale
      ]
    }
    
    const organic = getOrganicNode(node.id, index)
    const mod = organic.getModulation(time)
    const aliveFactor = aiControl.alive_factor || 1.0
    const nodeDrift = aiControl.node_drift || 0.4
    
    // === ORGANIC DOUBLE HELIX STRUCTURE ===
    // Use dynamic structure params from vizParams
    const currentStrandCount = Math.max(1, strandCount)
    const strand = index % currentStrandCount
    
    // Position along helix (0 to 1)
    const t = total <= 1 ? 0.5 : index / Math.max(1, total - 1)
    const tAdjusted = strandConfig.ageAtBottom === 'newer' ? 1 - t : t
    
    // Base helix parameters - use dynamic values from vizParams
    const turnsPerHelix = helixTurns
    
    // === HELIX MORPHING ===
    const morph = helixMorphRef.current
    
    // Dynamic radius with breathing and bulging
    let dynamicRadius = helixRadius
    
    // Global breathing (if enabled)
    if (aiControl.radial_breathing_enabled) {
      const breathAmp = aiControl.radial_breathing_amplitude || 0.4
      const globalBreath = Math.sin(time * 0.4 + breathCycleRef.current) * breathAmp * aliveFactor
      dynamicRadius += globalBreath
    }
    
    // Per-node breathing
    dynamicRadius += mod.breath * aliveFactor
    
    // Bulge wave - creates organic pulsing bulges along helix (if shape morphing enabled)
    if (aiControl.shape_morphing_enabled) {
      const morphAmp = aiControl.shape_morphing_amplitude || 0.35
      const bulgePhase = tAdjusted * Math.PI * 4 + time * 0.3
      const bulge = Math.sin(bulgePhase) * morphAmp * aliveFactor
      dynamicRadius += bulge
    }
    
    // Squeeze/expand at different heights
    const squeezePhase = time * 0.2
    const squeeze = Math.sin(tAdjusted * Math.PI * 2 + squeezePhase) * 0.2 * aliveFactor
    dynamicRadius += squeeze
    
    // === ANGLE CALCULATION ===
    const strandOffset = (strand * Math.PI) // 180 degrees apart for double helix
    let angle = tAdjusted * turnsPerHelix * Math.PI * 2 + strandOffset
    
    // Add global helix rotation
    angle += helixRotationRef.current
    
    // Organic twist variation
    const twistWave = Math.sin(time * 0.35 + tAdjusted * Math.PI * 3) * 0.3 * aliveFactor
    angle += twistWave
    
    // Per-node orbit
    angle += mod.orbit * 0.15 * aliveFactor
    
    // === VERTICAL POSITION ===
    let y = (tAdjusted - 0.5) * helixHeight
    
    // Vertical wave
    const vertWave = Math.sin(time * 0.5 + tAdjusted * Math.PI * 3) * 0.5 * aliveFactor
    y += vertWave
    
    // Per-node vertical drift
    y += Math.cos(time * 0.4 + organic.driftPhaseY) * nodeDrift * 0.3 * aliveFactor
    
    // Spiral compression/expansion
    const spiralMod = Math.sin(time * 0.25 + tAdjusted * Math.PI) * 0.15 * aliveFactor
    y *= (1 + spiralMod)
    
    // === CALCULATE XZ ===
    let x = Math.cos(angle) * dynamicRadius
    let z = Math.sin(angle) * dynamicRadius
    
    // Per-node horizontal drift
    const driftX = Math.sin(time * 0.7 + organic.driftPhaseX) * nodeDrift * 0.4 * aliveFactor
    const driftZ = Math.sin(time * 0.6 + organic.driftPhaseZ) * nodeDrift * 0.4 * aliveFactor
    x += driftX
    z += driftZ
    
    // Activity-based expansion
    const act = node.activation || 0
    const activityExpand = act * 0.25 * aliveFactor
    const actAngle = Math.atan2(z, x)
    x += Math.cos(actAngle) * activityExpand
    z += Math.sin(actAngle) * activityExpand
    
    const pos = [x, clamp(y, -helixHeight * 0.6, helixHeight * 0.6), z]
    positionsRef.current.set(node.id, pos)
    return pos
  }
  
  // Get node color with organic variation
  const getOrganicColor = (node, index, baseColor, time) => {
    const tempColor = new THREE.Color()
    const organic = getOrganicNode(node?.id, index)
    const mod = organic.getModulation(time)
    const act = node?.activation || 0
    const t = ageMap.get(node?.id) || index / MAX_NODES
    
    const colorMode = aiControl.color_mode || 'activity'
    
    switch (colorMode) {
      case 'activity': {
        tempColor.copy(baseColor)
        const intensity = 0.4 + act * 0.6 + mod.pulse * 0.2
        tempColor.multiplyScalar(intensity)
        if (act > 0.5) {
          tempColor.lerp(secondaryColorRef.current, (act - 0.5) * 0.4)
        }
        break
      }
      case 'flow': {
        const flowPhase = time * 0.6 + t * Math.PI * 2
        const flow = (Math.sin(flowPhase) + 1) / 2
        tempColor.copy(baseColor)
        tempColor.lerp(secondaryColorRef.current, flow * 0.5)
        tempColor.lerp(tertiaryColorRef.current, mod.pulse * 0.2)
        tempColor.multiplyScalar(0.5 + act * 0.5)
        break
      }
      case 'energy': {
        const hue = (Math.sin(time * 1.5 + organic.colorShift * Math.PI * 2) * 0.15 + 0.55) % 1
        tempColor.setHSL(hue, 0.85, 0.4 + act * 0.4 + mod.pulse * 0.15)
        break
      }
      case 'age': {
        const hueShift = Math.sin(time * 0.3 + t * Math.PI) * 0.05
        tempColor.setHSL(0.6 - t * 0.5 + hueShift, 0.8, 0.4 + act * 0.4)
        break
      }
      default:
        tempColor.copy(baseColor)
        tempColor.multiplyScalar(0.5 + act * 0.5)
    }
    
    return tempColor
  }
  
  // Smooth interpolation
  const lerp = (a, b, t) => a + (b - a) * t
  
  // === MAIN ANIMATION LOOP ===
  useFrame((state, delta) => {
    timeRef.current += delta
    const time = timeRef.current
    
    // Update global animation state
    helixRotationRef.current += delta * (aiControl.rotation_speed || 0.1) * offlineMultiplier
    breathCycleRef.current = time * 0.3
    globalPhaseRef.current = time
    
    // Update helix morph state
    helixMorphRef.current = {
      squeeze: Math.sin(time * 0.2) * 0.3,
      twist: Math.sin(time * 0.15) * 0.2,
      wave: Math.sin(time * 0.25) * 0.4,
      bulge: Math.sin(time * 0.3) * 0.25
    }
    
    // Smooth color transition
    colorRef.current.lerp(targetColorRef.current, delta * 2)
    const color = isOffline ? colorRef.current.clone().multiplyScalar(0.3) : colorRef.current
    
    const displayNodes = layoutNodes
    const baseColor = displayNodes.length === 0 ? new THREE.Color('#9ca3af') : color
    
    // === GROUP TRANSFORMS ===
    if (groupRef.current) {
      // Organic tilt
      const tiltBase = (aiControl.tilt || 0.08) * Math.sin(time * 0.3) * offlineMultiplier
      const tiltVar = Math.sin(time * 0.5 + Math.PI * 0.5) * (aiControl.tilt || 0.08) * 0.4 * offlineMultiplier
      groupRef.current.rotation.x = lerp(groupRef.current.rotation.x, tiltBase + tiltVar, delta * 2)
      groupRef.current.rotation.z = lerp(groupRef.current.rotation.z, Math.sin(time * 0.2) * 0.03 * offlineMultiplier, delta)
      
      // Breathing scale
      const breathe = Math.sin(time * 0.4) * (aiControl.breathing || 0.05) * offlineMultiplier
      groupRef.current.scale.setScalar(1 + breathe)
      
      // Subtle drift
      groupRef.current.position.x = lerp(groupRef.current.position.x, Math.sin(time * 0.08) * 0.15 * offlineMultiplier, delta * 0.5)
      groupRef.current.position.y = lerp(groupRef.current.position.y, Math.cos(time * 0.06) * 0.08 * offlineMultiplier, delta * 0.5)
    }
    
    // Get valid links
    const nodeIds = new Set(displayNodes.map(n => n?.id).filter(Boolean))
    // Sort links by source and target id for stable buffer mapping
    const displayLinks = (links || [])
      .filter(l => l && nodeIds.has(l.source) && nodeIds.has(l.target))
      .sort((a, b) => {
        if (a.source < b.source) return -1;
        if (a.source > b.source) return 1;
        if (a.target < b.target) return -1;
        if (a.target > b.target) return 1;
        return 0;
      })
      .slice(0, MAX_EDGES)
    
    // === CALCULATE NODE TARGETS ===
    const aiIntensity = (aiControl.intensity || 1.0) * offlineMultiplier
    const bloomIntensity = aiControl.bloom_intensity || 0.7
    
    for (let i = 0; i < MAX_NODES; i++) {
      const node = displayNodes[i]
      const idx = i * 3
      
      if (!node) {
        targetPositions.current[idx] = OFFSCREEN
        targetPositions.current[idx + 1] = OFFSCREEN
        targetPositions.current[idx + 2] = OFFSCREEN
        targetColors.current[idx] = 0
        targetColors.current[idx + 1] = 0
        targetColors.current[idx + 2] = 0
        targetSizes.current[i] = 0
        continue
      }
      
      // Get organic position
      const pos = getOrganicPosition(node, i, displayNodes.length, time)
      const organic = getOrganicNode(node.id, i)
      const mod = organic.getModulation(time)
      
      // Set position
      targetPositions.current[idx] = pos[0]
      targetPositions.current[idx + 1] = pos[1]
      targetPositions.current[idx + 2] = pos[2]
      
      // Calculate intensity
      const act = node.activation || 0
      const isActive = node.active || act > 0.5
      const activeBoost = isActive ? 1.4 : 1.0 + act * 0.3
      const pulseIntensity = mod.pulse * 0.3 * (aiControl.pulse || 0.5)
      const intensity = Math.min(4.0, (0.4 + act * 0.6 + pulseIntensity) * aiIntensity * activeBoost * mod.glow)
      
      // Get color
      const nodeColor = getOrganicColor(node, i, baseColor, time)
      targetColors.current[idx] = nodeColor.r * intensity
      targetColors.current[idx + 1] = nodeColor.g * intensity
      targetColors.current[idx + 2] = nodeColor.b * intensity
      
      // Dynamic size with breathing
      const breathSize = mod.breath * 0.25
      const activitySize = act * 0.35
      const pulseSize = mod.pulse * 0.15
      targetSizes.current[i] = (1 + breathSize + activitySize + pulseSize) * (aiControl.node_size || 1.5)
    }
    
    // === SMOOTH NODE INTERPOLATION ===
    const smoothFactor = 1 - Math.pow(0.0005, delta) // Smoother interpolation
    
    for (let i = 0; i < MAX_NODES * 3; i++) {
      currentPositions.current[i] = lerp(currentPositions.current[i], targetPositions.current[i], smoothFactor)
      currentColors.current[i] = lerp(currentColors.current[i], targetColors.current[i], smoothFactor)
    }
    for (let i = 0; i < MAX_NODES; i++) {
      currentSizes.current[i] = lerp(currentSizes.current[i], targetSizes.current[i], smoothFactor)
    }
    
    // === UPDATE NODE GEOMETRY ===
    if (pointsRef.current?.geometry) {
      const geo = pointsRef.current.geometry
      geo.attributes.position.array.set(currentPositions.current)
      geo.attributes.color.array.set(currentColors.current)
      geo.attributes.position.needsUpdate = true
      geo.attributes.color.needsUpdate = true
    }
    
    if (glowRef.current?.geometry) {
      const geo = glowRef.current.geometry
      geo.attributes.position.array.set(currentPositions.current)
      for (let i = 0; i < MAX_NODES * 3; i++) {
        geo.attributes.color.array[i] = currentColors.current[i] * 1.3
      }
      geo.attributes.position.needsUpdate = true
      geo.attributes.color.needsUpdate = true
    }
    
    if (innerGlowRef.current?.geometry) {
      const geo = innerGlowRef.current.geometry
      geo.attributes.position.array.set(currentPositions.current)
      for (let i = 0; i < MAX_NODES * 3; i++) {
        geo.attributes.color.array[i] = currentColors.current[i] * 0.9
      }
      geo.attributes.position.needsUpdate = true
      geo.attributes.color.needsUpdate = true
    }
    
    // === CALCULATE ORGANIC LINK TARGETS ===
    const nodeMap = new Map()
    displayNodes.forEach((n, i) => {
      if (n?.id) nodeMap.set(n.id, { node: n, index: i })
    })
    
    const linkFlowSpeed = aiControl.link_flow_speed ?? 3.0
    const linkFlowIntensity = aiControl.link_flow_intensity ?? 0.5
    const connectionStyle = aiControl.connection_style ?? 'bezier'
    const linkCurvatureParam = aiControl.link_curvature ?? 0.35
    const linkSegments = Math.max(4, Math.min(48, aiControl.link_segments ?? CURVE_SEGMENTS))
    const totalLinePoints = MAX_EDGES * CURVE_SEGMENTS * 2 * 3
    
    // Clear line data
    for (let i = 0; i < totalLinePoints; i += 3) {
      targetLinePos.current[i] = OFFSCREEN
      targetLinePos.current[i + 1] = OFFSCREEN
      targetLinePos.current[i + 2] = OFFSCREEN
      targetLineCol.current[i] = 0
      targetLineCol.current[i + 1] = 0
      targetLineCol.current[i + 2] = 0
    }
    
    for (let i = 0; i < MAX_EDGES; i++) {
      const link = displayLinks[i]
      if (!link) continue
      
      const src = nodeMap.get(link.source)
      const tgt = nodeMap.get(link.target)
      if (!src || !tgt) continue
      
      const organicLink = getOrganicLink(link.source, link.target)
      
      // Get smoothed positions
      const srcIdx = src.index * 3
      const tgtIdx = tgt.index * 3
      
      const srcPos = [
        currentPositions.current[srcIdx],
        currentPositions.current[srcIdx + 1],
        currentPositions.current[srcIdx + 2]
      ]
      const tgtPos = [
        currentPositions.current[tgtIdx],
        currentPositions.current[tgtIdx + 1],
        currentPositions.current[tgtIdx + 2]
      ]
      
      // === CURVE CALCULATION BASED ON CONNECTION STYLE ===
      const dx = tgtPos[0] - srcPos[0]
      const dy = tgtPos[1] - srcPos[1]
      const dz = tgtPos[2] - srcPos[2]
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001
      
      // Calculate control point based on connection style
      let midX, midY, midZ
      
      if (connectionStyle === 'line') {
        // Straight line - control point is midpoint (no curve)
        midX = (srcPos[0] + tgtPos[0]) / 2
        midY = (srcPos[1] + tgtPos[1]) / 2
        midZ = (srcPos[2] + tgtPos[2]) / 2
      } else {
        // Bezier or curved - use curvature parameter
        // Remove time-based wobble for static lines
        const curveMult = connectionStyle === 'curved' ? 1.5 : 1.0 // 'curved' has more pronounced curve
        const baseCurvature = linkCurvatureParam * curveMult * (0.8 + organicLink.seed * 0.4)

        // Calculate perpendicular direction for control point (static)
        let perpX, perpY, perpZ
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > Math.abs(dz)) {
          perpX = dz
          perpY = 0
          perpZ = -dx
        } else {
          perpX = -dz * 0.4
          perpY = dist * 0.35
          perpZ = dx * 0.4
        }

        const perpLen = Math.sqrt(perpX * perpX + perpY * perpY + perpZ * perpZ) || 1
        const curveScale = baseCurvature * dist

        perpX = (perpX / perpLen) * curveScale
        perpY = (perpY / perpLen) * curveScale
        perpZ = (perpZ / perpLen) * curveScale

        // Control point (static)
        midX = (srcPos[0] + tgtPos[0]) / 2 + perpX
        midY = (srcPos[1] + tgtPos[1]) / 2 + perpY
        midZ = (srcPos[2] + tgtPos[2]) / 2 + perpZ
      }
      
      // Link visual properties
      const weight = Math.abs(link.weight || 0.3)
      const srcAct = src.node.activation || 0
      const tgtAct = tgt.node.activation || 0
      const activity = (srcAct + tgtAct) / 2
      
      const baseIntensity = (0.15 + weight * 0.35 + activity * 0.3) * organicLink.intensity
      const lineColor = [
        color.r * baseIntensity,
        color.g * baseIntensity,
        color.b * baseIntensity
      ]
      
      // Flow position for this link
      const flowPos = organicLink.getFlowPosition(time * linkFlowSpeed)
      
      const baseIdx = i * CURVE_SEGMENTS * 2 * 3
      
      // Generate organic bezier curve segments
      for (let seg = 0; seg < CURVE_SEGMENTS; seg++) {
        const t0 = seg / CURVE_SEGMENTS
        const t1 = (seg + 1) / CURVE_SEGMENTS
        
        // Quadratic bezier
        const calcBezier = (t, p0, p1, p2) => {
          const mt = 1 - t
          return mt * mt * p0 + 2 * mt * t * p1 + t * t * p2
        }
        
        const x0 = calcBezier(t0, srcPos[0], midX, tgtPos[0])
        const y0 = calcBezier(t0, srcPos[1], midY, tgtPos[1])
        const z0 = calcBezier(t0, srcPos[2], midZ, tgtPos[2])
        const x1 = calcBezier(t1, srcPos[0], midX, tgtPos[0])
        const y1 = calcBezier(t1, srcPos[1], midY, tgtPos[1])
        const z1 = calcBezier(t1, srcPos[2], midZ, tgtPos[2])
        
        const segIdx = baseIdx + seg * 6
        
        targetLinePos.current[segIdx] = x0
        targetLinePos.current[segIdx + 1] = y0
        targetLinePos.current[segIdx + 2] = z0
        targetLinePos.current[segIdx + 3] = x1
        targetLinePos.current[segIdx + 4] = y1
        targetLinePos.current[segIdx + 5] = z1
        
        // Organic flow pulse
        const segCenter = (t0 + t1) / 2
        const flowDist = Math.abs(segCenter - flowPos)
        const wrappedFlowDist = Math.min(flowDist, 1 - flowDist) // Handle wrap-around
        const flow = Math.exp(-wrappedFlowDist * wrappedFlowDist * 25) * linkFlowIntensity
        const flowBoost = 1 + flow * (link.active ? 2.5 : 1.5)
        
        // Color gradient with organic fade at ends
        const endFade = 1 - Math.pow(Math.abs(segCenter - 0.5) * 2, 2) * 0.4
        
        targetLineCol.current[segIdx] = lineColor[0] * endFade * flowBoost
        targetLineCol.current[segIdx + 1] = lineColor[1] * endFade * flowBoost
        targetLineCol.current[segIdx + 2] = lineColor[2] * endFade * flowBoost
        targetLineCol.current[segIdx + 3] = lineColor[0] * endFade * flowBoost
        targetLineCol.current[segIdx + 4] = lineColor[1] * endFade * flowBoost
        targetLineCol.current[segIdx + 5] = lineColor[2] * endFade * flowBoost
      }
    }
    
    // Smooth line interpolation
    for (let i = 0; i < MAX_EDGES * CURVE_SEGMENTS * 2 * 3; i++) {
      currentLinePos.current[i] = lerp(currentLinePos.current[i], targetLinePos.current[i], smoothFactor)
      currentLineCol.current[i] = lerp(currentLineCol.current[i], targetLineCol.current[i], smoothFactor)
    }
    
    // Update line geometry
    if (linesRef.current?.geometry) {
      const geo = linesRef.current.geometry
      geo.attributes.position.array.set(currentLinePos.current)
      geo.attributes.color.array.set(currentLineCol.current)
      geo.attributes.position.needsUpdate = true
      geo.attributes.color.needsUpdate = true

      // Animate custom attributes like in three.js example
      const displacement = geo.attributes.displacement.array
      for (let i = 0, l = displacement.length; i < l; i += 3) {
        displacement[i] += 0.3 * (0.5 - Math.random()) * delta
        displacement[i + 1] += 0.3 * (0.5 - Math.random()) * delta
        displacement[i + 2] += 0.3 * (0.5 - Math.random()) * delta
      }
      geo.attributes.displacement.needsUpdate = true
    }

    // Update line shader uniforms
    if (lineUniformsRef.current) {
      lineUniformsRef.current.time.value = time
      lineUniformsRef.current.amplitude.value = Math.sin(time * 0.5) * 0.5 + 0.5
      lineUniformsRef.current.opacity.value = aiControl.link_opacity ?? 0.8
    }
    
    // === UPDATE MATERIAL SIZES AND OPACITIES ===
    // All values now come from vizParams for full control
    const nodeSize = aiControl.node_size || 1.0
    const nodeBaseSize = aiControl.node_base_size ?? 0.45
    const glowSizeMult = aiControl.glow_size ?? 1.6
    const innerGlowSizeMult = aiControl.inner_glow_size ?? 0.9
    const glowOpacity = aiControl.glow_opacity ?? 0.25
    const innerGlowOpacity = aiControl.inner_glow_opacity ?? 0.35
    const coreOpacity = aiControl.core_opacity ?? 0.9
    
    if (pointsMaterialRef.current) {
      pointsMaterialRef.current.size = nodeBaseSize * nodeSize
      pointsMaterialRef.current.opacity = coreOpacity
    }
    if (glowMaterialRef.current) {
      glowMaterialRef.current.size = glowSizeMult * nodeSize
      glowMaterialRef.current.opacity = glowOpacity * (0.5 + bloomIntensity * 0.5)
    }
    if (innerGlowMaterialRef.current) {
      innerGlowMaterialRef.current.size = innerGlowSizeMult * nodeSize
      innerGlowMaterialRef.current.opacity = innerGlowOpacity * (0.6 + bloomIntensity * 0.4)
    }
  })
  
  // Pre-allocated arrays
  const pointPositions = useMemo(() => {
    const arr = new Float32Array(MAX_NODES * 3)
    for (let i = 0; i < MAX_NODES * 3; i += 3) {
      arr[i] = OFFSCREEN
      arr[i + 1] = OFFSCREEN
      arr[i + 2] = OFFSCREEN
    }
    return arr
  }, [])
  const pointColors = useMemo(() => new Float32Array(MAX_NODES * 3), [])
  const glowPositions = useMemo(() => {
    const arr = new Float32Array(MAX_NODES * 3)
    for (let i = 0; i < MAX_NODES * 3; i += 3) {
      arr[i] = OFFSCREEN
      arr[i + 1] = OFFSCREEN
      arr[i + 2] = OFFSCREEN
    }
    return arr
  }, [])
  const innerGlowPositions = useMemo(() => {
    const arr = new Float32Array(MAX_NODES * 3)
    for (let i = 0; i < MAX_NODES * 3; i += 3) {
      arr[i] = OFFSCREEN
      arr[i + 1] = OFFSCREEN
      arr[i + 2] = OFFSCREEN
    }
    return arr
  }, [])
  const linePositions = useMemo(() => new Float32Array(MAX_EDGES * CURVE_SEGMENTS * 2 * 3), [])
  const lineColors = useMemo(() => new Float32Array(MAX_EDGES * CURVE_SEGMENTS * 2 * 3), [])
  const lineDisplacements = useMemo(() => new Float32Array(MAX_EDGES * CURVE_SEGMENTS * 2 * 3), [])
  const lineCustomColors = useMemo(() => new Float32Array(MAX_EDGES * CURVE_SEGMENTS * 2 * 3), [])

  // Initialize custom attributes
  useEffect(() => {
    const displacement = lineDisplacements
    const customColor = lineCustomColors
    const color = new THREE.Color()

    for (let i = 0, l = customColor.length; i < l; i += 3) {
      // Random displacement
      displacement[i] = (Math.random() - 0.5) * 0.1
      displacement[i + 1] = (Math.random() - 0.5) * 0.1
      displacement[i + 2] = (Math.random() - 0.5) * 0.1

      // HSL color based on position
      color.setHSL(i / l, 0.7, 0.6)
      color.toArray(customColor, i)
    }
  }, [lineDisplacements, lineCustomColors])

  // Line shader uniforms
  const lineUniformsRef = useRef({
    amplitude: { value: 1.0 },
    time: { value: 0 },
    color: { value: new THREE.Color(1, 1, 1) },
    opacity: { value: aiControl.link_opacity ?? 0.8 }
  })
  
  return (
    <group ref={groupRef}>
      {/* Organic flowing connections with custom attributes */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={MAX_EDGES * CURVE_SEGMENTS * 2}
            array={linePositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={MAX_EDGES * CURVE_SEGMENTS * 2}
            array={lineColors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-displacement"
            count={MAX_EDGES * CURVE_SEGMENTS * 2}
            array={lineDisplacements}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-customColor"
            count={MAX_EDGES * CURVE_SEGMENTS * 2}
            array={lineCustomColors}
            itemSize={3}
          />
        </bufferGeometry>
        <shaderMaterial
          uniforms={lineUniformsRef.current}
          vertexShader={lineVertexShader}
          fragmentShader={lineFragmentShader}
          blending={THREE.AdditiveBlending}
          depthTest={false}
          transparent={true}
        />
      </lineSegments>
      
      {/* Outer organic glow - reduced intensity */}
      <points ref={glowRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={MAX_NODES}
            array={glowPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={MAX_NODES}
            array={new Float32Array(MAX_NODES * 3)}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={glowMaterialRef}
          vertexColors
          size={1.6}
          sizeAttenuation
          transparent
          opacity={0.25}
          map={glowTexture}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      
      {/* Inner glow layer - reduced intensity */}
      <points ref={innerGlowRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={MAX_NODES}
            array={innerGlowPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={MAX_NODES}
            array={new Float32Array(MAX_NODES * 3)}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={innerGlowMaterialRef}
          vertexColors
          size={0.9}
          sizeAttenuation
          transparent
          opacity={0.35}
          map={glowTexture}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      
      {/* Core organic nodes */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={MAX_NODES}
            array={pointPositions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={MAX_NODES}
            array={pointColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={pointsMaterialRef}
          vertexColors
          size={0.45}
          sizeAttenuation
          transparent
          opacity={0.9}
          map={glowTexture}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  )
}
