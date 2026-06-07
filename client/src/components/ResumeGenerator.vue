<!-- client/src/components/ResumeGenerator.vue -->
<template>
  <div style="display: none;"></div>
  
  <!-- Скрытые контейнеры для рендеринга -->
  <div v-if="resumeHtml" style="position: fixed; left: -9999px; top: 0; z-index: -1;">
    <div ref="resumeContent" v-html="resumeHtml"></div>
  </div>
  
  <!-- Отдельные контейнеры для каждого дерева -->
  <div v-for="(tree, idx) in treesForRender" :key="idx" 
       :ref="el => setTreeRef(idx, el)"
       style="position: fixed; left: -9999px; top: 0; width: 800px; background: white;">
    <div v-html="tree.html"></div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useStore } from 'vuex'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default {
  name: 'ResumeGenerator',
  setup() {
    const store = useStore()
    const isGenerating = ref(false)
    const resumeHtml = ref('')
    const resumeContent = ref(null)
    const treesForRender = ref([])
    const treeRefs = ref({})

    const setTreeRef = (idx, el) => {
      if (el) {
        treeRefs.value[idx] = el
      }
    }

    const escapeHtml = (text) => {
      if (!text) return ''
      const div = document.createElement('div')
      div.textContent = text
      return div.innerHTML
    }

    const getDifficultyLabel = (difficulty) => {
      switch (difficulty) {
        case 'easy': return 'Лёгкий'
        case 'medium': return 'Средний'
        case 'hard': return 'Сложный'
        default: return '—'
      }
    }

    const getStatusLabel = (status) => {
      switch (status) {
        case 'completed': return 'Освоено'
        case 'in-progress': return 'В процессе'
        default: return 'Не начато'
      }
    }

    const getStatusClass = (status) => {
      switch (status) {
        case 'completed': return 'status-completed'
        case 'in-progress': return 'status-progress'
        default: return 'status-pending'
      }
    }

    // ========== ЗАГРУЗКА УЗЛОВ ДЕРЕВА ==========
    const loadTreeNodes = async (treeId) => {
      try {
        const token = localStorage.getItem('skilltree_token')
        const response = await fetch(`http://localhost:5000/api/trees/${treeId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error(`Failed to load tree ${treeId}`)
        }
        
        const data = await response.json()
        return {
          nodes: data.tree.nodes || [],
          progress: data.tree.progress
        }
      } catch (error) {
        console.error(`Ошибка загрузки узлов дерева ${treeId}:`, error)
        return { nodes: [], progress: 0 }
      }
    }

    // ========== ЗАГРУЗКА ВСЕХ ДЕРЕВЬЕВ С УЗЛАМИ ==========
    const loadTreesWithNodes = async () => {
      await store.dispatch('tree/loadUserTrees')
      const trees = store.state.tree.userTrees || []
      
      if (trees.length === 0) return []
      
      const treesWithNodes = await Promise.all(
        trees.map(async (tree) => {
          const { nodes, progress } = await loadTreeNodes(tree.id)
          return {
            ...tree,
            nodes: nodes,
            apiProgress: progress
          }
        })
      )
      
      return treesWithNodes
    }

    // ========== ИЗВЛЕЧЕНИЕ НАВЫКОВ ==========
    const extractSkillsFromNode = (node, sectionName = null, skillsList = []) => {
      if (!node) return skillsList
      
      if (node.status !== undefined && node.status !== null) {
        skillsList.push({
          id: node.id,
          name: node.name || 'Без названия',
          status: node.status,
          difficulty: node.difficulty || 'medium',
          section: sectionName,
          progress: node.progress || 0
        })
      }
      
      let currentSection = sectionName
      if (node.name && node.children && node.children.length > 0) {
        currentSection = node.name
      }
      
      if (node.children && Array.isArray(node.children) && node.children.length > 0) {
        node.children.forEach(child => {
          extractSkillsFromNode(child, currentSection, skillsList)
        })
      }
      
      return skillsList
    }

    // ========== ПОЛУЧЕНИЕ ВСЕХ НАВЫКОВ ИЗ ДЕРЕВА ==========
    const getAllSkillsFromTree = (tree) => {
      const allSkills = []
      
      if (!tree.nodes || !Array.isArray(tree.nodes)) {
        return allSkills
      }
      
      tree.nodes.forEach((node) => {
        extractSkillsFromNode(node, null, allSkills)
      })
      
      return allSkills
    }

    // ========== ГРУППИРОВКА НАВЫКОВ ПО СЕКЦИЯМ ==========
    const groupSkillsBySections = (allSkills) => {
      const skillsBySection = {}
      
      allSkills.forEach(skill => {
        if (skill.section && skill.section.trim() && skill.section !== 'null') {
          if (!skillsBySection[skill.section]) {
            skillsBySection[skill.section] = []
          }
          skillsBySection[skill.section].push(skill)
        }
      })
      
      const sections = Object.entries(skillsBySection).map(([name, skills]) => ({
        name,
        skills: skills.sort((a, b) => a.name.localeCompare(b.name))
      })).sort((a, b) => a.name.localeCompare(b.name))
      
      return sections
    }

    // ========== ПОДГОТОВКА ДАННЫХ ДЕРЕВЬЕВ ==========
    const getTreesWithData = (trees) => {
      if (!trees || trees.length === 0) return []
      
      const result = trees.map(tree => {
        const allSkills = getAllSkillsFromTree(tree)
        
        const totalSkills = allSkills.length
        const completedSkills = allSkills.filter(s => s.status === 'completed').length
        
        const progress = tree.apiProgress !== undefined ? parseFloat(tree.apiProgress) : 0
        
        const sections = groupSkillsBySections(allSkills)
        
        return {
          id: tree.id,
          name: tree.name || 'Дерево навыков',
          description: tree.description || '',
          progress: Math.round(progress),
          totalSkills,
          completedSkills,
          inProgressSkills: allSkills.filter(s => s.status === 'in-progress').length,
          sections
        }
      })
      
      return result
    }

    // ========== ГЕНЕРАЦИЯ HTML ДЛЯ ОДНОГО ДЕРЕВА ==========
    const generateTreeHTML = (tree) => {
      if (tree.sections.length === 0) {
        return `
          <div style="background: white; border: 1px solid #e5e2d5; margin-bottom: 0;">
            <div style="padding: 24px 30px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
              <div>
                <h3 style="font-family: 'Montserrat', sans-serif; font-size: 18px; font-weight: 500; color: #2a241a; margin: 0;">${escapeHtml(tree.name)}</h3>
                ${tree.description ? `<p style="font-size: 12px; color: #8b7a66; margin: 6px 0 0 0;">${escapeHtml(tree.description)}</p>` : ''}
              </div>
              <div style="text-align: right; min-width: 140px;">
                <div style="font-family: 'Montserrat', sans-serif; font-size: 24px; font-weight: 500; color: #8690a2;">${tree.progress}%</div>
                <div style="width: 100%; height: 2px; background: #e5e2d5; margin: 8px 0;">
                  <div style="width: ${tree.progress}%; height: 100%; background: #8690a2;"></div>
                </div>
                <div style="font-size: 11px; color: #8b7a66;">${tree.completedSkills}/${tree.totalSkills} навыков</div>
              </div>
            </div>
            <div style="padding: 40px; text-align: center; border-top: 1px solid #f0ede5;">
              <p style="font-size: 11px; color: #b8aa92; text-transform: uppercase; letter-spacing: 1px;">навыки не добавлены</p>
            </div>
          </div>
        `
      }
      
      return `
        <div style="background: white; border: 1px solid #e5e2d5; margin-bottom: 0;">
          <div style="padding: 24px 30px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; border-bottom: 1px solid #f0ede5;">
            <div>
              <h3 style="font-family: 'Montserrat', sans-serif; font-size: 18px; font-weight: 500; color: #2a241a; margin: 0;">${escapeHtml(tree.name)}</h3>
              ${tree.description ? `<p style="font-size: 12px; color: #8b7a66; margin: 6px 0 0 0;">${escapeHtml(tree.description)}</p>` : ''}
            </div>
            <div style="text-align: right; min-width: 140px;">
              <div style="font-family: 'Montserrat', sans-serif; font-size: 24px; font-weight: 500; color: #8690a2;">${tree.progress}%</div>
              <div style="width: 100%; height: 2px; background: #e5e2d5; margin: 8px 0;">
                <div style="width: ${tree.progress}%; height: 100%; background: #8690a2;"></div>
              </div>
              <div style="font-size: 11px; color: #8b7a66;">${tree.completedSkills}/${tree.totalSkills} навыков</div>
            </div>
          </div>
          
          <div style="padding: 24px 30px;">
            ${tree.sections.map((section, idx) => `
              <div style="margin-bottom: ${idx === tree.sections.length - 1 ? '0' : '32px'};">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                  <div style="width: 3px; height: 16px; background: #d9cb9c;"></div>
                  <h4 style="font-family: 'Montserrat', sans-serif; font-size: 13px; font-weight: 500; color: #b8a88a; margin: 0; letter-spacing: 0.3px; text-transform: uppercase;">${escapeHtml(section.name)}</h4>
                  <div style="flex: 1; height: 1px; background: #e5e2d5;"></div>
                  <span style="font-size: 10px; color: #b8aa92;">${section.skills.length} элементов</span>
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="border-bottom: 1px solid #e5e2d5;">
                      <th style="text-align: left; padding: 10px 0; font-size: 9px; font-weight: 500; color: #8b7a66; text-transform: uppercase; letter-spacing: 1px; width: 45%">Навык</th>
                      <th style="text-align: left; padding: 10px; font-size: 9px; font-weight: 500; color: #8b7a66; text-transform: uppercase; letter-spacing: 1px; width: 20%">Уровень</th>
                      <th style="text-align: left; padding: 10px; font-size: 9px; font-weight: 500; color: #8b7a66; text-transform: uppercase; letter-spacing: 1px; width: 35%">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${section.skills.map(skill => `
                      <tr style="border-bottom: 1px solid #f5f3ed;">
                        <td style="padding: 12px 0; font-size: 13px; color: #2a241a;">${escapeHtml(skill.name)}</td>
                        <td style="padding: 12px; font-size: 11px; color: ${skill.difficulty === 'easy' ? '#7c9c6e' : skill.difficulty === 'medium' ? '#b8a88a' : '#c68b6e'};">${getDifficultyLabel(skill.difficulty)}</td>
                        <td style="padding: 12px; font-size: 11px; color: ${skill.status === 'completed' ? '#7c9c6e' : skill.status === 'in-progress' ? '#b8a88a' : '#b8aa92'};">${getStatusLabel(skill.status)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            `).join('')}
          </div>
          
          <div style="padding: 12px 30px; background: #fefefa; border-top: 1px solid #f0ede5;">
            <div style="display: flex; justify-content: flex-end; gap: 24px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 6px; height: 6px; background: #7c9c6e;"></div>
                <span style="font-size: 9px; color: #8b7a66;">освоено: ${tree.completedSkills}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 6px; height: 6px; background: #b8a88a;"></div>
                <span style="font-size: 9px; color: #8b7a66;">в процессе: ${tree.inProgressSkills}</span>
              </div>
            </div>
          </div>
        </div>
      `
    }

    // ========== ГЕНЕРАЦИЯ HTML ЗАГОЛОВКА ==========
    const generateHeaderHTML = (user, totalStats) => {
      return `
        <div style="background: white; padding: 48px 50px 32px 50px; border-bottom: 1px solid #e5e2d5; position: relative;">
          <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #8690a2, #b8a88a, #d9cb9c);"></div>
          
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 24px;">
            <div>
              <div style="display: flex; align-items: baseline; gap: 12px;">
                <div>
                  <h1 style="font-family: 'Montserrat', sans-serif; font-size: 28px; font-weight: 500; color: #2a241a; margin: 0; letter-spacing: -0.2px;">SkillTree</h1>
                  <p style="font-size: 11px; color: #b8aa92; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">профессиональный портфолио</p>
                </div>
              </div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 10px; color: #b8aa92; text-transform: uppercase; letter-spacing: 1px;">дата</div>
              <div style="font-size: 13px; color: #5a4d3a;">${new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>
        </div>
        
        <div style="padding: 40px 50px; background: white; border-bottom: 1px solid #e5e2d5;">
          <div style="display: flex; align-items: flex-start; gap: 32px; flex-wrap: wrap;">
            <div style="width: 80px; height: 80px; background: #f5f3ed; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 1px solid #e5e2d5;">
              <div style="width: 40px; height: 40px; background: #8690a2; border-radius: 8px;"></div>
            </div>
            
            <div style="flex: 1;">
              <div style="margin-bottom: 16px;">
                <h2 style="font-family: 'Montserrat', sans-serif; font-size: 28px; font-weight: 500; color: #2a241a; margin: 0;">${escapeHtml(user.name || 'Пользователь')}</h2>
                <div style="font-size: 13px; color: #8b7a66; margin-top: 4px;">${escapeHtml(user.email || 'Email не указан')}</div>
              </div>
              ${user.bio ? `
                <div style="border-left: 3px solid #b8a88a; padding-left: 20px;">
                  <p style="font-size: 13px; line-height: 1.5; color: #5a4d3a; margin: 0;">${escapeHtml(user.bio)}</p>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
        
        <div style="padding: 40px 50px; background: white;">
          <div style="margin-bottom: 28px;">
            <div style="width: 40px; height: 2px; background: #8690a2; margin-bottom: 12px;"></div>
            <h3 style="font-family: 'Montserrat', sans-serif; font-size: 14px; font-weight: 500; color: #2a241a; margin: 0; letter-spacing: 0.5px;">КЛЮЧЕВЫЕ ПОКАЗАТЕЛИ</h3>
            <p style="font-size: 11px; color: #b8aa92; margin: 4px 0 0 0;">обзор производительности</p>
          </div>
          
          <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px;">
            <div style="background: #faf9f5; padding: 24px 16px; text-align: center; border: 1px solid #e5e2d5;">
              <div style="font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 500; color: #8690a2; margin-bottom: 8px;">${totalStats.treesCount}</div>
              <div style="font-size: 10px; color: #8b7a66; text-transform: uppercase; letter-spacing: 0.5px;">Деревьев</div>
            </div>
            <div style="background: #faf9f5; padding: 24px 16px; text-align: center; border: 1px solid #e5e2d5;">
              <div style="font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 500; color: #b8a88a; margin-bottom: 8px;">${totalStats.totalSkills}</div>
              <div style="font-size: 10px; color: #8b7a66; text-transform: uppercase; letter-spacing: 0.5px;">Всего навыков</div>
            </div>
            <div style="background: #faf9f5; padding: 24px 16px; text-align: center; border: 1px solid #e5e2d5;">
              <div style="font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 500; color: #9bb87f; margin-bottom: 8px;">${totalStats.completedSkills}</div>
              <div style="font-size: 10px; color: #8b7a66; text-transform: uppercase; letter-spacing: 0.5px;">Освоено</div>
            </div>
            <div style="background: #faf9f5; padding: 24px 16px; text-align: center; border: 1px solid #e5e2d5;">
              <div style="font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 500; color: #d9cb9c; margin-bottom: 8px;">${totalStats.inProgressSkills}</div>
              <div style="font-size: 10px; color: #8b7a66; text-transform: uppercase; letter-spacing: 0.5px;">В процессе</div>
            </div>
            <div style="background: #faf9f5; padding: 24px 16px; text-align: center; border: 1px solid #e5e2d5;">
              <div style="font-family: 'Montserrat', sans-serif; font-size: 32px; font-weight: 500; color: #8690a2; margin-bottom: 8px;">${totalStats.completionRate}%</div>
              <div style="font-size: 10px; color: #8b7a66; text-transform: uppercase; letter-spacing: 0.5px;">Прогресс</div>
            </div>
          </div>
        </div>
        
        <div style="background: #faf9f5; padding: 28px 50px 24px 50px; border-top: 1px solid #e5e2d5;">
          <div style="display: flex; align-items: baseline; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
            <div>
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="width: 24px; height: 2px; background: #b8a88a;"></div>
                <h2 style="font-family: 'Montserrat', sans-serif; font-size: 18px; font-weight: 500; color: #2a241a; margin: 0;">Обзор деревьев навыков</h2>
              </div>
              <p style="font-size: 11px; color: #8b7a66; margin: 6px 0 0 36px;">подробная информация</p>
            </div>
            <div style="display: flex; gap: 24px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 8px; height: 8px; background: #8690a2;"></div>
                <span style="font-size: 9px; color: #8b7a66;">прогресс</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 8px; height: 8px; background: #b8a88a;"></div>
                <span style="font-size: 9px; color: #8b7a66;">освоено</span>
              </div>
            </div>
          </div>
        </div>
      `
    }

    // ========== ГЕНЕРАЦИЯ HTML ФУТЕРА ==========
    const generateFooterHTML = () => {
      return `
        <div style="background: #faf9f5; padding: 28px 50px; text-align: center; border-top: 1px solid #e5e2d5; position: relative;">
          <div style="position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #8690a2, #b8a88a, #d9cb9c);"></div>
          
          <div style="display: flex; justify-content: center; gap: 40px; margin-bottom: 16px; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 10px; color: #5a4d3a; letter-spacing: 0.5px;">SkillTree</span>
            </div>
            <div style="font-size: 10px; color: #5a4d3a;">отслеживание прогресса</div>
            <div style="font-size: 10px; color: #5a4d3a;">оценка компетенций</div>
          </div>
          <div style="font-size: 9px; color: #b8aa92; letter-spacing: 0.5px;">
            автоматически сгенерированный отчёт • данные актуальны на дату генерации
          </div>
        </div>
      `
    }

    // ========== ГЕНЕРАЦИЯ PDF ==========
    const generateResume = async () => {
      if (isGenerating.value) return
      
      isGenerating.value = true
      
      try {
        const treesWithNodes = await loadTreesWithNodes()
        const user = store.state.user.user || {}
        
        if (treesWithNodes.length === 0) {
          alert('У вас пока нет созданных деревьев навыков')
          isGenerating.value = false
          return
        }
        
        const treesData = getTreesWithData(treesWithNodes)
        
        let totalSkills = 0
        let completedSkills = 0
        let inProgressSkills = 0
        let totalProgressSum = 0
        
        treesData.forEach(tree => {
          totalSkills += tree.totalSkills
          completedSkills += tree.completedSkills
          inProgressSkills += tree.inProgressSkills
          totalProgressSum += tree.progress
        })
        
        const completionRate = treesData.length > 0 
          ? Math.round(totalProgressSum / treesData.length)
          : 0
        
        if (totalSkills === 0) {
          alert('У вас пока нет навыков в деревьях')
          isGenerating.value = false
          return
        }
        
        const totalStats = {
          treesCount: treesData.length,
          totalSkills,
          completedSkills,
          inProgressSkills,
          completionRate
        }
        
        const treeHTMLs = treesData.map(tree => generateTreeHTML(tree))
        
        const headerHTML = generateHeaderHTML(user, totalStats)
        const footerHTML = generateFooterHTML()
        
        treesForRender.value = treeHTMLs.map((html, idx) => ({
          id: idx,
          html: `<div style="background: #faf9f5; padding: 0 50px 40px 50px;">${html}</div>`
        }))
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: 'a4'
        })
        
        const pdfWidth = pdf.internal.pageSize.getWidth()
        let isFirstPage = true
        
        const addPageWithContent = async (htmlContent) => {
          const tempDiv = document.createElement('div')
          tempDiv.style.position = 'fixed'
          tempDiv.style.left = '-9999px'
          tempDiv.style.top = '0'
          tempDiv.style.width = '800px'
          tempDiv.style.backgroundColor = 'white'
          tempDiv.innerHTML = htmlContent
          document.body.appendChild(tempDiv)
          
          await new Promise(resolve => setTimeout(resolve, 300))
          
          const canvas = await html2canvas(tempDiv, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true
          })
          
          const imgData = canvas.toDataURL('image/png')
          const imgHeight = (canvas.height * pdfWidth) / canvas.width
          
          if (!isFirstPage) {
            pdf.addPage()
          }
          
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight)
          
          document.body.removeChild(tempDiv)
          isFirstPage = false
        }
        
        await addPageWithContent(headerHTML)
        
        for (let i = 0; i < treeHTMLs.length; i++) {
          const treeWithFooterHTML = `<div style="background: #faf9f5; padding: 0 50px 40px 50px;">${treeHTMLs[i]}${i === treeHTMLs.length - 1 ? footerHTML : ''}</div>`
          await addPageWithContent(treeWithFooterHTML)
        }
        
        pdf.save(`skilltree-resume-${(user.name || 'user').toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`)
        
        treesForRender.value = []
        
      } catch (error) {
        console.error('Failed to generate resume:', error)
        alert('Ошибка при генерации резюме: ' + (error.message || 'Неизвестная ошибка'))
      } finally {
        isGenerating.value = false
      }
    }

    return {
      isGenerating,
      generateResume,
      resumeHtml,
      resumeContent,
      treesForRender,
      setTreeRef
    }
  }
}
</script>