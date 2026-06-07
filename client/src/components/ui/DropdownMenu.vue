<!-- DropdownMenu Root -->
<script>
import * as DropdownMenuPrimitive from '@radix-ui/vue-dropdown-menu'
export const DropdownMenu = DropdownMenuPrimitive.Root
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
export const DropdownMenuGroup = DropdownMenuPrimitive.Group
export const DropdownMenuPortal = DropdownMenuPrimitive.Portal
export const DropdownMenuSub = DropdownMenuPrimitive.Sub
export const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup
</script>

<!-- DropdownMenuSubTrigger -->
<template>
  <DropdownMenuPrimitive.SubTrigger
    ref="subTriggerRef"
    :class="cn(
      'flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent',
      inset && 'pl-8',
      $attrs.class
    )"
    v-bind="$attrs"
  >
    <slot />
    <ChevronRight class="ml-auto h-4 w-4" />
  </DropdownMenuPrimitive.SubTrigger>
</template>

<script>
import { ChevronRight } from 'lucide-vue'
import { cn } from '@/lib/utils'

export default {
  name: 'DropdownMenuSubTrigger',
  components: {
    ChevronRight
  },
  props: {
    inset: Boolean
  }
}
</script>

<!-- DropdownMenuSubContent -->
<template>
  <DropdownMenuPrimitive.SubContent
    ref="subContentRef"
    :class="cn(
      'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      $attrs.class
    )"
    v-bind="$attrs"
  />
</template>

<script>
export default {
  name: 'DropdownMenuSubContent'
}
</script>

<!-- DropdownMenuContent -->
<template>
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref="contentRef"
      :sideOffset="sideOffset"
      :class="cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        $attrs.class
      )"
      v-bind="$attrs"
    />
  </DropdownMenuPrimitive.Portal>
</template>

<script>
export default {
  name: 'DropdownMenuContent',
  props: {
    sideOffset: {
      type: Number,
      default: 4
    }
  }
}
</script>

<!-- DropdownMenuItem -->
<template>
  <DropdownMenuPrimitive.Item
    ref="itemRef"
    :class="cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      $attrs.class
    )"
    v-bind="$attrs"
  />
</template>

<script>
export default {
  name: 'DropdownMenuItem',
  props: {
    inset: Boolean
  }
}
</script>

<!-- DropdownMenuCheckboxItem -->
<template>
  <DropdownMenuPrimitive.CheckboxItem
    ref="checkboxItemRef"
    :class="cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      $attrs.class
    )"
    :checked="checked"
    v-bind="$attrs"
  >
    <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check class="h-4 w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    <slot />
  </DropdownMenuPrimitive.CheckboxItem>
</template>

<script>
import { Check } from 'lucide-vue'

export default {
  name: 'DropdownMenuCheckboxItem',
  components: {
    Check
  },
  props: {
    checked: Boolean
  }
}
</script>

<!-- DropdownMenuRadioItem -->
<template>
  <DropdownMenuPrimitive.RadioItem
    ref="radioItemRef"
    :class="cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      $attrs.class
    )"
    v-bind="$attrs"
  >
    <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle class="h-2 w-2 fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    <slot />
  </DropdownMenuPrimitive.RadioItem>
</template>

<script>
import { Circle } from 'lucide-vue'

export default {
  name: 'DropdownMenuRadioItem',
  components: {
    Circle
  }
}
</script>

<!-- DropdownMenuLabel -->
<template>
  <DropdownMenuPrimitive.Label
    ref="labelRef"
    :class="cn(
      'px-2 py-1.5 text-sm font-semibold',
      inset && 'pl-8',
      $attrs.class
    )"
    v-bind="$attrs"
  />
</template>

<script>
export default {
  name: 'DropdownMenuLabel',
  props: {
    inset: Boolean
  }
}
</script>

<!-- DropdownMenuSeparator -->
<template>
  <DropdownMenuPrimitive.Separator
    ref="separatorRef"
    :class="cn('-mx-1 my-1 h-px bg-muted', $attrs.class)"
    v-bind="$attrs"
  />
</template>

<script>
export default {
  name: 'DropdownMenuSeparator'
}
</script>

<!-- DropdownMenuShortcut -->
<template>
  <span
    :class="cn('ml-auto text-xs tracking-widest opacity-60', $attrs.class)"
    v-bind="$attrs"
  >
    <slot />
  </span>
</template>

<script>
export default {
  name: 'DropdownMenuShortcut'
}
</script>

<script>
// Экспорт всех компонентов dropdown menu
import * as DropdownMenuPrimitive from '@radix-ui/vue-dropdown-menu'

export {
  DropdownMenu: DropdownMenuPrimitive.Root,
  DropdownMenuTrigger: DropdownMenuPrimitive.Trigger,
  DropdownMenuContent: DropdownMenuPrimitive.Content,
  DropdownMenuItem: DropdownMenuPrimitive.Item,
  DropdownMenuCheckboxItem: DropdownMenuPrimitive.CheckboxItem,
  DropdownMenuRadioItem: DropdownMenuPrimitive.RadioItem,
  DropdownMenuLabel: DropdownMenuPrimitive.Label,
  DropdownMenuSeparator: DropdownMenuPrimitive.Separator,
  DropdownMenuShortcut,
  DropdownMenuGroup: DropdownMenuPrimitive.Group,
  DropdownMenuPortal: DropdownMenuPrimitive.Portal,
  DropdownMenuSub: DropdownMenuPrimitive.Sub,
  DropdownMenuSubContent: DropdownMenuPrimitive.SubContent,
  DropdownMenuSubTrigger: DropdownMenuPrimitive.SubTrigger,
  DropdownMenuRadioGroup: DropdownMenuPrimitive.RadioGroup
}
</script>