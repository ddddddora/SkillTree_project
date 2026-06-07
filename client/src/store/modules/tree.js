export default {
  namespaced: true,
  
  state: () => ({
    currentTree: null,
    userTrees: [],
    selectedNode: null,
    isLoading: false,
    error: null
  }),
  
  mutations: {
    SET_CURRENT_TREE(state, tree) {
      state.currentTree = tree
    },
    
    SET_USER_TREES(state, trees) {
      state.userTrees = trees
    },
    
    SET_SELECTED_NODE(state, node) {
      state.selectedNode = node
    },
    
    SET_LOADING(state, isLoading) {
      state.isLoading = isLoading
    },
    
    SET_ERROR(state, error) {
      state.error = error
    },
    
    ADD_TREE(state, tree) {
      state.userTrees.push(tree)
    },
    
    UPDATE_TREE(state, updatedTree) {
      const index = state.userTrees.findIndex(t => t.id === updatedTree.id)
      if (index !== -1) {
        state.userTrees.splice(index, 1, updatedTree)
      }
    },
    
    DELETE_TREE(state, treeId) {
      state.userTrees = state.userTrees.filter(t => t.id !== treeId)
    },
    
    CLEAR_CURRENT_TREE(state) {
      state.currentTree = null
      state.selectedNode = null
    },
    
    UPDATE_NODE_POSITION(state, { nodeId, position_x, position_y }) {
      const updateNodeInTree = (nodes) => {
        return nodes.map(node => {
          if (node.id === nodeId) {
            return { ...node, position_x, position_y }
          }
          if (node.children) {
            return { ...node, children: updateNodeInTree(node.children) }
          }
          return node
        })
      }
      
      if (state.currentTree) {
        state.currentTree.nodes = updateNodeInTree(state.currentTree.nodes)
      }
    }
  },
  
  actions: {
    async loadUserTrees({ commit, rootState }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await fetch('http://localhost:5000/api/trees', {
          headers: {
            'Authorization': `Bearer ${rootState.user.token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to load trees')
        }
        
        const data = await response.json()
        commit('SET_USER_TREES', data.trees)
        return data.trees
      } catch (error) {
        commit('SET_ERROR', error.message)
        console.error('Failed to load trees:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async loadTree({ commit, rootState }, treeId) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await fetch(`http://localhost:5000/api/trees/${treeId}`, {
          headers: {
            'Authorization': `Bearer ${rootState.user.token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to load tree')
        }
        
        const data = await response.json()
        commit('SET_CURRENT_TREE', data.tree)
        return data.tree
      } catch (error) {
        commit('SET_ERROR', error.message)
        console.error('Failed to load tree:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createTree({ commit, rootState }, treeData) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await fetch('http://localhost:5000/api/trees', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${rootState.user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(treeData)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create tree')
        }
        
        const data = await response.json()
        commit('ADD_TREE', data.tree)
        commit('SET_CURRENT_TREE', data.tree)
        return data.tree
      } catch (error) {
        commit('SET_ERROR', error.message)
        console.error('Failed to create tree:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async updateTree({ commit, rootState, state }, { treeId, updates }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await fetch(`http://localhost:5000/api/trees/${treeId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${rootState.user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update tree')
        }
        
        const data = await response.json()
        commit('UPDATE_TREE', data.tree)
        if (state.currentTree && state.currentTree.id === treeId) {
          commit('SET_CURRENT_TREE', data.tree)
        }
        return data.tree
      } catch (error) {
        commit('SET_ERROR', error.message)
        console.error('Failed to update tree:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async deleteTree({ commit, rootState, state }, treeId) {
      commit('SET_LOADING', true)
      
      try {
        const response = await fetch(`http://localhost:5000/api/trees/${treeId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${rootState.user.token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete tree')
        }
        
        commit('DELETE_TREE', treeId)
        
        if (state.currentTree && state.currentTree.id === treeId) {
          commit('CLEAR_CURRENT_TREE')
        }
      } catch (error) {
        commit('SET_ERROR', error.message)
        console.error('Failed to delete tree:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createNode({ commit, rootState }, nodeData) {
      commit('SET_LOADING', true);
      commit('SET_ERROR', null);

      try {
        console.log('Dispatching createNode with data:', nodeData);
        
        // Проверяем обязательные поля
        if (!nodeData.tree_id) {
          throw new Error('Tree ID is required');
        }

        const response = await fetch('http://localhost:5000/api/nodes', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${rootState.user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            tree_id: nodeData.tree_id,
            parent_id: nodeData.parent_id || null,
            name: nodeData.name || 'Новый узел',
            description: nodeData.description || '',
            status: nodeData.status || 'not-started',
            difficulty: nodeData.difficulty || 'medium',
            resources: nodeData.resources || [],
            notes: nodeData.notes || '',
            position_x: nodeData.position_x || 100,
            position_y: nodeData.position_y || 100,
            color: nodeData.color || '#8690a2',
            node_type: nodeData.node_type || 'skill'
          })
        });
        
        console.log('API response status:', response.status);
        
        if (!response.ok) {
          let errorMessage = `Failed to create node (HTTP ${response.status})`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
            console.error('Server error details:', errorData);
          } catch (e) {
            const text = await response.text();
            console.error('Raw error response:', text);
            errorMessage += `: ${text.substring(0, 100)}`;
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('API response data:', data);
        
        if (!data.node) {
          throw new Error('No node data in response');
        }
        
        return data.node; // Возвращаем только узел
      } catch (error) {
        commit('SET_ERROR', error.message);
        console.error('Failed to create node:', error);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },
        
    async updateNode({ commit, rootState }, { nodeId, updates }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const response = await fetch(`http://localhost:5000/api/nodes/${nodeId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${rootState.user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updates)
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update node')
        }
        
        const data = await response.json()
        
        // Обновляем позицию в локальном состоянии
        if (updates.position_x !== undefined || updates.position_y !== undefined) {
          commit('UPDATE_NODE_POSITION', {
            nodeId,
            position_x: updates.position_x,
            position_y: updates.position_y
          })
        }
        
        return data.node
      } catch (error) {
        commit('SET_ERROR', error.message)
        console.error('Failed to update node:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async deleteNode({ commit, rootState }, nodeId) {
      commit('SET_LOADING', true)
      
      try {
        const response = await fetch(`http://localhost:5000/api/nodes/${nodeId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${rootState.user.token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to delete node')
        }
        
        return true
      } catch (error) {
        commit('SET_ERROR', error.message)
        console.error('Failed to delete node:', error)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async logActivity({ rootState }, activityData) {
      try {
        const response = await fetch('http://localhost:5000/api/activity/log', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${rootState.user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(activityData)
        })
        
        if (!response.ok) {
          console.error('Failed to log activity')
        }
      } catch (error) {
        console.error('Activity logging failed:', error)
      }
    },
    
    setCurrentTree({ commit }, tree) {
      commit('SET_CURRENT_TREE', tree)
    },
    
    setSelectedNode({ commit }, node) {
      commit('SET_SELECTED_NODE', node)
    },
    
    clearCurrentTree({ commit }) {
      commit('CLEAR_CURRENT_TREE')
    },
    
    clearError({ commit }) {
      commit('SET_ERROR', null)
    },
    
    updateNodePosition({ commit }, payload) {
      commit('UPDATE_NODE_POSITION', payload)
    }
  },
  
  getters: {
    getTreeById: (state) => (id) => {
      return state.userTrees.find(tree => tree.id === id)
    },
    
    hasTrees: (state) => state.userTrees.length > 0,
    
    treesCount: (state) => state.userTrees.length,
    
    filteredTrees: (state) => (searchTerm) => {
      if (!searchTerm) return state.userTrees
      return state.userTrees.filter(tree => 
        tree.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    },
    
    treesStatistics: (state) => {
      return {
        total: state.userTrees.length,
        totalNodes: state.userTrees.reduce((sum, tree) => sum + (tree.node_count || 0), 0),
        completedNodes: state.userTrees.reduce((sum, tree) => sum + (tree.completed_count || 0), 0),
        recentCount: state.userTrees.filter(tree => {
          const created = new Date(tree.created_at)
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          return created > weekAgo
        }).length
      }
    }
  }
}