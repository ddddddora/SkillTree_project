import { createStore } from 'vuex'
import user from './modules/user'
import tree from './modules/tree'
import ui from './modules/ui'
import activity from './modules/activity'

export default createStore({
  modules: {
    user,
    tree,
    ui,
    activity
  },
  
  state: {
    appName: 'SkillTree App',
    version: '1.0.0',
    apiBaseUrl: 'http://localhost:5000/api'
  },
  
  getters: {
    appInfo: (state) => {
      return `${state.appName} v${state.version}`
    },
    apiUrl: (state) => (endpoint) => {
      return `${state.apiBaseUrl}${endpoint}`
    }
  }
})