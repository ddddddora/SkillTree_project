<template>
  <caption
    ref="captionRef"
    :class="captionClasses"
    v-bind="$attrs"
  >
    <slot />
  </caption>
</template>

<script>
import { cn } from '@/lib/utils'

export default {
  name: 'TableCaption',
  inheritAttrs: false,
  props: {
    className: String
  },
  computed: {
    captionClasses() {
      return cn('mt-4 text-sm text-muted-foreground', this.className)
    }
  }
}
</script>