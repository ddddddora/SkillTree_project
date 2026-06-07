<template>
  <ScrollAreaPrimitive.Root
    ref="scrollAreaRef"
    :class="cn('relative overflow-hidden', $attrs.class)"
    v-bind="$attrs"
  >
    <ScrollAreaPrimitive.Viewport class="h-full w-full rounded-[inherit]">
      <slot />
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
</template>

<script>
import * as ScrollAreaPrimitive from '@radix-ui/vue-scroll-area'
import { cn } from '@/lib/utils'

export default {
  name: 'ScrollArea',
  components: {
    ScrollAreaPrimitive
  }
}
</script>

<!-- ScrollBar -->
<template>
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref="scrollbarRef"
    :orientation="orientation"
    :class="scrollbarClasses"
    v-bind="$attrs"
  >
    <ScrollAreaPrimitive.ScrollAreaThumb class="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
</template>

<script>
export default {
  name: 'ScrollBar',
  props: {
    orientation: {
      type: String,
      default: 'vertical',
      validator: (value) => ['vertical', 'horizontal'].includes(value)
    },
    className: String
  },
  computed: {
    scrollbarClasses() {
      return cn(
        'flex touch-none select-none transition-colors',
        this.orientation === 'vertical' && 'h-full w-2.5 border-l border-l-transparent p-[1px]',
        this.orientation === 'horizontal' && 'h-2.5 flex-col border-t border-t-transparent p-[1px]',
        this.className
      )
    }
  }
}
</script>

<script>
// Экспорт компонентов ScrollArea
import * as ScrollAreaPrimitive from '@radix-ui/vue-scroll-area'

export {
  ScrollArea,
  ScrollBar
}
</script>