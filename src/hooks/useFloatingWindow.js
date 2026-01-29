import { useState, useEffect, useCallback } from 'react'
import { WINDOW_DEFAULTS } from '../config/appDefaults'

const resolvePosition = (position, size) => {
  if (typeof position === 'function') {
    return position(size)
  }
  const pos = position || { x: 0, y: 0 }
  const offsetX = pos.offsetX ?? 20
  const offsetY = pos.offsetY ?? 20
  let x = pos.x ?? 0
  let y = pos.y ?? 0

  if (x === 'right') {
    x = Math.max(0, window.innerWidth - size.width - offsetX)
  } else if (x === 'center') {
    x = Math.max(0, (window.innerWidth - size.width) / 2)
  }

  if (y === 'bottom') {
    y = Math.max(0, window.innerHeight - size.height - offsetY)
  } else if (y === 'center') {
    y = Math.max(0, (window.innerHeight - size.height) / 2)
  }

  return { x, y }
}

export default function useFloatingWindow({
  initialPosition,
  initialSize,
  minSize
}) {
  const minWidth = minSize?.width ?? WINDOW_DEFAULTS.minSize.width
  const minHeight = minSize?.height ?? WINDOW_DEFAULTS.minSize.height

  const [size, setSize] = useState(() => ({
    width: initialSize?.width ?? WINDOW_DEFAULTS.size.width,
    height: initialSize?.height ?? WINDOW_DEFAULTS.size.height
  }))

  const [position, setPosition] = useState(() => resolvePosition(initialPosition, size))
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const handleMouseDown = useCallback((event) => {
    if (event.target.closest('[data-window-ignore-drag]')) return
    setIsDragging(true)
    setDragOffset({
      x: event.clientX - position.x,
      y: event.clientY - position.y
    })
  }, [position])

  const handleResizeMouseDown = useCallback((event) => {
    event.stopPropagation()
    setIsResizing(true)
  }, [])

  const handleMouseMove = useCallback((event) => {
    if (isDragging) {
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - size.width, event.clientX - dragOffset.x)),
        y: Math.max(0, Math.min(window.innerHeight - size.height, event.clientY - dragOffset.y))
      })
    }
    if (isResizing) {
      setSize({
        width: Math.max(minWidth, event.clientX - position.x),
        height: Math.max(minHeight, event.clientY - position.y)
      })
    }
  }, [isDragging, isResizing, dragOffset, position, size.width, size.height, minWidth, minHeight])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
  }, [])

  useEffect(() => {
    if (!isDragging && !isResizing) return undefined
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp])

  return {
    position,
    size,
    isDragging,
    isResizing,
    setPosition,
    setSize,
    handleMouseDown,
    handleResizeMouseDown
  }
}
