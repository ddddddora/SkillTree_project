<!-- Simple Dialog Components -->
<template>
  <!-- Dialog Root - просто обертка -->
  <div v-if="type === 'root'" class="dialog-root">
    <slot />
  </div>

  <!-- Dialog Trigger - кнопка открытия -->
  <div v-else-if="type === 'trigger'" class="dialog-trigger" @click="$emit('trigger-click')">
    <slot />
  </div>

  <!-- Dialog Overlay -->
  <div
    v-else-if="type === 'overlay'"
    class="dialog-overlay"
    :class="className"
    @click="$emit('overlay-click')"
  />

  <!-- Dialog Content -->
  <div
    v-else-if="type === 'content'"
    class="dialog-content"
    :class="className"
  >
    <slot />
    <button
      class="dialog-close"
      @click="$emit('close-click')"
    >
      <span class="close-icon">×</span>
      <span class="sr-only">Close</span>
    </button>
  </div>

  <!-- Dialog Header -->
  <div
    v-else-if="type === 'header'"
    class="dialog-header"
    :class="className"
  >
    <slot />
  </div>

  <!-- Dialog Footer -->
  <div
    v-else-if="type === 'footer'"
    class="dialog-footer"
    :class="className"
  >
    <slot />
  </div>

  <!-- Dialog Title -->
  <h2
    v-else-if="type === 'title'"
    class="dialog-title"
    :class="className"
  >
    <slot />
  </h2>

  <!-- Dialog Description -->
  <p
    v-else-if="type === 'description'"
    class="dialog-description"
    :class="className"
  >
    <slot />
  </p>

  <!-- Dialog Close -->
  <button
    v-else-if="type === 'close'"
    class="dialog-close-button"
    :class="className"
    @click="$emit('close-click')"
  >
    <slot>×</slot>
  </button>
</template>

<script>
export default {
  name: 'DialogComponent',
  props: {
    type: {
      type: String,
      default: 'root',
      validator: (value) => [
        'root', 'trigger', 'overlay', 'content', 
        'header', 'footer', 'title', 'description', 'close'
      ].includes(value)
    },
    className: String
  },
  emits: ['trigger-click', 'overlay-click', 'close-click']
}
</script>

<style scoped>
.dialog-root {
  display: contents;
}

.dialog-trigger {
  display: inline-block;
  cursor: pointer;
}

.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background-color: rgba(0, 0, 0, 0.5);
  animation: fadeIn 0.2s ease-out;
}

.dialog-content {
  position: fixed;
  left: 50%;
  top: 50%;
  z-index: 50;
  width: 100%;
  max-width: 500px;
  transform: translate(-50%, -50%);
  border: 1px solid #e2e8f0;
  background: white;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-radius: 8px;
  animation: slideIn 0.2s ease-out;
  max-height: 85vh;
  overflow-y: auto;
}

.dialog-header {
  padding: 1.5rem 1.5rem 0.5rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.dialog-footer {
  padding: 1rem 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.75rem;
  color: #1a202c;
  margin: 0;
}

.dialog-description {
  font-size: 0.875rem;
  color: #718096;
  margin: 0.5rem 0 0 0;
}

.dialog-close {
  position: absolute;
  right: 1rem;
  top: 1rem;
  width: 2rem;
  height: 2rem;
  border: none;
  background: none;
  border-radius: 0.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: all 0.2s;
  cursor: pointer;
}

.dialog-close:hover {
  opacity: 1;
  background-color: #f7fafc;
}

.dialog-close-button {
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 0.375rem;
  opacity: 0.7;
  transition: all 0.2s;
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1rem;
}

.dialog-close-button:hover {
  opacity: 1;
  background-color: #f7fafc;
}

.close-icon {
  font-size: 1.25rem;
  line-height: 1;
  color: #4a5568;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translate(-50%, -48%) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
</style>