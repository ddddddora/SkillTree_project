<template>
  <div v-if="open">
    <DialogComponent type="overlay" @overlay-click="onClose" />
    <DialogComponent type="content" class="share-dialog-content">
      <DialogComponent type="header">
        <DialogComponent type="title">Поделиться деревом навыков</DialogComponent>
      </DialogComponent>

      <div class="dialog-body">
        <!-- Ссылка для копирования -->
        <div class="form-group">
          <label class="form-label">Ссылка для общего доступа</label>
          <div class="flex gap-2">
            <input
              ref="linkInput"
              :value="shareUrl"
              readonly
              class="form-input flex-1"
            />
            <Button @click="handleCopy" size="sm">
              <Icon :name="copied ? 'Check' : 'Copy'" :size="16" class="mr-1" />
              {{ copied ? 'Скопировано!' : 'Копировать' }}
            </Button>
          </div>
        </div>

        <!-- Соцсети -->
        <div class="form-group">
          <label class="form-label">Поделиться в соцсетях</label>
          <div class="flex gap-2">
            <Button
              variant="outline"
              class="flex-1"
              @click="handleShare('telegram')"
            >
              <Icon name="Send" :size="16" class="mr-2" />
              Telegram
            </Button>
            <Button
              variant="outline"
              class="flex-1"
              @click="handleShare('vk')"
            >
              <Icon name="Share2" :size="16" class="mr-2" />
              VK
            </Button>
            <Button
              variant="outline"
              class="flex-1"
              @click="handleShare('whatsapp')"
            >
              <Icon name="MessageCircle" :size="16" class="mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>
      </div>

      <DialogComponent type="footer">
        <Button variant="outline" @click="onClose">
          Закрыть
        </Button>
        <Button @click="handleCreateNewLink">
          <Icon name="RefreshCw" :size="16" class="mr-2" />
          Новая ссылка
        </Button>
      </DialogComponent>

      <!-- Кнопка закрытия -->
      <button
        class="dialog-close"
        @click="onClose"
      >
        <span class="close-icon">×</span>
      </button>
    </DialogComponent>
  </div>
</template>

<script>
import DialogComponent from '@/components/ui/Dialog.vue'
import Button from '@/components/ui/Button.vue'
import Icon from '@/components/ui/Icon.vue'

export default {
  name: 'ShareDialog',
  components: {
    DialogComponent,
    Button,
    Icon
  },
  props: {
    open: {
      type: Boolean,
      required: true
    },
    onClose: {
      type: Function,
      required: true
    },
    treeId: {
      type: String,
      required: true
    },
    treeName: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      copied: false,
      shareToken: this.treeId
    }
  },
  computed: {
    shareUrl() {
      return `${window.location.origin}/share/${this.shareToken}`
    }
  },
  methods: {
    handleCopy() {
      this.$refs.linkInput.select()
      document.execCommand('copy')
      this.copied = true
      setTimeout(() => {
        this.copied = false
      }, 2000)
    },
    
    handleShare(platform) {
      const text = `Посмотри мое дерево навыков: ${this.treeName}`
      let url = ''

      switch (platform) {
        case 'telegram':
          url = `https://t.me/share/url?url=${encodeURIComponent(this.shareUrl)}&text=${encodeURIComponent(text)}`
          break
        case 'vk':
          url = `https://vk.com/share.php?url=${encodeURIComponent(this.shareUrl)}&title=${encodeURIComponent(text)}`
          break
        case 'whatsapp':
          url = `https://wa.me/?text=${encodeURIComponent(text + ' ' + this.shareUrl)}`
          break
      }

      if (url) {
        window.open(url, '_blank', 'width=600,height=400')
      }
    },

    handleCreateNewLink() {
      this.shareToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      this.copied = false
      console.log('Новая ссылка создана:', this.shareUrl)
    }
  }
}
</script>

<style scoped>
.share-dialog-content {
  max-width: 450px;
}

.dialog-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: #f9fafb;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
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
  background-color: #f3f4f6;
}

.close-icon {
  font-size: 1.25rem;
  line-height: 1;
  color: #6b7280;
}
</style>