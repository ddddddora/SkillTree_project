<template>
  <div class="flex h-screen bg-background">
    <Card v-if="isSidebarOpen" class="w-80 rounded-none border-r border-border flex flex-col">
      <CardHeader class="border-b border-border">
        <CardTitle class="text-lg flex items-center justify-between">
          <span>Библиотека навыков</span>
          <Button variant="ghost" size="sm" @click="isSidebarOpen = false">
            <Icon name="ChevronLeft" :size="20" />
          </Button>
        </CardTitle>
      </CardHeader>
      <ScrollArea class="flex-1 p-4">
        <div class="space-y-4">
          <div v-for="category in categories" :key="category">
            <h3 class="text-sm font-semibold text-muted-foreground mb-2">{{ category }}</h3>
            <div class="space-y-2">
              <Button
                v-for="skill in getSkillsByCategory(category)"
                :key="skill.id"
                variant="outline"
                class="w-full justify-start text-left h-auto py-3"
                @click="addNodeToCanvas(skill)"
              >
                <div class="flex items-center gap-2 w-full">
                  <div 
                    class="w-3 h-3 rounded-full" 
                    :style="{ backgroundColor: skill.color }"
                  />
                  <span class="flex-1">{{ skill.title }}</span>
                  <Icon name="Plus" :size="16" class="text-muted-foreground" />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>

    <div class="flex-1 flex flex-col">
      <div class="border-b border-border bg-card p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Button v-if="!isSidebarOpen" variant="outline" size="sm" @click="isSidebarOpen = true">
              <Icon name="PanelLeftOpen" :size="18" class="mr-2" />
              Библиотека
            </Button>
            <h2 class="text-xl font-bold">Конструктор дерева навыков</h2>
          </div>
          <div class="flex items-center gap-2">
            <Badge variant="secondary" class="text-sm">
              Узлов: {{ nodes.length }}
            </Badge>
            <Badge variant="secondary" class="text-sm">
              Связей: {{ links.length }}
            </Badge>
            <Button
              :variant="isLinkMode ? 'default' : 'outline'"
              size="sm"
              @click="toggleLinkMode"
              :class="isLinkMode ? 'bg-primary' : ''"
            >
              <Icon name="Link" :size="16" class="mr-2" />
              {{ getLinkModeText }}
            </Button>
          </div>
        </div>
      </div>

      <div class="flex-1 overflow-hidden bg-gradient-to-br from-background to-muted/20 relative">
        <div v-if="nodes.length === 0" class="absolute inset-0 flex items-center justify-center">
          <div class="text-center space-y-4">
            <Icon name="MousePointerClick" :size="48" class="mx-auto text-muted-foreground" />
            <div>
              <p class="text-lg font-semibold text-foreground">Начните строить дерево навыков</p>
              <p class="text-sm text-muted-foreground mt-2">
                Добавьте навыки из библиотеки слева или создайте свои
              </p>
            </div>
          </div>
        </div>
        <svg ref="svgRef" class="w-full h-full" />
      </div>
    </div>

    <Dialog :open="isEditDialogOpen" @update:open="setIsEditDialogOpen">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Редактировать навык</DialogTitle>
        </DialogHeader>
        <div v-if="selectedNode" class="space-y-4">
          <div>
            <Label for="node-title">Название</Label>
            <Input
              id="node-title"
              :value="selectedNode.title"
              @input="(e) => updateSelectedNode('title', e.target.value)"
            />
          </div>
          <div>
            <Label for="node-desc">Описание</Label>
            <Textarea
              id="node-desc"
              :value="selectedNode.description"
              @input="(e) => updateSelectedNode('description', e.target.value)"
              placeholder="Например: Vue.js - фреймворк для создания интерфейсов"
            />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <Label for="node-status">Статус</Label>
              <Select
                :value="selectedNode.status"
                @update:value="(value) => updateSelectedNode('status', value)"
              >
                <SelectTrigger id="node-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">Не начато</SelectItem>
                  <SelectItem value="in-progress">В процессе</SelectItem>
                  <SelectItem value="completed">Завершено</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label for="node-difficulty">Сложность</Label>
              <Select
                :value="selectedNode.difficulty"
                @update:value="(value) => updateSelectedNode('difficulty', value)"
              >
                <SelectTrigger id="node-difficulty">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">🟢 Легкий</SelectItem>
                  <SelectItem value="medium">🟡 Средний</SelectItem>
                  <SelectItem value="hard">🔴 Сложный</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label for="node-resources">Ресурсы (ссылки через запятую)</Label>
            <Input
              id="node-resources"
              :value="selectedNode.resources.join(', ')"
              @input="(e) => updateSelectedNode('resources', e.target.value.split(',').map(r => r.trim()).filter(r => r))"
              placeholder="https://vuejs.org, https://stepik.org/course/123"
            />
          </div>
          <div>
            <Label for="node-notes">Заметки</Label>
            <Textarea
              id="node-notes"
              :value="selectedNode.notes"
              @input="(e) => updateSelectedNode('notes', e.target.value)"
              placeholder="Прошел курс на Stepik, осталось сделать проект..."
            />
          </div>
          <div class="flex gap-2 pt-4">
            <Button class="flex-1 bg-primary" @click="updateNode">
              Сохранить изменения
            </Button>
            <Button variant="destructive" @click="deleteNode(selectedNode.id)">
              <Icon name="Trash2" :size="16" class="mr-2" />
              Удалить
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script>
import * as d3 from 'd3'

