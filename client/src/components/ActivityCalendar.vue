<template>
  <Card class="p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-semibold">Календарь активности</h3>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" @click="previousMonth">
          <Icon name="ChevronLeft" :size="16" />
        </Button>
        <span class="text-sm font-medium">{{ currentMonth }}</span>
        <Button variant="outline" size="sm" @click="nextMonth">
          <Icon name="ChevronRight" :size="16" />
        </Button>
      </div>
    </div>
    
    <div v-if="isLoading" class="flex justify-center py-4">
      <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
    
    <div v-else>
      <div class="grid grid-cols-7 gap-1 mb-2">
        <div v-for="day in ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']" 
             :key="day" 
             class="text-center text-xs text-muted-foreground py-1">
          {{ day }}
        </div>
      </div>
      
      <div class="grid grid-cols-7 gap-1">
        <div v-for="day in calendarDays" 
             :key="day.date"
             class="aspect-square relative rounded-sm border border-border/50 hover:border-border cursor-pointer group"
             :class="{ 'opacity-30': !day.isCurrentMonth }"
             @click="selectDate(day)"
             :title="day.tooltip">
          <div class="w-full h-full flex items-center justify-center text-xs p-1 relative">
            {{ day.day }}
            <span v-if="day.isToday" class="absolute top-0 right-0 w-1 h-1 bg-primary rounded-full m-1"></span>
          </div>
          <!-- Индикатор активности -->
          <div v-if="day.activityLevel > 0" 
               class="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
            <div v-for="n in 3" 
                 :key="n"
                 class="w-1.5 h-1.5 rounded-full transition-all duration-300"
                 :class="getActivityColor(day.activityLevel, n)"></div>
          </div>
        </div>
      </div>
      
      <div class="flex items-center justify-between mt-4 text-xs text-muted-foreground">
        <div class="flex items-center gap-2">
          <span>Меньше</span>
          <div class="flex gap-0.5">
            <div v-for="n in 3" :key="n" class="w-2 h-2 rounded-full bg-green-200"></div>
          </div>
          <div class="flex gap-0.5">
            <div v-for="n in 3" :key="n" class="w-2 h-2 rounded-full bg-green-400"></div>
          </div>
          <div class="flex gap-0.5">
            <div v-for="n in 3" :key="n" class="w-2 h-2 rounded-full bg-green-600"></div>
          </div>
          <span>Больше</span>
        </div>
      </div>

      <!-- Попап с деталями активности -->
      <div v-if="selectedDate" class="mt-4 p-3 bg-muted rounded-lg">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium">{{ selectedDate.formattedDate }}</span>
          <Button variant="ghost" size="sm" @click="selectedDate = null">
            <Icon name="X" :size="14" />
          </Button>
        </div>
        <div v-if="selectedDate.activities && selectedDate.activities.length > 0" class="space-y-2">
          <div v-for="activity in selectedDate.activities" :key="activity.id" class="text-xs">
            <div class="font-medium">{{ getActivityActionLabel(activity.action_type) }}</div>
            <div class="text-muted-foreground">{{ activity.description }}</div>
            <div class="text-muted-foreground text-xs">{{ formatTime(activity.created_at) }}</div>
          </div>
        </div>
        <div v-else class="text-xs text-muted-foreground text-center py-2">
          Нет активности за этот день
        </div>
      </div>
    </div>
  </Card>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Icon from '@/components/ui/Icon.vue'

