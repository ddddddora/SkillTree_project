<template>
  <div
    class="canvas-node absolute cursor-move transition-all duration-200"
    :class="[
      isDragging ? 'shadow-2xl scale-105 z-50' : 'shadow-md hover:shadow-lg z-10',
      nodeTypeClass,
      statusClass
    ]"
    :style="{
      left: x + 'px',
      top: y + 'px',
      transform: `scale(${isDragging ? 1.05 : 1})`,
      width: '250px'
    }"
    @mousedown="onMouseDown"
    @click="onClick"
  >
    <div class="p-4 space-y-3 rounded-lg bg-card border border-border">
      <div class="flex items-start justify-between gap-2">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <component :is="statusIcon" :size="16" :class="statusIconClass" />
            <h3 class="font-semibold text-sm line-clamp-2">{{ node.name }}</h3>
          </div>
          <p v-if="node.description" class="text-xs text-muted-foreground line-clamp-2">
            {{ node.description }}
          </p>
        </div>
        <Badge v-if="isSection" :variant="getBadgeVariant()" class="shrink-0">
          <Icon name="Folder" :size="12" class="mr-1" />
          {{ node.children?.length || 0 }}
        </Badge>
        <Badge v-else :variant="getBadgeVariant()" class="shrink-0 text-xs">
          {{ getSkillStatusLabel() }}
        </Badge>
      </div>

      <!-- Прогресс только для разделов -->
      <div v-if="isSection" class="space-y-1">
        <div class="flex items-center justify-between text-xs">
          <span class="text-muted-foreground">Прогресс раздела</span>
          <span class="font-medium">{{ calculateSectionProgress() }}%</span>
        </div>
        <Progress :value="calculateSectionProgress()" class="h-2" />
        <div v-if="hasSkills" class="text-xs text-muted-foreground">
          {{ completedSkillsCount }}/{{ totalSkillsCount }} навыков
        </div>
        <div v-else class="text-xs text-muted-foreground">
          Нет навыков
        </div>
      </div>

      <!-- Для навыков показываем только статус -->
      <div v-if="!isSection" class="space-y-2">
        <div class="flex items-center justify-between">
          <Badge :variant="getSkillStatusBadgeVariant()" class="text-xs">
            <Icon :name="getSkillStatusIcon()" :size="12" class="mr-1" />
            {{ getSkillStatusLabel() }}
          </Badge>
          <div v-if="node.difficulty" class="text-xs text-muted-foreground">
            {{ getDifficultyLabel() }}
          </div>
        </div>
        
        <div v-if="node.resources && node.resources.length > 0" class="flex items-center gap-1 text-xs text-muted-foreground">
          <Icon name="Link" :size="12" />
          <span>{{ node.resources.length }} ресурс(ов)</span>
        </div>
      </div>

      <div v-if="node.notes" class="pt-2 border-t border-border/50">
        <div class="flex items-center gap-1 text-xs text-muted-foreground">
          <Icon name="FileText" :size="12" />
          <span class="truncate">Есть заметка</span>
        </div>
      </div>
      
      <!-- Индикатор типа узла -->
      <div class="absolute -top-2 -right-2">
        <div :class="typeIndicatorClass" class="w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
          <Icon :name="isSection ? 'Folder' : 'Target'" :size="12" />
        </div>
      </div>

      <!-- Индикатор дедлайна -->
      <div v-if="node.deadline" class="absolute -top-2 -left-2">
        <div 
          class="w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
          :class="deadlineIndicatorClass"
          :title="deadlineTooltip"
        >
          <Icon :name="deadlineIcon" :size="12" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Progress from '@/components/ui/Progress.vue'
import Icon from '@/components/ui/Icon.vue'

