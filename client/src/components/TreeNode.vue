<template>
  <div class="tree-node">
    <div 
      class="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer group"
      :class="{ 'bg-accent': isSelected }"
      @click="$emit('select', node)"
    >
      <Icon 
        v-if="hasChildren"
        :name="isExpanded ? 'ChevronDown' : 'ChevronRight'" 
        :size="16" 
        class="text-muted-foreground"
        @click.stop="toggleExpand"
      />
      <div v-else class="w-4"></div>
      <Icon 
        :name="hasChildren ? 'Folder' : 'File'" 
        :size="16" 
        :class="hasChildren ? 'text-blue-500' : 'text-green-500'" 
      />
      <span class="text-sm flex-1 truncate">{{ node.name }}</span>
      <Button
        variant="ghost"
        size="icon"
        class="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
        @click.stop="$emit('add-child', node.id)"
      >
        <Icon name="Plus" :size="12" />
      </Button>
    </div>
    
    <div v-if="isExpanded && hasChildren" class="ml-4 border-l border-border">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        @select="$emit('select', $event)"
        @add-child="$emit('add-child', $event)"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import Button from '@/components/ui/Button.vue'
import Icon from '@/components/ui/Icon.vue'

export default {
  name: 'TreeNode',
  components: {
    Button,
    Icon
  },
  props: {
    node: {
      type: Object,
      required: true
    },
    level: {
      type: Number,
      default: 0
    }
  },
  emits: ['select', 'add-child'],
  setup(props) {
    const isExpanded = ref(true)
    const isSelected = ref(false)

    const hasChildren = computed(() => {
      return props.node.children && props.node.children.length > 0
    })

    const toggleExpand = () => {
      isExpanded.value = !isExpanded.value
    }

    return {
      isExpanded,
      isSelected,
      hasChildren,
      toggleExpand
    }
  }
}
</script>