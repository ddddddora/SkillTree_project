<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold">Админ панель</h1>
        <p class="text-muted-foreground mt-1">Управление системой SkillTree</p>
      </div>
      <Badge variant="default" class="bg-primary/10 text-primary border-primary/20">
        <Icon name="Shield" :size="14" class="mr-1" />
        {{ userRole }}
      </Badge>
    </div>

    <div class="flex border-b overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap"
        :class="activeTab === tab.id ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'"
        @click="activeTab = tab.id"
      >
        <Icon :name="tab.icon" :size="16" class="inline mr-2" />
        {{ tab.name }}
      </button>
    </div>

    <!-- Конструктор готовых деревьев -->
    <div v-if="activeTab === 'builder'">
      <TreeBuilder />
    </div>

    <!-- Управление пользователями -->
    <div v-if="activeTab === 'users'" class="space-y-4">
      <div class="flex gap-4">
        <div class="flex-1">
          <Input 
            v-model="userSearch" 
            placeholder="Поиск по email или имени..."
            @input="searchUsers"
          />
        </div>
        <Button variant="outline" @click="loadUsers">
          <Icon name="RefreshCw" :size="16" class="mr-2" />
          Обновить
        </Button>
      </div>
      
      <div class="space-y-2">
        <div 
          v-for="user in users" 
          :key="user.id"
          class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-all gap-3"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="User" :size="18" class="text-primary" />
            </div>
            <div>
              <p class="font-medium">{{ user.name }}</p>
              <p class="text-sm text-muted-foreground">{{ user.email }}</p>
              <p class="text-xs text-muted-foreground">ID: {{ user.id }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3 flex-wrap">
            <Badge :variant="user.role === 'admin' ? 'default' : 'secondary'">
              <Icon :name="user.role === 'admin' ? 'Shield' : 'User'" :size="12" class="mr-1" />
              {{ user.role === 'admin' ? 'Администратор' : 'Пользователь' }}
            </Badge>
            
            <div class="flex gap-2">
              <Button 
                v-if="user.role !== 'admin'"
                size="sm"
                variant="outline"
                class="text-green-600 border-green-200 hover:bg-green-50"
                @click="makeAdmin(user.id)"
              >
                <Icon name="Shield" :size="14" class="mr-1" />
                Сделать админом
              </Button>
              <Button 
                v-if="user.role === 'admin' && user.id !== currentUserId"
                size="sm"
                variant="outline"
                class="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                @click="removeAdmin(user.id)"
              >
                <Icon name="UserX" :size="14" class="mr-1" />
                Убрать права
              </Button>
              <Button 
                v-if="user.id !== currentUserId"
                size="sm"
                variant="outline"
                class="text-red-600 border-red-200 hover:bg-red-50"
                @click="deleteUser(user.id)"
              >
                <Icon name="Trash2" :size="14" />
              </Button>
            </div>
          </div>
        </div>
        
        <div v-if="users.length === 0 && !usersLoading" class="text-center py-8 text-muted-foreground">
          Пользователи не найдены
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Icon from '@/components/ui/Icon.vue'
import Input from '@/components/ui/Input.vue'
import TreeBuilder from '@/components/TreeBuilder.vue'

export default {
  name: 'AdminPanel',
  components: { Button, Badge, Icon, Input, TreeBuilder },
  setup() {
    const store = useStore()
    const activeTab = ref('builder')
    const userSearch = ref('')
    const users = ref([])
    const usersLoading = ref(false)
    
    const currentUserId = computed(() => store.state.user.user?.id)
    const userRole = computed(() => store.state.user.user?.role || 'user')
    
    const tabs = [
      { id: 'builder', name: 'Конструктор', icon: 'Hammer' },
      { id: 'users', name: 'Пользователи', icon: 'Users' }
    ]
    
    const loadUsers = async () => {
      usersLoading.value = true
      try {
        const token = localStorage.getItem('skilltree_token')
        const response = await fetch('http://localhost:5000/api/admin/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          users.value = data.users
        }
      } catch (error) {
        console.error('Failed to load users:', error)
      } finally {
        usersLoading.value = false
      }
    }
    
    const searchUsers = async () => {
      if (!userSearch.value) {
        await loadUsers()
        return
      }
      usersLoading.value = true
      try {
        const token = localStorage.getItem('skilltree_token')
        const response = await fetch(`http://localhost:5000/api/admin/users/search?q=${encodeURIComponent(userSearch.value)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          users.value = data.users
        }
      } catch (error) {
        console.error('Failed to search users:', error)
      } finally {
        usersLoading.value = false
      }
    }
    
    const makeAdmin = async (userId) => {
      if (!confirm('Сделать этого пользователя администратором?')) return
      try {
        const token = localStorage.getItem('skilltree_token')
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/make-admin`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          await loadUsers()
          alert('Пользователь назначен администратором')
        }
      } catch (error) {
        console.error('Failed to make admin:', error)
        alert('Ошибка при назначении')
      }
    }
    
    const removeAdmin = async (userId) => {
      if (!confirm('Убрать права администратора?')) return
      try {
        const token = localStorage.getItem('skilltree_token')
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/remove-admin`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          await loadUsers()
          alert('Права администратора сняты')
        }
      } catch (error) {
        console.error('Failed to remove admin:', error)
        alert('Ошибка при снятии прав')
      }
    }
    
    const deleteUser = async (userId) => {
      if (!confirm('Удалить этого пользователя? Все его деревья также будут удалены.')) return
      try {
        const token = localStorage.getItem('skilltree_token')
        const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (response.ok) {
          await loadUsers()
          alert('Пользователь удалён')
        }
      } catch (error) {
        console.error('Failed to delete user:', error)
        alert('Ошибка при удалении')
      }
    }
    
    onMounted(() => {
      loadUsers()
    })
    
    return {
      activeTab,
      tabs,
      userSearch,
      users,
      usersLoading,
      currentUserId,
      userRole,
      loadUsers,
      searchUsers,
      makeAdmin,
      removeAdmin,
      deleteUser
    }
  }
}
</script>