export default {
  name: 'CanvasNode',
  components: {
    Button,
    Badge,
    Progress,
    Icon
  },
  props: {
    node: {
      type: Object,
      required: true
    },
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    },
    isDragging: {
      type: Boolean,
      default: false
    },
    onMouseDown: {
      type: Function,
      required: true
    },
    onClick: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    const isSection = computed(() => {
      return !props.node.parent_id || props.node.node_type === 'section'
    })

    const statusIcon = computed(() => {
      switch (props.node.status) {
        case 'completed': return 'CheckCircle2'
        case 'in-progress': return 'Clock'
        default: return 'Circle'
      }
    })

    const statusIconClass = computed(() => {
      switch (props.node.status) {
        case 'completed': return 'text-green-500'
        case 'in-progress': return 'text-yellow-500'
        default: return 'text-gray-400'
      }
    })

    const nodeTypeClass = computed(() => {
      return 'bg-white'
    })

    const statusClass = computed(() => {
      if (isSection.value) return ''
      switch (props.node.status) {
        case 'completed': return 'ring-1 ring-green-200 bg-green-50'
        case 'in-progress': return 'ring-1 ring-yellow-200 bg-yellow-50'
        default: return 'bg-white'
      }
    })
    
    const typeIndicatorClass = computed(() => {
      if (isSection.value) {
        return 'bg-gray-600 text-white'
      } else {
        switch (props.node.status) {
          case 'completed': return 'bg-green-600 text-white'
          case 'in-progress': return 'bg-yellow-600 text-white'
          default: return 'bg-gray-400 text-white'
        }
      }
    })
    
    const hasSkills = computed(() => {
      return isSection.value && props.node.children && props.node.children.length > 0
    })
    
    const totalSkillsCount = computed(() => {
      if (!isSection.value || !props.node.children) return 0
      return props.node.children.length
    })
    
    const completedSkillsCount = computed(() => {
      if (!isSection.value || !props.node.children) return 0
      return props.node.children.filter(child => child.status === 'completed').length
    })

    // Функция для расчета прогресса раздела
    const calculateSectionProgress = () => {
      if (!isSection.value) return props.node.progress || 0
      if (!hasSkills.value) return 0
      return Math.round((completedSkillsCount.value / totalSkillsCount.value) * 100)
    }
    
    const getBadgeVariant = () => {
      if (isSection.value) {
        return 'secondary'
      } else {
        switch (props.node.status) {
          case 'completed': return 'default'
          case 'in-progress': return 'secondary'
          default: return 'outline'
        }
      }
    }
    
    const getSkillStatusLabel = () => {
      if (isSection.value) return ''
      
      switch (props.node.status) {
        case 'completed': return 'Усвоен'
        case 'in-progress': return 'В процессе'
        default: return 'Не усвоен'
      }
    }
    
    const getSkillStatusBadgeVariant = () => {
      switch (props.node.status) {
        case 'completed': return 'default'
        case 'in-progress': return 'secondary'
        default: return 'outline'
      }
    }
    
    const getSkillStatusIcon = () => {
      switch (props.node.status) {
        case 'completed': return 'CheckCircle2'
        case 'in-progress': return 'Clock'
        default: return 'Circle'
      }
    }
    
    const getDifficultyLabel = () => {
      switch (props.node.difficulty) {
        case 'easy': return 'Легкий'
        case 'medium': return 'Средний'
        case 'hard': return 'Сложный'
        default: return 'Без оценки'
      }
    }

    // Дедлайн вычисления
    const getDaysUntilDeadline = (deadlineDate) => {
      if (!deadlineDate) return null
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const deadline = new Date(deadlineDate)
      deadline.setHours(0, 0, 0, 0)
      const diffTime = deadline - today
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const daysUntilDeadline = computed(() => {
      return getDaysUntilDeadline(props.node.deadline)
    })

    const deadlineIndicatorClass = computed(() => {
      const days = daysUntilDeadline.value
      if (days === null) return ''
      if (days < 0) return 'bg-red-600 text-white'
      if (days === 0) return 'bg-red-500 text-white animate-pulse'
      if (days <= 2) return 'bg-orange-500 text-white'
      if (days <= 5) return 'bg-yellow-500 text-white'
      return 'bg-blue-500 text-white'
    })

    const deadlineIcon = computed(() => {
      const days = daysUntilDeadline.value
      if (days === null) return 'Calendar'
      if (days < 0) return 'AlertTriangle'
      if (days === 0) return 'AlarmClock'
      return 'Clock'
    })

    const deadlineTooltip = computed(() => {
      const days = daysUntilDeadline.value
      if (days === null) return ''
      if (days < 0) return `Дедлайн просрочен на ${Math.abs(days)} дн.`
      if (days === 0) return 'Дедлайн сегодня!'
      if (days === 1) return 'Дедлайн завтра!'
      return `Дедлайн через ${days} дн.`
    })

    return {
      isSection,
      statusIcon,
      statusIconClass,
      nodeTypeClass,
      statusClass,
      typeIndicatorClass,
      hasSkills,
      totalSkillsCount,
      completedSkillsCount,
      calculateSectionProgress,
      getBadgeVariant,
      getSkillStatusLabel,
      getSkillStatusBadgeVariant,
      getSkillStatusIcon,
      getDifficultyLabel,
      deadlineIndicatorClass,
      deadlineIcon,
      deadlineTooltip
    }
  }
}
</script>

<style scoped>
.canvas-node {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 8px;
}

.canvas-node:hover {
  transform: translateY(-2px);
}
</style>