<template>
  <div class="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="flex justify-center">
          <img 
            src="https://cdn.poehali.dev/files/08644768-6677-4e7c-b42b-cd8a6c5fb5f9.png" 
            alt="SkillTree Logo" 
            width="80" 
            height="80" 
            class="rounded-xl"
          />
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-foreground">
          Вход в SkillTree
        </h2>
        <p class="mt-2 text-center text-sm text-muted-foreground">
          Или
          <a href="#" class="font-medium text-primary hover:text-primary/80" @click="showRegister = true">
            создайте новый аккаунт
          </a>
        </p>
      </div>
      
      <!-- Форма входа -->
      <form v-if="!showRegister" class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
          <div>
            <label for="email" class="sr-only">Email</label>
            <input
              id="email"
              v-model="loginForm.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="relative block w-full px-3 py-2 border border-input bg-background placeholder:text-muted-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Email"
            >
          </div>
          <div>
            <label for="password" class="sr-only">Пароль</label>
            <input
              id="password"
              v-model="loginForm.password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="relative block w-full px-3 py-2 border border-input bg-background placeholder:text-muted-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Пароль"
            >
          </div>
        </div>

        <div v-if="error" class="text-destructive text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading">
              <Icon name="Loader" class="animate-spin -ml-1 mr-3 h-5 w-5" />
            </span>
            {{ isLoading ? 'Вход...' : 'Войти' }}
          </button>
        </div>
      </form>

      <!-- Форма регистрации -->
      <form v-else class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <div>
            <label for="name" class="sr-only">Имя</label>
            <input
              id="name"
              v-model="registerForm.name"
              name="name"
              type="text"
              autocomplete="name"
              required
              class="relative block w-full px-3 py-2 border border-input bg-background placeholder:text-muted-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Имя"
            >
          </div>
          <div>
            <label for="register-email" class="sr-only">Email</label>
            <input
              id="register-email"
              v-model="registerForm.email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="relative block w-full px-3 py-2 border border-input bg-background placeholder:text-muted-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Email"
            >
          </div>
          <div>
            <label for="register-password" class="sr-only">Пароль</label>
            <input
              id="register-password"
              v-model="registerForm.password"
              name="password"
              type="password"
              autocomplete="new-password"
              required
              class="relative block w-full px-3 py-2 border border-input bg-background placeholder:text-muted-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Пароль (минимум 6 символов)"
            >
          </div>
        </div>

        <div v-if="error" class="text-destructive text-sm text-center">
          {{ error }}
        </div>

        <div class="flex space-x-3">
          <button
            type="button"
            @click="showRegister = false"
            class="flex-1 py-2 px-4 border border-input text-sm font-medium rounded-md text-foreground bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Назад
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading">
              <Icon name="Loader" class="animate-spin -ml-1 mr-3 h-5 w-5" />
            </span>
            {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Icon from '@/components/ui/Icon.vue'

export default {
  name: 'Login',
  components: {
    Icon
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const showRegister = ref(false)
    const isLoading = ref(false)
    const error = ref('')
    
    const loginForm = ref({
      email: '',
      password: ''
    })
    
    const registerForm = ref({
      name: '',
      email: '',
      password: ''
    })
    
    const handleLogin = async () => {
      isLoading.value = true
      error.value = ''
      
      try {
        // Выполняем вход
        const user = await store.dispatch('user/login', loginForm.value)
        
        console.log('Login response user:', user)
        console.log('User role:', user?.role)
        
        // Проверяем роль и перенаправляем
        if (user?.role === 'admin') {
          console.log('Redirecting to /admin')
          router.push('/admin')
        } else {
          console.log('Redirecting to /')
          router.push('/')
        }
      } catch (err) {
        console.error('Login error:', err)
        error.value = err.message
      } finally {
        isLoading.value = false
      }
    }
    
    const handleRegister = async () => {
      isLoading.value = true
      error.value = ''
      
      try {
        const user = await store.dispatch('user/register', registerForm.value)
        
        if (user?.role === 'admin') {
          router.push('/admin')
        } else {
          router.push('/')
        }
      } catch (err) {
        console.error('Registration error:', err)
        error.value = err.message
      } finally {
        isLoading.value = false
      }
    }
    
    return {
      showRegister,
      isLoading,
      error,
      loginForm,
      registerForm,
      handleLogin,
      handleRegister
    }
  }
}
</script>