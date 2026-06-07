<template>
  <aside class="w-64 border-r bg-card/50 p-4 space-y-6">
    <div>
      <h2 class="font-semibold mb-3 flex items-center gap-2">
        <Icon name="Wrench" :size="16" />
        Инструменты
      </h2>
      <div class="space-y-2">
        <Button
          variant="outline"
          class="w-full justify-start"
          @click="onAddSection"
        >
          <Icon name="Box" :size="16" class="mr-2" />
          Добавить раздел
        </Button>
        <Button
          variant="outline"
          class="w-full justify-start"
          @click="onAddSkill"
        >
          <Icon name="Plus" :size="16" class="mr-2" />
          Добавить навык
        </Button>
      </div>
    </div>

    <Separator />

    <div>
      <h2 class="font-semibold mb-3 flex items-center gap-2">
        <Icon name="Library" :size="16" />
        Библиотека
      </h2>
      <div class="space-y-2">
        <Button
          variant="ghost"
          class="w-full justify-start text-sm"
        >
          <Icon name="Lightbulb" :size="14" class="mr-2" />
          Готовые навыки
        </Button>
        <Button
          variant="ghost"
          class="w-full justify-start text-sm"
        >
          <Icon name="TreePine" :size="14" class="mr-2" />
          Готовые ветки
        </Button>
      </div>
    </div>

    <Separator />

    <div>
      <h2 class="font-semibold mb-3 flex items-center gap-2">
        <Icon name="Maximize2" :size="16" />
        Вид
      </h2>
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            @click="onZoomOut"
            class="flex-1"
          >
            <Icon name="ZoomOut" :size="14" />
          </Button>
          <div class="px-2 text-sm font-medium">
            {{ Math.round(scale * 100) }}%
          </div>
          <Button
            variant="outline"
            size="sm"
            @click="onZoomIn"
            class="flex-1"
          >
            <Icon name="ZoomIn" :size="14" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          class="w-full"
          @click="onResetView"
        >
          <Icon name="Minimize2" :size="14" class="mr-2" />
          Сбросить вид
        </Button>
      </div>
    </div>

    <Separator />

    <div>
      <h2 class="font-semibold mb-3 flex items-center gap-2">
        <Icon name="Settings" :size="16" />
        Действия
      </h2>
      <div class="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          class="w-full justify-start"
        >
          <Icon name="Layout" :size="14" class="mr-2" />
          Упорядочить дерево
        </Button>
        <Button
          variant="ghost"
          size="sm"
          class="w-full justify-start"
        >
          <Icon name="Palette" :size="14" class="mr-2" />
          Цвета разделов
        </Button>
      </div>
    </div>
  </aside>
</template>

<script>

import Card  from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import Icon from '@/components/ui/Icon.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Separator from '@/components/ui/Separator.vue'

export default {
  name: 'CanvasToolbar',
  components: {
    Card,
    Badge,
    CardContent,
    CardDescription,
    CardTitle,
    CardHeader,
    Icon,
    Separator
  },
  props: {
    onAddSection: {
      type: Function,
      required: true
    },
    onAddSkill: {
      type: Function,
      required: true
    },
    onZoomIn: {
      type: Function,
      required: true
    },
    onZoomOut: {
      type: Function,
      required: true
    },
    onResetView: {
      type: Function,
      required: true
    },
    scale: {
      type: Number,
      required: true
    }
  }
}
</script>
