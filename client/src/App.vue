<template>
  <div id="app" class="min-h-screen bg-background">
    <div v-if="isAuthChecked">
      <RouterView v-if="isAuthenticated" />
      <Login v-else />
    </div>
    <div v-else class="flex items-center justify-center min-h-screen">
      <div class="text-center p-8">
        <div class="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h1 class="text-2xl font-bold text-foreground mb-2">SkillTree App</h1>
        <p class="text-muted-foreground">Загрузка...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Login from '@/components/Login.vue'

export default {
  name: 'App',
  components: {
    Login
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const isAuthChecked = ref(false)

    const isAuthenticated = computed(() => store.state.user.isAuthenticated)

    onMounted(async () => {
      try {
        await store.dispatch('user/initializeAuth')
      } catch (error) {
        console.error('Auth initialization failed:', error)
      } finally {
        isAuthChecked.value = true
      }
    })

    return {
      isAuthChecked,
      isAuthenticated
    }
  }
}
</script>