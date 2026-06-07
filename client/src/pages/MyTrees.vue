<template>
  <div class="space-y-8">
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl sm:text-4xl font-bold mb-2">Мои деревья</h1>
        <p class="text-muted-foreground text-base sm:text-lg">
          Управляйте вашими деревьями навыков
        </p>
      </div>
      <Button class="w-full sm:w-auto" @click="handleCreateNew">
        <Icon name="Plus" :size="20" class="mr-2" />
        Создать
      </Button>
    </div>

    <div v-if="isLoading" class="flex justify-center py-12">
      <div class="text-center">
        <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-muted-foreground">Загрузка деревьев...</p>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <Icon name="AlertCircle" :size="48" class="text-destructive mx-auto mb-4" />
      <h3 class="text-lg font-semibold mb-2">Ошибка загрузки</h3>
      <p class="text-muted-foreground mb-4">{{ error }}</p>
      <Button @click="loadTrees">
        <Icon name="RefreshCw" :size="16" class="mr-2" />
        Попробовать снова
      </Button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      <Card
        v-for="tree in trees"
        :key="tree.id"
        class="p-4 sm:p-6 hover:shadow-lg transition-all group cursor-pointer"
        @click="handleOpenTree(tree.id)"
      >
        <div class="space-y-4">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="text-lg sm:text-xl font-semibold mb-1 group-hover:text-primary transition-colors">
                {{ tree.name }}
              </h3>
              <p class="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {{ tree.description || 'Без описания' }}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              @click.stop="handleDeleteTree(tree.id)"
              class="opacity-50 sm:opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Icon name="Trash2" :size="14" class="sm:w-4 sm:h-4" />
            </Button>
          </div>

          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Прогресс</span>
              <span class="font-semibold">{{ tree.progress || 0 }}%</span>
            </div>
            <Progress :value="tree.progress || 0" />
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">
              <Icon name="Boxes" :size="12" class="mr-1" />
              {{ tree.node_count || 0 }} узлов
            </Badge>
            <Badge variant="outline">
              {{ tree.completed_count || 0 }} завершено
            </Badge>
            <Badge v-if="tree.is_public" variant="outline" class="text-green-600 border-green-600">
              <Icon name="Globe" :size="12" class="mr-1" />
              Публичное
            </Badge>
          </div>

          <div class="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <div class="flex items-center gap-1">
              <Icon name="Calendar" :size="12" />
              {{ formatDate(tree.created_at) }}
            </div>
            <div class="flex items-center gap-1">
              <Icon name="Clock" :size="12" />
              {{ formatRelativeTime(tree.updated_at) }}
            </div>
          </div>
        </div>
      </Card>

      <Card
        class="p-4 sm:p-6 border-dashed border-2 flex items-center justify-center cursor-pointer hover:border-primary hover:bg-accent/50 transition-all group min-h-[200px]"
        @click="handleCreateNew"
      >
        <div class="text-center space-y-3">
          <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
            <Icon name="Plus" :size="24" class="text-primary sm:w-8 sm:h-8" />
          </div>
          <div>
            <h3 class="font-semibold mb-1 text-sm sm:text-base">Создать новое дерево</h3>
            <p class="text-xs sm:text-sm text-muted-foreground">
              Начните с нуля или выберите шаблон
            </p>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Progress from '@/components/ui/Progress.vue'
import Icon from '@/components/ui/Icon.vue'

export default {
  name: 'MyTrees',
  components: {
    Card,
    Button,
    Badge,
    Progress,
    Icon
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    
    const trees = computed(() => store.state.tree.userTrees)
    const isLoading = computed(() => store.state.tree.isLoading)
    const error = computed(() => store.state.tree.error)

    const loadTrees = async () => {
      try {
        await store.dispatch('tree/loadUserTrees')
      } catch (error) {
        console.error('Failed to load trees:', error)
      }
    }

    onMounted(() => {
      loadTrees()
    })

    const handleCreateNew = () => {
      router.push('/builder')
    }

    const handleOpenTree = (treeId) => {
      router.push(`/builder?tree=${treeId}`)
    }

    const handleDeleteTree = async (treeId) => {
      if (!confirm('Вы уверены, что хотите удалить это дерево?')) return
      
      try {
        await store.dispatch('tree/deleteTree', treeId)
      } catch (error) {
        console.error('Failed to delete tree:', error)
        alert('Ошибка при удалении дерева')
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return 'Неизвестно'
      return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(dateString))
    }

    const formatRelativeTime = (dateString) => {
      if (!dateString) return 'Неизвестно'
      
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
      
      return formatDate(dateString)
    }

    return {
      trees,
      isLoading,
      error,
      handleCreateNew,
      handleOpenTree,
      handleDeleteTree,
      formatDate,
      formatRelativeTime,
      loadTrees
    }
  }
}
</script>