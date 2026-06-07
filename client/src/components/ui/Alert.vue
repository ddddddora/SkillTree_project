<template>
  <div
    ref="alertRef"
    role="alert"
    :class="alertClasses"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script>
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export default {
  name: 'Alert',
  inheritAttrs: false,
  props: {
    className: String,
    variant: {
      type: String,
      default: 'default',
      validator: (value) => ['default', 'destructive'].includes(value)
    }
  },
  computed: {
    alertClasses() {
      return cn(alertVariants({ variant: this.variant }), this.className)
    }
  }
}
</script>

<!-- AlertTitle -->
<template>
  <h5
    ref="titleRef"
    :class="cn('mb-1 font-medium leading-none tracking-tight', $attrs.class)"
    v-bind="$attrs"
  >
    <slot />
  </h5>
</template>

<script>
export default {
  name: 'AlertTitle'
}
</script>

<!-- AlertDescription -->
<template>
  <div
    ref="descriptionRef"
    :class="cn('text-sm [&_p]:leading-relaxed', $attrs.class)"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>

<script>
export default {
  name: 'AlertDescription'
}
</script>

<script>
// Экспорт всех компонентов alert
export { alertVariants }
</script>