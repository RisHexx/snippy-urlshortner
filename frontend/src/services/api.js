import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect for auth check endpoint - 401 is expected for non-logged-in users
    const isAuthCheck = error.config?.url === '/api/auth/me'
    
    if (error.response?.status === 401 && !isAuthCheck) {
      // Handle unauthorized access - redirect to login
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default api
