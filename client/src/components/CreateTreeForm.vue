<template>
  <div class="p-8 max-w-3xl mx-auto">
    <Button variant="ghost" @click="onBack" class="mb-6">
      <Icon name="ArrowLeft" :size="20" class="mr-2" />
      Назад
    </Button>

    <Card class="p-8">
      <div class="mb-6">
        <h1 class="text-3xl font-bold mb-2">Создать дерево с нуля</h1>
        <p class="text-muted-foreground">
          Заполните основную информацию о вашем дереве навыков
        </p>
      </div>

      <div class="space-y-6">
        <div class="space-y-2">
          <Label for="name">
            Название дерева <span class="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Например: UX/UI Designer 2024"
            :value="formData.name"
            @input="(e) => updateField('name', e.target.value)"
          />
          <p class="text-xs text-muted-foreground">
            Краткое и понятное название вашей цели
          </p>
        </div>

        <div class="space-y-2">
          <Label for="description">Описание</Label>
          <Textarea
            id="description"
            placeholder="Например: Изучить современный дизайн с нуля за 6 месяцев"
            :rows="4"
            :value="formData.description"
            @input="(e) => updateField('description', e.target.value)"
          />
          <p class="text-xs text-muted-foreground">
            Опишите, чего вы хотите достичь с помощью этого дерева
          </p>
        </div>

        <div class="space-y-2">
          <Label for="category">Категория</Label>
          <Select
            :model-value="formData.category"
            @update:model-value="(value) => updateField('category', value)"
            :options="categories"
            class-name="w-full"
          >
            <template #value="{ value }">
              {{ categories.find(cat => cat.value === value)?.label || 'Выберите категорию' }}
            </template>
          </Select>
          <p class="text-xs text-muted-foreground">
            Выберите категорию для удобной организации
          </p>
        </div>

        <div class="pt-4 border-t flex justify-between items-center">
          <div>
            <p class="text-sm font-medium mb-1">Что дальше?</p>
            <p class="text-xs text-muted-foreground">
              После создания вы попадете на холст для построения дерева навыков
            </p>
          </div>
          <Button
            size="lg"
            @click="handleCreate"
            :disabled="!formData.name.trim()"
          >
            <Icon name="Sparkles" :size="20" class="mr-2" />
            Создать дерево
          </Button>
        </div>
      </div>
    </Card>

    <div class="mt-8 grid grid-cols-3 gap-4">
      <Card class="p-4">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Icon name="Box" :size="20" class="text-primary" />
          </div>
          <div>
            <h3 class="font-semibold mb-1">Разделы</h3>
            <p class="text-xs text-muted-foreground">
              Организуйте навыки по категориям
            </p>
          </div>
        </div>
      </Card>

      <Card class="p-4">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Icon name="GitBranch" :size="20" class="text-primary" />
          </div>
          <div>
            <h3 class="font-semibold mb-1">Связи</h3>
            <p class="text-xs text-muted-foreground">
              Создавайте зависимости между навыками
            </p>
          </div>
        </div>
      </Card>

      <Card class="p-4">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Icon name="Target" :size="20" class="text-primary" />
          </div>
          <div>
            <h3 class="font-semibold mb-1">Прогресс</h3>
            <p class="text-xs text-muted-foreground">
              Отслеживайте свои достижения
            </p>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Icon from '@/components/ui/Icon.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Textarea from '@/components/ui/Textarea.vue'
import Select from '@/components/ui/Select.vue'

export default {
  name: 'CreateTreeForm',
  components: {
    Button,
    Card,
    Icon,
    Input,
    Label,
    Textarea,
    Select
  },
  props: {
    onBack: {
      type: Function,
      required: true
    },
    onCreate: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      formData: {
        name: '',
        description: '',
        category: 'custom'
      },
      categories: [
        { value: 'custom', label: 'Пользовательское' },
        { value: 'programming', label: 'Программирование' },
        { value: 'design', label: 'Дизайн' },
        { value: 'data', label: 'Данные' },
        { value: 'business', label: 'Бизнес' },
        { value: 'languages', label: 'Языки' },
        { value: 'other', label: 'Другое' }
      ]
    }
  },
  methods: {
    updateField(field, value) {
      this.formData = {
        ...this.formData,
        [field]: value
      }
    },
    
    handleCreate() {
      if (!this.formData.name.trim()) return

      const newTree = {
        id: `tree-${Date.now()}`,
        name: this.formData.name,
        description: this.formData.description,
        progress: 0,
        nodes: []
      }

      this.onCreate(newTree)
    }
  }
}
</script>

