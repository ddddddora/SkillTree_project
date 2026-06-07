<!-- client/src/components/Layout.vue -->
<template>
  <div class="min-h-screen bg-background flex flex-col md:flex-row">
    <!-- Мобильный хедер -->
    <header class="md:hidden sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <img 
          src="https://cdn.poehali.dev/files/08644768-6677-4e7c-b42b-cd8a6c5fb5f9.png" 
          alt="SkillTree Logo" 
          width="32" 
          height="32" 
          class="rounded-lg transition-all duration-300 hover:brightness-110 hover:scale-105"
          :style="{ filter: 'hue-rotate(20deg) saturate(0.8) brightness(1.1)' }"
        />
        <h1 class="text-lg font-bold">SkillTree</h1>
      </div>
      <Button variant="ghost" size="icon" @click="mobileMenuOpen = !mobileMenuOpen">
        <Menu v-if="!mobileMenuOpen" :size="24" />
        <X v-else :size="24" />
      </Button>
    </header>

    <!-- Мобильное меню -->
    <div v-if="mobileMenuOpen" class="md:hidden fixed inset-0 top-[57px] z-40 bg-background/95 backdrop-blur">
      <nav class="p-4 space-y-2">
        <!-- Для админа показываем только админку -->
        <template v-if="isAdmin">
          <Button
            variant="ghost"
            class="w-full justify-start"
            @click="navigateTo('admin')"
          >
            <Shield :size="18" class="mr-3" />
            Админ панель
          </Button>
        </template>
        
        <!-- Для обычных пользователей показываем всё -->
        <template v-else>
          <Button
            v-for="item in navItems"
            :key="item.path"
            :variant="isActive(item.path) ? 'default' : 'ghost'"
            class="w-full justify-start"
            @click="navigateTo(item.path)"
          >
            <component :is="item.icon" :size="18" class="mr-3" />
            {{ item.label }}
          </Button>
        </template>
        
        <div class="pt-4 mt-4 border-t border-border space-y-2">
          <Button 
            variant="ghost" 
            class="w-full justify-start" 
            @click="navigateTo('/profile')"
          >
            <User :size="18" class="mr-3" />
            Профиль
          </Button>
          <!-- Кнопка "Скачать резюме" только для обычных пользователей -->
          <Button 
            v-if="!isAdmin"
            variant="ghost" 
            class="w-full justify-start" 
            :disabled="isGenerating"
            @click="handleGenerateResume"
          >
            <FileText :size="18" class="mr-3" />
            {{ isGenerating ? 'Генерация...' : 'Скачать резюме' }}
          </Button>
          <div class="pt-4 mt-4 border-t border-border">
            <Button 
              variant="ghost" 
              class="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
              @click="handleLogout"
            >
              <LogOut :size="18" class="mr-3" />
              Выйти
            </Button>
          </div>
        </div>
      </nav>
    </div>

    <!-- Десктопная панель -->
    <aside class="hidden md:flex w-64 border-r border-border bg-card/50 flex-col">
      <div class="p-6 border-b border-border">
        <div class="flex items-center gap-3">
          <img 
            src="https://cdn.poehali.dev/files/08644768-6677-4e7c-b42b-cd8a6c5fb5f9.png" 
            alt="SkillTree Logo" 
            width="44" 
            height="44" 
            class="rounded-xl transition-all duration-300 hover:brightness-110 hover:scale-105 cursor-pointer"
            :style="{ filter: 'hue-rotate(20deg) saturate(0.8) brightness(1.1)' }"
          />
          <div>
            <h1 class="text-xl font-bold tracking-tight">SkillTree</h1>
            <p class="text-xs text-muted-foreground">Визуализация роста</p>
          </div>
        </div>
      </div>

      <!-- Навигация - для админа своя, для пользователя своя -->
      <nav class="flex-1 p-4 space-y-2">
        <!-- Для админа показываем только админку -->
        <template v-if="isAdmin">
          <Button
            variant="ghost"
            class="w-full justify-start"
            @click="navigateTo('admin')"
          >
            <Shield :size="18" class="mr-3" />
            Админ панель
          </Button>
        </template>
        
        <!-- Для обычных пользователей показываем все пункты -->
        <template v-else>
          <Button
            v-for="item in navItems"
            :key="item.path"
            :variant="isActive(item.path) ? 'default' : 'ghost'"
            class="w-full justify-start"
            @click="navigateTo(item.path)"
          >
            <component :is="item.icon" :size="18" class="mr-3" />
            {{ item.label }}
          </Button>
        </template>
      </nav>

      <!-- Нижняя часть меню -->
      <div class="p-4 border-t border-border space-y-2">
        <Button 
          variant="ghost" 
          class="w-full justify-start" 
          @click="navigateTo('/profile')"
        >
          <User :size="18" class="mr-3" />
          Профиль
        </Button>
        <!-- Кнопка "Скачать резюме" только для обычных пользователей -->
        <Button 
          v-if="!isAdmin"
          variant="ghost" 
          class="w-full justify-start" 
          :disabled="isGenerating"
          @click="handleGenerateResume"
        >
          <FileText :size="18" class="mr-3" />
          {{ isGenerating ? 'Генерация...' : 'Скачать резюме' }}
        </Button>
        <div class="pt-4 mt-4 border-t border-border">
          <Button 
            variant="ghost" 
            class="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" 
            @click="handleLogout"
          >
            <LogOut :size="18" class="mr-3" />
            Выйти
          </Button>
        </div>
      </div>
    </aside>

    <!-- Основной контент -->
    <main class="flex-1 overflow-auto">
      <div class="container mx-auto p-4 md:p-8 max-w-7xl">
        <router-view />
      </div>
    </main>

    <!-- Компонент генерации резюме (скрытый, вызывается через ref) -->
    <ResumeGenerator ref="resumeGenerator" />
  </div>
