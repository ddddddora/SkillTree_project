<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h2 class="text-xl font-semibold">Готовые деревья</h2>
        <p class="text-muted-foreground">Создавайте и управляйте готовыми деревьями навыков</p>
      </div>
      <Button @click="createNewTree">
        <Icon name="Plus" :size="16" class="mr-2" />
        Новое дерево
      </Button>
    </div>

    <!-- Список существующих деревьев -->
    <div class="grid grid-cols-1 gap-4">
      <div v-if="loading" class="flex justify-center py-8">
        <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
      
      <div v-else-if="trees.length === 0" class="text-center py-12 text-muted-foreground">
        <Icon name="TreePine" :size="48" class="mx-auto mb-4 opacity-50" />
        <p>Нет готовых деревьев</p>
        <Button variant="link" @click="createNewTree" class="mt-2">Создать первое дерево</Button>
      </div>
      
      <Card v-for="tree in trees" :key="tree.id" class="p-4">
        <div class="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2 flex-wrap">
              <h3 class="font-semibold text-lg">{{ tree.name }}</h3>
              <Badge variant="outline" size="sm">{{ getCategoryName(tree.category) }}</Badge>
              <Badge :variant="tree.is_active ? 'default' : 'secondary'" size="sm">
                {{ tree.is_active ? 'Активен' : 'Неактивен' }}
              </Badge>
            </div>
            <p class="text-sm text-muted-foreground mb-2">{{ tree.description }}</p>
            <p class="text-xs text-muted-foreground">{{ getNodesCount(tree) }} навыков</p>
          </div>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" @click="editTree(tree)">
              <Icon name="Edit" :size="14" class="mr-1" />
              Редактировать
            </Button>
            <Button variant="destructive" size="sm" @click="deleteTree(tree.id)">
              <Icon name="Trash2" :size="14" />
            </Button>
          </div>
        </div>
        
        <details class="mt-3 pt-3 border-t">
          <summary class="text-sm cursor-pointer text-muted-foreground hover:text-foreground">
            Показать навыки ({{ getNodesCount(tree) }})
          </summary>
          <div class="mt-2 space-y-1">
            <div v-for="(node, idx) in getNodes(tree).slice(0, 5)" :key="idx" class="text-sm p-2 bg-muted/30 rounded flex justify-between items-center">
              <div>
                <span class="font-medium">{{ node.name }}</span>
                <span class="text-xs text-muted-foreground ml-2">Уровень {{ node.level || 0 }}</span>
              </div>
              <Badge variant="outline" size="sm">{{ getDifficultyLabel(node.difficulty) }}</Badge>
            </div>
            <div v-if="getNodes(tree).length > 5" class="text-xs text-muted-foreground text-center pt-1">
              и ещё {{ getNodes(tree).length - 5 }} навыков
            </div>
          </div>
        </details>
      </Card>
    </div>

    <!-- Модальное окно для редактирования дерева -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click="closeModal">
      <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto" @click.stop>
        <div class="p-6 border-b">
          <h2 class="text-xl font-bold">{{ editingTree ? 'Редактировать дерево' : 'Новое дерево' }}</h2>
        </div>
        
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium block mb-1">Название *</label>
              <Input v-model="form.name" placeholder="Например: Fullstack разработка" />
            </div>
            <div>
              <label class="text-sm font-medium block mb-1">Категория</label>
              <select v-model="form.category" class="w-full p-2 border rounded-md">
                <option value="programming">Программирование</option>
                <option value="web">Веб-разработка</option>
                <option value="data">Данные</option>
                <option value="design">Дизайн</option>
                <option value="devops">DevOps</option>
                <option value="mobile">Мобильная разработка</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="text-sm font-medium block mb-1">Описание</label>
            <Textarea v-model="form.description" rows="2" placeholder="Описание дерева навыков" />
          </div>
          
          <!-- Редактор навыков -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="text-sm font-medium">Навыки в дереве</label>
              <Button size="sm" variant="outline" @click="addSkill">
                <Icon name="Plus" :size="14" class="mr-1" />
                Добавить навык
              </Button>
            </div>
            
            <div class="border rounded-lg divide-y max-h-96 overflow-y-auto">
              <div v-for="(skill, idx) in form.nodes" :key="idx" class="p-4">
                <div class="flex justify-between items-start mb-3">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                      {{ skill.level || 0 }}
                    </div>
                    <h4 class="font-medium">Уровень {{ skill.level || 0 }}</h4>
                  </div>
                  <div class="flex gap-1">
                    <Button variant="ghost" size="sm" @click="moveSkillUp(idx)" :disabled="idx === 0">
                      <Icon name="ChevronUp" :size="14" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="moveSkillDown(idx)" :disabled="idx === form.nodes.length - 1">
                      <Icon name="ChevronDown" :size="14" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="increaseLevel(idx)">
                      <Icon name="ArrowRight" :size="14" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="decreaseLevel(idx)">
                      <Icon name="ArrowLeft" :size="14" />
                    </Button>
                    <Button variant="ghost" size="sm" @click="removeSkill(idx)">
                      <Icon name="Trash2" :size="14" class="text-red-500" />
                    </Button>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3 mb-3">
                  <Input v-model="skill.name" placeholder="Название навыка" />
                  <select v-model="skill.difficulty" class="p-2 border rounded-md">
                    <option value="easy">Легкий</option>
                    <option value="medium">Средний</option>
                    <option value="hard">Сложный</option>
                  </select>
                </div>
                <Textarea v-model="skill.description" rows="2" placeholder="Описание навыка" />
              </div>
              <div v-if="form.nodes.length === 0" class="text-center py-8 text-muted-foreground">
                Нет навыков. Нажмите "Добавить навык"
              </div>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <input type="checkbox" v-model="form.is_active" id="tree-active" class="w-4 h-4 rounded" />
            <label for="tree-active" class="text-sm">Активно (будет видно пользователям)</label>
          </div>
        </div>
        
        <div class="p-6 border-t flex justify-end gap-3">
          <Button variant="outline" @click="closeModal">Отмена</Button>
          <Button @click="saveTree" :disabled="saving">Сохранить</Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Icon from '@/components/ui/Icon.vue'
