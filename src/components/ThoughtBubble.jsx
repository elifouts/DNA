import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VISUAL_DEFAULTS, MOCK_DATA } from '../config/appDefaults'

export default function ThoughtBubble({ connected, send, themeColor = VISUAL_DEFAULTS.theme.hex, state, mockMode = false }) {
  const [thought, setThought] = useState(null)
  const [innerThought, setInnerThought] = useState(null)
  const [visible, setVisible] = useState(false)
  const lastInnerThought = useRef(null)
  
  // Track DNA's inner thoughts from state
  useEffect(() => {
    if (state?.currentThought && state.currentThought !== lastInnerThought.current) {
      lastInnerThought.current = state.currentThought
      
      // Show inner thought with delay
      setTimeout(() => {
        setInnerThought({
          content: state.currentThought,
          feeling: state.feeling || 'neutral',
          type: 'inner'
        })
        setVisible(true)
        
        // Hide after a while
        const duration = MOCK_DATA.generators.randomTiming(MOCK_DATA.timing.thoughtBubble.visibleDurationRangeMs)
        setTimeout(() => {
          setVisible(false)
        }, duration)
      }, MOCK_DATA.generators.randomTiming(MOCK_DATA.timing.thoughtBubble.fadeDelayRangeMs)) // Random delay for natural feel
    }
  }, [state?.currentThought])
  
  useEffect(() => {
    if (!connected) return
    if (mockMode || !send) return

    const requestThought = () => {
      send({ type: 'get_thought' })
    }

    const initialTimeout = setTimeout(requestThought, 3000)
    const intervalId = setInterval(() => {
      requestThought()
    }, MOCK_DATA.generators.randomTiming([10000, 20000]))

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(intervalId)
    }
  }, [connected, send, mockMode])

  // Mock thought generation when no backend is present
  useEffect(() => {
    if (!connected || !mockMode) return

    const emitMockThought = () => {
      const next = MOCK_DATA.generators.randomThought()
      setThought({ content: next, feeling: state?.feeling || 'neutral', type: 'inner' })
      setVisible(true)
      const duration = MOCK_DATA.generators.randomTiming(MOCK_DATA.timing.thoughtBubble.visibleDurationRangeMs)
      setTimeout(() => setVisible(false), duration)
    }

    const initialDelay = MOCK_DATA.timing.thoughtBubble.initialDelayMs
    const intervalRange = MOCK_DATA.timing.thoughtBubble.intervalRangeMs
    const intervalDuration = MOCK_DATA.generators.randomTiming(intervalRange)

    const initialTimeout = setTimeout(emitMockThought, initialDelay)
    const intervalId = setInterval(emitMockThought, intervalDuration)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(intervalId)
    }
  }, [connected, mockMode, state?.feeling])
  
  // Listen for thought responses via custom event
  useEffect(() => {
    const handleThought = (event) => {
      const data = event.detail
      if (data && data.content) {
        setThought(data)
        setInnerThought(null) // Clear inner thought
        setVisible(true)
        
        // Hide after 8-12 seconds
        setTimeout(() => {
          setVisible(false)
        }, 8000 + Math.random() * 4000)
      }
    }
    
    window.addEventListener('dna-thought', handleThought)
    return () => window.removeEventListener('dna-thought', handleThought)
  }, [])
  

  
  // Show either external thought or inner thought
  const currentThought = thought || innerThought
  
  return (
    <AnimatePresence>
      {visible && currentThought && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ 
            type: 'spring', 
            damping: 25, 
            stiffness: 200 
          }}
          style={{
            position: 'absolute',
            bottom: 24,
            left: 24,
            right: 140,
            maxWidth: 500,
            padding: '14px 18px',
            background: currentThought.type === 'inner' 
              ? `linear-gradient(135deg, ${themeColor}26, rgba(12, 14, 22, 0.92))`
              : `linear-gradient(135deg, ${themeColor}1a, rgba(12, 14, 22, 0.92))`,
            backdropFilter: 'blur(20px)',
            borderRadius: 12,
            border: `1px solid ${themeColor}30`,
            zIndex: 50,
            boxShadow: currentThought.type === 'inner'
              ? `0 8px 32px rgba(0,0,0,0.45), 0 0 30px ${themeColor}35`
              : `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${themeColor}25`
          }}
        >
          <div style={{
            fontSize: 10,
            color: currentThought.type === 'inner' ? '#8f8f8f' : themeColor,
            marginBottom: 6,
            textTransform: 'uppercase',
            letterSpacing: 1,
            opacity: 0.9,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            {currentThought.feeling && (
              <span style={{ fontSize: 11, opacity: 0.7 }}>
                {currentThought.feeling}
              </span>
            )}
          </div>
          <div style={{
            fontSize: 13,
            color: currentThought.type === 'inner' 
              ? 'rgba(204, 204, 204, 0.9)' 
              : 'rgba(201, 201, 201, 0.85)',
            lineHeight: 1.5,
            fontStyle: 'italic'
          }}>
            "{currentThought.content}"
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
