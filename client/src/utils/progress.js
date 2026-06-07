// Добавляем функцию форматирования чисел
export function formatNumber(value, defaultValue = '0') {
  if (value === undefined || value === null) return defaultValue
  if (typeof value === 'string') {
    const num = parseInt(value)
    return isNaN(num) ? defaultValue : num.toString()
  }
  if (typeof value === 'number') {
    return Math.round(value).toString()
  }
  return defaultValue
}

// Безопасное получение числа
export function safeNumber(value, fallback = 0) {
  if (value === undefined || value === null) return fallback
  const num = Number(value)
  return isNaN(num) ? fallback : num
}

export function calculateOverallProgress(trees) {
  if (!trees || !Array.isArray(trees) || trees.length === 0) return 0
  
  const validTrees = trees.filter(tree => 
    tree.progress !== undefined && tree.progress !== null
  )
  
  if (validTrees.length === 0) return 0
  
  const totalProgress = validTrees.reduce((sum, tree) => sum + safeNumber(tree.progress), 0)
  return Math.round(totalProgress / validTrees.length)
}

export function calculateUserStats(trees) {
  if (!trees || !Array.isArray(trees) || trees.length === 0) {
    return {
      totalTrees: 0,
      totalSkills: 0,
      completedSkills: 0,
      overallProgress: 0,
      inProgressTrees: 0,
      completedTrees: 0
    }
  }
  
  const totalSkills = trees.reduce((sum, tree) => sum + safeNumber(tree.node_count), 0)
  const completedSkills = trees.reduce((sum, tree) => sum + safeNumber(tree.completed_count), 0)
  
  const inProgressTrees = trees.filter(tree => {
    const progress = safeNumber(tree.progress)
    return progress > 0 && progress < 100
  }).length
  
  const completedTrees = trees.filter(tree => safeNumber(tree.progress) === 100).length
  
  const overallProgress = calculateOverallProgress(trees)
  
  return {
    totalTrees: trees.length,
    totalSkills,
    completedSkills,
    overallProgress,
    inProgressTrees,
    completedTrees
  }
}

export function calculateSectionProgress(section) {
  if (!section.children || section.children.length === 0) return 0
  
  const skills = section.children.filter(child => 
    child.node_type === 'skill'
  )
  
  if (skills.length === 0) return 0
  
  const completedSkills = skills.filter(skill => 
    skill.status === 'completed'
  ).length
  
  return Math.round((completedSkills / skills.length) * 100)
}