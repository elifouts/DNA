import axios from 'axios'
import { BACKEND } from '../config/appDefaults'

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: BACKEND.baseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth if needed
apiClient.interceptors.request.use(
  (config) => {
    // Add auth headers here if needed
    // const token = localStorage.getItem('authToken')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API Error:', error)
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.warn('Unauthorized - redirect to login if needed')
    } else if (error.response?.status >= 500) {
      // Handle server errors
      console.error('Server error:', error.response.data)
    }
    return Promise.reject(error)
  }
)

// API service functions
export const apiService = {
  // Health check
  ping: () => apiClient.get(BACKEND.endpoints.ping),

  // State management
  getState: () => apiClient.get(BACKEND.endpoints.state),
  updateState: (data) => apiClient.post(BACKEND.endpoints.state, data),

  // Visualization
  getVisualization: () => apiClient.get(BACKEND.endpoints.visualization),
  updateVisualization: (data) => apiClient.post(BACKEND.endpoints.visualization, data),
  getVisualizationSnapshot: () => apiClient.get(BACKEND.endpoints.visualizationSnapshot),

  // Network
  getNetwork: () => apiClient.get(BACKEND.endpoints.network),

  // AI Features
  getTools: () => apiClient.get(BACKEND.endpoints.tools),
  getActivity: () => apiClient.get(BACKEND.endpoints.activity),
  sendChat: (message) => apiClient.post(BACKEND.endpoints.chat, { message }),
  getThoughts: () => apiClient.get(BACKEND.endpoints.thoughts),

  // Control
  reset: () => apiClient.post(BACKEND.endpoints.reset),
  getSettings: () => apiClient.get(BACKEND.endpoints.settings),
  updateSettings: (data) => apiClient.post(BACKEND.endpoints.settings, data),

  // Terminal
  getTerminalLogs: () => apiClient.get(BACKEND.endpoints.terminalLogs),
  executeCommand: (command) => apiClient.post(BACKEND.endpoints.terminalCommand, { command }),
}

export default apiClient