<template>
  <div class="fixed inset-0 z-50">
    <div
      ref="menuRef"
      class="absolute min-w-[200px] shadow-lg bg-card border rounded-lg"
      :style="{ top: y + 'px', left: x + 'px' }"
    >
      <div class="py-1">
        <button
          v-for="(action, index) in actions"
          :key="index"
          @click="handleActionClick(action)"
          class="w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-accent transition-colors"
          :class="action.variant === 'destructive' ? 'text-destructive hover:bg-destructive/10' : ''"
        >
          <Icon :name="action.icon" :size="16" />
          <span class="text-sm">{{ action.label }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContextMenu',
  props: {
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    },
    onClose: {
      type: Function,
      required: true
    },
    actions: {
      type: Array,
      required: true
    }
  },
  mounted() {
    this.addEventListeners()
  },
  beforeUnmount() {
    this.removeEventListeners()
  },
  methods: {
    handleActionClick(action) {
      action.onClick()
      this.onClose()
    },
    
    handleClickOutside(event) {
      if (this.$refs.menuRef && !this.$refs.menuRef.contains(event.target)) {
        this.onClose()
      }
    },
    
    handleEscape(event) {
      if (event.key === 'Escape') {
        this.onClose()
      }
    },
    
    addEventListeners() {
      document.addEventListener('mousedown', this.handleClickOutside)
      document.addEventListener('keydown', this.handleEscape)
    },
    
    removeEventListeners() {
      document.removeEventListener('mousedown', this.handleClickOutside)
      document.removeEventListener('keydown', this.handleEscape)
    }
  }
}
</script>
