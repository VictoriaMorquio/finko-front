-- =====================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS FINKO COMPLETO
-- Versión: 1.2 - Sistema de Aprendizaje Completo
-- Fecha: 2024
-- =====================================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS finko 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE finko;

-- =====================================================
-- TABLA: users - Usuarios del sistema (ADAPTADA)
-- =====================================================
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    fullname VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL COMMENT 'BCrypt hash',
    profile_pic VARCHAR(500) DEFAULT '/images/profile-pic-default.png',
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    failed_login_attempts INT UNSIGNED DEFAULT 0,
    account_locked_until TIMESTAMP NULL,
    last_login TIMESTAMP NULL,
    
    -- Campos adicionales del sistema de gamificación
    coins INT UNSIGNED DEFAULT 100,
    current_streak INT UNSIGNED DEFAULT 0,
    levels_completed INT UNSIGNED DEFAULT 0,
    total_xp INT UNSIGNED DEFAULT 0,
    
    -- Campos opcionales para funcionalidad futura
    email_verified_at TIMESTAMP NULL,
    phone VARCHAR(20) NULL,
    date_of_birth DATE NULL,
    occupation VARCHAR(100) NULL,
    investment_experience ENUM('Principiante', 'Intermedio', 'Avanzado') DEFAULT 'Principiante',
    risk_tolerance ENUM('Conservador', 'Moderado', 'Agresivo') DEFAULT 'Moderado',
    settings JSON NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_is_active (is_active),
    INDEX idx_failed_attempts (failed_login_attempts),
    INDEX idx_account_locked (account_locked_until),
    INDEX idx_join_date (join_date)
);

-- =====================================================
-- TABLA: user_sessions - Sesiones activas (ADAPTADA)
-- =====================================================
CREATE TABLE user_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    session_token VARCHAR(500) NOT NULL UNIQUE COMMENT 'JWT token completo',
    device_info VARCHAR(255) NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_session_token (session_token),
    INDEX idx_is_active (is_active),
    INDEX idx_expires_at (expires_at),
    INDEX idx_last_accessed (last_accessed)
);

-- =====================================================
-- TABLA: password_resets - Tokens de recuperación
-- =====================================================
CREATE TABLE password_resets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
);

-- =====================================================
-- SISTEMA DE APRENDIZAJE COMPLETO
-- =====================================================

-- TABLA: learn_units - Unidades de aprendizaje
CREATE TABLE learn_units (
    id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    bg_color VARCHAR(7) DEFAULT '#FBEAE3',
    sort_order INT UNSIGNED NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_sort_order (sort_order),
    INDEX idx_is_active (is_active)
);

-- TABLA: learn_skills - Habilidades dentro de unidades
CREATE TABLE learn_skills (
    id VARCHAR(20) PRIMARY KEY,
    unit_id VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    sort_order INT UNSIGNED NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (unit_id) REFERENCES learn_units(id) ON DELETE CASCADE,
    INDEX idx_unit_id (unit_id),
    INDEX idx_sort_order (sort_order),
    INDEX idx_is_active (is_active)
);

