<template>
  <div class="h-full">
    <TreeSelection 
      v-if="!selectedTree" 
      @select="handleTreeSelect" 
    />
    <CanvasEditor 
      v-else-if="selectedTree"
      :tree="selectedTree"
      @back="handleBack"
      @save="handleSaveTree"
    />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import TreeSelection from '@/components/TreeSelection.vue'
import CanvasEditor from '@/components/CanvasEditor.vue'

export default {
  name: 'Builder',
  components: {
    TreeSelection,
    CanvasEditor,
  },
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()
    
    const selectedTree = ref(null)

    onMounted(async () => {
      // Если передан ID дерева в URL, загружаем его
      const treeId = route.query.tree
      if (treeId) {
        try {
          const tree = await store.dispatch('tree/loadTree', treeId)
          // Гарантируем, что у дерева есть nodes
          selectedTree.value = {
            ...tree,
            nodes: tree.nodes || []
          }
        } catch (error) {
          console.error('Failed to load tree:', error)
        }
      }
    })

    const handleTreeSelect = async (treeData) => {
      try {
        // Если treeData имеет id, значит это существующее дерево
        if (treeData.id && typeof treeData.id === 'number') {
          const tree = await store.dispatch('tree/loadTree', treeData.id)
          selectedTree.value = {
            ...tree,
            nodes: tree.nodes || []
          }
        } else {
          // Иначе создаём новое дерево
          const newTree = await store.dispatch('tree/createTree', {
            ...treeData,
            nodes: treeData.nodes || [] // Гарантируем nodes
          })
          selectedTree.value = {
            ...newTree,
            nodes: newTree.nodes || []
          }
        }
      } catch (error) {
        console.error('Failed to select tree:', error)
      }
    }

    const handleSaveTree = async (treeData) => {
      try {
        await store.dispatch('tree/updateTree', {
          treeId: treeData.id,
          updates: treeData
        })
      } catch (error) {
        console.error('Failed to save tree:', error)
        throw error
      }
    }

    const handleBack = () => {
      selectedTree.value = null
      router.push('/my-trees')
    }

    return {
      selectedTree,
      handleTreeSelect,
      handleSaveTree,
      handleBack
    }
  }
}
</script>