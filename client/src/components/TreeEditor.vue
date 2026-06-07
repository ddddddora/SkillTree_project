<template>
  <div class="h-full flex flex-col bg-background">
    <!-- Header -->
    <div class="border-b bg-card p-6 sticky top-0 z-10">
      <div class="flex items-center justify-between max-w-7xl mx-auto">
        <div class="flex items-center gap-4">
          <Button variant="ghost" @click="handleBack">
            <Icon name="ArrowLeft" :size="20" class="mr-2" />
            Назад
          </Button>
          <div class="flex items-center gap-4">
            <div>
              <h1 class="text-2xl font-bold">{{ tree.name }}</h1>
              <p class="text-sm text-muted-foreground">{{ tree.description }}</p>
            </div>
            <Badge :class="getTreeStatusClass(tree.status)">
              {{ getStatusLabel(tree.status) }}
            </Badge>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <div class="text-sm text-muted-foreground mb-1">Общий прогресс</div>
            <div class="flex items-center gap-3">
              <Progress :value="tree.progress" class="w-32" />
              <span class="font-semibold text-lg">{{ tree.progress }}%</span>
            </div>
          </div>
          <Button @click="handleSave">
            <Icon name="Save" :size="20" class="mr-2" />
            Сохранить
          </Button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 overflow-auto p-6">
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Empty State -->
        <div v-if="tree.nodes.length === 0" class="text-center py-16">
          <div class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Icon name="TreePine" :size="40" class="text-primary" />
          </div>
          <h2 class="text-2xl font-bold mb-4">Пустое дерево</h2>
          <p class="text-muted-foreground mb-6 max-w-md mx-auto">
            Начните создавать свое дерево навыков, добавив первый раздел
          </p>
          <Button @click="addSection">
            <Icon name="Plus" :size="18" class="mr-2" />
            Добавить раздел
          </Button>
        </div>

        <!-- Sections -->
        <div 
          v-for="section in tree.nodes" 
          :key="section.id"
          class="border rounded-lg bg-card overflow-hidden"
        >
          <!-- Section Header -->
          <div class="p-6 border-b bg-gradient-to-r from-card to-card/80">
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                  <h2 class="text-xl font-semibold">{{ section.name }}</h2>
                  <Badge :class="getStatusClass(section.status)">
                    {{ getStatusLabel(section.status) }}
                  </Badge>
                  <Badge v-if="section.category" variant="outline">
                    {{ section.category }}
                  </Badge>
                </div>
                <p v-if="section.description" class="text-sm text-muted-foreground">
                  {{ section.description }}
                </p>
              </div>
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <div class="flex items-center gap-2">
                    <Progress :value="calculateSectionProgress(section)" class="w-24" />
                    <span class="text-sm font-medium">{{ calculateSectionProgress(section) }}%</span>
                  </div>
                  <div v-if="section.children && section.children.length > 0" class="text-xs text-muted-foreground mt-1">
                    {{ getCompletedSkills(section) }}/{{ section.children.length }} навыков
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  @click="(e) => openContextMenu(e, section)"
                >
                  <Icon name="MoreVertical" :size="20" />
                </Button>
              </div>
            </div>
          </div>

          <!-- Skills in Section -->
          <div class="p-6 space-y-4">
            <div 
              v-for="skill in section.children" 
              :key="skill.id"
              class="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
              @click="() => editNode(skill)"
            >
              <div class="flex items-start gap-4 flex-1">
                <!-- Skill Status Icon -->
                <div :class="`w-10 h-10 rounded-full flex items-center justify-center ${getSkillStatusClass(skill.status)}`">
                  <Icon 
                    :name="getSkillIcon(skill.status)" 
                    :size="20" 
                    :class="getSkillIconColor(skill.status)"
                  />
                </div>
                
                <!-- Skill Info -->
                <div class="flex-1">
                  <h4 class="font-semibold group-hover:text-primary transition-colors">
                    {{ skill.name }}
                  </h4>
                  <p class="text-sm text-muted-foreground mt-1">{{ skill.description }}</p>
                  
                  <!-- Dependencies -->
                  <div v-if="skill.dependencies && skill.dependencies.length > 0" class="flex items-center gap-2 mt-2">
                    <Icon name="GitBranch" :size="14" class="text-muted-foreground" />
                    <span class="text-xs text-muted-foreground">
                      Требует: {{ skill.dependencies.length }} навык(ов)
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Skill Status (без прогресса) -->
              <div class="text-right">
                <Badge :variant="getSkillBadgeVariant(skill.status)" class="mb-1">
                  {{ getSkillStatusLabel(skill.status) }}
                </Badge>
                <div v-if="skill.difficulty" class="text-xs text-muted-foreground">
                  {{ getDifficultyLabel(skill.difficulty) }}
                </div>
              </div>

              <!-- Skill Actions -->
              <Button
                variant="ghost"
                size="icon"
                class="opacity-0 group-hover:opacity-100 transition-opacity"
                @click.stop="(e) => openContextMenu(e, skill)"
              >
                <Icon name="MoreVertical" :size="16" />
              </Button>
            </div>

            <!-- Add Skill Button -->
            <Button 
              variant="outline" 
              class="w-full"
              @click="() => addSkill(section.id)"
            >
              <Icon name="Plus" :size="16" class="mr-2" />
              Добавить навык
            </Button>
          </div>
        </div>

        <!-- Add Section Button -->
        <Button 
          v-if="tree.nodes.length > 0"
          variant="outline" 
          class="w-full"
          @click="addSection"
        >
          <Icon name="Plus" :size="16" class="mr-2" />
          Добавить раздел
        </Button>
      </div>
    </div>

    <!-- Skill/Node Detail Dialog -->
    <SkillDetailDialog
      v-if="selectedNode"
      :node="selectedNode"
      :onClose="() => selectedNode = null"
      :onUpdate="handleNodeUpdate"
    />

    <!-- Context Menu -->
    <div
      v-if="contextMenu.visible"
      class="fixed z-50 bg-card border rounded-lg shadow-lg py-1 min-w-48"
      :style="{
        left: contextMenu.x + 'px',
        top: contextMenu.y + 'px'
      }"
    >
      <button
        v-for="action in getContextMenuActions()"
        :key="action.label"
        :class="`w-full text-left px-3 py-2 text-sm hover:bg-accent flex items-center gap-2 ${
          action.variant === 'destructive' ? 'text-destructive hover:text-destructive' : ''
        }`"
        @click="action.onClick"
      >
        <Icon :name="action.icon" :size="16" />
        {{ action.label }}
      </button>
    </div>

    <!-- Backdrop for Context Menu -->
    <div
      v-if="contextMenu.visible"
      class="fixed inset-0 z-40"
      @click="closeContextMenu"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'
import Progress from '@/components/ui/Progress.vue'
import Icon from '@/components/ui/Icon.vue'
import SkillDetailDialog from '@/components/SkillDetailDialog.vue'

export default {
  name: 'TreeEditor',
  components: {
    Button,
    Card,
    Badge,
    Progress,
    Icon,
    SkillDetailDialog
  },
  props: {
    tree: {
      type: Object,
      default: () => ({
        id: 'new-tree',
        name: 'Новое дерево навыков',
        description: 'Описание вашего дерева навыков',
        progress: 0,
        status: 'not-started',
        nodes: []
      })
    },
    onBack: {
      type: Function,
      required: true
    },
    onSave: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      selectedNode: null,
      contextMenu: {
        visible: false,
        x: 0,
        y: 0,
        node: null
      },
      localTree: { ...this.tree }
    }
  },
  computed: {
    tree() {
      return this.localTree
    }
  },
  watch: {
    tree: {
      handler(newTree) {
        this.localTree = { ...newTree }
      },
      deep: true
    }
  },
  methods: {
    handleBack() {
      this.onBack()
    },

    handleSave() {
      if (this.onSave) {
        this.onSave(this.tree)
      } else {
        console.log('Сохранение дерева:', this.tree)
      }
    },

    openContextMenu(event, node) {
      event.preventDefault()
      event.stopPropagation()
      
      this.contextMenu = {
        visible: true,
        x: event.clientX,
        y: event.clientY,
        node
      }
    },

    closeContextMenu() {
      this.contextMenu = {
        visible: false,
        x: 0,
        y: 0,
        node: null
      }
    },

    getContextMenuActions() {
      if (!this.contextMenu.node) return []

      const isSection = !this.contextMenu.node.parent_id || this.contextMenu.node.node_type === 'section'
      const actions = [
        {
          label: 'Редактировать',
          icon: 'Edit',
          onClick: () => {
            this.editNode(this.contextMenu.node)
            this.closeContextMenu()
          }
        },
        {
          label: 'Дублировать',
          icon: 'Copy',
          onClick: () => {
            this.duplicateNode(this.contextMenu.node)
            this.closeContextMenu()
          }
        }
      ]

      if (isSection) {
        actions.splice(1, 0, {
          label: 'Добавить навык',
          icon: 'Plus',
          onClick: () => {
            this.addSkill(this.contextMenu.node.id)
            this.closeContextMenu()
          }
        })
      }

      actions.push({
        label: 'Удалить',
        icon: 'Trash2',
        variant: 'destructive',
        onClick: () => {
          this.deleteNode(this.contextMenu.node.id)
          this.closeContextMenu()
        }
      })

      return actions
    },

    editNode(node) {
      this.selectedNode = node
    },

    addSection() {
      const newSection = {
        id: `section-${Date.now()}`,
        name: 'Новый раздел',
        description: 'Описание раздела',
        status: 'not-started',
        progress: 0,
        node_type: 'section',
        children: []
      }

      this.tree.nodes.push(newSection)
      this.recalculateProgress()
    },

    addSkill(parentId) {
      const newSkill = {
        id: `skill-${Date.now()}`,
        name: 'Новый навык',
        description: 'Описание навыка',
        status: 'not-started',
        node_type: 'skill',
        dependencies: []
      }

      const addSkillToNode = (nodes) => {
        return nodes.map(node => {
          if (node.id === parentId) {
            return {
              ...node,
              children: [...(node.children || []), newSkill]
            }
          }
          if (node.children) {
            return {
              ...node,
              children: addSkillToNode(node.children)
            }
          }
          return node
        })
      }

      this.tree.nodes = addSkillToNode(this.tree.nodes)
      this.recalculateProgress()
    },

    duplicateNode(nodeToDuplicate) {
      const duplicatedNode = {
        ...nodeToDuplicate,
        id: `${nodeToDuplicate.id}-copy-${Date.now()}`,
        name: `${nodeToDuplicate.name} (копия)`
      }

      if (nodeToDuplicate.children) {
        duplicatedNode.children = nodeToDuplicate.children.map(child => ({
          ...child,
          id: `${child.id}-copy-${Date.now()}`
        }))
      }

      // Добавляем в тот же уровень
      const parentNodes = this.findParentNodes(this.tree.nodes, nodeToDuplicate.id)
      if (parentNodes) {
        parentNodes.push(duplicatedNode)
      } else {
        this.tree.nodes.push(duplicatedNode)
      }

      this.recalculateProgress()
    },

    findParentNodes(nodes, targetId, parentArray = null) {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === targetId) {
          return parentArray || nodes
        }
        if (nodes[i].children) {
          const result = this.findParentNodes(nodes[i].children, targetId, nodes[i].children)
          if (result) return result
        }
      }
      return null
    },

    deleteNode(nodeId) {
      const deleteFromNodes = (nodes) => {
        return nodes.filter(node => {
          if (node.id === nodeId) return false
          if (node.children) {
            node.children = deleteFromNodes(node.children)
          }
          return true
        })
      }

      this.tree.nodes = deleteFromNodes(this.tree.nodes)
      this.recalculateProgress()
    },

    handleNodeUpdate(updates) {
      const updateNodeInTree = (nodes, nodeId, updates) => {
        return nodes.map(node => {
          if (node.id === nodeId) {
            const updatedNode = { ...node, ...updates }
            
            // Если это навык и обновлен статус, обновляем прогресс
            if (updatedNode.node_type === 'skill' && updates.status) {
              updatedNode.progress = updates.status === 'completed' ? 100 : 0
            }
            
            return updatedNode
          }
          if (node.children) {
            return { ...node, children: updateNodeInTree(node.children, nodeId, updates) }
          }
          return node
        })
      }

      this.tree.nodes = updateNodeInTree(this.tree.nodes, this.selectedNode.id, updates)
      this.recalculateProgress()
      this.selectedNode = null
    },

    calculateSectionProgress(section) {
      if (!section.children || section.children.length === 0) return 0
      
      const skills = section.children.filter(child => 
        (!child.parent_id || child.node_type === 'skill')
      )
      
      if (skills.length === 0) return 0
      
      const completedSkills = skills.filter(skill => skill.status === 'completed').length
      return Math.round((completedSkills / skills.length) * 100)
    },

    recalculateProgress() {
      const calculateNodeProgress = (node) => {
        if (node.children && node.children.length > 0 && (!node.parent_id || node.node_type === 'section')) {
          // Для разделов: прогресс = процент завершенных навыков
          const skills = node.children.filter(child => 
            (!child.parent_id || child.node_type === 'skill')
          )
          
          if (skills.length === 0) {
            return {
              ...node,
              children: node.children.map(calculateNodeProgress),
              progress: 0,
              status: 'not-started'
            }
          }
          
          const completedSkills = skills.filter(skill => skill.status === 'completed').length
          const avgProgress = Math.round((completedSkills / skills.length) * 100)
          
          let status = 'not-started'
          if (avgProgress === 100) status = 'completed'
          else if (avgProgress > 0) status = 'in-progress'

          return {
            ...node,
            children: node.children.map(calculateNodeProgress),
            progress: avgProgress,
            status
          }
        }
        
        // Для навыков: прогресс = 100% если completed, иначе 0%
        const progress = node.status === 'completed' ? 100 : 0
        return {
          ...node,
          progress
        }
      }

      const updatedNodes = this.tree.nodes.map(calculateNodeProgress)
      
      // Рассчитываем общий прогресс дерева
      const sections = updatedNodes.filter(node => !node.parent_id || node.node_type === 'section')
      if (sections.length === 0) {
        this.tree.nodes = updatedNodes
        this.tree.progress = 0
        this.tree.status = 'not-started'
        return
      }
      
      const totalProgress = sections.reduce((sum, node) => sum + (node.progress || 0), 0)
      const avgProgress = Math.round(totalProgress / sections.length)

      let treeStatus = 'not-started'
      if (avgProgress === 100) treeStatus = 'completed'
      else if (avgProgress > 0) treeStatus = 'in-progress'

      this.tree.nodes = updatedNodes
      this.tree.progress = avgProgress
      this.tree.status = treeStatus
    },

    getCompletedSkills(section) {
      if (!section.children) return 0
      return section.children.filter(child => child.status === 'completed').length
    },

    getStatusClass(status) {
      switch (status) {
        case 'completed': return 'bg-green-500 text-white'
        case 'in-progress': return 'bg-yellow-500 text-white'
        default: return 'bg-gray-400 text-white'
      }
    },

    getTreeStatusClass(status) {
      switch (status) {
        case 'completed': return 'bg-green-100 text-green-800 border-green-200'
        case 'in-progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        default: return 'bg-gray-100 text-gray-800 border-gray-200'
      }
    },

    getSkillStatusClass(status) {
      switch (status) {
        case 'completed': return 'bg-green-100'
        case 'in-progress': return 'bg-yellow-100'
        default: return 'bg-gray-100'
      }
    },

    getSkillIcon(status) {
      switch (status) {
        case 'completed': return 'CheckCircle2'
        case 'in-progress': return 'Clock'
        default: return 'Circle'
      }
    },

    getSkillIconColor(status) {
      switch (status) {
        case 'completed': return 'text-green-600'
        case 'in-progress': return 'text-yellow-600'
        default: return 'text-gray-400'
      }
    },

    getSkillBadgeVariant(status) {
      switch (status) {
        case 'completed': return 'default'
        case 'in-progress': return 'secondary'
        default: return 'outline'
      }
    },

    getSkillStatusLabel(status) {
      switch (status) {
        case 'completed': return 'Усвоен'
        case 'in-progress': return 'В процессе'
        default: return 'Не усвоен'
      }
    },

    getDifficultyLabel(difficulty) {
      switch (difficulty) {
        case 'easy': return 'Легкий'
        case 'medium': return 'Средний'
        case 'hard': return 'Сложный'
        default: return 'Без оценки'
      }
    },

    getStatusLabel(status) {
      switch (status) {
        case 'completed': return 'Завершено'
        case 'in-progress': return 'В процессе'
        default: return 'Не начато'
      }
    }
  }
}
</script>