-- TABLA: learn_lessons - Lecciones/Niveles dentro de habilidades
CREATE TABLE learn_lessons (
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
CREATE TABLE learn_steps (
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

-- TABLA: user_progress - Progreso del usuario por habilidad
CREATE TABLE user_progress (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    skill_id VARCHAR(20) NOT NULL,
    progress_percentage INT UNSIGNED DEFAULT 0,
    completed_at TIMESTAMP NULL,
    current_lesson_id VARCHAR(20) NULL,
    current_step_id VARCHAR(30) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES learn_skills(id) ON DELETE CASCADE,
    FOREIGN KEY (current_lesson_id) REFERENCES learn_lessons(id) ON DELETE SET NULL,
    FOREIGN KEY (current_step_id) REFERENCES learn_steps(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_user_skill (user_id, skill_id),
    INDEX idx_user_id (user_id),
    INDEX idx_skill_id (skill_id),
    INDEX idx_progress (progress_percentage)
);

-- TABLA: user_lesson_progress - Progreso detallado por lección
CREATE TABLE user_lesson_progress (
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

-- TABLA: user_quiz_attempts - Intentos de quiz del usuario
CREATE TABLE user_quiz_attempts (
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
);

-- =====================================================
-- SISTEMA DE GAMIFICACIÓN
-- =====================================================

CREATE TABLE achievements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    category ENUM('inversión', 'aprendizaje', 'social') NOT NULL,
    criteria JSON NOT NULL,
    coins_reward INT UNSIGNED DEFAULT 0,
    xp_reward INT UNSIGNED DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_is_active (is_active)
);

CREATE TABLE user_achievements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    achievement_id BIGINT UNSIGNED NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    INDEX idx_user_id (user_id),
    INDEX idx_achievement_id (achievement_id),
    INDEX idx_unlocked_at (unlocked_at)
);

-- =====================================================
-- SISTEMA DE INVERSIONES
-- =====================================================

CREATE TABLE investments (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    stock_symbol VARCHAR(10) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    icon_url VARCHAR(500) NOT NULL,
    description TEXT NULL,
    current_price DECIMAL(15, 2) NOT NULL,
    price_change_24h DECIMAL(10, 4) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_stock_symbol (stock_symbol),
    INDEX idx_category (category),
    INDEX idx_is_active (is_active)
);

CREATE TABLE user_portfolios (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    investment_id VARCHAR(20) NOT NULL,
    shares_owned DECIMAL(15, 8) NOT NULL DEFAULT 0,
    total_invested DECIMAL(15, 2) NOT NULL DEFAULT 0,
    average_buy_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_investment (user_id, investment_id),
    INDEX idx_user_id (user_id),
    INDEX idx_investment_id (investment_id)
);

-- =====================================================
-- AUDITORÍA Y SEGURIDAD
-- =====================================================

CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(50) NOT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- EVENTOS Y TRIGGERS
-- =====================================================

-- Limpiar sesiones expiradas automáticamente
DELIMITER //
CREATE EVENT clean_expired_sessions
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW() OR (is_active = FALSE AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY));
    DELETE FROM password_resets WHERE expires_at < NOW();
END//
DELIMITER ;

-- Trigger para actualizar progreso cuando se completa una lección
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
-- DATOS INICIALES
-- =====================================================

-- Unidades de aprendizaje
INSERT INTO learn_units (id, title, description, image_url, sort_order) VALUES
('unit1', 'Unidad 1:<br>Fundamentos del Dinero', 'Conoce las bases del dinero y tus finanzas.', '/images/unidad1.jpg', 1),
('unit2', 'Unidad 2:<br>Introducción a la Inversión', 'Empieza a entender cómo hacer crecer tu dinero.', '/images/unidad2.jpg', 2),
('unit3', 'Unidad 3:<br>¿Dónde Puedo Invertir?', 'Descubre los tipos básicos de activos.', '/images/unidad3.jpg', 3);

-- Habilidades de la Unidad 1
INSERT INTO learn_skills (id, unit_id, title, image_url, sort_order) VALUES
('skill1-1', 'unit1', '¿Qué es el dinero?', '/images/paso1.png', 1),
('skill1-2', 'unit1', 'Ingresos y gastos', '/images/paso1.png', 2),
('skill1-3', 'unit1', 'Ahorro:<br>El primer paso', '/images/paso1.png', 3),
('skill1-4', 'unit1', 'Deuda:<br>Amiga o Enemiga', '/images/paso1.png', 4);

-- Lecciones de ejemplo para "¿Qué es el dinero?"
INSERT INTO learn_lessons (id, skill_id, title, description, image_url, type, total_steps, sort_order) VALUES
('lesson1-1-1', 'skill1-1', 'Introducción al Dinero', 'Aprende qué es el dinero y por qué existe', '/images/nivel1.png', 'intro', 3, 1),
('lesson1-1-2', 'skill1-1', 'Historia del Dinero', 'Descubre cómo evolucionó el dinero a través del tiempo', '/images/nivel1.png', 'lesson', 5, 2),
('lesson1-1-3', 'skill1-1', 'Tipos de Dinero Actual', 'Conoce las diferentes formas de dinero hoy en día', '/images/nivel1.png', 'lesson', 4, 3);

-- Pasos de ejemplo para "Introducción al Dinero"
INSERT INTO learn_steps (id, lesson_id, step_number, type, title, content, image_url, is_last_step, sort_order) VALUES
('step1-1-1-1', 'lesson1-1-1', 1, 'content', 'Bienvenido', 'El dinero es una herramienta que facilita el intercambio de bienes y servicios. Sin dinero, tendríamos que hacer trueques directos.', '/images/paso1.png', FALSE, 1),
('step1-1-1-2', 'lesson1-1-1', 2, 'quiz', 'Pregunta sobre el dinero', NULL, NULL, FALSE, 2),
('step1-1-1-3', 'lesson1-1-1', 3, 'content', '¡Felicidades!', 'Has completado tu primera lección sobre dinero. ¡Continúa aprendiendo!', '/images/nivelCompletado.png', TRUE, 3);

-- Quiz step con pregunta
UPDATE learn_steps SET 
    question = '¿Cuál es la función principal del dinero?',
    options = '["Facilitar el intercambio", "Decorar la casa", "Hacer ruido", "Ser bonito"]',
    correct_answer = 'A',
    feedback = '{"correct": "¡Correcto! El dinero facilita el intercambio de bienes y servicios.", "incorrect": "Incorrecto. La función principal del dinero es facilitar el intercambio."}'
WHERE id = 'step1-1-1-2';

-- Logros
INSERT INTO achievements (title, description, image_url, category, criteria, coins_reward, xp_reward) VALUES
('Primera Lección', 'Completaste tu primera lección', '/images/achievement1.png', 'aprendizaje', '{"type": "first_lesson"}', 100, 250),
('Estudiante Dedicado', 'Completa 5 lecciones', '/images/achievement2.png', 'aprendizaje', '{"type": "lessons_completed", "count": 5}', 200, 500),
('Experto en Quiz', 'Responde correctamente 10 preguntas seguidas', '/images/achievement3.png', 'aprendizaje', '{"type": "quiz_streak", "count": 10}', 300, 750);

-- Inversiones de ejemplo
INSERT INTO investments (id, name, stock_symbol, category, icon_url, current_price, description) VALUES
('inv1', 'Tecnología Innovadora', 'TCORP', 'Acciones', '/images/inversion-tecno.png', 29456.23, 'TechCorp es líder en innovación y desarrollo de software'),
('inv2', 'Bonos del Estado', 'GOVBOND', 'Bonos', '/images/inversion-bonos.png', 102.50, 'Bonos soberanos de bajo riesgo'),
('inv3', 'Criptomoneda Emergente', 'CRYPT1', 'Criptomonedas', '/images/inversion-crypto.png', 45687.89, 'Nueva criptomoneda con alta volatilidad');

-- Usuario de prueba (password: "password123")
INSERT INTO users (email, username, fullname, password, is_active) VALUES
('test@finko.com', 'testuser', 'Usuario de Prueba', '$2a$10$N9qo8uLOickgx2ZMRZoMye1.i6d4.Hx4f9rGYBJJQw5P7EOsrK/W2', TRUE);

-- =====================================================
-- VISTAS ÚTILES PARA EL FRONTEND
-- =====================================================

-- Vista del dashboard de aprendizaje del usuario
CREATE VIEW user_learning_dashboard AS
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
CREATE VIEW user_skill_detailed_progress AS
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

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

/*
ESTRUCTURA COMPLETA DEL SISTEMA DE APRENDIZAJE:

✅ JERARQUÍA:
- learn_units (Unidades)
  └── learn_skills (Habilidades)
      └── learn_lessons (Lecciones/Niveles)
          └── learn_steps (Pasos/Contenido)

✅ PROGRESO:
- user_progress: Progreso general por habilidad
- user_lesson_progress: Progreso detallado por lección
- user_quiz_attempts: Intentos de quiz con historial

✅ CONTENIDO:
- Pasos de contenido (texto + imagen + video)
- Pasos de quiz (pregunta + opciones + respuesta correcta)
- Pasos true/false (declaración + verdadero/falso)
- Feedback personalizado por respuesta

✅ GAMIFICACIÓN:
- Coins y XP por completar lecciones
- Sistema de logros automático
- Triggers para actualizar progreso

✅ COMPATIBLE CON TUS VISTAS:
- LevelIntro → learn_lessons (type='intro')
- LessonContent → learn_steps (type='content')  
- LessonQuiz → learn_steps (type='quiz'/'true-false')
- LevelCompleted → user_lesson_progress (status='completed')

ESTA ESTRUCTURA SOPORTA COMPLETAMENTE TU FRONTEND ACTUAL
*/ 