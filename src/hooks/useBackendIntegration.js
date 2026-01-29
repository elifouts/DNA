import { useState, useEffect, useCallback } from 'react'
import { BACKEND } from '../config/appDefaults'
import { apiService } from '../services/apiService'
import useWebSocket from './useWebSocket'

export default function useBackendIntegration() {
  const [backendConnected, setBackendConnected] = useState(false)
  const [backendData, setBackendData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // WebSocket connection
  const { connected: wsConnected, send: wsSend, lastMessage: wsMessage } = useWebSocket(
    BACKEND.enabled ? BACKEND.wsUrl : null
  )

  // Health check
  const checkBackendHealth = useCallback(async () => {
    if (!BACKEND.enabled) return false

    try {
      const response = await apiService.ping()
      setBackendConnected(true)
      setError(null)
      return true
    } catch (err) {
      console.warn('Backend health check failed:', err.message)
      setBackendConnected(false)
      setError(err.message)
      return false
    }
  }, [])

  // Fetch state from backend
  const fetchState = useCallback(async () => {
    if (!BACKEND.enabled || !backendConnected) return

    try {
      setIsLoading(true)
      const response = await apiService.getState()
      setBackendData(prev => ({ ...prev, state: response.data }))
      setError(null)
    } catch (err) {
      console.error('Failed to fetch state:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [backendConnected])

  // Fetch visualization data
  const fetchVisualization = useCallback(async () => {
    if (!BACKEND.enabled || !backendConnected) return

    try {
      const response = await apiService.getVisualization()
      setBackendData(prev => ({ ...prev, visualization: response.data }))
    } catch (err) {
      console.error('Failed to fetch visualization:', err)
    }
  }, [backendConnected])

  // Fetch activity data
  const fetchActivity = useCallback(async () => {
    if (!BACKEND.enabled || !backendConnected) return

    try {
      const response = await apiService.getActivity()
      setBackendData(prev => ({ ...prev, activity: response.data }))
    } catch (err) {
      console.error('Failed to fetch activity:', err)
    }
  }, [backendConnected])

  // Send chat message
  const sendChatMessage = useCallback(async (message) => {
    if (!BACKEND.enabled || !backendConnected) return null

    try {
      const response = await apiService.sendChat(message)
      return response.data
    } catch (err) {
      console.error('Failed to send chat message:', err)
      throw err
    }
  }, [backendConnected])

  // WebSocket message handler
  useEffect(() => {
    if (!wsMessage) return

    try {
      const data = JSON.parse(wsMessage)
      switch (data.type) {
        case 'state_update':
          setBackendData(prev => ({ ...prev, state: data.payload }))
          break
        case 'network_update':
          setBackendData(prev => ({ ...prev, network: data.payload }))
          break
        case 'viz_update':
          setBackendData(prev => ({ ...prev, visualization: data.payload }))
          break
        case 'activity':
          setBackendData(prev => ({ ...prev, activity: [...(prev?.activity || []), data.payload] }))
          break
        case 'thought':
          setBackendData(prev => ({ ...prev, thought: data.payload }))
          break
        default:
          console.log('Unknown WebSocket message type:', data.type)
      }
    } catch (err) {
      console.error('Failed to parse WebSocket message:', err)
    }
  }, [wsMessage])

  // Initial health check
  useEffect(() => {
    if (BACKEND.enabled) {
      checkBackendHealth()
    }
  }, [checkBackendHealth])

  // Polling intervals when WebSocket not available
  useEffect(() => {
    if (!BACKEND.enabled || wsConnected) return

    const stateInterval = setInterval(fetchState, BACKEND.polling.stateIntervalMs)
    const vizInterval = setInterval(fetchVisualization, BACKEND.polling.visualizationIntervalMs)
    const activityInterval = setInterval(fetchActivity, BACKEND.polling.activityIntervalMs)

    return () => {
      clearInterval(stateInterval)
      clearInterval(vizInterval)
      clearInterval(activityInterval)
    }
  }, [fetchState, fetchVisualization, fetchActivity, wsConnected])

  return {
    backendConnected,
    backendData,
    isLoading,
    error,
    sendChatMessage,
    checkBackendHealth,
    wsConnected,
  }
}