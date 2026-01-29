# DNA Frontend

A React + Three.js visualization frontend for an autonomous AI system. The DNA helix represents a living neural network that breathes, pulses, and flows with energy - reflecting the AI's cognitive state in real-time.

## 🧬 Project Overview

DNA (Dynamic Neural Architecture) is a visualization system designed to:

1. **Visualize AI Cognition**: Display neural network activity as a living, breathing DNA helix
2. **Provide Control Interface**: Allow users to interact with and tune AI behavior
3. **Enable Real-time Monitoring**: Show AI state, thoughts, and activity in real-time
4. **Support Backend Integration**: Ready for connection to an autonomous AI backend

### What It Does

- Renders a dynamic 3D DNA helix where each node represents a neural unit
- Shows connections (synapses) between nodes with flowing energy pulses
- Displays AI state through visualization parameters (rotation, breathing, pulse, etc.)
- Provides UI panels for settings, activity logs, terminal, and tools
- Runs in mock mode when no backend is connected

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your backend URLs

# Start development server
npm run dev

# Build for production
npm run build
```

## ⚙️ Environment Configuration

Create a `.env` file in the project root:

```env
# Backend Configuration
VITE_BACKEND_ENABLED=false
VITE_BACKEND_BASE_URL=http://127.0.0.1:8766
VITE_BACKEND_WS_URL=ws://127.0.0.1:8765

# Development settings
VITE_DEV_PROXY_TARGET=http://127.0.0.1:8766
```

- Set `VITE_BACKEND_ENABLED=true` when your backend is running
- Update URLs to match your backend server
- The dev server will proxy API calls to avoid CORS issues

## 📁 Project Structure

```
DNA/
├── index.html              # Entry point
├── package.json            # Dependencies
├── vite.config.js          # Vite configuration
└── src/
    ├── main.jsx           # React bootstrap
    ├── index.css          # Global styles
    ├── App.jsx            # Main application
    ├── components/
    │   ├── NeuralNetwork.jsx      # 3D DNA visualization
    │   ├── VisualizationWindow.jsx # Viz controls
    │   ├── ChatPanel.jsx          # AI chat interface
    │   ├── ActivityLog.jsx        # Event stream
    │   ├── SettingsPanel.jsx      # Learning parameters
    │   ├── TerminalWindow.jsx     # Command terminal
    │   ├── ToolsPanel.jsx         # AI tools viewer
    │   ├── StatsWindow.jsx        # System stats
    │   ├── StatusBar.jsx          # Top status bar
    │   ├── ThoughtBubble.jsx      # Thought popups
    │   └── WindowFrame.jsx        # Shared window frame
    ├── config/
    │   └── appDefaults.js         # ALL CONFIGURATION
    └── hooks/
        ├── useFloatingWindow.js   # Window drag/resize
        └── useWebSocket.js        # WebSocket client