const LIBRARY_SKILLS = [
  { id: 'html-css', title: 'HTML & CSS', category: 'Frontend', color: '#8690a2' },
  { id: 'javascript', title: 'JavaScript', category: 'Frontend', color: '#8690a2' },
  { id: 'typescript', title: 'TypeScript', category: 'Frontend', color: '#8690a2' },
  { id: 'react', title: 'React', category: 'Frontend', color: '#8690a2' },
  { id: 'vue', title: 'Vue.js', category: 'Frontend', color: '#8690a2' },
  { id: 'nodejs', title: 'Node.js', category: 'Backend', color: '#ab9b8e' },
  { id: 'python', title: 'Python', category: 'Backend', color: '#ab9b8e' },
  { id: 'postgresql', title: 'PostgreSQL', category: 'Database', color: '#d2c296' },
  { id: 'mongodb', title: 'MongoDB', category: 'Database', color: '#d2c296' },
  { id: 'docker', title: 'Docker', category: 'DevOps', color: '#b4d1d3' },
  { id: 'git', title: 'Git', category: 'DevOps', color: '#b4d1d3' }
]

export default {
  name: 'SkillTreeBuilder',
  data() {
    return {
      nodes: [],
      links: [],
      selectedNode: null,
      isEditDialogOpen: false,
      isLinkMode: false,
      linkSource: null,
      isSidebarOpen: true,
      LIBRARY_SKILLS,
      categories: ['Frontend', 'Backend', 'Database', 'DevOps']
    }
  },
  computed: {
    getLinkModeText() {
      if (!this.isLinkMode) return 'Создать связь'
      return this.linkSource ? 'Выберите цель связи' : 'Выберите источник'
    }
  },
  mounted() {
    this.renderD3()
  },
  watch: {
    nodes: {
      handler() {
        this.$nextTick(() => {
          this.renderD3()
        })
      },
      deep: true
    },
    links: {
      handler() {
        this.$nextTick(() => {
          this.renderD3()
        })
      },
      deep: true
    },
    isLinkMode() {
      this.$nextTick(() => {
        this.renderD3()
      })
    }
  },
  methods: {
    getSkillsByCategory(category) {
      return this.LIBRARY_SKILLS.filter(skill => skill.category === category)
    },

    addNodeToCanvas(librarySkill, dropX, dropY) {
      const newNode = {
        id: `${librarySkill.id}-${Date.now()}`,
        title: librarySkill.title,
        description: '',
        status: 'not-started',
        difficulty: 'medium',
        resources: [],
        notes: '',
        x: dropX || 400 + Math.random() * 200,
        y: dropY || 200 + Math.random() * 200,
        color: librarySkill.color
      }
      this.nodes.push(newNode)
    },

    handleNodeClick(nodeId) {
      if (this.isLinkMode) {
        if (!this.linkSource) {
          this.linkSource = nodeId
        } else if (this.linkSource !== nodeId) {
          this.links.push({ source: this.linkSource, target: nodeId })
          this.linkSource = null
          this.isLinkMode = false
        }
      } else {
        const node = this.nodes.find(n => n.id === nodeId)
        if (node) {
          this.selectedNode = { ...node }
          this.isEditDialogOpen = true
        }
      }
    },

    updateSelectedNode(field, value) {
      if (this.selectedNode) {
        this.selectedNode = {
          ...this.selectedNode,
          [field]: value
        }
      }
    },

    updateNode() {
      if (this.selectedNode) {
        const index = this.nodes.findIndex(n => n.id === this.selectedNode.id)
        if (index !== -1) {
          this.nodes.splice(index, 1, this.selectedNode)
        }
        this.selectedNode = null
        this.isEditDialogOpen = false
      }
    },

    deleteNode(nodeId) {
      this.nodes = this.nodes.filter(n => n.id !== nodeId)
      this.links = this.links.filter(l => l.source !== nodeId && l.target !== nodeId)
      this.isEditDialogOpen = false
    },

    deleteLink(source, target) {
      if (confirm('Удалить связь?')) {
        this.links = this.links.filter(l => !(l.source === source && l.target === target))
      }
    },

    toggleLinkMode() {
      this.isLinkMode = !this.isLinkMode
      this.linkSource = null
    },

    setIsEditDialogOpen(value) {
      this.isEditDialogOpen = value
      if (!value) {
        this.selectedNode = null
      }
    },

    renderD3() {
      if (!this.$refs.svgRef) return

      const svg = d3.select(this.$refs.svgRef)
      const width = 1400
      const height = 800

      svg.selectAll('*').remove()
      svg.attr('viewBox', `0 0 ${width} ${height}`)

      // Filters and markers
      const defs = svg.append('defs')
      const glowFilter = defs.append('filter')
        .attr('id', 'node-glow')
        .attr('x', '-50%')
        .attr('y', '-50%')
        .attr('width', '200%')
        .attr('height', '200%')

      glowFilter.append('feGaussianBlur')
        .attr('stdDeviation', '6')
        .attr('result', 'coloredBlur')

      const feMerge = glowFilter.append('feMerge')
      feMerge.append('feMergeNode').attr('in', 'coloredBlur')
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

      // Links
      const linkGroup = svg.append('g').attr('class', 'links')

      linkGroup.selectAll('path')
        .data(this.links)
        .enter()
        .append('path')
        .attr('d', d => {
          const sourceNode = this.nodes.find(n => n.id === d.source)
          const targetNode = this.nodes.find(n => n.id === d.target)
          if (!sourceNode || !targetNode) return ''

          const dx = targetNode.x - sourceNode.x
          const dy = targetNode.y - sourceNode.y
          const dr = Math.sqrt(dx * dx + dy * dy)

          return `M ${sourceNode.x} ${sourceNode.y} Q ${(sourceNode.x + targetNode.x) / 2} ${(sourceNode.y + targetNode.y) / 2 - 50} ${targetNode.x} ${targetNode.y}`
        })
        .attr('fill', 'none')
        .attr('stroke', '#8690a2')
        .attr('stroke-width', 3)
        .attr('opacity', 0.4)
        .attr('marker-end', 'url(#arrowhead)')
        .style('cursor', 'pointer')
        .on('click', (event, d) => {
          event.stopPropagation()
          this.deleteLink(d.source, d.target)
        })

      defs.append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 40)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#8690a2')
        .attr('opacity', 0.6)

      // Nodes
      const hexagonPath = (size) => {
        const points = []
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i - Math.PI / 6
          const x = size * Math.cos(angle)
          const y = size * Math.sin(angle)
          points.push(`${x},${y}`)
        }
        return `M ${points.join(' L ')} Z`
      }

      const nodeGroup = svg.append('g').attr('class', 'nodes')

      const drag = d3.drag()
        .on('start', function(event, d) {
          d3.select(this).raise()
        })
        .on('drag', function(event, d) {
          d.x = event.x
          d.y = event.y
          d3.select(this).attr('transform', `translate(${d.x}, ${d.y})`)
          
          linkGroup.selectAll('path').attr('d', (linkData) => {
            const sourceNode = this.nodes.find(n => n.id === linkData.source)
            const targetNode = this.nodes.find(n => n.id === linkData.target)
            if (!sourceNode || !targetNode) return ''
            return `M ${sourceNode.x} ${sourceNode.y} Q ${(sourceNode.x + targetNode.x) / 2} ${(sourceNode.y + targetNode.y) / 2 - 50} ${targetNode.x} ${targetNode.y}`
          })
        }.bind(this))
        .on('end', function(event, d) {
          const index = this.nodes.findIndex(n => n.id === d.id)
          if (index !== -1) {
            this.nodes.splice(index, 1, { ...d, x: d.x, y: d.y })
          }
        }.bind(this))

      const nodeElements = nodeGroup.selectAll('g')
        .data(this.nodes)
        .enter()
        .append('g')
        .attr('transform', d => `translate(${d.x}, ${d.y})`)
        .style('cursor', 'move')
        .call(drag)

      nodeElements.append('path')
        .attr('d', hexagonPath(40))
        .attr('fill', d => {
          if (d.status === 'completed') return d.color
          if (d.status === 'in-progress') return '#FFFFFF'
          return '#F5F5F5'
        })
        .attr('stroke', d => d.color)
        .attr('stroke-width', d => d.status === 'in-progress' ? 5 : 3)
        .attr('filter', d => d.status === 'in-progress' ? 'url(#node-glow)' : 'none')
        .on('click', (event, d) => {
          event.stopPropagation()
          this.handleNodeClick(d.id)
        })

      nodeElements.filter(d => d.status === 'completed')
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.4em')
        .attr('font-size', '24px')
        .attr('fill', '#FFFFFF')
        .attr('font-weight', 'bold')
        .text('✓')

      nodeElements.filter(d => d.status === 'in-progress')
        .append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 15)
        .attr('fill', 'none')
        .attr('stroke', d => d.color)
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '5,5')
        .append('animateTransform')
        .attr('attributeName', 'transform')
        .attr('type', 'rotate')
        .attr('from', '0 0 0')
        .attr('to', '360 0 0')
        .attr('dur', '3s')
        .attr('repeatCount', 'indefinite')

      nodeElements.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', 60)
        .attr('font-size', '14px')
        .attr('font-weight', '600')
        .attr('fill', '#4A4A4A')
        .text(d => d.title.length > 12 ? d.title.substring(0, 12) + '...' : d.title)

      const difficultyIcons = {
        'easy': '🟢',
        'medium': '🟡',
        'hard': '🔴'
      }

      nodeElements.append('text')
        .attr('text-anchor', 'middle')
        .attr('y', -55)
        .attr('font-size', '16px')
        .text(d => difficultyIcons[d.difficulty])
    }
  }
}
</script>
