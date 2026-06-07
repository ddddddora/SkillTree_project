<!-- Menubar Root -->
<template>
  <MenubarPrimitive.Root
    ref="menubarRef"
    :class="cn('flex h-10 items-center space-x-1 rounded-md border bg-background p-1', $attrs.class)"
    v-bind="$attrs"
  >
    <slot />
  </MenubarPrimitive.Root>
</template>

<script>
import * as MenubarPrimitive from '@radix-ui/vue-menubar'
import { cn } from '@/lib/utils'

export default {
  name: 'Menubar'
}
</script>

<!-- MenubarTrigger -->
<template>
  <MenubarPrimitive.Trigger
    ref="triggerRef"
    :class="cn(
      'flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground',
      $attrs.class
    )"
    v-bind="$attrs"
  >
    <slot />
  </MenubarPrimitive.Trigger>
</template>

<script>
export default {
  name: 'MenubarTrigger'
}
</script>

<!-- MenubarContent -->
<template>
  <MenubarPrimitive.Portal>
    <MenubarPrimitive.Content
      ref="contentRef"
      :align="align"
      :alignOffset="alignOffset"
      :sideOffset="sideOffset"
      :class="cn(
        'z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        $attrs.class
      )"
      v-bind="$attrs"
    >
      <slot />
    </MenubarPrimitive.Content>
  </MenubarPrimitive.Portal>
</template>

<script>
export default {
  name: 'MenubarContent',
  props: {
    align: {
      type: String,
      default: 'start'
    },
    alignOffset: {
      type: Number,
      default: -4
    },
    sideOffset: {
      type: Number,
      default: 8
    }
  }
}
</script>

<!-- MenubarItem -->
<template>
  <MenubarPrimitive.Item
    ref="itemRef"
    :class="cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      inset && 'pl-8',
      $attrs.class
    )"
    v-bind="$attrs"
  >
    <slot />
  </MenubarPrimitive.Item>
</template>

<script>
export default {
  name: 'MenubarItem',
  props: {
    inset: Boolean
  }
}
</script>

<!-- MenubarCheckboxItem -->
<template>
  <MenubarPrimitive.CheckboxItem
    ref="checkboxItemRef"
    :class="cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      $attrs.class
    )"
    :checked="checked"
    v-bind="$attrs"
  >
    <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check class="h-4 w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    <slot />
  </MenubarPrimitive.CheckboxItem>
</template>

<script>
import { Check } from 'lucide-vue'

export default {
  name: 'MenubarCheckboxItem',
  components: {
    Check
  },
  props: {
    checked: Boolean
  }
}
</script>

<!-- MenubarRadioItem -->
<template>
  <MenubarPrimitive.RadioItem
    ref="radioItemRef"
    :class="cn(
      'relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      $attrs.class
    )"
    v-bind="$attrs"
  >
    <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle class="h-2 w-2 fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    <slot />
  </MenubarPrimitive.RadioItem>
</template>

<script>
import { Circle } from 'lucide-vue'

export default {
  name: 'MenubarRadioItem',
  components: {
    Circle
  }
}
</script>

<!-- MenubarLabel -->
<template>
  <MenubarPrimitive.Label
    ref="labelRef"
    :class="cn(
      'px-2 py-1.5 text-sm font-semibold',
      inset && 'pl-8',
      $attrs.class
    )"
    v-bind="$attrs"
  >
    <slot />
  </MenubarPrimitive.Label>
</template>

<script>
export default {
  name: 'MenubarLabel',
  props: {
    inset: Boolean
  }
}
</script>

<!-- MenubarSeparator -->
<template>
  <MenubarPrimitive.Separator
    ref="separatorRef"
    :class="cn('-mx-1 my-1 h-px bg-muted', $attrs.class)"
    v-bind="$attrs"
  />
</template>

<script>
export default {
  name: 'MenubarSeparator'
}
</script>

<!-- MenubarShortcut -->
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
  name: 'MenubarShortcut'
}
</script>

<script>
// Экспорт всех компонентов menubar
import * as MenubarPrimitive from '@radix-ui/vue-menubar'

export {
  Menubar: MenubarPrimitive.Root,
  MenubarMenu: MenubarPrimitive.Menu,
  MenubarTrigger: MenubarPrimitive.Trigger,
  MenubarContent: MenubarPrimitive.Content,
  MenubarItem: MenubarPrimitive.Item,
  MenubarSeparator: MenubarPrimitive.Separator,
  MenubarLabel: MenubarPrimitive.Label,
  MenubarCheckboxItem: MenubarPrimitive.CheckboxItem,
  MenubarRadioGroup: MenubarPrimitive.RadioGroup,
  MenubarRadioItem: MenubarPrimitive.RadioItem,
  MenubarPortal: MenubarPrimitive.Portal,
  MenubarSubContent: MenubarPrimitive.SubContent,
  MenubarSubTrigger: MenubarPrimitive.SubTrigger,
  MenubarGroup: MenubarPrimitive.Group,
  MenubarSub: MenubarPrimitive.Sub,
  MenubarShortcut
}
</script>