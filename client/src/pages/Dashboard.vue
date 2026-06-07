<!-- client/src/pages/Dashboard.vue -->
<template>
  <div class="space-y-6 animate-fade-in">
    <!-- Заголовок и кнопка -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p class="text-muted-foreground mt-1 text-sm sm:text-base">Обзор вашего прогресса в обучении</p>
      </div>
      <Button class="bg-primary w-full sm:w-auto" @click="navigateToBuilder">
        <Icon name="Plus" :size="18" class="mr-2" />
        Создать новое дерево
      </Button>
    </div>

    <!-- Статистика -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card v-for="(stat, idx) in stats" :key="idx">
        <CardContent class="pt-4 sm:pt-6">
          <div class="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-2">
            <div>
              <p class="text-xs sm:text-sm text-muted-foreground">{{ stat.label }}</p>
              <p class="text-2xl sm:text-3xl font-bold mt-1">{{ stat.value }}</p>
            </div>
            <div :class="`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${stat.color} flex items-center justify-center`">
              <Icon :name="stat.icon" :size="20" class="sm:hidden" />
              <Icon :name="stat.icon" :size="24" class="hidden sm:block" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Основной контент -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Ваши деревья навыков -->
        <div class="space-y-4">
          <h2 class="text-xl font-semibold">Ваши деревья навыков</h2>
          
          <div v-if="isLoading" class="flex justify-center py-8">
            <div class="text-center">
              <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p class="text-muted-foreground text-sm">Загрузка деревьев...</p>
            </div>
          </div>

          <div v-else-if="userTrees.length === 0" class="text-center py-12">
            <div class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Icon name="TreePine" :size="40" class="text-primary" />
            </div>
            <h3 class="text-lg font-semibold mb-2">Нет деревьев навыков</h3>
            <p class="text-muted-foreground mb-4">Создайте первое дерево, чтобы начать отслеживать свой прогресс</p>
            <Button @click="navigateToBuilder">
              <Icon name="Plus" :size="16" class="mr-2" />
              Создать дерево
            </Button>
          </div>

          <Card 
            v-for="tree in userTrees" 
            :key="tree.id" 
            class="hover:shadow-lg transition-all cursor-pointer" 
            @click="navigateToTree(tree.id)"
          >
            <CardHeader>
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <CardTitle class="text-lg">{{ tree.name }}</CardTitle>
                  <CardDescription class="mt-1">{{ tree.description || 'Без описания' }}</CardDescription>
                </div>
                <Badge variant="outline" :style="{ borderColor: getProgressColor(tree.progress), color: getProgressColor(tree.progress) }">
                  {{ safeProgress(tree.progress) }}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent class="space-y-4">
              <Progress :value="safeProgress(tree.progress)" class="h-2" />
              
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs sm:text-sm gap-2">
                <div class="flex items-center gap-3 sm:gap-4">
                  <div class="flex items-center gap-1">
                    <Icon name="Boxes" :size="14" class="text-blue-600 sm:w-4 sm:h-4" />
                    <span>{{ formatNumber(tree.node_count) }} узлов</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <Icon name="CheckCircle2" :size="14" class="text-green-600 sm:w-4 sm:h-4" />
                    <span>{{ formatNumber(tree.completed_count) }} завершено</span>
                  </div>
                </div>
                <span class="text-muted-foreground text-xs">{{ formatRelativeTime(tree.updated_at) }}</span>
              </div>

              <div class="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  class="flex-1" 
                  @click.stop="navigateToTree(tree.id)"
                >
                  <Icon name="Edit" :size="14" class="mr-2" />
                  Редактировать
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  class="flex-1" 
                  @click.stop="navigateToStatistics"
                >
                  <Icon name="BarChart3" :size="14" class="mr-2" />
                  Статистика
                </Button>
              </div>
            </CardContent>
          </Card>

          <Button v-if="userTrees.length > 0" variant="outline" class="w-full" @click="navigateToBuilder">
            <Icon name="Plus" :size="16" class="mr-2" />
            Создать новое дерево
          </Button>
        </div>
      </div>

      <!-- Боковая панель -->
      <div class="space-y-6">
        <ActivityCalendar />
        
        <!-- Блок дедлайнов -->
        <Card>
          <CardHeader>
            <CardTitle class="text-lg flex items-center gap-2">
              <Icon name="Calendar" :size="20" />
              Приближающиеся дедлайны
            </CardTitle>
            <CardDescription>Навыки и разделы, которые требуют внимания</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <div v-if="deadlinesLoading" class="text-center py-4">
              <div class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p class="text-xs text-muted-foreground mt-2">Загрузка дедлайнов...</p>
            </div>
            
            <div v-else-if="upcomingDeadlines.length === 0 && overdueDeadlines.length === 0" class="text-center py-6">
              <Icon name="CalendarCheck" :size="32" class="text-muted-foreground mx-auto mb-2" />
              <p class="text-sm text-muted-foreground">Нет активных дедлайнов</p>
              <p class="text-xs text-muted-foreground mt-1">Установите дедлайны для навыков и разделов</p>
            </div>
            
            <div 
              v-else
              v-for="deadline in upcomingDeadlines" 
              :key="deadline.id" 
              class="flex items-start gap-3 p-3 rounded-lg transition-all cursor-pointer hover:shadow-sm"
              :class="getDeadlineCardClass(deadline.daysLeft)"
              @click="navigateToDeadline(deadline)"
            >
              <div :class="`w-10 h-10 rounded-full flex items-center justify-center ${getDeadlineIconBgClass(deadline.daysLeft)}`">
                <Icon :name="getDeadlineIcon(deadline.daysLeft)" :size="18" :class="getDeadlineIconClass(deadline.daysLeft)" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between flex-wrap gap-1">
                  <p class="font-medium text-sm truncate">{{ deadline.name }}</p>
                  <Badge :variant="getDeadlineBadgeVariant(deadline.daysLeft)" class="text-xs">
                    {{ getDeadlineLabel(deadline.daysLeft) }}
                  </Badge>
                </div>
                <p class="text-xs text-muted-foreground mt-1">{{ deadline.tree_name }}</p>
                <p class="text-xs mt-1" :class="getDeadlineTextClass(deadline.daysLeft)">
                  <Icon :name="deadline.daysLeft < 0 ? 'AlertCircle' : 'Clock'" :size="10" class="inline mr-1" />
                  {{ getDeadlineMessage(deadline.daysLeft, deadline.deadline) }}
                </p>
              </div>
            </div>
            
            <div v-if="overdueDeadlines.length > 0" class="pt-3 border-t">
              <details class="text-xs">
                <summary class="cursor-pointer text-muted-foreground hover:text-foreground">
                  Просроченные дедлайны ({{ overdueDeadlines.length }})
                </summary>
                <div class="mt-2 space-y-2">
                  <div 
                    v-for="deadline in overdueDeadlines" 
                    :key="deadline.id" 
                    class="flex items-center gap-3 p-2 rounded-lg bg-red-50/50"
                  >
                    <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <Icon name="AlertTriangle" :size="14" class="text-red-500" />
                    </div>
                    <div class="flex-1">
                      <p class="font-medium text-xs">{{ deadline.name }}</p>
                      <p class="text-xs text-muted-foreground">{{ deadline.tree_name }}</p>
                    </div>
                    <Badge variant="destructive" class="text-xs">
                      просрочен
                    </Badge>
                  </div>
                </div>
              </details>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-lg flex items-center gap-2">
              <Icon name="Activity" :size="20" />
              Недавняя активность
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
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
          </CardContent>
        </Card>

        <Card class="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle class="text-lg flex items-center gap-2">
              <Icon name="TrendingUp" :size="20" />
              Прогресс
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span>Общий прогресс:</span>
                <span class="font-semibold">{{ userStats.overallProgress }}%</span>
              </div>
              <div class="flex justify-between text-sm">
                <span>Активных деревьев:</span>
                <span class="font-semibold">{{ userStats.inProgressTrees }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span>Всего навыков:</span>
                <span class="font-semibold">{{ formatNumber(userStats.totalSkills) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span>Усвоено навыков:</span>
                <span class="font-semibold">{{ formatNumber(userStats.completedSkills) }}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Progress from '@/components/ui/Progress.vue'
import Icon from '@/components/ui/Icon.vue'
import ActivityCalendar from '@/components/ActivityCalendar.vue'

export default {
  name: 'Dashboard',
  components: {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Button,
    Badge,
    Progress,
    Icon,
    ActivityCalendar
  },
  setup() {
    const router = useRouter()
    const store = useStore()
    
    const recentActivityLoading = ref(false)
    const recentActivity = ref([])
    const deadlinesLoading = ref(false)
    const upcomingDeadlines = ref([])
    const overdueDeadlines = ref([])

    const userTrees = computed(() => store.state.tree.userTrees || [])
    const isLoadingTrees = computed(() => store.state.tree.isLoading)

    // Безопасное получение прогресса
    const safeProgress = (value) => {
      if (value === undefined || value === null) return 0
      const num = Number(value)
      return isNaN(num) ? 0 : Math.min(100, Math.max(0, num))
    }

    // Форматирование чисел
    const formatNumber = (value) => {
      if (value === undefined || value === null) return '0'
      const num = Number(value)
      return isNaN(num) ? '0' : num.toString()
    }

    // Расчет статистики пользователя
    const userStats = computed(() => {
      const trees = userTrees.value
      if (!trees || trees.length === 0) {
        return {
          totalTrees: 0,
          totalSkills: 0,
          completedSkills: 0,
          overallProgress: 0,
          inProgressTrees: 0,
          completedTrees: 0
        }
      }
      
      const totalSkills = trees.reduce((sum, tree) => sum + (Number(tree.node_count) || 0), 0)
      const completedSkills = trees.reduce((sum, tree) => sum + (Number(tree.completed_count) || 0), 0)
      
      // Расчет общего прогресса
      let totalProgress = 0
      let treesWithProgress = 0
      trees.forEach(tree => {
        const progress = safeProgress(tree.progress)
        totalProgress += progress
        treesWithProgress++
      })
      const overallProgress = treesWithProgress > 0 ? Math.round(totalProgress / treesWithProgress) : 0
      
      const inProgressTrees = trees.filter(tree => {
        const progress = safeProgress(tree.progress)
        return progress > 0 && progress < 100
      }).length
      
      const completedTrees = trees.filter(tree => safeProgress(tree.progress) === 100).length
      
      return {
        totalTrees: trees.length,
        totalSkills,
        completedSkills,
        overallProgress,
        inProgressTrees,
        completedTrees
      }
    })

    // Статистика для карточек
    const stats = computed(() => [
      { 
        label: 'Деревьев навыков', 
        value: userStats.value.totalTrees, 
        icon: 'TreePine', 
        color: 'bg-blue-100' 
      },
      { 
        label: 'Всего навыков', 
        value: formatNumber(userStats.value.totalSkills), 
        icon: 'Target', 
        color: 'bg-green-100' 
      },
      { 
        label: 'Усвоено', 
        value: formatNumber(userStats.value.completedSkills), 
        icon: 'CheckCircle2', 
        color: 'bg-yellow-100' 
      },
      { 
        label: 'Общий прогресс', 
        value: `${userStats.value.overallProgress}%`, 
        icon: 'TrendingUp', 
        color: 'bg-purple-100' 
      }
    ])

    const getProgressColor = (progress) => {
      const p = safeProgress(progress)
      if (p >= 80) return '#10b981'
      if (p >= 50) return '#f59e0b'
      return '#ef4444'
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
        'create_tree': 'bg-blue-100',
        'update_tree': 'bg-yellow-100',
        'create_node': 'bg-green-100',
        'update_node': 'bg-yellow-100',
        'complete_skill': 'bg-green-100',
        'start_learning': 'bg-purple-100',
        'delete_tree': 'bg-red-100',
        'delete_node': 'bg-red-100'
      }
      return colors[actionType] || 'bg-gray-100'
    }

    const getActivityIconColor = (actionType) => {
      const colors = {
        'create_tree': 'text-blue-600',
        'update_tree': 'text-yellow-600',
        'create_node': 'text-green-600',
        'update_node': 'text-yellow-600',
        'complete_skill': 'text-green-600',
        'start_learning': 'text-purple-600',
        'delete_tree': 'text-red-600',
        'delete_node': 'text-red-600'
      }
      return colors[actionType] || 'text-gray-600'
    }

    const getDemoActivity = () => {
      return [
        { 
          action: 'Завершен навык', 
          name: 'React Hooks', 
          time: '2 часа назад', 
          icon: 'CheckCircle2', 
          bgColor: 'bg-green-100', 
          iconColor: 'text-green-600' 
        },
        { 
          action: 'Создано дерево', 
          name: 'Fullstack разработка', 
          time: '1 день назад', 
          icon: 'Plus', 
          bgColor: 'bg-blue-100', 
          iconColor: 'text-blue-600' 
        },
        { 
          action: 'Начато изучение', 
          name: 'TypeScript Advanced', 
          time: '2 дня назад', 
          icon: 'Play', 
          bgColor: 'bg-yellow-100', 
          iconColor: 'text-yellow-600' 
        },
      ]
    }

    // Дедлайн функции
    const getDaysUntilDeadline = (deadlineDate) => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const deadline = new Date(deadlineDate)
      deadline.setHours(0, 0, 0, 0)
      const diffTime = deadline - today
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const loadDeadlines = async () => {
      deadlinesLoading.value = true
      try {
        const token = localStorage.getItem('skilltree_token')
        const response = await fetch('http://localhost:5000/api/users/deadlines', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          const allDeadlines = data.deadlines || []
          
          const deadlinesWithDays = allDeadlines.map(d => ({
            ...d,
            daysLeft: getDaysUntilDeadline(d.deadline)
          }))
          
          upcomingDeadlines.value = deadlinesWithDays
            .filter(d => d.daysLeft >= 0 && d.daysLeft <= 7)
            .sort((a, b) => a.daysLeft - b.daysLeft)
          
          overdueDeadlines.value = deadlinesWithDays
            .filter(d => d.daysLeft < 0)
            .sort((a, b) => b.daysLeft - a.daysLeft)
        }
      } catch (error) {
        console.error('Failed to load deadlines:', error)
      } finally {
        deadlinesLoading.value = false
      }
    }

    const getDeadlineCardClass = (daysLeft) => {
      if (daysLeft < 0) return 'bg-red-50 border border-red-200'
      if (daysLeft === 0) return 'bg-red-100 border border-red-300 shadow-sm'
      if (daysLeft <= 2) return 'bg-orange-50 border border-orange-200'
      if (daysLeft <= 5) return 'bg-yellow-50 border border-yellow-200'
      return 'bg-blue-50 border border-blue-100'
    }

    const getDeadlineIconBgClass = (daysLeft) => {
      if (daysLeft < 0) return 'bg-red-200'
      if (daysLeft === 0) return 'bg-red-300'
      if (daysLeft <= 2) return 'bg-orange-200'
      if (daysLeft <= 5) return 'bg-yellow-200'
      return 'bg-blue-200'
    }

    const getDeadlineIcon = (daysLeft) => {
      if (daysLeft < 0) return 'AlertTriangle'
      if (daysLeft === 0) return 'AlarmClock'
      if (daysLeft <= 3) return 'Clock'
      return 'Calendar'
    }

    const getDeadlineIconClass = (daysLeft) => {
      if (daysLeft < 0) return 'text-red-600'
      if (daysLeft === 0) return 'text-red-700'
      if (daysLeft <= 3) return 'text-orange-600'
      return 'text-blue-600'
    }

    const getDeadlineBadgeVariant = (daysLeft) => {
      if (daysLeft < 0) return 'destructive'
      if (daysLeft === 0) return 'destructive'
      if (daysLeft <= 2) return 'default'
      if (daysLeft <= 5) return 'secondary'
      return 'outline'
    }

    const getDeadlineLabel = (daysLeft) => {
      if (daysLeft < 0) return 'Просрочен'
      if (daysLeft === 0) return 'Сегодня!'
      if (daysLeft === 1) return 'Завтра'
      if (daysLeft <= 3) return 'Скоро'
      return 'В процессе'
    }

    const getDeadlineTextClass = (daysLeft) => {
      if (daysLeft < 0) return 'text-red-600'
      if (daysLeft === 0) return 'text-red-700 font-medium'
      if (daysLeft <= 2) return 'text-orange-600'
      return 'text-muted-foreground'
    }

    const getDeadlineMessage = (daysLeft, deadline) => {
      if (daysLeft < 0) return `Просрочен на ${Math.abs(daysLeft)} дн.`
      if (daysLeft === 0) return 'Дедлайн сегодня!'
      if (daysLeft === 1) return 'Дедлайн завтра!'
      if (daysLeft <= 3) return `Осталось ${daysLeft} дня`
      return `До дедлайна ${daysLeft} дней`
    }

    const navigateToDeadline = (deadline) => {
      router.push(`/builder?tree=${deadline.tree_id}&node=${deadline.id}`)
    }

    const loadTrees = async () => {
      try {
        await store.dispatch('tree/loadUserTrees')
      } catch (error) {
        console.error('Failed to load trees:', error)
      }
    }

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

    const navigateToBuilder = () => {
      router.push('/builder')
    }

    const navigateToTree = (treeId) => {
      router.push(`/builder?tree=${treeId}`)
    }

    const navigateToStatistics = () => {
      router.push('/statistics')
    }

    onMounted(() => {
      loadTrees()
      loadRecentActivity()
      loadDeadlines()
    })

    return {
      userTrees,
      stats,
      userStats,
      recentActivity,
      recentActivityLoading,
      deadlinesLoading,
      upcomingDeadlines,
      overdueDeadlines,
      isLoading: isLoadingTrees,
      safeProgress,
      formatNumber,
      getProgressColor,
      formatRelativeTime,
      getDeadlineCardClass,
      getDeadlineIconBgClass,
      getDeadlineIcon,
      getDeadlineIconClass,
      getDeadlineBadgeVariant,
      getDeadlineLabel,
      getDeadlineTextClass,
      getDeadlineMessage,
      navigateToBuilder,
      navigateToTree,
      navigateToStatistics,
      navigateToDeadline
    }
  }
}
</script>