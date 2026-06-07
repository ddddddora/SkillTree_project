<template>
  <button
    v-if="!asChild"
    :class="buttonClass"
    :type="type"
    :disabled="disabled"
    v-bind="$attrs"
  >
    <slot></slot>
  </button>
  <slot v-else></slot>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'Button',
  inheritAttrs: false,
  props: {
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'].includes(value)
    },
    size: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'sm', 'lg', 'icon'].includes(value)
    },
    asChild: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'button'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const buttonClass = computed(() => {
      const baseClasses = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
      
      const variantClasses = {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline'
      }
      
      const sizeClasses = {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10'
      }
      
      return `${baseClasses} ${variantClasses[props.variant]} ${sizeClasses[props.size]}`
    })

    return {
      buttonClass
    }
  }
}
</script>