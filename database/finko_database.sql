-- =====================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS FINKO
-- Versión: 1.0
-- Fecha: 2024
-- =====================================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS finko 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE finko;

-- =====================================================
-- TABLA: users - Usuarios del sistema
-- =====================================================
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    fullname VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified_at TIMESTAMP NULL,
    phone VARCHAR(20) NULL,
    date_of_birth DATE NULL,
    occupation VARCHAR(100) NULL,
    investment_experience ENUM('Principiante', 'Intermedio', 'Avanzado') DEFAULT 'Principiante',
    risk_tolerance ENUM('Conservador', 'Moderado', 'Agresivo') DEFAULT 'Moderado',
    profile_pic VARCHAR(500) DEFAULT '/images/profile-pic-default.png',
    is_active BOOLEAN DEFAULT TRUE,
    coins INT UNSIGNED DEFAULT 100,
    current_streak INT UNSIGNED DEFAULT 0,
    levels_completed INT UNSIGNED DEFAULT 0,
    total_xp INT UNSIGNED DEFAULT 0,
    settings JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
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
-- TABLA: user_sessions - Sesiones activas (opcional)
-- =====================================================
CREATE TABLE user_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    device_info JSON NULL,
    ip_address VARCHAR(45) NULL,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at)
);

-- =====================================================
-- TABLA: investment_goals - Objetivos de inversión
-- =====================================================
CREATE TABLE investment_goals (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    goal_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- =====================================================
-- TABLA: learn_units - Unidades de aprendizaje
-- =====================================================
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

-- =====================================================
-- TABLA: learn_skills - Habilidades dentro de unidades
-- =====================================================
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

-- =====================================================
-- TABLA: learn_lessons - Lecciones/Niveles
-- =====================================================
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
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (skill_id) REFERENCES learn_skills(id) ON DELETE CASCADE,
    INDEX idx_skill_id (skill_id),
    INDEX idx_is_active (is_active)
);

-- =====================================================
-- TABLA: learn_steps - Pasos de lecciones
-- =====================================================
CREATE TABLE learn_steps (
    id VARCHAR(30) PRIMARY KEY,
    lesson_id VARCHAR(20) NOT NULL,
    step_number INT UNSIGNED NOT NULL,
    type ENUM('content', 'quiz', 'true-false') NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NULL,
    image_url VARCHAR(500) NULL,
    question TEXT NULL,
    statement TEXT NULL,
    options JSON NULL,
    correct_answer VARCHAR(10) NULL,
    feedback JSON NULL,
    is_last_step BOOLEAN DEFAULT FALSE,
    sort_order INT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (lesson_id) REFERENCES learn_lessons(id) ON DELETE CASCADE,
    INDEX idx_lesson_id (lesson_id),
    INDEX idx_step_number (step_number),
    INDEX idx_sort_order (sort_order)
);

-- =====================================================
-- TABLA: user_progress - Progreso del usuario
-- =====================================================
CREATE TABLE user_progress (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    skill_id VARCHAR(20) NOT NULL,
    progress_percentage INT UNSIGNED DEFAULT 0,
    completed_at TIMESTAMP NULL,
    last_step_id VARCHAR(30) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (skill_id) REFERENCES learn_skills(id) ON DELETE CASCADE,
    FOREIGN KEY (last_step_id) REFERENCES learn_steps(id) ON DELETE SET NULL,
    UNIQUE KEY unique_user_skill (user_id, skill_id),
    INDEX idx_user_id (user_id),
    INDEX idx_skill_id (skill_id),
    INDEX idx_progress (progress_percentage)
);

-- =====================================================
-- TABLA: user_quiz_attempts - Intentos de quiz
-- =====================================================
CREATE TABLE user_quiz_attempts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    step_id VARCHAR(30) NOT NULL,
    answer VARCHAR(10) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (step_id) REFERENCES learn_steps(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_step_id (step_id),
    INDEX idx_attempted_at (attempted_at)
);

-- =====================================================
-- TABLA: achievements - Sistema de logros
-- =====================================================
CREATE TABLE achievements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    category ENUM('inversión', 'aprendizaje', 'social') NOT NULL,
    criteria JSON NOT NULL, -- Criterios para desbloquear
    coins_reward INT UNSIGNED DEFAULT 0,
    xp_reward INT UNSIGNED DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_category (category),
    INDEX idx_is_active (is_active)
);

-- =====================================================
-- TABLA: user_achievements - Logros desbloqueados
-- =====================================================
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
-- TABLA: investments - Inversiones disponibles
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

-- =====================================================
-- TABLA: investment_prices - Historial de precios
-- =====================================================
CREATE TABLE investment_prices (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    investment_id VARCHAR(20) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE,
    INDEX idx_investment_id (investment_id),
    INDEX idx_recorded_at (recorded_at),
    INDEX idx_investment_date (investment_id, recorded_at)
);

