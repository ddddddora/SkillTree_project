<template>
  <div
    ref="separatorRef"
    :class="separatorClasses"
    v-bind="$attrs"
  />
</template>

<script>
import { cn } from '@/lib/utils'

export default {
  name: 'Separator',
  inheritAttrs: false,
  props: {
    className: String,
    orientation: {
      type: String,
      default: 'horizontal',
      validator: (value) => ['horizontal', 'vertical'].includes(value)
    },
    decorative: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    separatorClasses() {
      return cn(
        'shrink-0 bg-border',
        this.orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
        this.className
      )
    }
  }
}
</script>