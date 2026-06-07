export default {
  namespaced: true,
  
  state: () => ({
    dailyActivity: {},
    isLoading: false,
    error: null
  }),
  
  mutations: {
    SET_DAILY_ACTIVITY(state, activity) {
      state.dailyActivity = activity
    },
    
    SET_LOADING(state, isLoading) {
      state.isLoading = isLoading
    },
    
    SET_ERROR(state, error) {
      state.error = error
    }
  },
  
  actions: {
    async loadActivity({ commit, rootState }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        // Получаем активность пользователя
        const response = await fetch('http://localhost:5000/api/users/activity', {
          headers: {
            'Authorization': `Bearer ${rootState.user.token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to load activity')
        }
        
        const data = await response.json()
        
        // Группируем активность по дням
        const dailyActivity = {}
        data.activities.forEach(activity => {
          const date = new Date(activity.created_at).toISOString().split('T')[0]
          if (!dailyActivity[date]) {
            dailyActivity[date] = []
          }
          dailyActivity[date].push(activity)
        })
        
        commit('SET_DAILY_ACTIVITY', dailyActivity)
        
      } catch (error) {
        commit('SET_ERROR', error.message)
        console.error('Failed to load activity:', error)
        // Не бросаем ошибку дальше, чтобы не ломать страницу
      } finally {
        commit('SET_LOADING', false)
      }
    }
  },
  
  getters: {
    // Уровень активности за день (от 0 до 3)
    getActivityLevelForDate: (state) => (date) => {
      const dateKey = typeof date === 'string' ? date : date.toISOString().split('T')[0]
      const activities = state.dailyActivity[dateKey] || []
      
      if (activities.length === 0) return 0
      if (activities.length === 1) return 1
      if (activities.length <= 3) return 2
      return 3
    },
    
    // Детали активности за день
    getActivityDetailsForDate: (state) => (date) => {
      const dateKey = typeof date === 'string' ? date : date.toISOString().split('T')[0]
      return state.dailyActivity[dateKey] || []
    }
  }
}