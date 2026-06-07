<template>
  <div class="select-wrapper relative">
    <button
      class="select-trigger flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      :class="className"
      @click="isOpen = !isOpen"
      type="button"
    >
      <span class="select-value truncate">
        <slot name="value">{{ selectedLabel }}</slot>
      </span>
      <Icon name="ChevronDown" class="h-4 w-4 opacity-50" />
    </button>

    <div
      v-if="isOpen"
      class="select-content absolute z-50 mt-1 max-h-60 min-w-[8rem] overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95"
      :class="contentClassName"
    >
      <div class="p-1">
        <!-- Отображаем опции если они переданы -->
        <div
          v-for="option in options"
          :key="option.value"
          class="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground"
          :class="{ 'bg-accent text-accent-foreground': modelValue === option.value }"
          @click="selectOption(option.value)"
        >
          <span 
            v-if="modelValue === option.value"
            class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center"
          >
            <Icon name="Check" class="h-4 w-4" />
          </span>
          {{ option.label }}
        </div>
        
        <!-- Слот для кастомного контента -->
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import Icon from '@/components/ui/Icon.vue'

export default {
  name: 'Select',
  components: {
    Icon
  },
  props: {
    className: String,
    contentClassName: String,
    modelValue: [String, Number],
    options: Array
  },
  emits: ['update:modelValue'],
  data() {
    return {
      isOpen: false
    }
  },
  computed: {
    selectedLabel() {
      const option = this.options?.find(opt => opt.value === this.modelValue)
      return option?.label || this.modelValue || 'Выберите...'
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside)
  },
  methods: {
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.isOpen = false
      }
    },
    
    selectOption(value) {
      this.$emit('update:modelValue', value)
      this.isOpen = false
    }
  }
}
</script>