```

## ⚙️ Configuration

**All settings are centralized in `src/config/appDefaults.js`** for easy backend integration.

✅ **Configuration Completeness**: All exported constants and properties in `appDefaults.js` are actively used in the codebase. No unused configuration values remain that could cause issues during backend integration.

### Backend Configuration

```javascript
export const BACKEND = {
  enabled: false, // Set to true when backend is running
  baseUrl: "http://127.0.0.1:8766",
  wsUrl: "ws://127.0.0.1:8765",

  polling: {
    stateIntervalMs: 1500,
    visualizationIntervalMs: 1000,
    activityIntervalMs: 2500,
    networkIntervalMs: 2000,
  },

  endpoints: {
    ping: "/api/ping",
    state: "/api/state",
    visualization: "/api/visualization",
    network: "/api/network",
    tools: "/api/tools",
    activity: "/api/activity",
    chat: "/api/chat",
    // ... more endpoints
  },
};
```

### Visualization Parameters

All visualization parameters can be controlled by the backend:

```javascript
export const VISUAL_DEFAULTS = {
  vizParams: {
    rotationSpeed: 0.08, // Helix rotation speed
    tilt: 0.05, // Tilt oscillation
    breathing: 0.03, // Scale breathing
    pulse: 0.4, // Glow pulse intensity
    intensity: 0.85, // Overall brightness
    aliveFactor: 1.25, // Liveliness multiplier
    nodeSize: 1.05, // Node size
    connectionStyle: "bezier", // line | bezier | curved
    colorMode: "activity", // activity | flow | energy | age | type
    linkOpacity: 0.7, // Connection opacity
    linkFlowSpeed: 2.4, // Energy flow speed
    linkFlowIntensity: 0.35, // Flow highlight
    energyRipple: 0.5, // Energy wave effect
    nodeDrift: 0.3, // Per-node drift
    syncFactor: 0.7, // Node synchronization
  },
};
```

### Task-Driven Visualization

The visualization automatically responds to AI activities and tasks, including **network structure changes**:

```javascript
// Task-to-visualization mapping with network parameters
export const TASK_VIZ_MAPPING = {
  learning: {
    viz: { rotationSpeed: 0.12, pulse: 0.4, intensity: 0.9, aliveFactor: 1.1 },
    network: {
      targetNodeCount: 25,
      targetLinkCount: 45,
      growthRate: 0.3,
      pruningRate: 0.02,
    },
  },
  thinking: {
    viz: { rotationSpeed: 0.1, pulse: 0.35, intensity: 0.85, aliveFactor: 1.0 },
    network: {
      targetNodeCount: 22,
      targetLinkCount: 40,
      growthRate: 0.08,
      pruningRate: 0.08,
    },
  },
  creating: {
    viz: {
      rotationSpeed: 0.14,
      pulse: 0.45,
      intensity: 0.95,
      aliveFactor: 1.3,
    },
    network: {
      targetNodeCount: 30,
      targetLinkCount: 60,
      growthRate: 0.4,
      pruningRate: 0.01,
    },
  },
  // ... more mappings
};
```

**Network Structure Control:**

- **Node Count**: AI tasks dynamically adjust the number of neurons in the network
- **Connection Density**: Link count changes based on cognitive activity type
- **Growth Rate**: How quickly new connections form during learning activities
- **Pruning Rate**: How aggressively unused connections are removed during consolidation
  **Link Stability**: How often connections change (higher = more stable connections)
- **Smart Rebuilding**: Links only change when nodes are added/removed OR very rarely
- **Minimum Intervals**: At least 10 evolution cycles between random rebuilds
- **Node Change Detection**: Automatically rebuilds when network structure requires it

**Examples:**

- **Learning**: Network grows rapidly (25 nodes, high growth, 98.5% stable links)
- **Thinking**: Network consolidates (22 nodes, balanced rates, 98.8% stable links)
- **Creating**: Network expands dramatically (30 nodes, max growth, 97.5% stable links)
- **Remembering**: Network shrinks during memory access (14 nodes, high pruning, 99.8% stable links)

**Priority System:**

1. **Backend Task Data**: Uses `state.current_task` from backend API
2. **Activity Events**: Falls back to latest activity event type
3. **Mock Cycling**: Cycles through predefined states when no backend

**User Controls:**

- Enable/disable AI control per parameter (rotation, pulse, intensity, movement)
- Smooth blending between states prevents jarring transitions
- Real-time response to task changes

### Learning Parameters

```javascript
export const SETTINGS_DEFAULTS = {
  params: {
    learningRate: 0.03,
    spontaneousRate: 0.002,
    growthThreshold: 0.7,
    pruningThreshold: 0.005,
    decayRate: 0.05,
    curiosity: 0.5,
    creativity: 0.5,
    focus: 0.5,
  },
};
```

## 🔌 Backend Integration Guide

### Required API Endpoints

The frontend expects these REST endpoints:

| Endpoint             | Method   | Description              |
| -------------------- | -------- | ------------------------ |
| `/api/ping`          | GET      | Health check             |
| `/api/state`         | GET      | Full AI state snapshot   |
| `/api/visualization` | GET      | Visualization parameters |
| `/api/network`       | GET      | Network nodes and links  |
| `/api/activity`      | GET      | Activity event stream    |
| `/api/tools`         | GET      | AI-generated tools       |
| `/api/chat`          | POST     | Send chat message        |
| `/api/settings`      | GET/POST | Learning parameters      |
| `/api/reset`         | POST     | Reset AI state           |

### Expected Data Shapes

#### State Response (`GET /api/state`)

```json
{
  "status": "live",
  "statusMessage": "awake",
  "feeling": "curiosity",
  "feelingDescription": "Exploring new patterns",
  "currentThought": "Analyzing input data...",
  "thoughtCount": 42,
  "age": 3600,
  "stepCount": 15000,
  "nodeCount": 250,
  "connectionCount": 2000,
  "intelligence": 0.78,
  "state": {
    "activity_level": 0.65,
    "coherence": 0.72,
    "entropy": 0.35,
    "curiosity": 0.8,
    "contentment": 0.55
  },
  "db_stats": {
    "nodes": 250,
    "connections": 2000,
    "vocabulary": 5000,
    "tools": 5,
    "last_activity": 1706400000
  }
}
```

#### Visualization Response (`GET /api/visualization`)

```json
{
  "rotation_speed": 0.1,
  "tilt": 0.05,
  "breathing": 0.03,
  "pulse": 0.4,
  "intensity": 0.85,
  "alive_factor": 1.2,
  "node_size": 1.0,
  "bloom_intensity": 0.5,
  "connection_style": "bezier",
  "color_mode": "activity",
  "link_opacity": 0.7,
  "link_flow_speed": 2.4,
  "link_flow_intensity": 0.35,
  "energy_ripple": 0.5,
  "node_drift": 0.3,
  "sync_factor": 0.7
}
```

#### Network Response (`GET /api/network`)

```json
{
  "nodes": [
    {
      "id": "n-0",
      "activation": 0.75,
      "active": true,
      "layer": "input",
      "x": 1.5,
      "y": 2.0,
      "z": -0.5
    }
  ],
  "links": [
    {
      "source": "n-0",
      "target": "n-1",
      "weight": 0.6,
      "active": true
    }
  ]
}
```

#### Activity Response (`GET /api/activity`)

```json
[
  {
    "timestamp": 1706400000,
    "event_type": "thought_written",
    "details": {
      "thought": "Discovered new pattern in data"
    }
  },
  {
    "timestamp": 1706399950,
    "event_type": "words_learned",
    "details": {
      "count": 15,
      "total": 5015
    }
  }
]
```

### WebSocket Integration (Future)

Connect to `ws://127.0.0.1:8765` for real-time updates:

