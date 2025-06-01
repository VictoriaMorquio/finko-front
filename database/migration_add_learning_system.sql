-- =====================================================
-- MIGRACIÓN: AGREGAR SISTEMA DE APRENDIZAJE COMPLETO
-- Versión: 1.0 - Migración desde estructura básica
-- Fecha: 2024
-- =====================================================

USE finko;

-- =====================================================
-- AGREGAR TABLAS FALTANTES DEL SISTEMA DE APRENDIZAJE
-- =====================================================

-- TABLA: learn_lessons - Lecciones/Niveles dentro de habilidades
CREATE TABLE IF NOT EXISTS learn_lessons (
    id VARCHAR(20) PRIMARY KEY,
    skill_id VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    type ENUM('intro', 'lesson') DEFAULT 'lesson',
    total_steps INT UNSIGNED DEFAULT 1,
    coins_reward INT UNSIGNED DEFAULT 50,
    xp_reward INT UNSIGNED DEFAULT 100,
    sort_order INT UNSIGNED NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (skill_id) REFERENCES learn_skills(id) ON DELETE CASCADE,
    INDEX idx_skill_id (skill_id),
    INDEX idx_sort_order (sort_order),
    INDEX idx_is_active (is_active)
);

-- TABLA: learn_steps - Pasos/Contenido dentro de lecciones
CREATE TABLE IF NOT EXISTS learn_steps (
    id VARCHAR(30) PRIMARY KEY,
    lesson_id VARCHAR(20) NOT NULL,
    step_number INT UNSIGNED NOT NULL,
    type ENUM('content', 'quiz', 'true-false') NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NULL,
    image_url VARCHAR(500) NULL,
    
    -- Para pasos de contenido
    video_url VARCHAR(500) NULL,
    
    -- Para pasos de quiz
    question TEXT NULL,
    statement TEXT NULL, -- Para true/false
    options JSON NULL, -- Para multiple choice: ["A", "B", "C", "D"]
    correct_answer VARCHAR(10) NULL, -- "A", "B", "true", "false"
    
    -- Feedback después de responder
    feedback JSON NULL, -- {"correct": "¡Correcto!", "incorrect": "Incorrecto..."}
    
    is_last_step BOOLEAN DEFAULT FALSE,
    sort_order INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (lesson_id) REFERENCES learn_lessons(id) ON DELETE CASCADE,
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_step_number (step_number),
    INDEX idx_type (type),
    INDEX idx_sort_order (sort_order)
);

