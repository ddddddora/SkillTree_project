<!-- client/src/components/SkillDetailDialog.vue -->
<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="onClose">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto" @click.stop>
      
      <!-- Header -->
      <div class="p-6 border-b">
        <h2 class="text-xl font-bold">
          {{ isSection ? 'Редактировать раздел' : 'Редактировать навык' }}
        </h2>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- Название -->
        <div class="space-y-2">
          <label for="name" class="text-sm font-medium block">Название</label>
          <input
            id="name"
            v-model="formData.name"
            class="w-full p-2 border rounded-md"
            :placeholder="isSection ? 'Название раздела' : 'Название навыка'"
          />
        </div>

        <!-- Описание -->
        <div class="space-y-2">
          <label for="description" class="text-sm font-medium block">Описание</label>
          <textarea
            id="description"
            v-model="formData.description"
            class="w-full p-2 border rounded-md h-20"
            :placeholder="isSection ? 'Описание раздела' : 'Описание навыка'"
          />
        </div>

        <!-- Статус -->
        <div class="space-y-2">
          <label class="text-sm font-medium block">Статус</label>
          <div class="flex flex-wrap gap-3">
            <label class="flex items-center gap-2 cursor-pointer px-3 py-2 rounded border hover:bg-gray-50">
              <input
                type="radio"
                v-model="formData.status"
                value="not-started"
                class="w-4 h-4"
              />
              <span :class="{'font-medium': formData.status === 'not-started'}">
                {{ isSection ? 'Не начат' : 'Не усвоен' }}
              </span>
            </label>
            <label v-if="isSection" class="flex items-center gap-2 cursor-pointer px-3 py-2 rounded border hover:bg-gray-50">
              <input
                type="radio"
                v-model="formData.status"
                value="in-progress"
                class="w-4 h-4"
              />
              <span :class="{'font-medium': formData.status === 'in-progress'}">
                В процессе
              </span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer px-3 py-2 rounded border hover:bg-gray-50">
              <input
                type="radio"
                v-model="formData.status"
                value="completed"
                class="w-4 h-4"
              />
              <span :class="{'font-medium': formData.status === 'completed'}">
                {{ isSection ? 'Завершен' : 'Усвоен' }}
              </span>
            </label>
          </div>
          
          <!-- Пояснение для навыков -->
          <p v-if="!isSection" class="text-xs text-gray-500 mt-2">
            При статусе "Усвоен" прогресс автоматически устанавливается в 100%
          </p>
        </div>

        <!-- Прогресс (только для разделов) -->
        <div v-if="isSection" class="space-y-3 p-4 bg-blue-50 rounded-lg">
          <div class="flex justify-between items-center">
            <label class="text-sm font-medium block text-blue-800">Прогресс раздела</label>
            <span class="text-lg font-bold text-blue-700">{{ calculateSectionProgress() }}%</span>
          </div>
          <Progress :value="calculateSectionProgress()" class="h-3 bg-blue-200" />
          
          <div class="text-sm text-blue-700">
            <div class="flex justify-between mb-1">
              <span>Навыки в разделе:</span>
              <span class="font-medium">{{ skillCount }}</span>
            </div>
            <div class="flex justify-between">
              <span>Усвоено навыков:</span>
              <span class="font-medium">{{ completedSkills }}/{{ skillCount }}</span>
            </div>
          </div>
          
          <p class="text-xs text-blue-600 mt-2">
            ⓘ Прогресс рассчитывается автоматически: <strong>{{ completedSkills }}</strong> из <strong>{{ skillCount }}</strong> навыков усвоено
          </p>
        </div>

        <!-- Сложность (только для навыков) -->
        <div v-if="!isSection" class="space-y-2">
          <label for="difficulty" class="text-sm font-medium block">Сложность</label>
          <div class="flex gap-3">
            <label class="flex items-center gap-2 cursor-pointer px-3 py-2 rounded border hover:bg-gray-50 flex-1 text-center">
              <input
                type="radio"
                v-model="formData.difficulty"
                value="easy"
                class="w-4 h-4"
              />
              <span :class="{'font-medium': formData.difficulty === 'easy'}">
                Легкий
              </span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer px-3 py-2 rounded border hover:bg-gray-50 flex-1 text-center">
              <input
                type="radio"
                v-model="formData.difficulty"
                value="medium"
                class="w-4 h-4"
              />
              <span :class="{'font-medium': formData.difficulty === 'medium'}">
                Средний
              </span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer px-3 py-2 rounded border hover:bg-gray-50 flex-1 text-center">
              <input
                type="radio"
                v-model="formData.difficulty"
                value="hard"
                class="w-4 h-4"
              />
              <span :class="{'font-medium': formData.difficulty === 'hard'}">
                Сложный
              </span>
            </label>
          </div>
        </div>

        <!-- Ресурсы (только для навыков) -->
        <div v-if="!isSection" class="space-y-2">
          <label class="text-sm font-medium block">Ресурсы для изучения</label>
          <div class="flex gap-2">
            <input
              v-model="newResource"
              placeholder="https://example.com"
              class="flex-1 p-2 border rounded-md"
              @keypress.enter="handleAddResource"
            />
            <Button type="button" @click="handleAddResource" class="bg-blue-500 text-white hover:bg-blue-600">
              <Icon name="Plus" :size="16" />
            </Button>
          </div>
          <div v-if="formData.resources && formData.resources.length > 0" class="space-y-2 mt-3">
            <div
              v-for="(resource, index) in formData.resources"
              :key="index"
              class="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg group"
            >
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <Icon name="Link" :size="14" class="text-gray-400 flex-shrink-0" />
                <a
                  :href="resource"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                  @click.stop
                  :title="resource"
                >
                  {{ resource.replace(/^https?:\/\//, '').replace(/\/$/, '') }}
                </a>
              </div>
              <button
                @click="handleRemoveResource(index)"
                class="text-gray-400 hover:text-red-500 p-1"
                title="Удалить ресурс"
              >
                <Icon name="X" :size="14" />
              </button>
            </div>
          </div>
          <p v-else class="text-sm text-gray-500 text-center py-3">
            Нет добавленных ресурсов
          </p>
        </div>

        <!-- Заметки -->
        <div class="space-y-2">
          <label for="notes" class="text-sm font-medium block">Заметки</label>
          <textarea
            id="notes"
            v-model="formData.notes"
            class="w-full p-3 border rounded-md h-32 resize-none"
            placeholder="Ваши заметки о прогрессе, планах, дедлайнах..."
          />
        </div>

        <!-- Дедлайн -->
        <div class="space-y-2">
          <label class="text-sm font-medium block">
            Дедлайн
            <span class="text-xs text-muted-foreground ml-2">(необязательно)</span>
          </label>
          <div class="flex gap-3 items-center">
            <input
              type="date"
              v-model="formData.deadline"
              :min="new Date().toISOString().split('T')[0]"
              class="flex-1 p-2 border rounded-md"
            />
            <Button
              v-if="formData.deadline"
              type="button"
              variant="ghost"
              size="icon"
              @click="formData.deadline = null"
              title="Очистить дедлайн"
            >
              <Icon name="X" :size="16" />
            </Button>
          </div>
          <p class="text-xs text-muted-foreground">
            Установите дату, к которой планируете завершить {{ isSection ? 'раздел' : 'навык' }}
          </p>
        </div>

        <!-- Индикатор приближения дедлайна -->
        <div v-if="formData.deadline" class="space-y-2 p-3 rounded-lg" :class="deadlineWarningClass">
          <div class="flex items-center gap-2">
            <Icon :name="deadlineIcon" :size="16" :class="deadlineIconClass" />
            <span class="text-sm font-medium" :class="deadlineTextClass">
              {{ deadlineMessage }}
            </span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
        <!-- Левая часть - кнопка удаления -->
        <Button 
          variant="destructive" 
          @click="handleDelete"
          class="w-full sm:w-auto"
        >
          <Icon name="Trash2" :size="16" class="mr-2" />
          Удалить
        </Button>

        <!-- Правая часть - кнопки отмены и сохранения -->
        <div class="flex gap-3 w-full sm:w-auto">
          <Button variant="outline" @click="onClose" class="flex-1">
            Отмена
          </Button>
          <Button @click="handleSave" :disabled="isSaving" class="flex-1 bg-green-600 hover:bg-green-700">
            <Icon name="Save" :size="16" class="mr-2" />
            {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
          </Button>
        </div>
      </div>

      <!-- Диалог подтверждения удаления -->
      <div 
        v-if="showDeleteConfirm" 
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-60"
      >
        <div class="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
          <div class="flex items-start gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <Icon name="AlertTriangle" :size="20" class="text-red-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-1">Подтверждение удаления</h3>
              <p class="text-gray-600">
                Вы уверены, что хотите удалить <strong>"{{ formData.name }}"</strong>?
              </p>
              <p class="text-sm text-gray-500 mt-2">
                Это действие нельзя отменить. {{ isSection ? 'Все навыки в разделе также будут удалены.' : '' }}
              </p>
            </div>
          </div>
          <div class="flex justify-end gap-3">
            <Button variant="outline" @click="showDeleteConfirm = false" class="px-6">
              Отмена
            </Button>
            <Button variant="destructive" @click="confirmDelete" :disabled="isDeleting" class="px-6">
              <Icon name="Trash2" :size="16" class="mr-2" />
              {{ isDeleting ? 'Удаление...' : 'Удалить' }}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import Button from '@/components/ui/Button.vue'
import Icon from '@/components/ui/Icon.vue'
import Progress from '@/components/ui/Progress.vue'

export default {
  name: 'SkillDetailDialog',
  components: {
    Button,
    Icon,
    Progress
  },
  props: {
    node: {
      type: Object,
      required: true
    },
    onClose: {
      type: Function,
      required: true
    },
    onUpdate: {
      type: Function,
      required: true
    },
    onDelete: {
      type: Function,
      default: null
    }
  },
  setup(props) {
    const formData = ref({
      name: props.node.name || '',
      description: props.node.description || '',
      status: props.node.status || 'not-started',
      difficulty: props.node.difficulty || 'medium',
      resources: Array.isArray(props.node.resources) ? [...props.node.resources] : [],
      notes: props.node.notes || '',
      deadline: props.node.deadline || null
    })
    
    const newResource = ref('')
    const showDeleteConfirm = ref(false)
    const isSaving = ref(false)
    const isDeleting = ref(false)
    
    const isSection = computed(() => {
      return !props.node.parent_id || props.node.node_type === 'section'
    })
    
    const skillCount = computed(() => {
      if (!isSection.value || !props.node.children) return 0
      return props.node.children.filter(child => !child.parent_id || child.node_type === 'skill').length
    })
    
    const completedSkills = computed(() => {
      if (!isSection.value || !props.node.children) return 0
      const skills = props.node.children.filter(child => !child.parent_id || child.node_type === 'skill')
      return skills.filter(skill => skill.status === 'completed').length
    })
    
    const calculateSectionProgress = () => {
      if (!isSection.value) return props.node.progress || 0
      if (skillCount.value === 0) return 0
      
      const progress = Math.round((completedSkills.value / skillCount.value) * 100)
      
      if (skillCount.value > 0 && progress === 100) {
        formData.value.status = 'completed'
      } else if (progress > 0 && progress < 100) {
        formData.value.status = 'in-progress'
      } else {
        formData.value.status = 'not-started'
      }
      
      return progress
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

    const declOfNum = (number, titles) => {
      const cases = [2, 0, 1, 1, 1, 2]
      return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]]
    }

    const deadlineWarningClass = computed(() => {
      if (!formData.value.deadline) return ''
      const daysLeft = getDaysUntilDeadline(formData.value.deadline)
      if (daysLeft < 0) return 'bg-red-50 border border-red-200'
      if (daysLeft <= 1) return 'bg-red-50 border border-red-200'
      if (daysLeft <= 3) return 'bg-yellow-50 border border-yellow-200'
      return 'bg-green-50 border border-green-200'
    })

    const deadlineIcon = computed(() => {
      if (!formData.value.deadline) return 'Calendar'
      const daysLeft = getDaysUntilDeadline(formData.value.deadline)
      if (daysLeft < 0) return 'AlertCircle'
      if (daysLeft <= 1) return 'Clock'
      if (daysLeft <= 3) return 'Clock'
      return 'Calendar'
    })

    const deadlineIconClass = computed(() => {
      if (!formData.value.deadline) return ''
      const daysLeft = getDaysUntilDeadline(formData.value.deadline)
      if (daysLeft < 0) return 'text-red-500'
      if (daysLeft <= 1) return 'text-red-500'
      if (daysLeft <= 3) return 'text-yellow-600'
      return 'text-green-600'
    })

    const deadlineTextClass = computed(() => {
      if (!formData.value.deadline) return ''
      const daysLeft = getDaysUntilDeadline(formData.value.deadline)
      if (daysLeft < 0) return 'text-red-700'
      if (daysLeft <= 1) return 'text-red-700'
      if (daysLeft <= 3) return 'text-yellow-700'
      return 'text-green-700'
    })

    const deadlineMessage = computed(() => {
      if (!formData.value.deadline) return ''
      const daysLeft = getDaysUntilDeadline(formData.value.deadline)
      if (daysLeft < 0) return `Дедлайн просрочен на ${Math.abs(daysLeft)} ${declOfNum(Math.abs(daysLeft), ['день', 'дня', 'дней'])}`
      if (daysLeft === 0) return 'Дедлайн сегодня!'
      if (daysLeft === 1) return 'Дедлайн завтра!'
      if (daysLeft <= 3) return `Дедлайн через ${daysLeft} ${declOfNum(daysLeft, ['день', 'дня', 'дней'])}`
      return `Дедлайн через ${daysLeft} ${declOfNum(daysLeft, ['день', 'дня', 'дней'])}`
    })

    const handleAddResource = () => {
      const resource = newResource.value.trim()
      if (resource) {
        let finalResource = resource
        if (!resource.startsWith('http://') && !resource.startsWith('https://')) {
          finalResource = 'https://' + resource
        }
        formData.value.resources.push(finalResource)
        newResource.value = ''
      }
    }
    
    const handleRemoveResource = (index) => {
      formData.value.resources.splice(index, 1)
    }
    
    const handleSave = async () => {
      isSaving.value = true
      try {
        const updates = { ...formData.value }
        
        if (!isSection.value) {
          updates.progress = updates.status === 'completed' ? 100 : 0
        }
        
        if (isSection.value) {
          delete updates.progress
        }
        
        await props.onUpdate(updates)
      } catch (error) {
        console.error('Failed to update node:', error)
        alert('Ошибка при сохранении: ' + error.message)
      } finally {
        isSaving.value = false
      }
    }

    const handleDelete = () => {
      showDeleteConfirm.value = true
    }

    const confirmDelete = async () => {
      isDeleting.value = true
      try {
        if (props.onDelete) {
          await props.onDelete(props.node.id)
        }
        showDeleteConfirm.value = false
      } catch (error) {
        console.error('Failed to delete node:', error)
        alert('Ошибка при удалении: ' + error.message)
      } finally {
        isDeleting.value = false
      }
    }

    onMounted(() => {
      setTimeout(() => {
        const nameInput = document.getElementById('name')
        if (nameInput) {
          nameInput.focus()
          nameInput.select()
        }
      }, 100)
    })

    return {
      formData,
      newResource,
      showDeleteConfirm,
      isSaving,
      isDeleting,
      isSection,
      skillCount,
      completedSkills,
      calculateSectionProgress,
      deadlineWarningClass,
      deadlineIcon,
      deadlineIconClass,
      deadlineTextClass,
      deadlineMessage,
      handleAddResource,
      handleRemoveResource,
      handleSave,
      handleDelete,
      confirmDelete
    }
  }
}
</script>

<style scoped>
input[type="radio"]:checked + span {
  font-weight: 600;
}
</style>