```javascript
// Message types
{
  type: 'state_update',    // AI state changed
  type: 'network_update',  // Network topology changed
  type: 'viz_update',      // Visualization params changed
  type: 'activity',        // New activity event
  type: 'thought',         // New thought
  type: 'error'            // Error message
}
```

## 🎨 Visualization System

### DNA Helix Structure

The visualization renders nodes in a double helix pattern:

- **Strands**: 2 primary DNA strands with cross-connections
- **Bridge Nodes**: Nodes spawned on cross-strand links (like base pairs)
- **Sub-strands**: Mini helixes branching from main nodes
- **Floating Nodes**: Disconnected nodes orbiting the structure

### Organic Movement

The helix has multiple layers of organic motion:

1. **Global Rotation**: Continuous spin controlled by `rotationSpeed`
2. **Breathing**: Scale expansion/contraction via `breathing`
3. **Tilt Oscillation**: Gentle swaying via `tilt`
4. **Helix Wave**: Vertical wave propagation
5. **Radial Breathing**: Strand expansion/contraction
6. **Twist Dynamics**: Dynamic twist variation
7. **Shape Morphing**: Complex deformation harmonics
8. **Per-node Drift**: Individual random motion
9. **Energy Waves**: Ripples spreading through network

### Color Modes

- **activity**: Color intensity based on node activation
- **flow**: Colors flow through network as waves
- **energy**: Bright pulsing energy colors
- **age**: Gradient from new (blue) to old (red)
- **type**: Different colors for input/hidden/output layers

## 🔧 Development

### Mock Mode

When `BACKEND.enabled = false`, the frontend runs in mock mode:

- Generates dummy neural network
- Simulates node activation changes
- Cycles through AI cognitive states
- Provides fake activity events

### Adding New Features

1. Add configuration to `src/config/appDefaults.js`
2. Implement component in `src/components/`
3. Wire up in `App.jsx`
4. Document expected API response format

### Performance Tips

- `VISUAL_DEFAULTS.neural.maxNodes` controls max rendered nodes
- `VISUAL_DEFAULTS.neural.maxEdges` controls max rendered links
- Reduce `CURVE_SEGMENTS` for simpler link curves
- Disable `organicMovement` features for performance

## 📋 Backend Implementation Checklist

- [ ] Implement `/api/ping` health check
- [ ] Implement `/api/state` full state endpoint
- [ ] Implement `/api/visualization` parameter endpoint
- [ ] Implement `/api/network` topology endpoint
- [ ] Implement `/api/activity` event stream
- [ ] Implement `/api/chat` message endpoint
- [ ] Implement `/api/tools` tools endpoint
- [ ] Implement `/api/settings` parameter endpoint
- [ ] Set up WebSocket for real-time updates
- [ ] Match all response schemas documented above
- [ ] Set `BACKEND.enabled = true` to connect

## 📝 Notes

- This is **frontend-only** - no backend code included
- All tunable values in `appDefaults.js` for consistency
- Mock mode provides full functionality without backend
- Frontend gracefully handles missing/offline backend

## 🛠 Tech Stack

- **React 18** - UI framework
- **Three.js** - 3D rendering
- **@react-three/fiber** - React Three.js bindings
- **@react-three/drei** - Three.js helpers
- **Framer Motion** - Animations
- **Vite** - Build tool

## 📄 License

MIT
