export default {
  namespaced: true,
  
  state: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    token: localStorage.getItem('skilltree_token') || null
  }),
  
  mutations: {
    SET_USER(state, user) {
      state.user = user
      state.isAuthenticated = !!user
    },
    
    SET_TOKEN(state, token) {
      state.token = token
      if (token) {
        localStorage.setItem('skilltree_token', token)
      } else {
        localStorage.removeItem('skilltree_token')
      }
    },
    
    SET_LOADING(state, isLoading) {
      state.isLoading = isLoading
    },
    
    CLEAR_USER(state) {
      state.user = null
      state.isAuthenticated = false
      state.token = null
      localStorage.removeItem('skilltree_token')
    },
    
    UPDATE_USER_PROFILE(state, profile) {
      if (state.user) {
        state.user = { ...state.user, ...profile }
      }
    }
  },
  
  actions: {
    async login({ commit, dispatch }, credentials) {
      commit('SET_LOADING', true)
      
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Login failed')
        }
        
        const data = await response.json()
        
        commit('SET_USER', data.user)
        commit('SET_TOKEN', data.token)
        
        // Устанавливаем токен для будущих запросов
        dispatch('setAuthHeader', data.token)
        
        // Возвращаем пользователя для перенаправления
        return data.user
      } catch (error) {
        console.error('Login failed:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async register({ commit, dispatch }, userData) {
      commit('SET_LOADING', true)
      
      try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Registration failed')
        }
        
        const data = await response.json()
        
        commit('SET_USER', data.user)
        commit('SET_TOKEN', data.token)
        
        dispatch('setAuthHeader', data.token)
        
        // Возвращаем пользователя для перенаправления
        return data.user
      } catch (error) {
        console.error('Registration failed:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async logout({ commit }) {
      commit('SET_LOADING', true)
      
      try {
        commit('CLEAR_USER')
      } catch (error) {
        console.error('Logout failed:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchCurrentUser({ commit, state }) {
      if (!state.token) return null
      
      commit('SET_LOADING', true)
      
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${state.token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          if (response.status === 401) {
            commit('CLEAR_USER')
          }
          throw new Error('Failed to fetch user data')
        }
        
        const data = await response.json()
        commit('SET_USER', data.user)
        return data.user
      } catch (error) {
        console.error('Failed to fetch user:', error)
        commit('CLEAR_USER')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async updateProfile({ commit, state }, profile) {
      commit('SET_LOADING', true)
      
      try {
        const response = await fetch('http://localhost:5000/api/users/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${state.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(profile)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Profile update failed')
        }
        
        const data = await response.json()
        commit('UPDATE_USER_PROFILE', data.user)
        return data.user
      } catch (error) {
        console.error('Profile update failed:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    setAuthHeader({ state }, token = null) {
      const authToken = token || state.token
      if (authToken) {
        // Устанавливаем глобальный заголовок для fetch
        // В реальном приложении лучше использовать axios interceptors
      }
    },
    
    initializeAuth({ commit, dispatch }) {
      const token = localStorage.getItem('skilltree_token')
      if (token) {
        commit('SET_TOKEN', token)
        dispatch('setAuthHeader', token)
        return dispatch('fetchCurrentUser')
      }
      return Promise.resolve(null)
    }
  },
  
  getters: {
    userName: (state) => state.user?.name || 'Guest',
    userEmail: (state) => state.user?.email,
    userId: (state) => state.user?.id,
    isGuest: (state) => !state.isAuthenticated,
    authToken: (state) => state.token,
    
    userInfo: (state) => {
      if (!state.user) return null
      return {
        name: state.user.name,
        email: state.user.email,
        avatar_url: state.user.avatar_url,
        bio: state.user.bio,
        created_at: state.user.created_at,
        role: state.user.role
      }
    }
  }
}