class ApiClient {
  constructor(baseURL = '/api') { // Используем относительный путь для proxy
    this.baseURL = baseURL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const token = localStorage.getItem('skilltree_token')
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Добавляем credentials
      ...options,
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        // Если 401 - очищаем токен
        if (response.status === 401) {
          localStorage.removeItem('skilltree_token')
          window.location.reload()
        }
        
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // остальные методы остаются без изменений
  get(endpoint) {
    return this.request(endpoint)
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    })
  }
}

export const apiClient = new ApiClient()

// Экспорт отдельных методов для удобства
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  getMe: () => apiClient.get('/auth/me'),
}

export const treesAPI = {
  getAll: () => apiClient.get('/trees'),
  getById: (id) => apiClient.get(`/trees/${id}`),
  create: (data) => apiClient.post('/trees', data),
  update: (id, data) => apiClient.put(`/trees/${id}`, data),
  delete: (id) => apiClient.delete(`/trees/${id}`),
  getShared: (token) => apiClient.get(`/trees/share/${token}`),
}

export const nodesAPI = {
  create: (data) => apiClient.post('/nodes', data),
  update: (id, data) => apiClient.put(`/nodes/${id}`, data),
  delete: (id) => apiClient.delete(`/nodes/${id}`),
}

export const usersAPI = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data) => apiClient.put('/users/profile', data),
  getActivity: () => apiClient.get('/users/activity'),
  getStatistics: () => apiClient.get('/users/statistics'),
}