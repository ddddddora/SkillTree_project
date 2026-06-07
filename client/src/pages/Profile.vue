<!-- client/src/pages/Profile.vue -->
<template>
  <div class="min-h-screen bg-background">
    <div class="max-w-6xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <!-- Карточка профиля -->
      <Card class="p-4 sm:p-8">
        <div class="flex flex-col sm:flex-row items-start gap-4 sm:gap-8">
          <div class="relative mx-auto sm:mx-0">
            <div class="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-4 border-primary/20">
              <img 
                v-if="profile.avatar_url" 
                :src="profile.avatar_url" 
                alt="Avatar" 
                class="w-full h-full rounded-full object-cover" 
              />
              <Icon v-else name="User" :size="48" class="text-primary/40 sm:w-16 sm:h-16" />
            </div>
            <Button
              v-if="editing"
              size="sm"
              variant="outline"
              class="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
              @click="handleAvatarChange"
            >
              <Icon name="Camera" :size="16" />
            </Button>
          </div>

          <div class="flex-1">
            <div v-if="editing">
              <div class="space-y-4">
                <div>
                  <Label for="name">Имя</Label>
                  <Input
                    id="name"
                    v-model="editForm.name"
                    name="name"
                    type="text"
                    autocomplete="name"
                    required
                  />
                </div>
                <div>
                  <Label for="email">Email</Label>
                  <Input
                    id="email"
                    v-model="editForm.email"
                    name="email"
                    type="email"
                    autocomplete="email"
                    required
                    disabled
                  />
                </div>
                <div>
                  <Label for="bio">О себе</Label>
                  <Textarea
                    id="bio"
                    v-model="editForm.bio"
                    name="bio"
                    :rows="3"
                    placeholder="Расскажите о себе..."
                  />
                </div>
                <div>
                  <Label for="avatar_url">URL аватара</Label>
                  <Input
                    id="avatar_url"
                    v-model="editForm.avatar_url"
                    name="avatar_url"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>
              <div class="flex flex-col sm:flex-row gap-2 mt-4">
                <Button @click="handleSave" :disabled="isLoading" class="w-full sm:w-auto">
                  <Icon name="Save" :size="16" class="mr-2" />
                  {{ isLoading ? 'Сохранение...' : 'Сохранить' }}
                </Button>
                <Button variant="outline" @click="cancelEdit" class="w-full sm:w-auto" :disabled="isLoading">
                  Отмена
                </Button>
              </div>
            </div>

            <div v-else>
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                <h1 class="text-2xl sm:text-3xl font-bold">{{ profile.name }}</h1>
                <Button @click="startEditing" variant="outline" class="w-full sm:w-auto">
                  <Icon name="Edit" :size="16" class="mr-2" />
                  Редактировать
                </Button>
              </div>
              <p class="text-sm sm:text-base text-muted-foreground mb-2">{{ profile.email }}</p>
              <p class="text-sm sm:text-base text-foreground">{{ profile.bio || 'Нет информации о себе' }}</p>
              
              <div class="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                <Icon name="Calendar" :size="16" />
                <span>Участник с {{ formatDate(profile.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Статистика -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card v-for="(stat, index) in stats" :key="index" class="p-4 sm:p-6">
          <div class="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon :name="stat.icon" :size="20" class="text-primary sm:w-6 sm:h-6" />
            </div>
            <div class="text-center sm:text-left">
              <p class="text-xl sm:text-2xl font-bold">{{ stat.value }}</p>
              <p class="text-xs sm:text-sm text-muted-foreground">{{ stat.label }}</p>
            </div>
          </div>
        </Card>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <!-- Недавняя активность -->
        <Card class="p-4 sm:p-6">
          <h2 class="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="Activity" :size="20" />
            Недавняя активность
          </h2>
          <div class="space-y-4">
            <div v-if="recentActivityLoading" class="text-center py-4">
              <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p class="text-xs text-muted-foreground mt-2">Загрузка активности...</p>
            </div>
            
            <div v-else-if="recentActivity.length === 0" class="text-center py-4">
              <Icon name="Activity" :size="24" class="text-muted-foreground mx-auto mb-2" />
              <p class="text-sm text-muted-foreground">Нет активности</p>
              <p class="text-xs text-muted-foreground mt-1">Начните изучать навыки</p>
            </div>
            
            <div 
              v-else
              v-for="(activity, idx) in recentActivity" 
              :key="idx" 
              class="flex items-start gap-3 pb-4 border-b last:border-0"
            >
              <div :class="`w-8 h-8 rounded-full flex items-center justify-center ${activity.bgColor}`">
                <Icon :name="activity.icon" :size="16" :class="activity.iconColor" />
              </div>
              <div class="flex-1">
                <p class="font-medium text-sm">{{ activity.action }}</p>
                <p class="text-sm text-primary">{{ activity.name }}</p>
                <p class="text-xs text-muted-foreground mt-1">{{ activity.time }}</p>
              </div>
            </div>
          </div>
        </Card>

        <!-- Достижения (исправленные) -->
        <Card class="p-4 sm:p-6">
          <h2 class="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            <Icon name="Award" :size="20" />
            Достижения
          </h2>
          
          <div v-if="achievementsLoading" class="text-center py-8">
            <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p class="text-xs text-muted-foreground mt-2">Загрузка достижений...</p>
          </div>
          
          <div v-else-if="achievements.length === 0" class="text-center py-8">
            <Icon name="Award" :size="32" class="text-muted-foreground mx-auto mb-3" />
            <p class="text-sm text-muted-foreground">Нет достижений</p>
            <p class="text-xs text-muted-foreground mt-1">Продолжайте изучать навыки, чтобы получать достижения</p>
          </div>
          
          <div v-else class="grid grid-cols-1 gap-3">
            <div 
              v-for="(achievement, idx) in achievements" 
              :key="idx" 
              :class="`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                achievement.unlocked 
                  ? 'border-primary/50 bg-primary/5' 
                  : 'border-border bg-muted/20 opacity-70'
              }`"
            >
              <div :class="`w-10 h-10 rounded-full flex items-center justify-center ${
                achievement.unlocked ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`">
                <Icon :name="achievement.icon" :size="20" />
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between flex-wrap gap-2">
                  <h3 class="font-semibold text-sm">{{ achievement.title }}</h3>
                  <Badge 
                    v-if="achievement.unlocked" 
                    variant="default" 
                    class="text-xs bg-primary/80"
                  >
                    <Icon name="Check" :size="10" class="mr-1" />
                    Получено
                  </Badge>
                  <Badge v-else variant="outline" class="text-xs">
                    <Icon name="Clock" :size="10" class="mr-1" />
                    В процессе
                  </Badge>
                </div>
                <p class="text-xs text-muted-foreground mt-1">{{ achievement.description }}</p>
                
                <!-- Прогресс для недостигнутых достижений -->
                <div v-if="!achievement.unlocked && achievement.progress" class="mt-2">
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-muted-foreground">Прогресс</span>
                    <span class="font-medium">{{ achievement.progress.current }}/{{ achievement.progress.total }}</span>
                  </div>
                  <Progress 
                    :value="(achievement.progress.current / achievement.progress.total) * 100" 
                    class="h-1.5"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Icon from '@/components/ui/Icon.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Progress from '@/components/ui/Progress.vue'
import Badge from '@/components/ui/Badge.vue'

export default {
  name: 'Profile',
  components: {
    Card,
    Button,
    Icon,
    Input,
    Label,
    Textarea,
    Progress,
    Badge
  },
  setup() {
    const store = useStore()
    
    const editing = ref(false)
    const isLoading = ref(false)
    const recentActivityLoading = ref(false)
    const achievementsLoading = ref(false)
    const recentActivity = ref([])
    
    const profile = computed(() => store.state.user.user || {})
    const userTrees = computed(() => store.state.tree.userTrees)

    const editForm = ref({
      name: '',
      email: '',
      bio: '',
      avatar_url: ''
    })

    // Статистика для карточек
    const stats = computed(() => {
      const trees = userTrees.value
      
      let totalSkills = 0
      let completedSkills = 0
      
      trees.forEach(tree => {
        totalSkills += Number(tree.node_count) || 0
        completedSkills += Number(tree.completed_count) || 0
      })
      
      let totalProgress = 0
      trees.forEach(tree => {
        totalProgress += safeProgress(tree.progress)
      })
      const overallProgress = trees.length > 0 ? Math.round(totalProgress / trees.length) : 0
      
      return [
        { label: 'Деревьев навыков', value: trees.length, icon: 'TreePine' },
        { label: 'Всего навыков', value: totalSkills, icon: 'Target' },
        { label: 'Усвоено', value: completedSkills, icon: 'CheckCircle2' },
        { label: 'Общий прогресс', value: `${overallProgress}%`, icon: 'TrendingUp' }
      ]
    })

    const safeProgress = (value) => {
      if (value === undefined || value === null) return 0
      const num = Number(value)
      return isNaN(num) ? 0 : Math.min(100, Math.max(0, num))
    }

    // Достижения с правильной логикой
    const achievements = ref([])
    
    const calculateAchievements = () => {
      const trees = userTrees.value
      const userStats = {
        totalTrees: trees.length,
        totalSkills: 0,
        completedSkills: 0,
        activeDays: 0,
        overallProgress: 0,
        completedTrees: 0
      }
      
      // Считаем статистику
      trees.forEach(tree => {
        userStats.totalSkills += Number(tree.node_count) || 0
        userStats.completedSkills += Number(tree.completed_count) || 0
        if (safeProgress(tree.progress) === 100) {
          userStats.completedTrees++
        }
      })
      
      let totalProgress = 0
      trees.forEach(tree => {
        totalProgress += safeProgress(tree.progress)
      })
      userStats.overallProgress = trees.length > 0 ? Math.round(totalProgress / trees.length) : 0
      
      // Активные дни из localStorage
      try {
        const activities = JSON.parse(localStorage.getItem('user_activities') || '[]')
        const uniqueDays = new Set()
        activities.forEach(activity => {
          if (activity.created_at) {
            uniqueDays.add(activity.created_at.split('T')[0])
          }
        })
        userStats.activeDays = uniqueDays.size
      } catch (e) {
        userStats.activeDays = 0
      }
      
      // Определяем достижения
      achievements.value = [
        { 
          id: 'first-tree', 
          title: 'Первые шаги', 
          description: 'Создано первое дерево навыков', 
          icon: 'Rocket',
          unlocked: userStats.totalTrees >= 1,
          progress: { current: Math.min(userStats.totalTrees, 1), total: 1 }
        },
        { 
          id: 'skill-master', 
          title: 'Целеустремленный', 
          description: '10 навыков завершено', 
          icon: 'Target',
          unlocked: userStats.completedSkills >= 10,
          progress: { current: Math.min(userStats.completedSkills, 10), total: 10 }
        },
        { 
          id: 'streak', 
          title: 'Горячая полоса', 
          description: '7 дней подряд активности', 
          icon: 'Flame',
          unlocked: userStats.activeDays >= 7,
          progress: { current: Math.min(userStats.activeDays, 7), total: 7 }
        },
        { 
          id: 'progress-master', 
          title: 'Мастер', 
          description: '50% общего прогресса', 
          icon: 'Star',
          unlocked: userStats.overallProgress >= 50,
          progress: { current: userStats.overallProgress, total: 100 }
        },
        { 
          id: 'tree-completer', 
          title: 'Завершитель', 
          description: 'Завершено хотя бы одно дерево', 
          icon: 'CheckCircle',
          unlocked: userStats.completedTrees >= 1,
          progress: { current: Math.min(userStats.completedTrees, 1), total: 1 }
        }
      ]
    }

    // Функция для загрузки реальной активности
    const loadRecentActivity = async () => {
      recentActivityLoading.value = true
      try {
        const token = localStorage.getItem('skilltree_token')
        if (!token) {
          recentActivity.value = getDemoActivity()
          return
        }

        const response = await fetch('http://localhost:5000/api/users/activity', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          const latestActivities = (data.activities || []).slice(0, 3)
          
          if (latestActivities.length > 0) {
            recentActivity.value = latestActivities.map(activity => ({
              action: getActivityLabel(activity.action_type),
              name: activity.node_name || activity.tree_name || 'Дерево навыков',
              time: formatRelativeTime(activity.created_at),
              icon: getActivityIcon(activity.action_type),
              bgColor: getActivityBgColor(activity.action_type),
              iconColor: getActivityIconColor(activity.action_type)
            }))
          } else {
            recentActivity.value = getDemoActivity()
          }
        } else {
          recentActivity.value = getDemoActivity()
        }
      } catch (error) {
        console.error('Failed to load recent activity:', error)
        recentActivity.value = getDemoActivity()
      } finally {
        recentActivityLoading.value = false
      }
    }

    const getActivityLabel = (actionType) => {
      const labels = {
        'create_tree': 'Создано дерево',
        'update_tree': 'Обновлено дерево',
        'create_node': 'Добавлен навык',
        'update_node': 'Обновлен навык',
        'complete_skill': 'Завершен навык',
        'start_learning': 'Начато изучение',
        'delete_tree': 'Удалено дерево',
        'delete_node': 'Удален навык'
      }
      return labels[actionType] || 'Новая активность'
    }

    const getActivityIcon = (actionType) => {
      const icons = {
        'create_tree': 'Plus',
        'update_tree': 'Edit',
        'create_node': 'Target',
        'update_node': 'Edit',
        'complete_skill': 'CheckCircle2',
        'start_learning': 'Play',
        'delete_tree': 'Trash2',
        'delete_node': 'Trash2'
      }
      return icons[actionType] || 'Activity'
    }

    const getActivityBgColor = (actionType) => {
      const colors = {
        'create_tree': 'bg-primary/10',
        'update_tree': 'bg-accent/10',
        'create_node': 'bg-secondary/10',
        'update_node': 'bg-accent/10',
        'complete_skill': 'bg-secondary/10',
        'start_learning': 'bg-primary/10',
        'delete_tree': 'bg-destructive/10',
        'delete_node': 'bg-destructive/10'
      }
      return colors[actionType] || 'bg-muted'
    }

    const getActivityIconColor = (actionType) => {
      const colors = {
        'create_tree': 'text-primary',
        'update_tree': 'text-accent-foreground',
        'create_node': 'text-secondary-foreground',
        'update_node': 'text-accent-foreground',
        'complete_skill': 'text-secondary-foreground',
        'start_learning': 'text-primary',
        'delete_tree': 'text-destructive',
        'delete_node': 'text-destructive'
      }
      return colors[actionType] || 'text-muted-foreground'
    }

    const getDemoActivity = () => {
      return [
        { 
          action: 'Завершен навык', 
          name: 'React Hooks', 
          time: '2 часа назад', 
          icon: 'CheckCircle2', 
          bgColor: 'bg-secondary/10', 
          iconColor: 'text-secondary-foreground' 
        },
        { 
          action: 'Создано дерево', 
          name: 'Fullstack разработка', 
          time: '1 день назад', 
          icon: 'Plus', 
          bgColor: 'bg-primary/10', 
          iconColor: 'text-primary' 
        },
        { 
          action: 'Начато изучение', 
          name: 'TypeScript Advanced', 
          time: '2 дня назад', 
          icon: 'Play', 
          bgColor: 'bg-accent/10', 
          iconColor: 'text-accent-foreground' 
        },
      ]
    }

    const formatRelativeTime = (dateString) => {
      if (!dateString) return 'Неизвестно'
      
      try {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now - date
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)
        
        if (diffMins < 1) return 'только что'
        if (diffMins < 60) return `${diffMins} мин назад`
        if (diffHours < 24) return `${diffHours} ч назад`
        if (diffDays < 7) return `${diffDays} дн назад`
        
        return new Intl.DateTimeFormat('ru-RU', {
          day: 'numeric',
          month: 'short'
        }).format(date)
      } catch (error) {
        return 'Неизвестно'
      }
    }

    const loadUserData = async () => {
      achievementsLoading.value = true
      try {
        await store.dispatch('tree/loadUserTrees')
        calculateAchievements()
        await loadRecentActivity()
      } catch (error) {
        console.error('Failed to load user data:', error)
      } finally {
        achievementsLoading.value = false
      }
    }

    onMounted(() => {
      loadUserData()
    })

    const startEditing = () => {
      editForm.value = { ...profile.value }
      editing.value = true
    }

    const cancelEdit = () => {
      editing.value = false
      editForm.value = {
        name: '',
        email: '',
        bio: '',
        avatar_url: ''
      }
    }

    const handleSave = async () => {
      isLoading.value = true
      try {
        await store.dispatch('user/updateProfile', editForm.value)
        editing.value = false
      } catch (error) {
        console.error('Failed to update profile:', error)
        alert('Ошибка при сохранении профиля')
      } finally {
        isLoading.value = false
      }
    }

    const handleAvatarChange = () => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e) => {
        const file = e.target.files[0]
        if (file) {
          console.log('Selected file:', file)
        }
      }
      input.click()
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'Неизвестно'
      return new Intl.DateTimeFormat('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(new Date(dateString))
    }

    return {
      editing,
      isLoading,
      recentActivityLoading,
      achievementsLoading,
      profile,
      editForm,
      stats,
      recentActivity,
      achievements,
      startEditing,
      cancelEdit,
      handleSave,
      handleAvatarChange,
      formatDate
    }
  }
}
</script>