const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const { swaggerUi, specs } = require('./swagger');

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'skilltree',
  password: '1234',
  port: 5432,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
});

// ========== AUTH MIDDLEWARE ==========
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    
    const result = await pool.query(
      'SELECT id, email, name, avatar_url, bio, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    
    const result = await pool.query(
      'SELECT id, email, name, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (result.rows[0].role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, 'your-secret-key');
      const result = await pool.query(
        'SELECT id, email, name, avatar_url, bio FROM users WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length > 0) {
        req.user = result.rows[0];
      }
    } catch (error) {}
  }
  next();
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ========== ФУНКЦИИ РАСЧЕТА ПРОГРЕССА ==========
const calculateSectionProgress = async (client, sectionId) => {
  try {
    const skillsResult = await client.query(
      `SELECT id, status FROM nodes 
       WHERE parent_id = $1 AND node_type = 'skill'`,
      [sectionId]
    );
    
    if (skillsResult.rows.length === 0) {
      await client.query('UPDATE nodes SET progress = 0 WHERE id = $1', [sectionId]);
      return 0;
    }
    
    const completedSkills = skillsResult.rows.filter(s => s.status === 'completed').length;
    const progress = Math.round((completedSkills / skillsResult.rows.length) * 100);
    
    await client.query('UPDATE nodes SET progress = $1 WHERE id = $2', [progress, sectionId]);
    return progress;
  } catch (error) {
    console.error('Error calculating section progress:', error);
    return 0;
  }
};