export default {
  name: 'ActivityCalendar',
  components: {
    Card,
    Button,
    Icon
  },
  setup() {
    const store = useStore()
    const currentDate = ref(new Date())
    const selectedDate = ref(null)
    
    const isLoading = ref(false)
    const activities = ref([])

    // Функция для правильного форматирования даты в YYYY-MM-DD
    const formatDateToYMD = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // Получаем сегодняшнюю дату
    const getTodayDate = () => {
      const today = new Date()
      return formatDateToYMD(today)
    }

    // Загружаем реальную активность пользователя
    const loadActivity = async () => {
      isLoading.value = true
      try {
        const token = localStorage.getItem('skilltree_token')
        const response = await fetch('http://localhost:5000/api/users/activity', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to load activity')
        }
        
        const data = await response.json()
        activities.value = data.activities || []
        console.log('Loaded activities:', activities.value)
        
      } catch (error) {
        console.error('Failed to load activity:', error)
        // Показываем демо-данные если API недоступно
        activities.value = getDemoActivities()
      } finally {
        isLoading.value = false
      }
    }

    // Демо-данные для тестирования
    const getDemoActivities = () => {
      const now = new Date()
      const activities = []
      
      // Активность за последние 30 дней
      for (let i = 0; i < 30; i++) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        
        // Случайное количество активностей за день
        const activityCount = Math.floor(Math.random() * 5)
        
        for (let j = 0; j < activityCount; j++) {
          activities.push({
            id: `activity-${i}-${j}`,
            action_type: ['create_node', 'update_node', 'complete_skill', 'create_tree'][Math.floor(Math.random() * 4)],
            description: `Активность ${j + 1} за ${date.toLocaleDateString('ru-RU')}`,
            created_at: date.toISOString(),
            tree_name: 'Дерево навыков',
            node_name: 'Навык ' + (j + 1)
          })
        }
      }
      
      return activities
    }

    const currentMonth = computed(() => {
      return currentDate.value.toLocaleDateString('ru-RU', { 
        month: 'long', 
        year: 'numeric' 
      })
    })

    const calendarDays = computed(() => {
      const year = currentDate.value.getFullYear()
      const month = currentDate.value.getMonth()
      const todayStr = getTodayDate()
      
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      
      const days = []
      
      // Добавляем дни из предыдущего месяца
      const firstDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(year, month, -i)
        const dateStr = formatDateToYMD(date)
        const dayActivities = getActivitiesForDate(date)
        
        days.push({
          date: dateStr,
          day: date.getDate(),
          isCurrentMonth: false,
          isToday: dateStr === todayStr,
          activityLevel: calculateActivityLevel(dayActivities),
          activities: dayActivities,
          tooltip: getTooltip(date, dayActivities),
          formattedDate: date.toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })
        })
      }
      
      // Добавляем дни текущего месяца
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const date = new Date(year, month, i)
        const dateStr = formatDateToYMD(date)
        const dayActivities = getActivitiesForDate(date)
        
        days.push({
          date: dateStr,
          day: i,
          isCurrentMonth: true,
          isToday: dateStr === todayStr,
          activityLevel: calculateActivityLevel(dayActivities),
          activities: dayActivities,
          tooltip: getTooltip(date, dayActivities),
          formattedDate: date.toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })
        })
      }
      
      // Добавляем дни следующего месяца
      const totalCells = 42 // 6 недель
      const remainingCells = totalCells - days.length
      for (let i = 1; i <= remainingCells; i++) {
        const date = new Date(year, month + 1, i)
        const dateStr = formatDateToYMD(date)
        
        days.push({
          date: dateStr,
          day: i,
          isCurrentMonth: false,
          isToday: dateStr === todayStr,
          activityLevel: 0,
          activities: [],
          tooltip: 'Нет активности',
          formattedDate: date.toLocaleDateString('ru-RU', { 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
          })
        })
      }
      
      return days
    })

    // Получение активностей для конкретной даты
    const getActivitiesForDate = (date) => {
      const dateStr = formatDateToYMD(date)
      return activities.value.filter(activity => {
        if (!activity.created_at) return false
        const activityDate = new Date(activity.created_at)
        const activityDateStr = formatDateToYMD(activityDate)
        return activityDateStr === dateStr
      })
    }

    // Расчет уровня активности (0-3)
    const calculateActivityLevel = (dayActivities) => {
      if (dayActivities.length === 0) return 0
      if (dayActivities.length === 1) return 1
      if (dayActivities.length <= 3) return 2
      return 3
    }

    const getTooltip = (date, activities) => {
      const dateFormatted = date.toLocaleDateString('ru-RU')
      
      if (activities.length === 0) return `${dateFormatted}: Нет активности`
      
      const actionTypes = activities.map(a => getActivityActionLabel(a.action_type))
      const uniqueActions = [...new Set(actionTypes)]
      
      return `${dateFormatted}: ${activities.length} активностей (${uniqueActions.join(', ')})`
    }

    const getActivityColor = (level, dotIndex) => {
      if (dotIndex > level) return 'bg-gray-200'
      
      if (level === 1) return 'bg-green-200'
      if (level === 2) return 'bg-green-400'
      return 'bg-green-600'
    }
    
    const getActivityActionLabel = (actionType) => {
      const labels = {
        'create_tree': 'Создано дерево',
        'update_tree': 'Обновлено дерево',
        'delete_tree': 'Удалено дерево',
        'create_node': 'Добавлен навык',
        'update_node': 'Обновлен навык',
        'delete_node': 'Удален навык',
        'complete_skill': 'Завершен навык',
        'start_learning': 'Начато изучение'
      }
      return labels[actionType] || actionType
    }
    
    const formatTime = (dateString) => {
      const date = new Date(dateString)
      return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    }

    const previousMonth = () => {
      currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() - 1,
        1
      )
    }

    const nextMonth = () => {
      currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() + 1,
        1
      )
    }

    const selectDate = (day) => {
      selectedDate.value = day
    }

    onMounted(() => {
      loadActivity()
    })

    watch(currentDate, () => {
      // При смене месяца пересчитываем календарь
    })

    return {
      currentDate,
      currentMonth,
      calendarDays,
      selectedDate,
      isLoading,
      previousMonth,
      nextMonth,
      getActivityColor,
      getActivityActionLabel,
      formatTime,
      selectDate
    }
  }
}
</script>