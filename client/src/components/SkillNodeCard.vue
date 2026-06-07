<template>
  <Card
    :class="[
      'p-4 cursor-pointer transition-all hover:shadow-md',
      isLocked ? 'opacity-60' : ''
    ]"
    @click="onClick"
    @contextmenu="onContextMenu"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3 flex-1">
        <component :is="statusIcon.component" :size="20" :class="statusIcon.class" />
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <h3 class="font-medium">{{ node.name }}</h3>
            <Icon v-if="isLocked" name="Lock" :size="16" class="text-muted-foreground" />
          </div>
          <p v-if="node.description" class="text-sm text-muted-foreground mt-1">
            {{ node.description }}
          </p>
          <div v-if="node.dependencies && node.dependencies.length > 0" class="flex items-center gap-1 mt-2">
            <Icon name="GitBranch" :size="14" class="text-muted-foreground" />
            <span class="text-xs text-muted-foreground">
              Требует: {{ node.dependencies.length }} навык(ов)
            </span>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <Badge v-if="node.resources && node.resources.length > 0" variant="secondary">
          <Icon name="Link" :size="12" class="mr-1" />
          {{ node.resources.length }}
        </Badge>
        <Badge v-if="node.notes" variant="secondary">
          <Icon name="FileText" :size="12" class="mr-1" />
          Заметка
        </Badge>
        <div class="text-right">
          <Progress :value="node.progress" class="w-20 mb-1" />
          <span class="text-xs text-muted-foreground">{{ node.progress }}%</span>
        </div>
      </div>
    </div>
  </Card>
</template>

<script>
export default {
  name: 'SkillNodeCard',
  props: {
    node: {
      type: Object,
      required: true
    },
    onClick: {
      type: Function,
      required: true
    },
    onContextMenu: {
      type: Function,
      required: true
    }
  },
  computed: {
    isLocked() {
      return this.node.dependencies && 
             this.node.dependencies.length > 0 && 
             this.node.status === 'not-started'
    },
    statusIcon() {
      switch (this.node.status) {
        case 'completed':
          return { component: 'CheckCircle2', class: 'text-green-500' }
        case 'in-progress':
          return { component: 'Clock', class: 'text-yellow-500' }
        default:
          return { component: 'Circle', class: 'text-gray-400' }
      }
    }
  }
}
</script>