const updateTreeProgress = async (client, treeId) => {
  try {
    const nodesResult = await client.query(
      `SELECT id, node_type, status, progress, parent_id FROM nodes WHERE tree_id = $1`,
      [treeId]
    );
    
    const nodes = nodesResult.rows;
    
    if (nodes.length === 0) {
      await client.query(
        'UPDATE trees SET progress = 0, status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['not-started', treeId]
      );
      return;
    }
    
    const sections = nodes.filter(n => n.node_type === 'section');
    const skills = nodes.filter(n => n.node_type === 'skill');
    
    let treeProgress = 0;
    let treeStatus = 'not-started';
    
    if (sections.length > 0) {
      let totalSectionProgress = 0;
      let sectionsWithProgress = 0;
      
      for (const section of sections) {
        const sectionSkills = skills.filter(s => s.parent_id === section.id);
        
        if (sectionSkills.length > 0) {
          const completedSkills = sectionSkills.filter(s => s.status === 'completed').length;
          const sectionProgress = Math.round((completedSkills / sectionSkills.length) * 100);
          totalSectionProgress += sectionProgress;
          sectionsWithProgress++;
          await client.query('UPDATE nodes SET progress = $1 WHERE id = $2', [sectionProgress, section.id]);
        } else if (section.progress !== undefined && section.progress !== null) {
          totalSectionProgress += section.progress;
          sectionsWithProgress++;
        }
      }
      
      treeProgress = sectionsWithProgress > 0 ? Math.round(totalSectionProgress / sectionsWithProgress) : 0;
    } else if (skills.length > 0) {
      const completedSkills = skills.filter(s => s.status === 'completed').length;
      treeProgress = Math.round((completedSkills / skills.length) * 100);
    }
    
    if (treeProgress === 100) {
      treeStatus = 'completed';
    } else if (treeProgress > 0) {
      treeStatus = 'in-progress';
    } else {
      treeStatus = 'not-started';
    }
    
    await client.query(
      `UPDATE trees SET progress = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
      [treeProgress, treeStatus, treeId]
    );
    
    return treeProgress;
  } catch (error) {
    console.error('Error updating tree progress:', error);
    await client.query('UPDATE trees SET progress = 0, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [treeId]);
    return 0;
  }
};

const getTreeStatistics = async (treeId) => {
  try {
    const result = await pool.query(
      `SELECT 
        COUNT(DISTINCT n.id) as node_count,
        COUNT(DISTINCT CASE WHEN n.status = 'completed' THEN n.id END) as completed_count
       FROM trees t
       LEFT JOIN nodes n ON t.id = n.tree_id
       WHERE t.id = $1`,
      [treeId]
    );
    return result.rows[0] || { node_count: 0, completed_count: 0 };
  } catch (error) {
    console.error('Error getting tree statistics:', error);
    return { node_count: 0, completed_count: 0 };
  }
};

// ========== AUTH ROUTES ==========

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 123456
 *               name:
 *                 type: string
 *                 example: Иван Иванов
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *       400:
 *         description: Неверные данные
 *       500:
 *         description: Ошибка сервера
 */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password and name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, name, role) 
       VALUES ($1, $2, $3, 'user') RETURNING id, email, name, created_at, role`,
      [email, passwordHash, name]
    );

    const user = result.rows[0];
    const token = jwt.sign({ userId: user.id }, 'your-secret-key', { expiresIn: '7d' });

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Авторизация пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Успешный вход
 *       401:
 *         description: Неверные учётные данные
 *       500:
 *         description: Ошибка сервера
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await pool.query(
      'SELECT id, email, name, password_hash, avatar_url, bio, role FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, 'your-secret-key', { expiresIn: '7d' });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        bio: user.bio,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Получить информацию о текущем пользователе
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные пользователя
 *       401:
 *         description: Не авторизован
 */
app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, 'your-secret-key');
    
    const result = await pool.query(
      'SELECT id, email, name, avatar_url, bio, created_at, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// ========== TREE ROUTES ==========

/**
 * @swagger
 * /trees:
 *   get:
 *     summary: Получить все деревья текущего пользователя
 *     tags: [Trees]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список деревьев
 *       401:
 *         description: Не авторизован
 */
app.get('/api/trees', authenticateToken, async (req, res) => {
  try {
    const treesResult = await pool.query(
      `SELECT t.* FROM trees t WHERE t.user_id = $1 ORDER BY t.updated_at DESC`,
      [req.user.id]
    );
    
    const trees = [];
    for (const tree of treesResult.rows) {
      const stats = await getTreeStatistics(tree.id);
      trees.push({
        ...tree,
        node_count: parseInt(stats.node_count) || 0,
        completed_count: parseInt(stats.completed_count) || 0
      });
    }
    
    res.json({ trees });
  } catch (error) {
    console.error('Get trees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /trees/{id}:
 *   get:
 *     summary: Получить дерево по ID
 *     tags: [Trees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID дерева
 *     responses:
 *       200:
 *         description: Дерево найдено
 *       404:
 *         description: Дерево не найдено
 */
app.get('/api/trees/:id', optionalAuth, async (req, res) => {
  try {
    const treeId = req.params.id;

    const treeResult = await pool.query(
      `SELECT t.*, u.name as author_name
       FROM trees t
       LEFT JOIN users u ON t.user_id = u.id
       WHERE t.id = $1 AND (t.is_public = true OR t.user_id = $2)`,
      [treeId, req.user?.id || null]
    );

    if (treeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tree not found' });
    }

    const tree = treeResult.rows[0];

    const nodesResult = await pool.query(
      `SELECT n.* FROM nodes n WHERE n.tree_id = $1 ORDER BY n.sort_order, n.created_at`,
      [treeId]
    );

    const nodesMap = new Map();
    nodesResult.rows.forEach(node => {
      nodesMap.set(node.id, { ...node, children: [] });
    });

    const rootNodes = [];
    nodesResult.rows.forEach(node => {
      if (node.parent_id) {
        const parent = nodesMap.get(node.parent_id);
        if (parent) parent.children.push(nodesMap.get(node.id));
      } else {
        rootNodes.push(nodesMap.get(node.id));
      }
    });

    let client;
    try {
      client = await pool.connect();
      await updateTreeProgress(client, treeId);
    } catch (err) {}
    finally { if (client) client.release(); }
    
    const updatedTreeResult = await pool.query('SELECT * FROM trees WHERE id = $1', [treeId]);
    const stats = await getTreeStatistics(treeId);
    
    tree.nodes = rootNodes;
    tree.progress = updatedTreeResult.rows[0]?.progress || 0;
    tree.node_count = stats.node_count;
    tree.completed_count = stats.completed_count;

    res.json({ tree });
  } catch (error) {
    console.error('Get tree error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /trees:
 *   post:
 *     summary: Создать новое дерево навыков
 *     tags: [Trees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Мой первый стек
 *               description:
 *                 type: string
 *                 example: Изучение веб-разработки
 *               category:
 *                 type: string
 *                 example: web
 *     responses:
 *       201:
 *         description: Дерево создано
 *       400:
 *         description: Не указано название
 */
app.post('/api/trees', authenticateToken, async (req, res) => {
  let client;
  try {
    const { name, description, category, is_public } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Tree name is required' });
    }

    client = await pool.connect();
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO trees (user_id, name, description, category, is_public, share_token) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.id, name, description, category || 'custom', is_public || false, require('crypto').randomBytes(16).toString('hex')]
    );

    const tree = result.rows[0];

    await client.query(
      'INSERT INTO user_activity (user_id, tree_id, action_type, description) VALUES ($1, $2, $3, $4)',
      [req.user.id, tree.id, 'create_tree', `Created tree "${name}"`]
    );

    await client.query('COMMIT');
    res.status(201).json({ tree });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Create tree error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) client.release();
  }
});

/**
 * @swagger
 * /trees/{id}:
 *   put:
 *     summary: Обновить дерево
 *     tags: [Trees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Дерево обновлено
 *       404:
 *         description: Дерево не найдено
 */
app.put('/api/trees/:id', authenticateToken, async (req, res) => {
  let client;
  try {
    const treeId = req.params.id;
    const { name, description, category, is_public } = req.body;

    client = await pool.connect();
    await client.query('BEGIN');

    const ownershipResult = await client.query(
      'SELECT id, user_id FROM trees WHERE id = $1 AND user_id = $2',
      [treeId, req.user.id]
    );

    if (ownershipResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Tree not found' });
    }

    const result = await client.query(
      `UPDATE trees 
       SET name = COALESCE($1, name), description = COALESCE($2, description),
           category = COALESCE($3, category), is_public = COALESCE($4, is_public), updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [name, description, category, is_public, treeId]
    );

    const tree = result.rows[0];
    await updateTreeProgress(client, treeId);

    await client.query(
      'INSERT INTO user_activity (user_id, tree_id, action_type, description) VALUES ($1, $2, $3, $4)',
      [req.user.id, treeId, 'update_tree', `Updated tree "${tree.name}"`]
    );

    await client.query('COMMIT');
    res.json({ tree });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Update tree error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) client.release();
  }
});

/**
 * @swagger
 * /trees/{id}:
 *   delete:
 *     summary: Удалить дерево
 *     tags: [Trees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Дерево удалено
 *       404:
 *         description: Дерево не найдено
 */
app.delete('/api/trees/:id', authenticateToken, async (req, res) => {
  let client;
  try {
    const treeId = req.params.id;

    client = await pool.connect();
    await client.query('BEGIN');

    const ownershipResult = await client.query(
      'SELECT id, name FROM trees WHERE id = $1 AND user_id = $2',
      [treeId, req.user.id]
    );

    if (ownershipResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Tree not found' });
    }

    const treeName = ownershipResult.rows[0].name;

    await client.query('DELETE FROM nodes WHERE tree_id = $1', [treeId]);
    await client.query('DELETE FROM trees WHERE id = $1', [treeId]);

    await client.query(
      'INSERT INTO user_activity (user_id, action_type, description) VALUES ($1, $2, $3)',
      [req.user.id, 'delete_tree', `Deleted tree "${treeName}"`]
    );

    await client.query('COMMIT');
    res.json({ message: 'Tree deleted successfully' });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Delete tree error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) client.release();
  }
});

// ========== NODE ROUTES ==========

/**
 * @swagger
 * /nodes:
 *   post:
 *     summary: Создать узел (раздел или навык)
 *     tags: [Nodes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tree_id
 *             properties:
 *               tree_id:
 *                 type: integer
 *               parent_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               node_type:
 *                 type: string
 *                 enum: [section, skill]
 *     responses:
 *       201:
 *         description: Узел создан
 *       400:
 *         description: Ошибка в данных
 */
app.post('/api/nodes', authenticateToken, async (req, res) => {
  let client;
  try {
    const { tree_id, parent_id, name, description, status, difficulty,
      resources, notes, position_x, position_y, color, node_type, deadline } = req.body;

    if (!tree_id) {
      return res.status(400).json({ error: 'Tree ID is required' });
    }

    client = await pool.connect();
    await client.query('BEGIN');

    const treeCheck = await client.query('SELECT id, user_id FROM trees WHERE id = $1', [tree_id]);

    if (treeCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Tree not found' });
    }

    if (treeCheck.rows[0].user_id !== req.user.id) {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Access denied' });
    }

    let nextSortOrder = 1;
    const sortQuery = parent_id 
      ? 'SELECT COALESCE(MAX(sort_order), 0) as max_order FROM nodes WHERE tree_id = $1 AND parent_id = $2'
      : 'SELECT COALESCE(MAX(sort_order), 0) as max_order FROM nodes WHERE tree_id = $1 AND parent_id IS NULL';
    
    const sortParams = parent_id ? [tree_id, parent_id] : [tree_id];
    const sortResult = await client.query(sortQuery, sortParams);
    nextSortOrder = sortResult.rows[0].max_order + 1;

    const finalNodeType = node_type || (!parent_id ? 'section' : 'skill');
    const finalProgress = 0;
    
    let resourcesJson = '[]';
    if (Array.isArray(resources)) {
      resourcesJson = JSON.stringify(resources);
    }

    const result = await client.query(
      `INSERT INTO nodes (
        tree_id, parent_id, name, description, status, progress, 
        difficulty, resources, notes, position_x, position_y, color, sort_order, node_type, deadline
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [tree_id, parent_id || null, name || 'Новый узел', description || '', 
        status || 'not-started', finalProgress, difficulty || 'medium', resourcesJson,
        notes || '', Math.round(Number(position_x)) || 100, Math.round(Number(position_y)) || 100,
        color || (finalNodeType === 'section' ? '#8690a2' : '#10b981'),
        nextSortOrder, finalNodeType, deadline || null]
    );

    const newNode = result.rows[0];

    if (finalNodeType === 'skill' && parent_id) {
      await calculateSectionProgress(client, parent_id);
    }
    
    await updateTreeProgress(client, tree_id);

    await client.query(
      'INSERT INTO user_activity (user_id, tree_id, node_id, action_type, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, tree_id, newNode.id, 'create_node', `Created ${finalNodeType} "${newNode.name}"`]
    );

    await client.query('COMMIT');
    res.status(201).json({ node: newNode });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Create node error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  } finally {
    if (client) client.release();
  }
});

/**
 * @swagger
 * /nodes/{id}:
 *   put:
 *     summary: Обновить узел
 *     tags: [Nodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               status:
 *                 type: string
 *               position_x:
 *                 type: integer
 *               position_y:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Узел обновлён
 *       404:
 *         description: Узел не найден
 */
app.put('/api/nodes/:id', authenticateToken, async (req, res) => {
  let client;
  try {
    const nodeId = req.params.id;
    const updates = req.body;

    client = await pool.connect();
    await client.query('BEGIN');

    const nodeResult = await client.query(
      `SELECT n.*, t.user_id, t.id as tree_id FROM nodes n JOIN trees t ON n.tree_id = t.id WHERE n.id = $1 AND t.user_id = $2`,
      [nodeId, req.user.id]
    );

    if (nodeResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Node not found' });
    }

    const currentNode = nodeResult.rows[0];
    const treeId = currentNode.tree_id;

    const allowedFields = [
      'name', 'description', 'status', 'difficulty', 'resources', 'notes',
      'position_x', 'position_y', 'color', 'parent_id', 'sort_order', 'node_type', 'deadline'
    ];

    const setClause = [];
    const values = [];
    let paramCount = 1;

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        setClause.push(`${field} = $${paramCount}`);
        values.push(updates[field]);
        paramCount++;
      }
    });

    if (updates.status && currentNode.node_type === 'skill') {
      const newProgress = updates.status === 'completed' ? 100 : 0;
      setClause.push(`progress = $${paramCount}`);
      values.push(newProgress);
      paramCount++;
    }

    if (setClause.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(nodeId);
    const query = `UPDATE nodes SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`;
    const result = await client.query(query, values);
    const updatedNode = result.rows[0];

    if (currentNode.node_type === 'skill' && updates.status !== undefined && updates.status !== currentNode.status) {
      const sectionId = currentNode.parent_id;
      if (sectionId) await calculateSectionProgress(client, sectionId);
    }

    await updateTreeProgress(client, treeId);

    const actionType = currentNode.node_type === 'skill' && updates.status === 'completed' ? 'complete_skill' : 'update_node';
    
    await client.query(
      'INSERT INTO user_activity (user_id, tree_id, node_id, action_type, description) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, treeId, nodeId, actionType, `Updated ${currentNode.node_type} "${updatedNode.name}"`]
    );

    await client.query('COMMIT');
    res.json({ node: updatedNode });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Update node error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  } finally {
    if (client) client.release();
  }
});

/**
 * @swagger
 * /nodes/{id}:
 *   delete:
 *     summary: Удалить узел
 *     tags: [Nodes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Узел удалён
 *       404:
 *         description: Узел не найден
 */
app.delete('/api/nodes/:id', authenticateToken, async (req, res) => {
  let client;
  try {
    const nodeId = req.params.id;

    client = await pool.connect();
    await client.query('BEGIN');

    const nodeResult = await client.query(
      `SELECT n.*, t.user_id, t.id as tree_id FROM nodes n JOIN trees t ON n.tree_id = t.id WHERE n.id = $1 AND t.user_id = $2`,
      [nodeId, req.user.id]
    );

    if (nodeResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Node not found' });
    }

    const currentNode = nodeResult.rows[0];
    const treeId = currentNode.tree_id;
    const sectionId = currentNode.parent_id;

    await client.query('DELETE FROM nodes WHERE id = $1', [nodeId]);

    if (currentNode.node_type === 'skill' && sectionId) {
      await calculateSectionProgress(client, sectionId);
    }

    if (currentNode.node_type === 'section') {
      await client.query('DELETE FROM nodes WHERE parent_id = $1', [nodeId]);
    }

    await updateTreeProgress(client, treeId);

    await client.query(
      'INSERT INTO user_activity (user_id, tree_id, action_type, description) VALUES ($1, $2, $3, $4)',
      [req.user.id, treeId, 'delete_node', `Deleted ${currentNode.node_type} "${currentNode.name}"`]
    );

    await client.query('COMMIT');
    res.json({ message: 'Node deleted successfully' });
  } catch (error) {
    if (client) await client.query('ROLLBACK');
    console.error('Delete node error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  } finally {
    if (client) client.release();
  }
});

// ========== USER ROUTES ==========

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Получить профиль текущего пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Профиль пользователя
 *       401:
 *         description: Не авторизован
 */
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, email, name, avatar_url, bio, created_at, role FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];

    const statsResult = await pool.query(
      `SELECT 
        COUNT(DISTINCT t.id) as tree_count,
        COUNT(DISTINCT n.id) as total_skills,
        COUNT(DISTINCT CASE WHEN n.status = 'completed' THEN n.id END) as completed_skills
       FROM users u
       LEFT JOIN trees t ON u.id = t.user_id
       LEFT JOIN nodes n ON t.id = n.tree_id
       WHERE u.id = $1`,
      [req.user.id]
    );

    const stats = statsResult.rows[0];

    res.json({ 
      user: {
        ...user,
        tree_count: stats.tree_count || 0,
        total_skills: stats.total_skills || 0,
        completed_skills: stats.completed_skills || 0
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Обновить профиль пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               avatar_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Профиль обновлён
 *       401:
 *         description: Не авторизован
 */
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const { name, bio, avatar_url } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name), bio = COALESCE($2, bio),
           avatar_url = COALESCE($3, avatar_url), updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING id, email, name, avatar_url, bio, created_at`,
      [name, bio, avatar_url, req.user.id]
    );

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /users/activity:
 *   get:
 *     summary: Получить активность пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список активностей
 */
app.get('/api/users/activity', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, t.name as tree_name, n.name as node_name
       FROM user_activity a
       LEFT JOIN trees t ON a.tree_id = t.id
       LEFT JOIN nodes n ON a.node_id = n.id
       WHERE a.user_id = $1
       ORDER BY a.created_at DESC
       LIMIT 100`,
      [req.user.id]
    );

    res.json({ activities: result.rows });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /users/statistics:
 *   get:
 *     summary: Получить статистику пользователя
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Статистика
 */
app.get('/api/users/statistics', authenticateToken, async (req, res) => {
  try {
    const activeDaysResult = await pool.query(
      `SELECT COUNT(DISTINCT DATE(created_at)) as active_days FROM user_activity WHERE user_id = $1`,
      [req.user.id]
    );

    const activeDays = parseInt(activeDaysResult.rows[0]?.active_days || 0);

    const statsResult = await pool.query(
      `SELECT 
        COUNT(DISTINCT t.id) as total_trees,
        COUNT(DISTINCT n.id) as total_skills,
        COUNT(DISTINCT CASE WHEN n.status = 'completed' THEN n.id END) as completed_skills,
        COUNT(DISTINCT CASE WHEN n.status = 'in-progress' THEN n.id END) as in_progress_skills,
        COUNT(DISTINCT a.id) as total_activities
       FROM users u
       LEFT JOIN trees t ON u.id = t.user_id
       LEFT JOIN nodes n ON t.id = n.tree_id
       LEFT JOIN user_activity a ON u.id = a.user_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.user.id]
    );

    const treesResult = await pool.query('SELECT progress FROM trees WHERE user_id = $1', [req.user.id]);
    
    let overallProgress = 0;
    const treesWithProgress = treesResult.rows.filter(t => t.progress !== null && t.progress !== undefined);
    if (treesWithProgress.length > 0) {
      const totalProgress = treesWithProgress.reduce((sum, t) => sum + (Number(t.progress) || 0), 0);
      overallProgress = Math.round(totalProgress / treesWithProgress.length);
    }

    res.json({
      stats: {
        ...(statsResult.rows[0] || { total_trees: 0, total_skills: 0, completed_skills: 0, in_progress_skills: 0, total_activities: 0 }),
        active_days: activeDays,
        overall_progress: overallProgress
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== DEADLINES ==========

/**
 * @swagger
 * /users/deadlines:
 *   get:
 *     summary: Получить список активных дедлайнов
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список дедлайнов
 */
app.get('/api/users/deadlines', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT n.id, n.name, n.deadline, n.node_type, n.status, t.id as tree_id, t.name as tree_name
       FROM nodes n JOIN trees t ON n.tree_id = t.id
       WHERE t.user_id = $1 AND n.deadline IS NOT NULL AND n.status != 'completed'
       ORDER BY n.deadline ASC`,
      [req.user.id]
    );
    
    res.json({ deadlines: result.rows });
  } catch (error) {
    console.error('Get deadlines error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/activity/log', authenticateToken, async (req, res) => {
  try {
    const { tree_id, node_id, action_type, description } = req.body;

    const result = await pool.query(
      `INSERT INTO user_activity (user_id, tree_id, node_id, action_type, description) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.user.id, tree_id, node_id, action_type, description]
    );

    res.json({ activity: result.rows[0] });
  } catch (error) {
    console.error('Log activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== LIBRARY TREES API (ГОТОВЫЕ ДЕРЕВЬЯ) ==========

/**
 * @swagger
 * /library/trees:
 *   get:
 *     summary: Получить список готовых деревьев (библиотека)
 *     tags: [Library]
 *     responses:
 *       200:
 *         description: Список готовых деревьев
 */
app.get('/api/library/trees', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM library_trees WHERE is_active = true ORDER BY name'
    );
    console.log('Library trees found:', result.rows.length);
    res.json({ trees: result.rows });
  } catch (error) {
    console.error('Get library trees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/trees', authenticateAdmin, async (req, res) => {
  try {
    const { name, description, category, nodes, is_active } = req.body;
    
    const result = await pool.query(
      `INSERT INTO library_trees (name, description, category, nodes, is_active, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description, category, JSON.stringify(nodes), is_active !== false, req.user.id]
    );
    
    res.status(201).json({ tree: result.rows[0] });
  } catch (error) {
    console.error('Create tree error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/admin/trees/:id', authenticateAdmin, async (req, res) => {
  try {
    const treeId = req.params.id;
    const { name, description, category, nodes, is_active } = req.body;
    
    const result = await pool.query(
      `UPDATE library_trees 
       SET name = COALESCE($1, name), description = COALESCE($2, description),
           category = COALESCE($3, category), nodes = COALESCE($4, nodes),
           is_active = COALESCE($5, is_active), updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [name, description, category, nodes ? JSON.stringify(nodes) : null, is_active, treeId]
    );
    
    res.json({ tree: result.rows[0] });
  } catch (error) {
    console.error('Update tree error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/trees/:id', authenticateAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM library_trees WHERE id = $1', [req.params.id]);
    res.json({ message: 'Tree deleted successfully' });
  } catch (error) {
    console.error('Delete tree error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== ADMIN USER MANAGEMENT ==========

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Получить список всех пользователей (только админ)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список пользователей
 *       403:
 *         description: Доступ запрещён
 */
app.get('/api/admin/users', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/admin/users/search', authenticateAdmin, async (req, res) => {
  try {
    const { q } = req.query;
    const result = await pool.query(
      'SELECT id, email, name, role, created_at FROM users WHERE email ILIKE $1 OR name ILIKE $1 ORDER BY created_at DESC',
      [`%${q}%`]
    );
    res.json({ users: result.rows });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/users/:id/make-admin', authenticateAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['admin', req.params.id]);
    res.json({ message: 'User is now admin' });
  } catch (error) {
    console.error('Make admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/users/:id/remove-admin', authenticateAdmin, async (req, res) => {
  try {
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['user', req.params.id]);
    res.json({ message: 'Admin rights removed' });
  } catch (error) {
    console.error('Remove admin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/admin/users/:id', authenticateAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    await pool.query('DELETE FROM user_activity WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM nodes WHERE tree_id IN (SELECT id FROM trees WHERE user_id = $1)', [userId]);
    await pool.query('DELETE FROM trees WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== ERROR HANDLING ==========
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});