</template>

<script>
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { computed } from 'vue'
import { 
  LayoutDashboard, 
  Folder, 
  TreePine, 
  BarChart3, 
  User, 
  FileText,
  Shield,
  LogOut,
  Menu, 
  X 
} from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import ResumeGenerator from '@/components/ResumeGenerator.vue'

export default {
  name: 'Layout',
  components: {
    Button,
    ResumeGenerator,
    LayoutDashboard,
    Folder,
    TreePine,
    BarChart3,
    User,
    FileText,
    Shield,
    LogOut,
    Menu,
    X
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const store = useStore()
    
    const isAdmin = computed(() => {
      const user = store.state.user.user
      return user?.role === 'admin'
    })

    return {
      router,
      route,
      store,
      isAdmin
    }
  },
  data() {
    return {
      mobileMenuOpen: false,
      isGenerating: false,
      navItems: [
        { path: '', label: 'Dashboard', icon: 'LayoutDashboard' },
        { path: 'my-trees', label: 'Мои деревья', icon: 'Folder' },
        { path: 'builder', label: 'Конструктор', icon: 'TreePine' },
        { path: 'statistics', label: 'Статистика', icon: 'BarChart3' },
      ]
    }
  },
  methods: {
    isActive(path) {
      if (path === '' && this.route.path === '/') return true
      return this.route.path === `/${path}`
    },
    navigateTo(path) {
      let fullPath = path
      if (path === '') {
        fullPath = '/'
      } else if (!path.startsWith('/')) {
        fullPath = `/${path}`
      }
      this.router.push(fullPath)
      this.mobileMenuOpen = false
    },
    async handleGenerateResume() {
      if (this.$refs.resumeGenerator && !this.isGenerating) {
        this.isGenerating = true
        try {
          await this.$refs.resumeGenerator.generateResume()
        } catch (error) {
          console.error('Ошибка при генерации резюме:', error)
        } finally {
          this.isGenerating = false
        }
      }
    },
    async handleLogout() {
      try {
        await this.store.dispatch('user/logout')
        this.router.push('/login')
      } catch (error) {
        console.error('Logout failed:', error)
        localStorage.removeItem('skilltree_token')
        this.router.push('/login')
      }
    }
  }
}
</script>