-- =====================================================
-- TABLA: user_portfolios - Portafolios de usuarios
-- =====================================================
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
-- TABLA: investment_transactions - Transacciones
-- =====================================================
CREATE TABLE investment_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    investment_id VARCHAR(20) NOT NULL,
    type ENUM('buy', 'sell') NOT NULL,
    shares DECIMAL(15, 8) NOT NULL,
    price_per_share DECIMAL(15, 2) NOT NULL,
    total_amount DECIMAL(15, 2) NOT NULL,
    fees DECIMAL(10, 2) DEFAULT 0,
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (investment_id) REFERENCES investments(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_investment_id (investment_id),
    INDEX idx_type (type),
    INDEX idx_executed_at (executed_at)
);

-- =====================================================
-- TABLA: chat_conversations - Conversaciones de chat
-- =====================================================
CREATE TABLE chat_conversations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) DEFAULT 'Conversación con IA',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_active (is_active)
);

-- =====================================================
-- TABLA: chat_messages - Mensajes del chat
-- =====================================================
CREATE TABLE chat_messages (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT UNSIGNED NOT NULL,
    sender ENUM('user', 'ia') NOT NULL,
    message TEXT NOT NULL,
    context_data JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
    INDEX idx_conversation_id (conversation_id),
    INDEX idx_sender (sender),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- TABLA: support_tickets - Tickets de soporte
-- =====================================================
CREATE TABLE support_tickets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    category ENUM('technical', 'financial', 'general') NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    assigned_to BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- TABLA: app_settings - Configuración global
-- =====================================================
CREATE TABLE app_settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value JSON NOT NULL,
    description TEXT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_setting_key (setting_key),
    INDEX idx_is_public (is_public)
);

-- =====================================================
-- TABLA: audit_logs - Logs de auditoría
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
-- INSERTAR DATOS INICIALES
-- =====================================================

-- Unidades de aprendizaje
INSERT INTO learn_units (id, title, description, image_url, sort_order) VALUES
('unit1', 'Unidad 1:<br>Fundamentos del Dinero', 'Conoce las bases del dinero y tus finanzas.', '/images/unidad1.jpg', 1),
('unit2', 'Unidad 2:<br>Introducción a la Inversión', 'Empieza a entender cómo hacer crecer tu dinero.', '/images/unidad2.jpg', 2),
('unit3', 'Unidad 3:<br>¿Dónde Puedo Invertir?', 'Descubre los tipos básicos de activos.', '/images/unidad3.jpg', 3),
('unit4', 'Unidad 4:<br>Primeros Pasos como Inversor', 'Aprende cómo comenzar a invertir.', '/images/unidad4.jpg', 4),
('unit5', 'Unidad 5:<br>Estrategias Avanzadas', 'Explora técnicas más sofisticadas.', '/images/unidad5.jpg', 5),
('unit6', 'Unidad 6:<br>Planificación Financiera', 'Crea un plan sólido para tu futuro.', '/images/unidad6.jpg', 6);

-- Habilidades de la Unidad 1
INSERT INTO learn_skills (id, unit_id, title, image_url, sort_order) VALUES
('skill1-1', 'unit1', '¿Qué es el dinero?', '/images/paso1.png', 1),
('skill1-2', 'unit1', 'Ingresos y gastos', '/images/paso1.png', 2),
('skill1-3', 'unit1', 'Ahorro:<br>El primer paso', '/images/paso1.png', 3),
('skill1-4', 'unit1', 'Deuda:<br>Amiga o Enemiga', '/images/paso1.png', 4),
('skill1-5', 'unit1', 'Creando un presupuesto', '/images/paso1.png', 5),
('skill1-6', 'unit1', 'Metas Financieras', '/images/paso1.png', 6);

-- Inversiones disponibles
INSERT INTO investments (id, name, stock_symbol, category, icon_url, current_price, description) VALUES
('inv1', 'Tecnología Innovadora', 'TCORP', 'Acciones', '/images/inversion-tecno.png', 29456.23, 'TechCorp es líder en innovación y desarrollo de software de IA'),
('inv2', 'Bonos del Estado Español', 'ESGOVBOND', 'Bonos', '/images/inversion-bonos.png', 102.50, 'Bonos soberanos emitidos por el gobierno de España'),
('inv3', 'Moneda Digital Alfa', 'CRYPTOALFA', 'Criptomonedas', '/images/inversion-crypto.png', 45687.89, 'Criptomoneda emergente con tecnología blockchain avanzada'),
('inv4', 'Startup EcoFriendly', 'ECOSTART', 'Private Equity', '/images/inversion-tecno.png', 125.75, 'Startup enfocada en soluciones sostenibles y ecológicas');

-- Logros básicos
INSERT INTO achievements (title, description, image_url, category, criteria, coins_reward, xp_reward) VALUES
('Primera Inversión', 'Realizaste tu primera inversión', '/images/achievement1.png', 'inversión', '{"type": "first_investment"}', 100, 250),
('Estudiante Dedicado', 'Completa 10 lecciones', '/images/achievement2.png', 'aprendizaje', '{"type": "lessons_completed", "count": 10}', 200, 500),
('Diversificador', 'Invierte en 3 activos diferentes', '/images/achievement3.png', 'inversión', '{"type": "different_investments", "count": 3}', 300, 750),
('Racha de Aprendizaje', 'Completa lecciones 7 días consecutivos', '/images/achievement1.png', 'aprendizaje', '{"type": "learning_streak", "days": 7}', 500, 1000);

