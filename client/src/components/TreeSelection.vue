<template>
  <div class="h-full flex items-center justify-center p-4 sm:p-8">
    <div class="max-w-2xl w-full">
      <div class="text-center mb-8 sm:mb-12">
        <h1 class="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Создать новое дерево</h1>
        <p class="text-muted-foreground text-base sm:text-lg">
          Начните строить дерево навыков с нуля
        </p>
      </div>

      <Card 
        class="p-8 hover:shadow-lg transition-all cursor-pointer group"
        @click="view = 'scratch'"
      >
        <div class="flex flex-col items-center text-center gap-4 sm:gap-6">
          <div class="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Icon name="Pencil" :size="32" class="text-primary sm:w-12 sm:h-12" />
          </div>
          <div class="flex-1">
            <h3 class="text-xl sm:text-2xl font-semibold mb-2">Создать с нуля</h3>
            <p class="text-sm sm:text-base text-muted-foreground mb-4">
              Постройте собственное дерево навыков с полного нуля. Используйте библиотеку готовых навыков для быстрого старта.
            </p>
            <div class="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div class="flex items-center gap-1">
                <Icon name="Library" :size="14" />
                <span>Библиотека навыков</span>
              </div>
              <div class="flex items-center gap-1">
                <Icon name="GitBranch" :size="14" />
                <span>Готовые ветки</span>
              </div>
            </div>
          </div>
          <Button size="lg" class="w-full sm:w-auto">
            <Icon name="Sparkles" :size="20" class="mr-2" />
            Начать создание
          </Button>
        </div>
      </Card>
    </div>
  </div>

  <CreateTreeForm
    v-if="view === 'scratch'"
    :onBack="() => view = 'main'"
    :onCreate="onSelect"
  />
</template>

<script>
import { ref } from 'vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Icon from '@/components/ui/Icon.vue'
import CreateTreeForm from '@/components/CreateTreeForm.vue'

export default {
  name: 'TreeSelection',
  components: {
    Button,
    Card,
    Icon,
    CreateTreeForm
  },
  props: {
    onSelect: {
      type: Function,
      required: true
    }
  },
  setup(props) {
    const view = ref('main')
    
    return {
      view
    }
  }
}
</script>