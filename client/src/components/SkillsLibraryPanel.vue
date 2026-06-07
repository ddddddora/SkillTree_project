<template>
  <div class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <Card class="w-full max-w-4xl h-[90vh] flex flex-col">
      <div class="p-6 border-b flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold">Библиотека готовых деревьев</h2>
          <p class="text-sm text-muted-foreground">
            Готовые деревья навыков для быстрого старта
          </p>
        </div>
        <Button variant="ghost" size="icon" @click="onClose">
          <Icon name="X" :size="20" />
        </Button>
      </div>

      <div class="p-6 border-b">
        <Input placeholder="Поиск деревьев..." v-model="search" class="w-full" />
      </div>

      <div class="flex-1 flex gap-4 p-6 overflow-hidden">
        <div class="w-48 space-y-1 overflow-y-auto border-r pr-2">
          <Button
            v-for="category in categories"
            :key="category.id"
            :variant="selectedCategory === category.id ? 'default' : 'ghost'"
            class="w-full justify-start"
            @click="selectedCategory = category.id"
          >
            <Icon :name="category.icon" :size="16" class="mr-2" />
            {{ category.name }}
          </Button>
        </div>

        <div class="flex-1 overflow-auto">
          <div v-if="loading" class="flex justify-center py-12">
            <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          <div v-else-if="filteredTrees.length === 0" class="text-center py-12">
            <Icon name="TreePine" :size="48" class="text-muted-foreground mx-auto mb-4" />
            <p class="text-muted-foreground">Нет деревьев в этой категории</p>
          </div>
          
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card
              v-for="tree in filteredTrees"
              :key="tree.id"
              class="p-4 hover:shadow-md transition-all cursor-pointer"
              @click="addTree(tree)"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <h3 class="font-semibold text-lg mb-1 flex items-center gap-2">
                    <Icon :name="getCategoryIcon(tree.category)" :size="18" class="text-primary" />
                    {{ tree.name }}
                  </h3>
                  <p class="text-sm text-muted-foreground line-clamp-2">
                    {{ tree.description }}
                  </p>
                </div>
              </div>
              
              <div class="mb-3">
                <div class="text-xs text-muted-foreground mb-2">Навыки в дереве:</div>
                <div class="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                  <Badge
                    v-for="(node, idx) in getNodes(tree).slice(0, 5)"
                    :key="idx"
                    variant="secondary"
                    class="text-xs"
                  >
                    {{ node.name }}
                  </Badge>
                  <Badge v-if="getNodes(tree).length > 5" variant="outline" class="text-xs">
                    +{{ getNodes(tree).length - 5 }}
                  </Badge>
                </div>
              </div>
              
              <div class="pt-3 border-t text-xs text-muted-foreground">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <Icon name="Target" :size="12" />
                    <span>{{ getNodes(tree).length }} навыков</span>
                  </div>
                  <Button size="sm" @click.stop="addTree(tree)">
                    Добавить
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      <div class="p-4 border-t bg-muted/50">
        <p class="text-xs text-muted-foreground text-center">
          Нажмите на дерево, чтобы добавить его в ваш конструктор
        </p>
      </div>
    </Card>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Icon from '@/components/ui/Icon.vue'
import Input from '@/components/ui/Input.vue'
import Badge from '@/components/ui/Badge.vue'

const categories = [
  { id: 'programming', name: 'Программирование', icon: 'Code' },
  { id: 'web', name: 'Веб-разработка', icon: 'Globe' },
  { id: 'data', name: 'Данные', icon: 'Database' },
  { id: 'design', name: 'Дизайн', icon: 'Palette' },
  { id: 'devops', name: 'DevOps', icon: 'Settings' },
  { id: 'mobile', name: 'Мобильная разработка', icon: 'Smartphone' }
]

const getCategoryIcon = (category) => {
  const icons = {
    programming: 'Code',
    web: 'Globe',
    data: 'Database',
    design: 'Palette',
    devops: 'Settings',
    mobile: 'Smartphone'
  }
  return icons[category] || 'Folder'
}

export default {
  name: 'SkillsLibraryPanel',
  components: { Card, Button, Icon, Input, Badge },
  props: {
    onAddTree: { type: Function, required: true },
    onClose: { type: Function, required: true }
  },
  setup(props) {
    const search = ref('')
    const selectedCategory = ref('programming')
    const loading = ref(false)
    const libraryTrees = ref([])

    const getNodes = (tree) => {
      try {
        return typeof tree.nodes === 'string' ? JSON.parse(tree.nodes) : tree.nodes
      } catch {
        return []
      }
    }

    const loadTrees = async () => {
      loading.value = true
      try {
        const token = localStorage.getItem('skilltree_token')
        const response = await fetch('http://localhost:5000/api/library/trees', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (response.ok) {
          const data = await response.json()
          libraryTrees.value = data.trees
          console.log('Loaded trees from DB:', libraryTrees.value)
        } else {
          console.error('Failed to load trees:', response.status)
          // Если нет деревьев в БД, показываем пустой список
          libraryTrees.value = []
        }
      } catch (error) {
        console.error('Failed to load trees:', error)
        libraryTrees.value = []
      } finally {
        loading.value = false
      }
    }

    const filteredTrees = computed(() => {
      let trees = libraryTrees.value.filter(tree => 
        tree.category === selectedCategory.value && tree.is_active !== false
      )
      
      if (search.value) {
        trees = trees.filter(tree =>
          tree.name.toLowerCase().includes(search.value.toLowerCase()) ||
          tree.description.toLowerCase().includes(search.value.toLowerCase()) ||
          getNodes(tree).some(node => node.name.toLowerCase().includes(search.value.toLowerCase()))
        )
      }
      
      return trees
    })

    const addTree = (tree) => {
      const nodes = getNodes(tree)
      const newTree = {
        name: tree.name,
        description: tree.description,
        nodes: nodes.map((node, index) => ({
          id: `node-${Date.now()}-${index}`,
          name: node.name,
          description: node.description,
          difficulty: node.difficulty,
          position_x: 100 + (node.level || 0) * 150,
          position_y: 200 + index * 120,
          status: 'not-started',
          progress: 0,
          node_type: 'skill',
          children: []
        }))
      }
      props.onAddTree(newTree)
      props.onClose() // Закрываем библиотеку после добавления
    }

    onMounted(() => {
      loadTrees()
    })

    return {
      search,
      selectedCategory,
      loading,
      filteredTrees,
      categories,
      getNodes,
      getCategoryIcon,
      addTree
    }
  }
}
</script>