import Input from '@/components/ui/Input.vue'
import Textarea from '@/components/ui/Textarea.vue'

export default {
  name: 'TreeBuilder',
  components: { Card, Button, Badge, Icon, Input, Textarea },
  setup() {
    const trees = ref([])
    const loading = ref(false)
    const saving = ref(false)
    const showModal = ref(false)
    const editingTree = ref(null)
    
    const form = ref({
      name: '',
      description: '',
      category: 'programming',
      nodes: [],
      is_active: true
    })

    const getCategoryName = (category) => {
      const names = {
        programming: 'Программирование',
        web: 'Веб-разработка',
        data: 'Данные',
        design: 'Дизайн',
        devops: 'DevOps',
        mobile: 'Мобильная разработка'
      }
      return names[category] || category
    }

    const getDifficultyLabel = (difficulty) => {
      const labels = { easy: 'Легкий', medium: 'Средний', hard: 'Сложный' }
      return labels[difficulty] || difficulty
    }

    const getNodes = (tree) => {
      try {
        return typeof tree.nodes === 'string' ? JSON.parse(tree.nodes) : tree.nodes
      } catch {
        return []
      }
    }

    const getNodesCount = (tree) => {
      return getNodes(tree).length
    }

    // Загрузка деревьев из БД
    const loadTrees = async () => {
      loading.value = true
      try {
        const token = localStorage.getItem('skilltree_token')
        const response = await fetch('http://localhost:5000/api/library/trees', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (response.ok) {
          const data = await response.json()
          trees.value = data.trees
        }
      } catch (error) {
        console.error('Failed to load trees:', error)
      } finally {
        loading.value = false
      }
    }

    const createNewTree = () => {
      editingTree.value = null
      form.value = {
        name: '',
        description: '',
        category: 'programming',
        nodes: [],
        is_active: true
      }
      showModal.value = true
    }

    const editTree = (tree) => {
      editingTree.value = tree
      form.value = {
        name: tree.name,
        description: tree.description || '',
        category: tree.category,
        nodes: getNodes(tree),
        is_active: tree.is_active
      }
      showModal.value = true
    }

    const saveTree = async () => {
      if (!form.value.name.trim()) {
        alert('Введите название дерева')
        return
      }

      saving.value = true
      try {
        const token = localStorage.getItem('skilltree_token')
        const url = editingTree.value 
          ? `http://localhost:5000/api/admin/trees/${editingTree.value.id}`
          : 'http://localhost:5000/api/admin/trees'
        
        const method = editingTree.value ? 'PUT' : 'POST'
        
        const response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: form.value.name,
            description: form.value.description,
            category: form.value.category,
            nodes: form.value.nodes,
            is_active: form.value.is_active
          })
        })
        
        if (response.ok) {
          await loadTrees()
          closeModal()
        } else {
          const error = await response.json()
          alert('Ошибка: ' + (error.error || 'Неизвестная ошибка'))
        }
      } catch (error) {
        console.error('Failed to save tree:', error)
        alert('Ошибка при сохранении: ' + error.message)
      } finally {
        saving.value = false
      }
    }

    const deleteTree = async (id) => {
      if (!confirm('Удалить это дерево? Все навыки внутри также будут удалены.')) return
      try {
        const token = localStorage.getItem('skilltree_token')
        const response = await fetch(`http://localhost:5000/api/admin/trees/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (response.ok) {
          await loadTrees()
        } else {
          alert('Ошибка при удалении')
        }
      } catch (error) {
        console.error('Failed to delete tree:', error)
        alert('Ошибка при удалении')
      }
    }

    const addSkill = () => {
      form.value.nodes.push({
        name: '',
        description: '',
        difficulty: 'medium',
        level: form.value.nodes.length
      })
    }

    const removeSkill = (index) => {
      form.value.nodes.splice(index, 1)
      // Пересчитываем уровни
      form.value.nodes.forEach((skill, idx) => {
        skill.level = idx
      })
    }

    const moveSkillUp = (index) => {
      if (index > 0) {
        const temp = form.value.nodes[index]
        form.value.nodes[index] = form.value.nodes[index - 1]
        form.value.nodes[index - 1] = temp
        // Пересчитываем уровни
        form.value.nodes.forEach((skill, idx) => {
          skill.level = idx
        })
      }
    }

    const moveSkillDown = (index) => {
      if (index < form.value.nodes.length - 1) {
        const temp = form.value.nodes[index]
        form.value.nodes[index] = form.value.nodes[index + 1]
        form.value.nodes[index + 1] = temp
        // Пересчитываем уровни
        form.value.nodes.forEach((skill, idx) => {
          skill.level = idx
        })
      }
    }

    const increaseLevel = (index) => {
      form.value.nodes[index].level = (form.value.nodes[index].level || 0) + 1
    }

    const decreaseLevel = (index) => {
      if ((form.value.nodes[index].level || 0) > 0) {
        form.value.nodes[index].level = (form.value.nodes[index].level || 0) - 1
      }
    }

    const closeModal = () => {
      showModal.value = false
      editingTree.value = null
    }

    onMounted(() => {
      loadTrees()
    })

    return {
      trees,
      loading,
      saving,
      showModal,
      editingTree,
      form,
      getCategoryName,
      getDifficultyLabel,
      getNodes,
      getNodesCount,
      createNewTree,
      editTree,
      saveTree,
      deleteTree,
      addSkill,
      removeSkill,
      moveSkillUp,
      moveSkillDown,
      increaseLevel,
      decreaseLevel,
      closeModal
    }
  }
}
</script>