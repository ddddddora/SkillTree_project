-- Миграция 001: Добавление node_type и пересчет прогресса

-- 1. Добавляем колонку node_type к таблице nodes
ALTER TABLE nodes ADD COLUMN IF NOT EXISTS node_type VARCHAR(20) DEFAULT 'skill';

-- 2. Обновляем существующие записи: узлы без родителя = разделы
UPDATE nodes SET node_type = 'section' WHERE parent_id IS NULL;

-- 3. Создаем индекс для ускорения запросов
CREATE INDEX IF NOT EXISTS idx_nodes_node_type ON nodes(node_type);

-- 4. Создаем функцию для пересчета прогресса раздела
CREATE OR REPLACE FUNCTION calculate_section_progress(section_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    total_skills INTEGER;
    completed_skills INTEGER;
    progress_percent INTEGER;
BEGIN
    -- Считаем общее количество навыков в разделе
    SELECT COUNT(*) INTO total_skills
    FROM nodes 
    WHERE parent_id = section_id AND node_type = 'skill';
    
    IF total_skills = 0 THEN
        RETURN 0;
    END IF;
    
    -- Считаем количество завершенных навыков
    SELECT COUNT(*) INTO completed_skills
    FROM nodes 
    WHERE parent_id = section_id 
      AND node_type = 'skill' 
      AND status = 'completed';
    
    -- Рассчитываем процент
    progress_percent := ROUND((completed_skills::DECIMAL / total_skills::DECIMAL) * 100);
    
    RETURN progress_percent;
END;
$$ LANGUAGE plpgsql;

-- 5. Создаем функцию для обновления прогресса дерева
CREATE OR REPLACE FUNCTION update_tree_progress(tree_id INTEGER)
RETURNS VOID AS $$
DECLARE
    sections_count INTEGER;
    total_progress INTEGER;
    avg_progress INTEGER;
BEGIN
    -- Считаем количество разделов
    SELECT COUNT(*) INTO sections_count
    FROM nodes 
    WHERE tree_id = tree_id 
      AND node_type = 'section' 
      AND parent_id IS NULL;
    
    IF sections_count = 0 THEN
        -- Если нет разделов, прогресс дерева = 0
        UPDATE trees SET progress = 0, updated_at = NOW() WHERE id = tree_id;
        RETURN;
    END IF;
    
    -- Считаем общий прогресс всех разделов
    SELECT COALESCE(SUM(progress), 0) INTO total_progress
    FROM nodes 
    WHERE tree_id = tree_id 
      AND node_type = 'section' 
      AND parent_id IS NULL;
    
    -- Рассчитываем средний прогресс
    avg_progress := ROUND(total_progress::DECIMAL / sections_count);
    
    -- Обновляем прогресс дерева
    UPDATE trees 
    SET progress = avg_progress, updated_at = NOW() 
    WHERE id = tree_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Создаем триггер для автоматического обновления прогресса раздела при изменении навыка
CREATE OR REPLACE FUNCTION update_section_progress_on_skill_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Если у навыка есть родитель (раздел), обновляем прогресс раздела
    IF NEW.parent_id IS NOT NULL THEN
        UPDATE nodes 
        SET progress = calculate_section_progress(NEW.parent_id),
            updated_at = NOW()
        WHERE id = NEW.parent_id AND node_type = 'section';
        
        -- Обновляем прогресс дерева
        PERFORM update_tree_progress(NEW.tree_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггер
DROP TRIGGER IF EXISTS trigger_update_section_progress ON nodes;
CREATE TRIGGER trigger_update_section_progress
AFTER INSERT OR UPDATE OF status ON nodes
FOR EACH ROW
WHEN (NEW.node_type = 'skill')
EXECUTE FUNCTION update_section_progress_on_skill_change();

-- 7. Пересчитываем прогресс для всех существующих данных
DO $$
DECLARE
    section_record RECORD;
    tree_record RECORD;
BEGIN
    -- Обновляем прогресс для всех разделов
    FOR section_record IN SELECT id FROM nodes WHERE node_type = 'section' LOOP
        UPDATE nodes 
        SET progress = calculate_section_progress(section_record.id)
        WHERE id = section_record.id;
    END LOOP;
    
    -- Обновляем прогресс для всех деревьев
    FOR tree_record IN SELECT id FROM trees LOOP
        PERFORM update_tree_progress(tree_record.id);
    END LOOP;
END $$;

-- 8. Обновляем прогресс для навыков (100% если completed, иначе 0%)
UPDATE nodes 
SET progress = CASE 
    WHEN status = 'completed' THEN 100 
    ELSE 0 
END
WHERE node_type = 'skill';

COMMIT;

-- 9. Проверяем что все работает
SELECT 
    'Миграция успешно выполнена!' as status,
    (SELECT COUNT(*) FROM nodes WHERE node_type = 'section') as sections_count,
    (SELECT COUNT(*) FROM nodes WHERE node_type = 'skill') as skills_count,
    (SELECT AVG(progress) FROM trees) as avg_tree_progress;