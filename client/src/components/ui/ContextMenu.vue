<!-- ContextMenu Root -->
<script>
import * as ContextMenuPrimitive from '@radix-ui/vue-context-menu'
export const ContextMenu = ContextMenuPrimitive.Root
export const ContextMenuTrigger = ContextMenuPrimitive.Trigger
export const ContextMenuGroup = ContextMenuPrimitive.Group
export const ContextMenuPortal = ContextMenuPrimitive.Portal
export const ContextMenuSub = ContextMenuPrimitive.Sub
export const ContextMenuRadioGroup = ContextMenuPrimitive.RadioGroup
</script>

<!-- ContextMenuSubTrigger -->
<template>
  <ContextMenuPrimitive.SubTrigger
    ref="subTriggerRef"
    :class="cn(
      'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
      inset && 'pl-8',
      $attrs.class
    )"
    v-bind="$attrs"
  >
    <slot />
    <ChevronRight class="ml-auto h-4 w-4" />
  </ContextMenuPrimitive.SubTrigger>
</template>

<script>
import { ChevronRight } from 'lucide-vue'
import { cn } from '@/lib/utils'

export default {
  name: 'ContextMenuSubTrigger',
  components: {
    ChevronRight
  },
  props: {
    inset: Boolean
  }
}
</script>

<!-- ContextMenuSubContent -->
<template>
  <ContextMenuPrimitive.SubContent
    ref="subContentRef"
    :class="cn(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      $attrs.class
    )"
    v-bind="$attrs"
  />
</template>

<script>
export default {
  name: 'ContextMenuSubContent'
}
</script>

<!-- ContextMenuContent -->
<template>
  <ContextMenuPrimitive.Portal>
    <ContextMenuPrimitive.Content
      ref="contentRef"
      :class="cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        $attrs.class
      )"
      v-bind="$attrs"
    />
  </ContextMenuPrimitive.Portal>
</template>

<script>
export default {
  name: 'ContextMenuContent'
}
</script>

<!-- ContextMenuItem -->
<template>
  <ContextMenuPrimitive.Item
    ref="itemRef"
    :class="cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      $attrs.class
    )"
    v-bind="$attrs"
  />
</template>

<script>
export default {
  name: 'ContextMenuItem',
  props: {
    inset: Boolean
  }
}
</script>

<!-- ContextMenuCheckboxItem -->
<template>
  <ContextMenuPrimitive.CheckboxItem
    ref="checkboxItemRef"
    :class="cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      $attrs.class
    )"
    :checked="checked"
    v-bind="$attrs"
  >
    <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Check class="h-4 w-4" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    <slot />
  </ContextMenuPrimitive.CheckboxItem>
</template>

<script>
import { Check } from 'lucide-vue'

export default {
  name: 'ContextMenuCheckboxItem',
  components: {
    Check
  },
  props: {
    checked: Boolean
  }
}
</script>

<!-- ContextMenuRadioItem -->
<template>
  <ContextMenuPrimitive.RadioItem
    ref="radioItemRef"
    :class="cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      $attrs.class
    )"
    v-bind="$attrs"
  >
    <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ContextMenuPrimitive.ItemIndicator>
        <Circle class="h-2 w-2 fill-current" />
      </ContextMenuPrimitive.ItemIndicator>
    </span>
    <slot />
  </ContextMenuPrimitive.RadioItem>
</template>

<script>
import { Circle } from 'lucide-vue'

export default {
  name: 'ContextMenuRadioItem',
  components: {
    Circle
  }
}
</script>

<!-- ContextMenuLabel -->
<template>
  <ContextMenuPrimitive.Label
    ref="labelRef"
    :class="cn(
      'px-2 py-1.5 text-sm font-semibold text-foreground',
      inset && 'pl-8',
      $attrs.class
    )"
    v-bind="$attrs"
  />
</template>

<script>
export default {
  name: 'ContextMenuLabel',
  props: {
    inset: Boolean
  }
}
</script>

<!-- ContextMenuSeparator -->
<template>
  <ContextMenuPrimitive.Separator
    ref="separatorRef"
    :class="cn('-mx-1 my-1 h-px bg-border', $attrs.class)"
    v-bind="$attrs"
  />
</template>

<script>
export default {
  name: 'ContextMenuSeparator'
}
</script>

<!-- ContextMenuShortcut -->
<template>
  <span
    :class="cn('ml-auto text-xs tracking-widest text-muted-foreground', $attrs.class)"
    v-bind="$attrs"
  >
    <slot />
  </span>
</template>

<script>
export default {
  name: 'ContextMenuShortcut'
}
</script>

<script>
// Экспорт всех компонентов context menu
import * as ContextMenuPrimitive from '@radix-ui/vue-context-menu'

export {
  ContextMenu: ContextMenuPrimitive.Root,
  ContextMenuTrigger: ContextMenuPrimitive.Trigger,
  ContextMenuContent: ContextMenuPrimitive.Content,
  ContextMenuItem: ContextMenuPrimitive.Item,
  ContextMenuCheckboxItem: ContextMenuPrimitive.CheckboxItem,
  ContextMenuRadioItem: ContextMenuPrimitive.RadioItem,
  ContextMenuLabel: ContextMenuPrimitive.Label,
  ContextMenuSeparator: ContextMenuPrimitive.Separator,
  ContextMenuShortcut,
  ContextMenuGroup: ContextMenuPrimitive.Group,
  ContextMenuPortal: ContextMenuPrimitive.Portal,
  ContextMenuSub: ContextMenuPrimitive.Sub,
  ContextMenuSubContent: ContextMenuPrimitive.SubContent,
  ContextMenuSubTrigger: ContextMenuPrimitive.SubTrigger,
  ContextMenuRadioGroup: ContextMenuPrimitive.RadioGroup
}
</script>