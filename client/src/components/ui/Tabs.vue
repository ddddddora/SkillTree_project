<!-- Tabs Root -->
<script>
import * as TabsPrimitive from '@radix-ui/vue-tabs'
export const Tabs = TabsPrimitive.Root
</script>

<!-- TabsList -->
<template>
  <TabsPrimitive.List
    ref="listRef"
    :class="cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', $attrs.class)"
    v-bind="$attrs"
  >
    <slot />
  </TabsPrimitive.List>
</template>

<script>
import { cn } from '@/lib/utils'

export default {
  name: 'TabsList'
}
</script>

<!-- TabsTrigger -->
<template>
  <TabsPrimitive.Trigger
    ref="triggerRef"
    :class="cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
      $attrs.class
    )"
    v-bind="$attrs"
  >
    <slot />
  </TabsPrimitive.Trigger>
</template>

<script>
export default {
  name: 'TabsTrigger'
}
</script>

<!-- TabsContent -->
<template>
  <TabsPrimitive.Content
    ref="contentRef"
    :class="cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      $attrs.class
    )"
    v-bind="$attrs"
  >
    <slot />
  </TabsPrimitive.Content>
</template>

<script>
export default {
  name: 'TabsContent'
}
</script>

<script>
// Экспорт всех компонентов tabs
import * as TabsPrimitive from '@radix-ui/vue-tabs'

export {
  Tabs: TabsPrimitive.Root,
  TabsList: TabsPrimitive.List,
  TabsTrigger: TabsPrimitive.Trigger,
  TabsContent: TabsPrimitive.Content
}
</script>