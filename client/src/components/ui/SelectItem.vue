<template>
  <div
    class="select-item relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground"
    :class="[className, { 'bg-accent text-accent-foreground': isSelected }]"
    @click="$emit('select', value)"
  >
    <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <span v-if="isSelected" class="text-sm">✓</span>
    </span>
    <span class="select-item-text">
      <slot>{{ label }}</slot>
    </span>
  </div>
</template>

<script>
export default {
  name: 'SelectItem',
  props: {
    value: [String, Number],
    label: String,
    className: String
  },
  inject: ['select'],
  computed: {
    isSelected() {
      return this.select.modelValue === this.value
    }
  },
  emits: ['select']
}
</script>