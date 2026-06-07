<template>
  <div class="h-full flex">
    <!-- Боковая панель с инструментами -->
    <div class="w-80 border-r bg-card flex flex-col">
      <!-- Инструменты -->
      <div class="p-4 border-b">
        <h3 class="font-semibold mb-3 text-lg">Инструменты</h3>
        <div class="space-y-2">
          <Button variant="outline" class="w-full justify-start" @click="handleAddSection">
            <Icon name="FolderPlus" :size="16" class="mr-2" />
            Добавить раздел
          </Button>
          <Button variant="outline" class="w-full justify-start" @click="toggleSkillsLibrary">
            <Icon name="Library" :size="16" class="mr-2" />
            Библиотека навыков
          </Button>
        </div>
      </div>

      <!-- Структура дерева -->
      <div class="flex-1 p-4 overflow-auto">
        <h3 class="font-semibold mb-3 text-lg">Структура</h3>
        <div class="space-y-2">
          <TreeNode
            v-for="node in tree.nodes"
            :key="node.id"
            :node="node"
            :level="0"
            @select="handleNodeSelect"
            @add-child="handleAddChildSkill"
          />
        </div>
      </div>

      <!-- Прогресс -->
      <div class="p-4 border-t">
        <h3 class="font-semibold mb-3 text-lg">Прогресс</h3>
        <div class="space-y-3">
          <div>
            <div class="flex items-center justify-between mb-1">
              <span class="text-sm">Общий прогресс</span>
              <span class="text-sm font-medium">{{ tree.progress || 0 }}%</span>
            </div>
            <Progress :value="tree.progress || 0" class="h-2" />
          </div>
          
          <div v-if="sectionsCount > 0" class="text-xs text-muted-foreground">
            <div class="flex justify-between mb-1">
              <span>Разделов:</span>
              <span>{{ sectionsCount }}</span>
            </div>
            <div class="flex justify-between">
              <span>Навыков всего:</span>
              <span>{{ totalSkills }}</span>
            </div>
            <div class="flex justify-between">
              <span>Усвоено навыков:</span>
              <span class="font-medium text-green-600">{{ completedSkills }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Подсказки по управлению -->
      <div class="p-4 border-t bg-muted/50">
        <h3 class="font-semibold mb-2 text-sm">Управление холстом:</h3>
        <div class="space-y-1 text-xs text-muted-foreground">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-primary/20 rounded flex items-center justify-center">
              <Icon name="Mouse" :size="10" />
            </div>
            <span>ЛКМ + перемещение: перетаскивание узлов</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-blue-500/20 rounded flex items-center justify-center">
              <Icon name="Mouse" :size="10" />
            </div>
            <span>ПКМ + перемещение: перемещение камеры</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-green-500/20 rounded flex items-center justify-center">
              <Icon name="ZoomIn" :size="10" />
            </div>
            <span>Колесико мыши: масштабирование</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 bg-orange-500/20 rounded flex items-center justify-center">
              <Icon name="RefreshCw" :size="10" />
            </div>
            <span>Кнопки справа: управление масштабом</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Основная область -->
    <div class="flex-1 flex flex-col min-h-0">
      <!-- Header -->
      <div class="border-b bg-card p-4 flex items-center justify-between shrink-0">
        <div class="flex items-center gap-4">
          <Button variant="ghost" size="sm" @click="onBack">
            <Icon name="ArrowLeft" :size="18" class="mr-2" />
            Назад
          </Button>
          <div>
            <h1 class="text-xl font-bold">{{ tree.name }}</h1>
            <p class="text-xs text-muted-foreground">{{ tree.description }}</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex gap-2">
            <div class="bg-black/80 text-white px-3 py-1 rounded text-sm">
              Масштаб: {{ Math.round(canvasScale * 100) }}%
            </div>
            <div v-if="isDraggingCamera" class="bg-blue-600 text-white px-3 py-1 rounded text-sm">
              Перетаскивание камеры
            </div>
            <div v-if="draggedNode" class="bg-green-600 text-white px-3 py-1 rounded text-sm">
              Перетаскивание узла
            </div>
          </div>
          
          <Button variant="outline" size="sm" @click="handleExport">
            <Icon name="Download" :size="16" class="mr-2" />
            Экспорт
          </Button>
          <Button size="sm" @click="handleSave" :disabled="isSaving">
            <Icon name="Save" :size="16" class="mr-2" />
            {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
          </Button>
        </div>
      </div>

      <!-- Canvas Area -->
      <div class="flex-1 relative overflow-hidden bg-grid-pattern" style="min-height: 70vh;">
        <div 
          ref="canvasContainer"
          class="w-full h-full relative overflow-auto"
          @mousedown="handleCanvasMouseDown"
          @mousemove="handleCanvasMouseMove"
          @mouseup="handleCanvasMouseUp"
          @wheel="handleCanvasWheel"
          @contextmenu.prevent="handleContextMenu"
        >
          <div 
            class="absolute"
            :style="{
              transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${canvasScale})`,
              transformOrigin: '0 0',
              width: '20000px',
              height: '20000px'
            }"
          >
            <!-- Связи между узлами -->
            <svg class="absolute inset-0 pointer-events-none" width="20000" height="20000" style="z-index: 1;">
              <line
                v-for="link in nodeLinks"
                :key="`${link.source.id}-${link.target.id}`"
                :x1="link.source.position_x + 125"
                :y1="link.source.position_y + 40"
                :x2="link.target.position_x + 125"
                :y2="link.target.position_y + 40"
                stroke="#64748b"
                stroke-width="3"
                stroke-linecap="round"
              />
            </svg>

            <!-- Узлы -->
            <CanvasNode
              v-for="node in allNodes"
              :key="node.id"
              :node="node"
              :x="node.position_x"
              :y="node.position_y"
              :is-dragging="draggedNode?.id === node.id"
              :on-mouse-down="(e) => startNodeDrag(e, node)"
              :on-click="() => handleNodeClick(node)"
            />
          </div>
        </div>
        
        <!-- Контролы масштабирования -->
        <div class="absolute bottom-6 right-6 flex flex-col gap-3">
          <Button variant="outline" size="icon" class="w-10 h-10" @click="zoomIn">
            <Icon name="Plus" :size="18" />
          </Button>
          <Button variant="outline" size="icon" class="w-10 h-10" @click="zoomOut">
            <Icon name="Minus" :size="18" />
          </Button>
          <Button variant="outline" size="icon" class="w-10 h-10" @click="resetView">
            <Icon name="RefreshCw" :size="18" />
          </Button>
          <Button variant="outline" size="icon" class="w-10 h-10" @click="centerViewOnNodes">
            <Icon name="Focus" :size="18" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Диалоги -->
    <SkillDetailDialog
      v-if="selectedNode"
      :node="selectedNode"
      :onClose="() => selectedNode = null"
      :onUpdate="handleNodeUpdate"
      :onDelete="handleNodeDelete"
    />

    <SkillsLibraryPanel
      v-if="showSkillsLibrary"
      :onClose="toggleSkillsLibrary"
      :onAddTree="handleAddTreeFromLibrary"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import Button from '@/components/ui/Button.vue'
import Icon from '@/components/ui/Icon.vue'
import Progress from '@/components/ui/Progress.vue'
import SkillDetailDialog from '@/components/SkillDetailDialog.vue'
import SkillsLibraryPanel from '@/components/SkillsLibraryPanel.vue'
import CanvasNode from '@/components/CanvasNode.vue'
import TreeNode from '@/components/TreeNode.vue'

export default {
  name: 'CanvasEditor',
  components: {
    Button,
    Icon,
    Progress,
    SkillDetailDialog,
    SkillsLibraryPanel,
    CanvasNode,
    TreeNode
  },
  props: {
    tree: {
      type: Object,
      required: true
    },
    onBack: {
      type: Function,
      required: true
    },
    onSave: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    const store = useStore()
    const tree = ref({ ...props.tree })
    const selectedNode = ref(null)
    const showSkillsLibrary = ref(false)
    const isSaving = ref(false)
    const draggedNode = ref(null)
    const dragOffset = ref({ x: 0, y: 0 })
    const canvasScale = ref(1)
    const canvasOffset = ref({ x: 0, y: 0 })
    const isDraggingCamera = ref(false)
    const lastMousePos = ref({ x: 0, y: 0 })
    const canvasContainer = ref(null)

    const allNodes = computed(() => {
      const nodes = []
      const collectNodes = (nodeList) => {
        nodeList.forEach(node => {
          nodes.push(node)
          if (node.children) {
            collectNodes(node.children)
          }
        })
      }
      collectNodes(tree.value.nodes || [])
      return nodes
    })

    const nodeLinks = computed(() => {
      const links = []
      const processNode = (node) => {
        if (node.children) {
          node.children.forEach(child => {
            links.push({ source: node, target: child })
            processNode(child)
          })
        }
      }
      tree.value.nodes.forEach(processNode)
      return links
    })
    
    const sectionsCount = computed(() => {
      let count = 0
      const countSections = (nodes) => {
        nodes.forEach(node => {
          if (node.node_type === 'section') count++
          if (node.children) countSections(node.children)
        })
      }
      if (tree.value.nodes) countSections(tree.value.nodes)
      return count
    })
    
    const totalSkills = computed(() => {
      let count = 0
      const countSkills = (nodes) => {
        nodes.forEach(node => {
          if (node.node_type === 'skill') count++
          if (node.children) countSkills(node.children)
        })
      }
      if (tree.value.nodes) countSkills(tree.value.nodes)
      return count
    })
    
    const completedSkills = computed(() => {
      let count = 0
      const countCompleted = (nodes) => {
        nodes.forEach(node => {
          if (node.node_type === 'skill' && node.status === 'completed') count++
          if (node.children) countCompleted(node.children)
        })
      }
      if (tree.value.nodes) countCompleted(tree.value.nodes)
      return count
    })

    const getViewportCenter = () => {
      if (!canvasContainer.value) return { x: 500, y: 300 }
      const rect = canvasContainer.value.getBoundingClientRect()
      const centerX = (-canvasOffset.value.x + rect.width / 2) / canvasScale.value
      const centerY = (-canvasOffset.value.y + rect.height / 2) / canvasScale.value
      return { x: Math.round(centerX), y: Math.round(centerY) }
    }

    const handleAddSection = async () => {
      try {
        const viewportCenter = getViewportCenter()
        const newSection = {
          tree_id: tree.value.id,
          name: 'Новый раздел',
          description: 'Описание раздела',
          status: 'not-started',
          difficulty: 'medium',
          resources: [],
          notes: '',
          position_x: Math.round(viewportCenter.x),
          position_y: Math.round(viewportCenter.y),
          color: '#8690a2',
          node_type: 'section'
        }
        const response = await store.dispatch('tree/createNode', newSection)
        if (!response || !response.id) throw new Error('Invalid response')
        const newNode = { ...response, children: [] }
        if (!tree.value.nodes) tree.value.nodes = []
        if (!tree.value.nodes.some(node => node.id === response.id)) {
          tree.value.nodes.push(newNode)
        }
      } catch (error) {
        console.error('Failed to create section:', error)
        alert(`Не удалось создать раздел: ${error.message}`)
      }
    }

    const handleAddSkill = async (parentId = null) => {
      try {
        const viewportCenter = getViewportCenter()
        const newSkill = {
          tree_id: tree.value.id,
          parent_id: parentId,
          name: 'Новый навык',
          description: 'Описание навыка',
          status: 'not-started',
          difficulty: 'medium',
          resources: [],
          notes: '',
          position_x: Math.round(viewportCenter.x),
          position_y: Math.round(viewportCenter.y),
          color: '#10b981',
          node_type: 'skill'
        }
        const response = await store.dispatch('tree/createNode', newSkill)
        if (!response || !response.id) throw new Error('Invalid response')
        const createdSkill = response
        if (parentId) {
          const findAndAddToParent = (nodes) => {
            return nodes.map(node => {
              if (node.id === parentId) {
                return { ...node, children: [...(node.children || []), { ...createdSkill, children: [] }] }
              }
              if (node.children) {
                return { ...node, children: findAndAddToParent(node.children) }
              }
              return node
            })
          }
          tree.value.nodes = findAndAddToParent(tree.value.nodes)
        } else {
          if (!tree.value.nodes) tree.value.nodes = []
          tree.value.nodes.push({ ...createdSkill, children: [] })
        }
      } catch (error) {
        console.error('Failed to create skill:', error)
        alert(`Ошибка при создании навыка: ${error.message}`)
      }
    }

    const handleAddChildSkill = (parentId) => {
      handleAddSkill(parentId)
    }

    const handleNodeSelect = (node) => {
      selectedNode.value = node
    }

    const handleNodeClick = (node) => {
      selectedNode.value = node
    }

    const handleNodeUpdate = async (updates) => {
      try {
        const response = await store.dispatch('tree/updateNode', {
          nodeId: selectedNode.value.id,
          updates: updates
        })
        if (response) {
          const updateNodeInTree = (nodes, nodeId, updates) => {
            return nodes.map(node => {
              if (node.id === nodeId) return { ...node, ...updates }
              if (node.children) return { ...node, children: updateNodeInTree(node.children, nodeId, updates) }
              return node
            })
          }
          tree.value.nodes = updateNodeInTree(tree.value.nodes, selectedNode.value.id, updates)
          selectedNode.value = null
        }
      } catch (error) {
        console.error('Failed to update node:', error)
        alert('Ошибка при обновлении: ' + error.message)
      }
    }

    const handleNodeDelete = async (nodeId) => {
      try {
        await store.dispatch('tree/deleteNode', nodeId)
        const deleteFromNodes = (nodes) => {
          return nodes.filter(node => {
            if (node.id === nodeId) return false
            if (node.children) node.children = deleteFromNodes(node.children)
            return true
          })
        }
        tree.value.nodes = deleteFromNodes(tree.value.nodes)
        selectedNode.value = null
      } catch (error) {
        console.error('Failed to delete node:', error)
        alert('Ошибка при удалении: ' + error.message)
      }
    }

    const handleSave = async () => {
      isSaving.value = true
      try {
        await props.onSave(tree.value)
      } catch (error) {
        console.error('Failed to save tree:', error)
        alert('Ошибка при сохранении: ' + error.message)
      } finally {
        isSaving.value = false
      }
    }

    const handleExport = () => {
      const dataStr = JSON.stringify(tree.value, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', `skill-tree-${tree.value.name}-${new Date().toISOString().split('T')[0]}.json`)
      linkElement.click()
    }

    const toggleSkillsLibrary = () => {
      showSkillsLibrary.value = !showSkillsLibrary.value
    }

    const handleAddTreeFromLibrary = async (treeData) => {
      try {
        console.log('Adding tree from library:', treeData)
        const viewportCenter = getViewportCenter()
        const newSection = {
          tree_id: tree.value.id,
          name: treeData.name,
          description: treeData.description,
          status: 'not-started',
          difficulty: 'medium',
          resources: [],
          notes: '',
          position_x: Math.round(viewportCenter.x),
          position_y: Math.round(viewportCenter.y),
          color: '#8690a2',
          node_type: 'section'
        }
        const response = await store.dispatch('tree/createNode', newSection)
        if (!response || !response.id) throw new Error('Failed to create section')
        const createdSection = response
        if (!tree.value.nodes) tree.value.nodes = []
        const sectionWithChildren = { ...createdSection, children: [] }
        tree.value.nodes.push(sectionWithChildren)
        let currentY = viewportCenter.y + 120
        for (const skillData of treeData.nodes) {
          const newSkill = {
            tree_id: tree.value.id,
            parent_id: createdSection.id,
            name: skillData.name,
            description: skillData.description,
            status: 'not-started',
            difficulty: skillData.difficulty || 'medium',
            resources: [],
            notes: '',
            position_x: Math.round(viewportCenter.x + (skillData.level || 0) * 50),
            position_y: Math.round(currentY + (skillData.level || 0) * 80),
            color: '#10b981',
            node_type: 'skill'
          }
          const skillResponse = await store.dispatch('tree/createNode', newSkill)
          if (skillResponse && skillResponse.id) {
            sectionWithChildren.children.push({ ...skillResponse, children: [] })
          }
          currentY += 100
        }
        showSkillsLibrary.value = false
        console.log('Tree added successfully')
      } catch (error) {
        console.error('Failed to add tree from library:', error)
        alert(`Ошибка при добавлении дерева: ${error.message}`)
      }
    }

    const startNodeDrag = (event, node) => {
      event.preventDefault()
      event.stopPropagation()
      const rect = canvasContainer.value.getBoundingClientRect()
      const scale = canvasScale.value
      const offset = canvasOffset.value
      const worldX = (event.clientX - rect.left - offset.x) / scale
      const worldY = (event.clientY - rect.top - offset.y) / scale
      draggedNode.value = node
      dragOffset.value = { x: worldX - node.position_x, y: worldY - node.position_y }
      document.addEventListener('mousemove', handleDocumentMouseMove)
      document.addEventListener('mouseup', handleDocumentMouseUp)
    }

    const handleDocumentMouseMove = (event) => {
      if (!draggedNode.value || !canvasContainer.value) return
      const rect = canvasContainer.value.getBoundingClientRect()
      const scale = canvasScale.value
      const offset = canvasOffset.value
      const worldX = (event.clientX - rect.left - offset.x) / scale
      const worldY = (event.clientY - rect.top - offset.y) / scale
      draggedNode.value.position_x = Math.round(worldX - dragOffset.value.x)
      draggedNode.value.position_y = Math.round(worldY - dragOffset.value.y)
    }

    const handleDocumentMouseUp = async () => {
      if (draggedNode.value) {
        try {
          await store.dispatch('tree/updateNode', {
            nodeId: draggedNode.value.id,
            updates: {
              position_x: draggedNode.value.position_x,
              position_y: draggedNode.value.position_y
            }
          })
        } catch (error) {
          console.error('Failed to update node position:', error)
        } finally {
          draggedNode.value = null
        }
      }
      document.removeEventListener('mousemove', handleDocumentMouseMove)
      document.removeEventListener('mouseup', handleDocumentMouseUp)
    }

    const handleCanvasMouseDown = (event) => {
      if (event.button === 2) {
        event.preventDefault()
        isDraggingCamera.value = true
        lastMousePos.value = { x: event.clientX, y: event.clientY }
        canvasContainer.value.style.cursor = 'grabbing'
        return
      }
      if (event.button === 0 && event.target === canvasContainer.value) {
        selectedNode.value = null
      }
    }

    const handleCanvasMouseMove = (event) => {
      if (isDraggingCamera.value) {
        const deltaX = event.clientX - lastMousePos.value.x
        const deltaY = event.clientY - lastMousePos.value.y
        canvasOffset.value = {
          x: canvasOffset.value.x + deltaX,
          y: canvasOffset.value.y + deltaY
        }
        lastMousePos.value = { x: event.clientX, y: event.clientY }
      }
    }

    const handleCanvasMouseUp = () => {
      if (isDraggingCamera.value) {
        isDraggingCamera.value = false
        canvasContainer.value.style.cursor = ''
      }
    }

    const handleCanvasWheel = (event) => {
      event.preventDefault()
      if (!canvasContainer.value) return
      const rect = canvasContainer.value.getBoundingClientRect()
      const mouseX = event.clientX - rect.left
      const mouseY = event.clientY - rect.top
      const worldX = (mouseX - canvasOffset.value.x) / canvasScale.value
      const worldY = (mouseY - canvasOffset.value.y) / canvasScale.value
      const delta = -event.deltaY * 0.001
      const newScale = Math.max(0.1, Math.min(3, canvasScale.value + delta))
      const newOffsetX = mouseX - worldX * newScale
      const newOffsetY = mouseY - worldY * newScale
      canvasScale.value = newScale
      canvasOffset.value = { x: newOffsetX, y: newOffsetY }
    }

    const handleContextMenu = (event) => {
      event.preventDefault()
    }

    const zoomIn = () => {
      canvasScale.value = Math.min(3, canvasScale.value + 0.2)
    }

    const zoomOut = () => {
      canvasScale.value = Math.max(0.1, canvasScale.value - 0.2)
    }

    const resetView = () => {
      canvasScale.value = 1
      canvasOffset.value = { x: 0, y: 0 }
    }

    const centerViewOnNodes = () => {
      if (allNodes.value.length === 0) return
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      allNodes.value.forEach(node => {
        minX = Math.min(minX, node.position_x)
        minY = Math.min(minY, node.position_y)
        maxX = Math.max(maxX, node.position_x + 250)
        maxY = Math.max(maxY, node.position_y + 120)
      })
      const centerX = (minX + maxX) / 2
      const centerY = (minY + maxY) / 2
      if (canvasContainer.value) {
        const rect = canvasContainer.value.getBoundingClientRect()
        canvasOffset.value = {
          x: rect.width / 2 - centerX * canvasScale.value,
          y: rect.height / 2 - centerY * canvasScale.value
        }
      }
    }

    onMounted(() => {
      if (!tree.value.nodes) tree.value.nodes = []
      setTimeout(() => centerViewOnNodes(), 100)
    })

    onUnmounted(() => {
      document.removeEventListener('mousemove', handleDocumentMouseMove)
      document.removeEventListener('mouseup', handleDocumentMouseUp)
    })

    return {
      tree,
      selectedNode,
      showSkillsLibrary,
      isSaving,
      draggedNode,
      canvasScale,
      canvasOffset,
      isDraggingCamera,
      canvasContainer,
      allNodes,
      nodeLinks,
      sectionsCount,
      totalSkills,
      completedSkills,
      handleAddSection,
      handleAddSkill,
      handleAddChildSkill,
      handleNodeSelect,
      handleNodeClick,
      handleNodeUpdate,
      handleNodeDelete,
      handleSave,
      handleExport,
      toggleSkillsLibrary,
      handleAddTreeFromLibrary,
      startNodeDrag,
      handleCanvasMouseDown,
      handleCanvasMouseMove,
      handleCanvasMouseUp,
      handleCanvasWheel,
      handleContextMenu,
      zoomIn,
      zoomOut,
      resetView,
      centerViewOnNodes,
      onBack: props.onBack
    }
  }
}
</script>

<style scoped>
.bg-grid-pattern {
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>