import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/Layout.vue'
import Dashboard from '@/pages/Dashboard.vue'
import Index from '@/pages/Index.vue'
import MyTrees from '@/pages/MyTrees.vue'
import Builder from '@/pages/Builder.vue'
import Statistics from '@/pages/Statistics.vue'
import Profile from '@/pages/Profile.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Index',
        component: Index
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'my-trees',
        name: 'MyTrees',
        component: MyTrees
      },
      {
        path: 'builder',
        name: 'Builder',
        component: Builder
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: Statistics
      },
      {
        path: 'profile',
        name: 'Profile',
        component: Profile
      },
      {
        path: '/admin',
        name: 'AdminPanel',
        component: () => import('@/pages/AdminPanel.vue'),
        meta: { requiresAdmin: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Навигационный guard для проверки аутентификации и прав админа
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('skilltree_token')
  const isAuthenticated = token !== null
  
  // Проверка на неавторизованного пользователя
  if (!isAuthenticated && to.path !== '/') {
    next('/')
    return
  }
  
  // Проверка на права админа для админ-панели
  if (to.meta.requiresAdmin) {
    if (!isAuthenticated) {
      next('/')
      return
    }
    
    try {
      // Получаем информацию о пользователе
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const userRole = data.user?.role
        
        if (userRole !== 'admin') {
          console.warn('Access denied: admin role required')
          next('/')
          return
        }
      } else {
        next('/')
        return
      }
    } catch (error) {
      console.error('Error checking admin role:', error)
      next('/')
      return
    }
  }
  
  next()
})

export default router