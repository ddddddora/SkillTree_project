<template>
  <component :is="iconComponent" v-bind="iconProps" />
</template>

<script>
import { computed } from 'vue'
import * as LucideIcons from 'lucide-vue-next'

export default {
  name: 'Icon',
  props: {
    name: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      default: 24
    },
    color: {
      type: String,
      default: 'currentColor'
    },
    strokeWidth: {
      type: Number,
      default: 2
    },
    fallback: {
      type: String,
      default: 'CircleAlert'
    }
  },
  setup(props) {
    const iconComponent = computed(() => {
      const IconComp = LucideIcons[props.name]
      
      if (!IconComp) {
        const FallbackIcon = LucideIcons[props.fallback]
        if (!FallbackIcon) {
          return 'span'
        }
        return FallbackIcon
      }
      
      return IconComp
    })

    const iconProps = computed(() => ({
      size: props.size,
      color: props.color,
      strokeWidth: props.strokeWidth
    }))

    return {
      iconComponent,
      iconProps
    }
  }
}
</script>