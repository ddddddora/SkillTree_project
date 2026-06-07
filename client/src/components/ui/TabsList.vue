<template>
  <div class="flex items-center justify-center rounded-lg bg-muted p-1" :class="className">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'TabsList',
  props: {
    className: String
  }
}
</script>