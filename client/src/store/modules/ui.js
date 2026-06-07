// Для управления состоянием интерфейса
export default {
  namespaced: true,
  
  state: () => ({
    // Панели и диалоги
    isSkillsLibraryOpen: false,
    isShareDialogOpen: false,
    isSkillDetailOpen: false,
    isCreateTreeFormOpen: false,
    
    // Активные модальные окна
    activeModal: null,
    
    // Настройки темы
    theme: 'light',
    
    // Мобильное представление
    isMobile: false,
    
    // Уведомления
    notifications: [],
    
    // Загрузка
    globalLoading: false
  }),
  
  mutations: {
    // Панели и диалоги
    TOGGLE_SKILLS_LIBRARY(state) {
      state.isSkillsLibraryOpen = !state.isSkillsLibraryOpen
    },
    
    SET_SKILLS_LIBRARY_OPEN(state, isOpen) {
      state.isSkillsLibraryOpen = isOpen
    },
    
    SET_SHARE_DIALOG_OPEN(state, isOpen) {
      state.isShareDialogOpen = isOpen
    },
    
    SET_SKILL_DETAIL_OPEN(state, isOpen) {
      state.isSkillDetailOpen = isOpen
    },
    
    SET_CREATE_TREE_FORM_OPEN(state, isOpen) {
      state.isCreateTreeFormOpen = isOpen
    },
    
    // Модальные окна
    SET_ACTIVE_MODAL(state, modalName) {
      state.activeModal = modalName
    },
    
    CLOSE_ALL_MODALS(state) {
      state.activeModal = null
      state.isSkillsLibraryOpen = false
      state.isShareDialogOpen = false
      state.isSkillDetailOpen = false
      state.isCreateTreeFormOpen = false
    },
    
    // Тема
    SET_THEME(state, theme) {
      state.theme = theme
      localStorage.setItem('skilltree-theme', theme)
    },
    
    // Мобильное представление
    SET_MOBILE(state, isMobile) {
      state.isMobile = isMobile
    },
    
    // Уведомления
    ADD_NOTIFICATION(state, notification) {
      state.notifications.push({
        id: Date.now(),
        type: 'info',
        timeout: 5000,
        ...notification
      })
    },
    
    REMOVE_NOTIFICATION(state, notificationId) {
      state.notifications = state.notifications.filter(n => n.id !== notificationId)
    },
    
    CLEAR_NOTIFICATIONS(state) {
      state.notifications = []
    },
    
    // Глобальная загрузка
    SET_GLOBAL_LOADING(state, isLoading) {
      state.globalLoading = isLoading
    }
  },
  
  actions: {
    // Управление панелями
    toggleSkillsLibrary({ commit }) {
      commit('TOGGLE_SKILLS_LIBRARY')
    },
    
    openSkillsLibrary({ commit }) {
      commit('SET_SKILLS_LIBRARY_OPEN', true)
    },
    
    closeSkillsLibrary({ commit }) {
      commit('SET_SKILLS_LIBRARY_OPEN', false)
    },
    
    openShareDialog({ commit }) {
      commit('SET_SHARE_DIALOG_OPEN', true)
    },
    
    closeShareDialog({ commit }) {
      commit('SET_SHARE_DIALOG_OPEN', false)
    },
    
    openSkillDetail({ commit }) {
      commit('SET_SKILL_DETAIL_OPEN', true)
    },
    
    closeSkillDetail({ commit }) {
      commit('SET_SKILL_DETAIL_OPEN', false)
    },
    
    openCreateTreeForm({ commit }) {
      commit('SET_CREATE_TREE_FORM_OPEN', true)
    },
    
    closeCreateTreeForm({ commit }) {
      commit('SET_CREATE_TREE_FORM_OPEN', false)
    },
    
    // Управление модальными окнами
    openModal({ commit }, modalName) {
      commit('SET_ACTIVE_MODAL', modalName)
    },
    
    closeModal({ commit }) {
      commit('SET_ACTIVE_MODAL', null)
    },
    
    closeAllModals({ commit }) {
      commit('CLOSE_ALL_MODALS')
    },
    
    // Управление темой
    toggleTheme({ commit, state }) {
      const newTheme = state.theme === 'light' ? 'dark' : 'light'
      commit('SET_THEME', newTheme)
    },
    
    initTheme({ commit }) {
      const savedTheme = localStorage.getItem('skilltree-theme') || 'light'
      commit('SET_THEME', savedTheme)
    },
    
    // Управление мобильным представлением
    setMobileView({ commit }, isMobile) {
      commit('SET_MOBILE', isMobile)
    },
    
    // Уведомления
    showNotification({ commit }, notification) {
      commit('ADD_NOTIFICATION', notification)
    },
    
    removeNotification({ commit }, notificationId) {
      commit('REMOVE_NOTIFICATION', notificationId)
    },
    
    clearNotifications({ commit }) {
      commit('CLEAR_NOTIFICATIONS')
    },
    
    // Быстрые уведомления
    showSuccess({ commit }, message) {
      commit('ADD_NOTIFICATION', { type: 'success', message })
    },
    
    showError({ commit }, message) {
      commit('ADD_NOTIFICATION', { type: 'error', message })
    },
    
    showWarning({ commit }, message) {
      commit('ADD_NOTIFICATION', { type: 'warning', message })
    },
    
    // Глобальная загрузка
    setGlobalLoading({ commit }, isLoading) {
      commit('SET_GLOBAL_LOADING', isLoading)
    }
  },
  
  getters: {
    // Проверки состояний
    isAnyModalOpen: (state) => {
      return state.activeModal !== null || 
             state.isSkillsLibraryOpen || 
             state.isShareDialogOpen ||
             state.isSkillDetailOpen ||
             state.isCreateTreeFormOpen
    },
    
    // Фильтрация уведомлений по типу
    successNotifications: (state) => state.notifications.filter(n => n.type === 'success'),
    errorNotifications: (state) => state.notifications.filter(n => n.type === 'error'),
    warningNotifications: (state) => state.notifications.filter(n => n.type === 'warning'),
    infoNotifications: (state) => state.notifications.filter(n => n.type === 'info'),
    
    // Проверка темы
    isDarkTheme: (state) => state.theme === 'dark',
    isLightTheme: (state) => state.theme === 'light'
  }
}