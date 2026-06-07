<template>
  <div class="relative h-4 w-full overflow-hidden rounded-full bg-secondary">
    <div
      class="h-full w-full flex-1 bg-primary transition-all duration-300"
      :style="{ transform: `translateX(-${100 - (value || 0)}%)` }"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'Progress',
  props: {
    value: {
      type: Number,
      default: 0,
      validator: (value) => value >= 0 && value <= 100
    }
  }
}
</script>