-- TABLA: user_lesson_progress - Progreso detallado por lección
CREATE TABLE IF NOT EXISTS user_lesson_progress (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    lesson_id VARCHAR(20) NOT NULL,
    status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
    current_step_number INT UNSIGNED DEFAULT 1,
    completed_steps INT UNSIGNED DEFAULT 0,
    total_steps INT UNSIGNED NOT NULL,
    coins_earned INT UNSIGNED DEFAULT 0,
    xp_earned INT UNSIGNED DEFAULT 0,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES learn_lessons(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_user_lesson (user_id, lesson_id),
    INDEX idx_user_id (user_id),
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_status (status),
    INDEX idx_last_accessed (last_accessed)
);

-- =====================================================
-- MODIFICAR TABLA user_progress EXISTENTE
-- =====================================================

-- Agregar campos faltantes a user_progress si no existen
ALTER TABLE user_progress 
ADD COLUMN IF NOT EXISTS current_lesson_id VARCHAR(20) NULL,
ADD COLUMN IF NOT EXISTS current_step_id VARCHAR(30) NULL;

-- Agregar foreign keys si no existen
SET @exist_fk_lesson := (
    SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'finko' 
    AND TABLE_NAME = 'user_progress' 
    AND CONSTRAINT_NAME = 'user_progress_ibfk_3'
);

SET @exist_fk_step := (
    SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE 
    WHERE TABLE_SCHEMA = 'finko' 
    AND TABLE_NAME = 'user_progress' 
    AND CONSTRAINT_NAME = 'user_progress_ibfk_4'
);

SET @sql_lesson = IF(@exist_fk_lesson = 0,
    'ALTER TABLE user_progress ADD FOREIGN KEY (current_lesson_id) REFERENCES learn_lessons(id) ON DELETE SET NULL',
    'SELECT "FK lesson already exists"'
);

SET @sql_step = IF(@exist_fk_step = 0,
    'ALTER TABLE user_progress ADD FOREIGN KEY (current_step_id) REFERENCES learn_steps(id) ON DELETE SET NULL',
    'SELECT "FK step already exists"'
);

PREPARE stmt1 FROM @sql_lesson;
EXECUTE stmt1;
DEALLOCATE PREPARE stmt1;

PREPARE stmt2 FROM @sql_step;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- =====================================================
-- MODIFICAR TABLA user_quiz_attempts SI EXISTE
-- =====================================================

-- Verificar si user_quiz_attempts existe y agregarle campos si es necesario
SET @table_exists := (
    SELECT COUNT(*) FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = 'finko' AND TABLE_NAME = 'user_quiz_attempts'
);

SET @sql_quiz_table = IF(@table_exists = 0,
    'CREATE TABLE user_quiz_attempts (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        step_id VARCHAR(30) NOT NULL,
        lesson_id VARCHAR(20) NOT NULL,
        answer VARCHAR(10) NOT NULL,
        is_correct BOOLEAN NOT NULL,
        attempt_number INT UNSIGNED DEFAULT 1,
        time_taken_seconds INT UNSIGNED NULL,
        attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (step_id) REFERENCES learn_steps(id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES learn_lessons(id) ON DELETE CASCADE,
        
        INDEX idx_user_id (user_id),
        INDEX idx_step_id (step_id),
        INDEX idx_lesson_id (lesson_id),
        INDEX idx_is_correct (is_correct),
        INDEX idx_attempted_at (attempted_at)
    )',
    'SELECT "Table user_quiz_attempts already exists"'
);

PREPARE stmt3 FROM @sql_quiz_table;
EXECUTE stmt3;
DEALLOCATE PREPARE stmt3;

-- =====================================================
-- AGREGAR TRIGGER PARA ACTUALIZAR PROGRESO
-- =====================================================

-- Eliminar trigger si existe para recrearlo
DROP TRIGGER IF EXISTS update_skill_progress;

DELIMITER //
CREATE TRIGGER update_skill_progress 
AFTER UPDATE ON user_lesson_progress 
FOR EACH ROW 
BEGIN 
    DECLARE total_lessons INT;
    DECLARE completed_lessons INT;
    DECLARE skill_progress INT;
    
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Obtener el skill_id de la lección
        SELECT skill_id INTO @current_skill_id FROM learn_lessons WHERE id = NEW.lesson_id;
        
        -- Contar lecciones totales y completadas para esta habilidad
        SELECT COUNT(*) INTO total_lessons 
        FROM learn_lessons 
        WHERE skill_id = @current_skill_id AND is_active = TRUE;
        
        SELECT COUNT(*) INTO completed_lessons 
        FROM user_lesson_progress ulp
        JOIN learn_lessons ll ON ulp.lesson_id = ll.id
        WHERE ulp.user_id = NEW.user_id 
        AND ll.skill_id = @current_skill_id 
        AND ulp.status = 'completed';
        
        -- Calcular progreso porcentual
        SET skill_progress = ROUND((completed_lessons / total_lessons) * 100);
        
        -- Actualizar progreso de la habilidad
        INSERT INTO user_progress (user_id, skill_id, progress_percentage, current_lesson_id)
        VALUES (NEW.user_id, @current_skill_id, skill_progress, NEW.lesson_id)
        ON DUPLICATE KEY UPDATE 
            progress_percentage = skill_progress,
            current_lesson_id = NEW.lesson_id,
            completed_at = CASE WHEN skill_progress = 100 THEN NOW() ELSE completed_at END,
            updated_at = NOW();
            
        -- Actualizar stats del usuario
        UPDATE users 
        SET total_xp = total_xp + NEW.xp_earned,
            coins = coins + NEW.coins_earned,
            levels_completed = levels_completed + 1
        WHERE id = NEW.user_id;
    END IF;
END//
DELIMITER ;

-- =====================================================
-- AGREGAR DATOS INICIALES
-- =====================================================

-- Agregar más unidades si no existen
INSERT IGNORE INTO learn_units (id, title, description, image_url, sort_order) VALUES
('unit3', 'Unidad 3:<br>¿Dónde Puedo Invertir?', 'Descubre los tipos básicos de activos.', '/images/unidad3.jpg', 3),
('unit4', 'Unidad 4:<br>Primeros Pasos como Inversor', 'Aprende cómo comenzar a invertir.', '/images/unidad4.jpg', 4),
('unit5', 'Unidad 5:<br>Estrategias Avanzadas', 'Explora técnicas más sofisticadas.', '/images/unidad5.jpg', 5),
('unit6', 'Unidad 6:<br>Planificación Financiera', 'Crea un plan sólido para tu futuro.', '/images/unidad6.jpg', 6);

-- Lecciones de ejemplo para "¿Qué es el dinero?" (skill1-1)
INSERT IGNORE INTO learn_lessons (id, skill_id, title, description, image_url, type, total_steps, sort_order) VALUES
('lesson1-1-1', 'skill1-1', 'Introducción al Dinero', 'Aprende qué es el dinero y por qué existe', '/images/nivel1.png', 'intro', 3, 1),
('lesson1-1-2', 'skill1-1', 'Historia del Dinero', 'Descubre cómo evolucionó el dinero a través del tiempo', '/images/nivel1.png', 'lesson', 5, 2),
('lesson1-1-3', 'skill1-1', 'Tipos de Dinero Actual', 'Conoce las diferentes formas de dinero hoy en día', '/images/nivel1.png', 'lesson', 4, 3);

-- Lecciones para "Ingresos y gastos" (skill1-2)
INSERT IGNORE INTO learn_lessons (id, skill_id, title, description, image_url, type, total_steps, sort_order) VALUES
('lesson1-2-1', 'skill1-2', 'Conociendo tus Ingresos', 'Identifica todas tus fuentes de ingresos', '/images/nivel1.png', 'intro', 3, 1),
('lesson1-2-2', 'skill1-2', 'Categorías de Gastos', 'Aprende a clasificar tus gastos correctamente', '/images/nivel1.png', 'lesson', 4, 2),
('lesson1-2-3', 'skill1-2', 'Balance Mensual', 'Cómo hacer un balance de ingresos vs gastos', '/images/nivel1.png', 'lesson', 5, 3);

-- Pasos de ejemplo para "Introducción al Dinero" (lesson1-1-1)
INSERT IGNORE INTO learn_steps (id, lesson_id, step_number, type, title, content, image_url, is_last_step, sort_order) VALUES
('step1-1-1-1', 'lesson1-1-1', 1, 'content', 'Bienvenido', 'El dinero es una herramienta que facilita el intercambio de bienes y servicios. Sin dinero, tendríamos que hacer trueques directos.', '/images/paso1.png', FALSE, 1),
('step1-1-1-2', 'lesson1-1-1', 2, 'quiz', 'Pregunta sobre el dinero', NULL, NULL, FALSE, 2),
('step1-1-1-3', 'lesson1-1-1', 3, 'content', '¡Felicidades!', 'Has completado tu primera lección sobre dinero. ¡Continúa aprendiendo!', '/images/nivelCompletado.png', TRUE, 3);

-- Pasos para "Historia del Dinero" (lesson1-1-2)
INSERT IGNORE INTO learn_steps (id, lesson_id, step_number, type, title, content, image_url, is_last_step, sort_order) VALUES
('step1-1-2-1', 'lesson1-1-2', 1, 'content', 'El Trueque', 'Antes del dinero, las personas intercambiaban directamente bienes y servicios. Esto se llama trueque.', '/images/paso1.png', FALSE, 1),
('step1-1-2-2', 'lesson1-1-2', 2, 'content', 'Dinero Mercancía', 'Luego se usaron objetos valiosos como sal, conchas o metales preciosos como dinero.', '/images/paso1.png', FALSE, 2),
('step1-1-2-3', 'lesson1-1-2', 3, 'quiz', 'Quiz: Historia', NULL, NULL, FALSE, 3),
('step1-1-2-4', 'lesson1-1-2', 4, 'content', 'Billetes y Monedas', 'Los gobiernos empezaron a emitir billetes y monedas respaldados por oro y plata.', '/images/paso1.png', FALSE, 4),
('step1-1-2-5', 'lesson1-1-2', 5, 'content', 'Dinero Digital', 'Hoy en día también tenemos dinero digital: tarjetas, transferencias y criptomonedas.', '/images/nivelCompletado.png', TRUE, 5);

-- Configurar preguntas de quiz
UPDATE learn_steps SET 
    question = '¿Cuál es la función principal del dinero?',
    options = '["Facilitar el intercambio", "Decorar la casa", "Hacer ruido", "Ser bonito"]',
    correct_answer = 'A',
    feedback = '{"correct": "¡Correcto! El dinero facilita el intercambio de bienes y servicios.", "incorrect": "Incorrecto. La función principal del dinero es facilitar el intercambio."}'
WHERE id = 'step1-1-1-2';

UPDATE learn_steps SET 
    question = '¿Qué sistema se usaba antes del dinero?',
    options = '["Trueque", "Bancos", "Tarjetas", "Internet"]',
    correct_answer = 'A',
    feedback = '{"correct": "¡Exacto! El trueque era el intercambio directo de bienes.", "incorrect": "No, antes del dinero se usaba el trueque."}'
WHERE id = 'step1-1-2-3';

-- Agregar más logros específicos del aprendizaje
INSERT IGNORE INTO achievements (title, description, image_url, category, criteria, coins_reward, xp_reward) VALUES
('Primera Lección', 'Completaste tu primera lección', '/images/achievement1.png', 'aprendizaje', '{"type": "first_lesson"}', 100, 250),
('Experto en Quiz', 'Responde correctamente 10 preguntas seguidas', '/images/achievement3.png', 'aprendizaje', '{"type": "quiz_streak", "count": 10}', 300, 750),
('Maratón de Aprendizaje', 'Completa 3 lecciones en un día', '/images/achievement2.png', 'aprendizaje', '{"type": "daily_lessons", "count": 3}', 150, 400),
('Explorador Financiero', 'Completa una habilidad completa', '/images/achievement1.png', 'aprendizaje', '{"type": "skill_completed"}', 500, 1000);

-- =====================================================
-- CREAR VISTAS ÚTILES PARA EL FRONTEND
-- =====================================================

-- Vista del dashboard de aprendizaje del usuario
CREATE OR REPLACE VIEW user_learning_dashboard AS
SELECT 
    u.id as user_id,
    u.fullname,
    u.coins,
    u.current_streak,
    u.levels_completed,
    u.total_xp,
    COALESCE(AVG(up.progress_percentage), 0) as overall_progress,
    COUNT(DISTINCT ua.achievement_id) as total_achievements,
    COUNT(DISTINCT CASE WHEN ulp.status = 'completed' THEN ulp.lesson_id END) as completed_lessons
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
LEFT JOIN user_achievements ua ON u.id = ua.user_id
LEFT JOIN user_lesson_progress ulp ON u.id = ulp.user_id
WHERE u.is_active = TRUE
GROUP BY u.id;

-- Vista del progreso detallado por habilidad
CREATE OR REPLACE VIEW user_skill_detailed_progress AS
SELECT 
    up.user_id,
    up.skill_id,
    ls.unit_id,
    ls.title as skill_title,
    up.progress_percentage,
    up.completed_at,
    COUNT(ll.id) as total_lessons,
    COUNT(CASE WHEN ulp.status = 'completed' THEN 1 END) as completed_lessons,
    COUNT(CASE WHEN ulp.status = 'in_progress' THEN 1 END) as in_progress_lessons
FROM user_progress up
JOIN learn_skills ls ON up.skill_id = ls.id
JOIN learn_lessons ll ON ls.id = ll.skill_id AND ll.is_active = TRUE
LEFT JOIN user_lesson_progress ulp ON up.user_id = ulp.user_id AND ll.id = ulp.lesson_id
GROUP BY up.user_id, up.skill_id;

-- Vista para obtener el siguiente paso de una lección
CREATE OR REPLACE VIEW lesson_next_step AS
SELECT 
    ls.lesson_id,
    ls.id as step_id,
    ls.step_number,
    ls.type,
    ls.title,
    ls.content,
    ls.image_url,
    ls.video_url,
    ls.question,
    ls.statement,
    ls.options,
    ls.is_last_step,
    ll.title as lesson_title,
    ll.coins_reward,
    ll.xp_reward
FROM learn_steps ls
JOIN learn_lessons ll ON ls.lesson_id = ll.id
WHERE ll.is_active = TRUE
ORDER BY ls.lesson_id, ls.sort_order;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices compuestos para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_user_lesson_composite ON user_lesson_progress(user_id, status, last_accessed);
CREATE INDEX IF NOT EXISTS idx_steps_lesson_order ON learn_steps(lesson_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_lessons_skill_order ON learn_lessons(skill_id, sort_order);

-- =====================================================
-- FINALIZACIÓN DE LA MIGRACIÓN
-- =====================================================

-- Mensaje de confirmación
SELECT 'MIGRACIÓN COMPLETADA: Sistema de aprendizaje agregado exitosamente' AS status;

-- Mostrar resumen de tablas creadas
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'finko' 
AND TABLE_NAME IN ('learn_lessons', 'learn_steps', 'user_lesson_progress', 'user_quiz_attempts')
ORDER BY TABLE_NAME;

/*
=====================================================
RESUMEN DE CAMBIOS APLICADOS:

✅ TABLAS AGREGADAS:
- learn_lessons: Lecciones/niveles dentro de habilidades
- learn_steps: Pasos individuales de cada lección
- user_lesson_progress: Progreso detallado por lección
- user_quiz_attempts: Intentos de quiz (si no existía)

✅ MODIFICACIONES:
- user_progress: Agregados campos current_lesson_id y current_step_id
- Agregadas foreign keys para mantener integridad

✅ FUNCIONALIDADES AGREGADAS:
- Trigger para actualizar progreso automáticamente
- Vistas optimizadas para el frontend
- Datos de ejemplo con 2 habilidades completas
- Logros adicionales del sistema de aprendizaje

✅ COMPATIBILIDAD:
- Funciona con tu estructura de base de datos existente
- Compatible con todas tus vistas Vue actuales
- Mantiene datos existentes intactos

PUEDES EJECUTAR ESTE SCRIPT SOBRE TU BASE DE DATOS ACTUAL
=====================================================
*/ 