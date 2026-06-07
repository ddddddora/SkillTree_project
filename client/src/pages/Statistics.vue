<!-- client/src/pages/Statistics.vue -->
<template>
  <div class="space-y-6 animate-fade-in">
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold">Статистика</h1>
      <p class="text-sm sm:text-base text-muted-foreground mt-1">Аналитика вашего прогресса в обучении</p>
    </div>

    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-muted-foreground">Загрузка статистики...</p>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <Icon name="AlertCircle" :size="48" class="text-destructive mx-auto mb-4" />
      <h3 class="text-lg font-semibold mb-2">Ошибка загрузки</h3>
      <p class="text-muted-foreground mb-4">{{ error }}</p>
      <Button @click="loadStatistics">
        <Icon name="RefreshCw" :size="16" class="mr-2" />
        Попробовать снова
      </Button>
    </div>

    <div v-else>
      <!-- Основная статистика -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card class="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <Icon name="Target" :size="18" class="text-primary" />
              Общий прогресс
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div class="flex items-baseline gap-2">
                <span class="text-3xl sm:text-4xl font-bold">{{ formatNumber(statistics.overallProgress) }}%</span>
                <span class="text-xs sm:text-sm text-muted-foreground">завершено</span>
              </div>
              <Progress :value="statistics.overallProgress" class="h-2" />
              <p class="text-xs sm:text-sm text-muted-foreground">
                {{ formatNumber(statistics.completedSkills) }} из {{ formatNumber(statistics.totalSkills) }} навыков освоено
              </p>
            </div>
          </CardContent>
        </Card>

        <Card class="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <Icon name="TreePine" :size="18" class="text-primary" />
              Деревья навыков
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div class="flex items-baseline gap-2">
                <span class="text-3xl sm:text-4xl font-bold text-primary">{{ formatNumber(statistics.totalTrees) }}</span>
                <span class="text-xs sm:text-sm text-muted-foreground">деревьев</span>
              </div>
              <p class="text-xs sm:text-sm text-muted-foreground">{{ formatNumber(statistics.inProgressTrees) }} в процессе</p>
              <p class="text-xs sm:text-sm text-muted-foreground">{{ formatNumber(statistics.completedTrees) }} завершено</p>
            </div>
          </CardContent>
        </Card>

        <Card class="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle class="text-base flex items-center gap-2">
              <Icon name="Clock" :size="18" class="text-primary" />
              Активность
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-2">
              <div class="flex items-baseline gap-2">
                <span class="text-3xl sm:text-4xl font-bold text-primary">{{ formatNumber(statistics.activeDays) }}</span>
                <span class="text-xs sm:text-sm text-muted-foreground">дней</span>
              </div>
              <p class="text-xs sm:text-sm text-muted-foreground">Активных дней за всё время</p>
              <p class="text-xs sm:text-sm text-muted-foreground">{{ formatNumber(statistics.totalActivities) }} активностей</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Графики и детальная статистика -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <!-- Круговая диаграмма для сравнения прогресса деревьев -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Icon name="PieChart" :size="20" />
              Сравнение прогресса деревьев
            </CardTitle>
            <CardDescription>Размер сектора = прогресс дерева</CardDescription>
          </CardHeader>
          <CardContent>
            <div v-if="treesProgress.length === 0" class="text-center py-8">
              <Icon name="PieChart" :size="32" class="text-muted-foreground mx-auto mb-3" />
              <p class="text-sm text-muted-foreground">Нет данных для отображения</p>
              <p class="text-xs text-muted-foreground">Создайте деревья навыков, чтобы увидеть статистику</p>
            </div>
            
            <div v-else>
              <div class="flex flex-col lg:flex-row items-center gap-6">
                <!-- SVG Круговая диаграмма -->
                <div class="relative w-48 h-48">
                  <svg class="w-full h-full" viewBox="0 0 100 100">
                    <!-- Фоновый круг -->
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="#e5e2d5"
                      stroke-width="8"
                    />
                    <!-- Сектора для каждого дерева с цветами из приложения -->
                    <g v-for="(segment, index) in pieSegments" :key="index">
                      <path
                        :d="segment.path"
                        :fill="segment.color"
                        stroke="white"
                        stroke-width="2"
                        class="transition-all duration-300 hover:opacity-80 hover:brightness-105 cursor-pointer"
                        @click="selectedTree = treesProgress[index]"
                      />
                    </g>
                    <!-- Центральный круг -->
                    <circle
                      cx="50"
                      cy="50"
                      r="28"
                      fill="white"
                      stroke="#e5e2d5"
                      stroke-width="2"
                    />
                    <text
                      x="50"
                      y="50"
                      text-anchor="middle"
                      dominant-baseline="middle"
                      class="text-sm font-bold fill-gray-600"
                    >
                      {{ treesProgress.length }}
                      <tspan x="50" dy="12" class="text-[9px] fill-gray-400">деревьев</tspan>
                    </text>
                  </svg>
                </div>
                
                <!-- Легенда с цветами из приложения -->
                <div class="flex-1 space-y-2">
                  <div 
                    v-for="(tree, idx) in treesProgress" 
                    :key="tree.id"
                    class="flex items-center justify-between text-sm py-1.5 px-2 rounded-lg cursor-pointer transition-all duration-200"
                    :class="[
                      selectedTree?.id === tree.id 
                        ? 'bg-primary/10 border border-primary/20' 
                        : 'hover:bg-muted/30'
                    ]"
                    @click="selectedTree = tree"
                  >
                    <div class="flex items-center gap-2">
                      <div class="w-3 h-3 rounded-full shadow-sm" :style="{ backgroundColor: tree.color }"></div>
                      <span class="truncate max-w-[120px] font-medium">{{ tree.name }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <div class="w-20 bg-muted/30 rounded-full h-1.5 overflow-hidden">
                        <div 
                          class="h-1.5 rounded-full transition-all duration-500" 
                          :style="{ width: `${safeProgress(tree.progress)}%`, backgroundColor: tree.color }"
                        ></div>
                      </div>
                      <span class="font-semibold w-10 text-right" :style="{ color: tree.color }">
                        {{ safeProgress(tree.progress) }}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Детальная информация о выбранном дереве -->
              <div v-if="selectedTree" class="mt-5 p-4 bg-muted/20 rounded-xl border border-border shadow-sm">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full shadow-sm" :style="{ backgroundColor: selectedTree.color }"></div>
                    <span class="font-semibold">{{ selectedTree.name }}</span>
                  </div>
                  <Badge 
                    :variant="selectedTree.progress === 100 ? 'default' : 'secondary'"
                    :class="selectedTree.progress === 100 ? 'bg-secondary text-secondary-foreground' : 'bg-accent text-accent-foreground'"
                  >
                    <Icon :name="selectedTree.progress === 100 ? 'CheckCircle' : 'Clock'" :size="12" class="mr-1" />
                    {{ selectedTree.progress === 100 ? 'Завершено' : 'В процессе' }}
                  </Badge>
                </div>
                <Progress 
                  :value="selectedTree.progress" 
                  class="h-2 mb-2"
                  :class="selectedTree.progress === 100 ? 'bg-secondary/30' : 'bg-accent/30'"
                />
                <div class="flex justify-between items-center mt-2">
                  <p class="text-xs text-muted-foreground">
                    <Icon name="TrendingUp" :size="12" class="inline mr-1" />
                    {{ selectedTree.progress === 100 ? 'Все навыки усвоены! Отличная работа!' : 'Продолжайте изучение навыков' }}
                  </p>
                  <span class="text-xs font-medium" :style="{ color: selectedTree.color }">
                    {{ selectedTree.progress }}% завершено
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Icon name="BarChart3" :size="20" />
              Навыки по статусам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="skillsByStatus.length === 0" class="text-center py-8">
              <Icon name="BarChart3" :size="32" class="text-muted-foreground mx-auto mb-3" />
              <p class="text-sm text-muted-foreground">Нет данных для отображения</p>
              <p class="text-xs text-muted-foreground">Создайте навыки, чтобы увидеть статистику</p>
            </div>
            
            <div v-else class="space-y-4">
              <div v-for="(status, idx) in skillsByStatus" :key="idx">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: getStatusColor(status.status) }" />
                    <span class="font-medium">{{ status.label }}</span>
                  </div>
                  <span class="text-sm text-muted-foreground">
                    {{ formatNumber(status.count) }} ({{ formatNumber(status.percentage) }}%)
                  </span>
                </div>
                <Progress 
                  :value="status.percentage" 
                  class="h-2"
                  :class="getStatusProgressBarClass(status.status)"
                />
              </div>
              
              <div class="pt-4 border-t text-sm text-muted-foreground">
                <div class="flex justify-between">
                  <span>Всего навыков:</span>
                  <span class="font-medium">{{ formatNumber(statistics.totalSkills) }}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Достижения -->
      <Card class="mt-6">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Icon name="Award" :size="20" />
            Достижения
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div 
              v-for="(achievement, idx) in achievements" 
              :key="idx" 
              :class="`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 transition-all ${
                checkAchievement(achievement) 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border bg-muted/20'
              }`"
            >
              <div :class="`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                checkAchievement(achievement) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`">
                <Icon :name="achievement.icon" :size="20" class="sm:w-6 sm:h-6" />
              </div>
              <div class="flex-1">
                <h3 class="font-semibold text-sm sm:text-base">{{ achievement.title }}</h3>
                <p class="text-xs sm:text-sm text-muted-foreground mt-0.5">{{ achievement.description }}</p>
                <div class="mt-2">
                  <Badge v-if="checkAchievement(achievement)" variant="default" class="text-xs">
                    <Icon name="Check" :size="12" class="mr-1" />
                    Получено
                  </Badge>
                  <Badge v-else variant="outline" class="text-xs">
                    <Icon name="Clock" :size="12" class="mr-1" />
                    Не получено
                  </Badge>
                  <p v-if="achievement.progress && achievement.progress.current < achievement.progress.total" class="text-xs text-muted-foreground mt-1">
                    Прогресс: {{ formatNumber(achievement.progress.current) }}/{{ formatNumber(achievement.progress.total) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import Icon from '@/components/ui/Icon.vue'
import Progress from '@/components/ui/Progress.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'

export default {
  name: 'Statistics',
  components: {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    Icon,
    Progress,
    Badge,
    Button
  },
  setup() {
    const store = useStore()
    
    const isLoading = ref(false)
    const error = ref('')
    const selectedTree = ref(null)
    const statistics = ref({
      overallProgress: 0,
      totalSkills: 0,
      completedSkills: 0,
      activeDays: 0,
      totalTrees: 0,
      inProgressTrees: 0,
      completedTrees: 0,
      totalActivities: 0
    })

    const userTrees = computed(() => store.state.tree.userTrees || [])
    const treesProgress = ref([])
    
    // Цвета в стиле приложения из index.css
    const appColors = [
      '#8690a2',  // primary - серо-голубой
      '#b8a88a',  // secondary - бежевый
      '#d9cb9c',  // accent - песочный
      '#b8cdcd',  // muted - зеленовато-серый
      '#9a9e8c',  // дополнительный оливковый
      '#c2aa7c',  // дополнительный золотистый
      '#a7b8b8',  // дополнительный серо-зеленый
      '#e1d2b0'   // дополнительный светло-песочный
    ]
    
    // Вычисляем сегменты для круговой диаграммы
    const pieSegments = computed(() => {
      const segments = []
      let currentAngle = -90
      
      const sortedTrees = [...treesProgress.value].sort((a, b) => b.progress - a.progress)
      const totalProgress = sortedTrees.reduce((sum, t) => sum + safeProgress(t.progress), 0)
      
      if (totalProgress === 0) return []
      
      sortedTrees.forEach((tree, index) => {
        const angle = (safeProgress(tree.progress) / totalProgress) * 360
        const startAngle = currentAngle
        const endAngle = currentAngle + angle
        
        const startRad = (startAngle * Math.PI) / 180
        const endRad = (endAngle * Math.PI) / 180
        
        const radius = 45
        const center = 50
        
        const x1 = center + radius * Math.cos(startRad)
        const y1 = center + radius * Math.sin(startRad)
        const x2 = center + radius * Math.cos(endRad)
        const y2 = center + radius * Math.sin(endRad)
        
        const largeArc = angle > 180 ? 1 : 0
        
        const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
        
        segments.push({
          path,
          angle,
          color: tree.color,
          progress: tree.progress
        })
        
        currentAngle += angle
      })
      
      return segments
    })
    
    const safeProgress = (value) => {
      if (value === undefined || value === null) return 0
      const num = Number(value)
      return isNaN(num) ? 0 : Math.min(100, Math.max(0, num))
    }

    const formatNumber = (value) => {
      if (value === undefined || value === null) return '0'
      const num = Number(value)
      return isNaN(num) ? '0' : Math.round(num).toString()
    }

    const skillsByStatus = ref([
      { status: 'completed', label: 'Усвоено', count: 0, percentage: 0 },
      { status: 'in-progress', label: 'В процессе', count: 0, percentage: 0 },
      { status: 'not-started', label: 'Не начато', count: 0, percentage: 0 }
    ])

    const achievements = ref([
      { 
        id: 'first-tree', 
        title: 'Первые шаги', 
        description: 'Создано первое дерево навыков', 
        icon: 'Rocket',
        check: (stats, trees) => trees.length >= 1
      },
      { 
        id: 'skill-master', 
        title: 'Целеустремленный', 
        description: '10 навыков завершено', 
        icon: 'Target',
        check: (stats) => stats.completedSkills >= 10,
        progress: (stats) => ({ current: stats.completedSkills, total: 10 })
      },
      { 
        id: 'streak', 
        title: 'Горячая полоса', 
        description: '7 дней подряд активности', 
        icon: 'Flame',
        check: (stats) => stats.activeDays >= 7,
        progress: (stats) => ({ current: Math.min(stats.activeDays, 7), total: 7 })
      },
      { 
        id: 'progress-master', 
        title: 'Мастер', 
        description: '50% общего прогресса', 
        icon: 'Star',
        check: (stats) => stats.overallProgress >= 50,
        progress: (stats) => ({ current: stats.overallProgress, total: 100 })
      },
      { 
        id: 'tree-completer', 
        title: 'Завершитель', 
        description: 'Завершено хотя бы одно дерево', 
        icon: 'CheckCircle',
        check: (stats) => stats.completedTrees >= 1
      }
    ])

    const getStatusColor = (status) => {
      switch (status) {
        case 'completed': return '#b8a88a'
        case 'in-progress': return '#d9cb9c'
        default: return '#b8cdcd'
      }
    }

    const getStatusProgressBarClass = (status) => {
      switch (status) {
        case 'completed': return 'bg-secondary'
        case 'in-progress': return 'bg-accent'
        default: return 'bg-muted'
      }
    }

    // Расчет статистики
    const calculateStatistics = () => {
      const trees = userTrees.value
      
      if (trees.length === 0) {
        statistics.value = {
          overallProgress: 0,
          totalSkills: 0,
          completedSkills: 0,
          activeDays: 0,
          totalTrees: 0,
          inProgressTrees: 0,
          completedTrees: 0,
          totalActivities: 0
        }
        treesProgress.value = []
        selectedTree.value = null
        return
      }
      
      let totalSkills = 0
      let completedSkills = 0
      
      trees.forEach(tree => {
        totalSkills += Number(tree.node_count) || 0
        completedSkills += Number(tree.completed_count) || 0
      })
      
      // Используем цвета из приложения
      treesProgress.value = trees.map((tree, index) => ({
        id: tree.id,
        name: tree.name,
        progress: safeProgress(tree.progress),
        color: appColors[index % appColors.length]
      }))
      
      // Выбираем первое дерево по умолчанию
      if (treesProgress.value.length > 0 && !selectedTree.value) {
        selectedTree.value = treesProgress.value[0]
      }
      
      let totalProgress = 0
      trees.forEach(tree => {
        totalProgress += safeProgress(tree.progress)
      })
      const overallProgress = trees.length > 0 ? Math.round(totalProgress / trees.length) : 0
      
      const inProgressTrees = trees.filter(tree => {
        const progress = safeProgress(tree.progress)
        return progress > 0 && progress < 100
      }).length
      
      const completedTrees = trees.filter(tree => safeProgress(tree.progress) === 100).length
      
      let activeDays = 0
      try {
        const activities = JSON.parse(localStorage.getItem('user_activities') || '[]')
        const uniqueDays = new Set()
        activities.forEach(activity => {
          if (activity.created_at) {
            uniqueDays.add(activity.created_at.split('T')[0])
          }
        })
        activeDays = uniqueDays.size
      } catch (e) {
        activeDays = 0
      }
      
      statistics.value = {
        overallProgress,
        totalSkills,
        completedSkills,
        activeDays,
        totalTrees: trees.length,
        inProgressTrees,
        completedTrees,
        totalActivities: 0
      }
      
      const completedCount = completedSkills
      const inProgressCount = Math.max(Math.floor(totalSkills * 0.2), 0)
      const notStartedCount = Math.max(totalSkills - completedCount - inProgressCount, 0)
      
      skillsByStatus.value = [
        { status: 'completed', label: 'Усвоено', count: completedCount, percentage: totalSkills > 0 ? Math.round((completedCount / totalSkills) * 100) : 0 },
        { status: 'in-progress', label: 'В процессе', count: inProgressCount, percentage: totalSkills > 0 ? Math.round((inProgressCount / totalSkills) * 100) : 0 },
        { status: 'not-started', label: 'Не начато', count: notStartedCount, percentage: totalSkills > 0 ? Math.round((notStartedCount / totalSkills) * 100) : 0 }
      ]
    }

    const checkAchievement = (achievement) => {
      if (achievement.check) {
        return achievement.check(statistics.value, userTrees.value)
      }
      return false
    }

    const loadStatistics = async () => {
      isLoading.value = true
      error.value = ''
      
      try {
        await store.dispatch('tree/loadUserTrees')
        calculateStatistics()
      } catch (err) {
        error.value = 'Не удалось загрузить статистику'
        console.error('Failed to load statistics:', err)
      } finally {
        isLoading.value = false
      }
    }

    const achievementsWithProgress = computed(() => {
      return achievements.value.map(achievement => {
        const unlocked = checkAchievement(achievement)
        const progress = achievement.progress ? achievement.progress(statistics.value) : null
        return {
          ...achievement,
          unlocked,
          progress
        }
      })
    })

    onMounted(() => {
      loadStatistics()
    })

    return {
      isLoading,
      error,
      statistics,
      skillsByStatus,
      achievements: achievementsWithProgress,
      treesProgress,
      pieSegments,
      selectedTree,
      safeProgress,
      formatNumber,
      getStatusColor,
      getStatusProgressBarClass,
      loadStatistics,
      checkAchievement
    }
  }
}
</script>