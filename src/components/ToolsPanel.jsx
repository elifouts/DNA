import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VISUAL_DEFAULTS, WINDOW_DEFAULTS } from '../config/appDefaults'
import useFloatingWindow from '../hooks/useFloatingWindow'
import WindowFrame from './WindowFrame'

/**
 * ToolsPanel - Glassy Hyprland-style draggable panel
 * Shows DNA-created tools with code viewer
 */
export default function ToolsPanel({ isOpen, onClose, themeColor = VISUAL_DEFAULTS.theme.hex, tools = [] }) {
  const [selectedTool, setSelectedTool] = useState(null)
  const { position, size, isDragging, handleMouseDown, handleResizeMouseDown } = useFloatingWindow({
    initialPosition: WINDOW_DEFAULTS.layout.tools.position,
    initialSize: WINDOW_DEFAULTS.layout.tools.size,
    minSize: WINDOW_DEFAULTS.layout.tools.minSize
  })

  // Select first tool when tools change
  useEffect(() => {
    if (tools.length > 0 && !selectedTool) {
      setSelectedTool(tools[0])
    }
  }, [tools, selectedTool])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <WindowFrame
        isOpen
        position={position}
        size={size}
        isDragging={isDragging}
        onMouseDown={handleMouseDown}
        onResizeMouseDown={handleResizeMouseDown}
        onClose={onClose}
        title="DNA Tools"
        badge={`${tools.length} created`}
        themeColor={themeColor}
        fontFamily='"JetBrains Mono", "Fira Code", monospace'
        contentStyle={{ display: 'flex', flexDirection: 'column' }}
        footer={(
          <>
            <span>Self-generated tools</span>
            <span style={{ color: themeColor }}>Self-evolving • Self-improving</span>
          </>
        )}
      >

        {/* Content */}
        <div className="panel-content" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Tool List */}
          <div style={{
            width: 220,
            borderRight: '1px solid rgba(255,255,255,0.05)',
            overflowY: 'auto',
            padding: '8px',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.08) transparent'
          }}>
            {tools.length === 0 ? (
              <div style={{
                padding: 20,
                textAlign: 'center',
                color: 'rgba(255,255,255,0.3)',
                fontSize: 11
              }}>
                <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.5 }}>🔨</div>
                DNA hasn't created any tools yet.
                <br/><br/>
                <span style={{ fontSize: 10, opacity: 0.7 }}>
                  Tools will appear here as DNA learns to build them.
                </span>
              </div>
            ) : (
              tools.map((tool, idx) => (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => setSelectedTool(tool)}
                  style={{
                    padding: '10px 12px',
                    marginBottom: 4,
                    background: selectedTool?.name === tool.name 
                      ? `${themeColor}20` 
                      : 'rgba(255,255,255,0.02)',
                    borderRadius: 8,
                    cursor: 'pointer',
                    border: selectedTool?.name === tool.name 
                      ? `1px solid ${themeColor}40`
                      : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{
                      color: selectedTool?.name === tool.name ? themeColor : 'rgba(255,255,255,0.7)',
                      fontSize: 11,
                      fontWeight: 500
                    }}>
                      {tool.name}
                    </span>
                    <span style={{
                      color: 'rgba(255,255,255,0.25)',
                      fontSize: 9,
                      background: 'rgba(255,255,255,0.04)',
                      padding: '1px 5px',
                      borderRadius: 4
                    }}>
                      {tool.use_count || 0}×
                    </span>
                  </div>
                  <div style={{
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: 10,
                    marginTop: 4,
                    lineHeight: 1.3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {tool.description}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Code View */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: 16,
            background: 'rgba(0,0,0,0.2)',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.08) transparent'
          }}>
            {selectedTool ? (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12
                }}>
                  <h3 style={{
                    margin: 0,
                    color: themeColor,
                    fontSize: 14,
                    fontWeight: 600
                  }}>
                    {selectedTool.name}
                  </h3>
                  <div style={{
                    display: 'flex',
                    gap: 10,
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.4)'
                  }}>
                    <span>Used: {selectedTool.use_count || 0}×</span>
                    <span>•</span>
                    <span style={{ color: selectedTool.enabled !== false ? '#22c55e' : '#ef4444' }}>
                      {selectedTool.enabled !== false ? '● Active' : '○ Disabled'}
                    </span>
                  </div>
                </div>

                <div style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: 8,
                  padding: 12,
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div style={{
                    color: 'rgba(255,255,255,0.3)',
                    fontSize: 9,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                    marginBottom: 10
                  }}>
                    DNA-Generated Python Code
                  </div>
                  <pre style={{
                    margin: 0,
                    color: '#a5f3fc',
                    fontSize: 11,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: '"JetBrains Mono", "Fira Code", monospace'
                  }}>
                    {selectedTool.code || '# No code available'}
                  </pre>
                </div>

                <div style={{
                  marginTop: 12,
                  padding: 10,
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 6,
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.5)',
                  lineHeight: 1.4
                }}>
                  <span style={{ color: themeColor }}>Purpose:</span> {selectedTool.description}
                </div>
              </div>
            ) : (
              <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.3)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.4 }}>👈</div>
                <div style={{ fontSize: 12 }}>Select a tool to view its code</div>
                <div style={{ fontSize: 10, marginTop: 6, opacity: 0.6 }}>
                  DNA writes Python code to create new capabilities
                </div>
              </div>
            )}
          </div>
        </div>

      </WindowFrame>
    </AnimatePresence>
  )
}