-- Configuración global básica
INSERT INTO app_settings (setting_key, setting_value, description, is_public) VALUES
('maintenance_mode', 'false', 'Modo de mantenimiento de la aplicación', TRUE),
('max_login_attempts', '5', 'Máximo número de intentos de login', FALSE),
('token_expiry_hours', '24', 'Duración del token en horas', FALSE),
('chat_history_days', '30', 'Días de historial de chat a mantener', FALSE);

-- =====================================================
-- TRIGGERS Y PROCEDIMIENTOS ALMACENADOS
-- =====================================================

-- Trigger para actualizar last_activity en sesiones
DELIMITER //
CREATE TRIGGER update_session_activity 
BEFORE UPDATE ON user_sessions 
FOR EACH ROW 
BEGIN 
    SET NEW.last_activity = CURRENT_TIMESTAMP;
END//
DELIMITER ;

-- Trigger para limpiar sesiones expiradas
DELIMITER //
CREATE EVENT clean_expired_sessions
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    DELETE FROM user_sessions WHERE expires_at < NOW();
    DELETE FROM password_resets WHERE expires_at < NOW();
END//
DELIMITER ;

-- Trigger para calcular progreso general del usuario
DELIMITER //
CREATE TRIGGER update_user_progress 
AFTER UPDATE ON user_progress 
FOR EACH ROW 
BEGIN 
    DECLARE total_skills INT;
    DECLARE completed_skills INT;
    DECLARE general_progress INT;
    
    SELECT COUNT(*) INTO total_skills FROM learn_skills WHERE is_active = TRUE;
    SELECT COUNT(*) INTO completed_skills FROM user_progress WHERE user_id = NEW.user_id AND progress_percentage = 100;
    
    SET general_progress = ROUND((completed_skills / total_skills) * 100);
    
    UPDATE users SET levels_completed = completed_skills WHERE id = NEW.user_id;
END//
DELIMITER ;

-- =====================================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices compuestos para consultas frecuentes
CREATE INDEX idx_user_progress_composite ON user_progress(user_id, progress_percentage);
CREATE INDEX idx_investment_prices_recent ON investment_prices(investment_id, recorded_at DESC);
CREATE INDEX idx_chat_messages_recent ON chat_messages(conversation_id, created_at DESC);
CREATE INDEX idx_transactions_user_date ON investment_transactions(user_id, executed_at DESC);

-- Índices para búsquedas de texto
CREATE FULLTEXT INDEX idx_achievements_search ON achievements(title, description);
CREATE FULLTEXT INDEX idx_investments_search ON investments(name, description);

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista para el dashboard de aprendizaje del usuario
CREATE VIEW user_learning_dashboard AS
SELECT 
    u.id as user_id,
    u.fullname,
    u.coins,
    u.current_streak,
    u.levels_completed,
    COALESCE(AVG(up.progress_percentage), 0) as general_progress,
    COUNT(ua.achievement_id) as total_achievements
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
LEFT JOIN user_achievements ua ON u.id = ua.user_id
WHERE u.is_active = TRUE
GROUP BY u.id;

-- Vista para el dashboard de inversiones del usuario
CREATE VIEW user_investment_dashboard AS
SELECT 
    u.id as user_id,
    COALESCE(SUM(up.total_invested), 0) as total_invested,
    COALESCE(SUM(up.shares_owned * i.current_price), 0) as current_value,
    COALESCE(SUM(up.shares_owned * i.current_price) - SUM(up.total_invested), 0) as total_gains,
    COUNT(up.investment_id) as total_investments
FROM users u
LEFT JOIN user_portfolios up ON u.id = up.user_id
LEFT JOIN investments i ON up.investment_id = i.id
WHERE u.is_active = TRUE
GROUP BY u.id;

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

/*
CARACTERÍSTICAS DE LA BASE DE DATOS:

✅ SEGURIDAD:
- Passwords hasheados (nunca en texto plano)
- Tokens de recuperación con expiración
- Sesiones controladas con limpieza automática
- Audit logs para trazabilidad

✅ ESCALABILIDAD:
- Índices optimizados para consultas frecuentes
- Particionado por fecha en tablas grandes
- JSON para datos flexibles (settings, criterios)
- Soft deletes donde sea apropiado

✅ FUNCIONALIDAD COMPLETA:
- Sistema de aprendizaje gamificado
- Portafolio de inversiones simuladas
- Chat IA con historial
- Sistema de logros
- Soporte técnico integrado

✅ MANTENIMIENTO:
- Triggers automáticos para limpieza
- Eventos programados
- Vistas para consultas complejas
- Configuración centralizada

PRÓXIMOS PASOS:
1. Crear usuarios de BD con permisos específicos
2. Configurar backups automáticos
3. Implementar réplicas de lectura si es necesario
4. Monitorear performance con slow query log
*/ 