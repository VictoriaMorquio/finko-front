<template>
  <div class="level-complete-page" v-if="completionData">
    <header class="completion-header">
      <router-link :to="{name: 'LearnDashboard'}" class="close-btn" aria-label="Cerrar">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </router-link>
      <h1>{{ completionData.pageTitle || 'Nivel Completado' }}</h1>
    </header>

    <main class="completion-main">
      <div class="completion-card">
        <!-- Imagen de celebración -->
        <div class="celebration-container">
          <div class="celebration-glow"></div>
          <img :src="completionData.headerImage || '/images/level-completed/celebration.png'" 
               alt="¡Nivel completado!" 
               class="celebration-image">
        </div>

        <!-- Contenido principal -->
        <div class="completion-content">
          <h2 class="congrats-title">{{ completionData.congratsTitle }}</h2>
          <h3 class="level-name">{{ completionData.levelName }}</h3>
          <p class="level-description">{{ completionData.description }}</p>

          <!-- Recompensas con diseño mejorado -->
          <div class="rewards-section" v-if="completionData.rewards">
            <div class="rewards-card">
              <div class="coin-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#FFD700"/>
                  <circle cx="12" cy="12" r="7" fill="#FFA500"/>
                  <text x="12" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#8B4513">$</text>
                </svg>
              </div>
              <span class="rewards-text">{{ completionData.rewards.text }}</span>
            </div>
          </div>
        </div>

        <!-- Botón de continuar -->
        <div class="action-section">
          <BaseButton 
            variant="primary" 
            size="large"
            @click="continueLearning" 
            full-width
            class="btn-continuar-modern"
          >
            Continuar
          </BaseButton>
        </div>
      </div>
    </main>
  </div>
  <div v-else-if="learnStore.loading" class="loading-message">
    <div class="loading-spinner"></div>
    <p>Cargando...</p>
  </div>
  <div v-else-if="learnStore.error" class="error-message-centered">{{ learnStore.error }}</div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLearnStore } from '@/stores/learn';
import { useAuthStore } from '@/stores/auth'; // Para actualizar monedas del usuario
import BaseButton from '@/components/common/BaseButton.vue';

const route = useRoute();
const router = useRouter();
const learnStore = useLearnStore();
const authStore = useAuthStore();
const levelId = route.params.levelId;

onMounted(() => {
  console.log('🔴 DEBUG - LevelCompletedView onMounted called with levelId:', levelId);
  learnStore.fetchLevelCompletedData(levelId);
});

const completionData = computed(() => {
  console.log('🔍 DEBUG - completionData:', learnStore.currentLesson);
  console.log('🔍 DEBUG - headerImage:', learnStore.currentLesson?.headerImage);
  return learnStore.currentLesson;
}); // Reutilizamos currentLesson

const continueLearning = async () => {
  // Actualizar monedas del usuario (UI Optimista) - Solo si hay datos válidos
  if (authStore.currentUser && completionData.value?.rewards?.coins) {
      try {
        const currentUserData = JSON.parse(JSON.stringify(authStore.currentUser));
        currentUserData.stats.coins += completionData.value.rewards.coins;
        currentUserData.stats.levelsCompleted += 1;
        
        // Actualizar el store local inmediatamente (UI optimista)
        authStore.user = currentUserData;
        localStorage.setItem('finkoUser', JSON.stringify(currentUserData));
        
        // También actualizar desde el servidor en background para mantener sincronización
        try {
          await authStore.refreshUserData();
        } catch (err) {
          console.warn('⚠️ Error actualizando datos de usuario desde servidor, usando datos locales');
        }
      } catch (err) {
        console.warn('⚠️ Error actualizando monedas de usuario:', err);
      }
  } else {
    console.log('⚠️ No se pudo actualizar monedas: datos de usuario o recompensas no disponibles');
  }

  // 🔒 VERIFICACIÓN ESTRICTA: Solo actualizar si la lección está REALMENTE completada
  try {
    console.log('🔍 Verificando completación real de la lección:', levelId);
    
    // Obtener el skillId de la lección actual
    const skillId = getSkillIdFromLevelId(levelId);
    
    // Refrescar los datos de las lecciones desde el servidor para verificar estado real
    await learnStore.fetchSkillLessons(skillId);
    
    console.log('✅ Datos de lecciones actualizados tras completación');
    
    // Navegar de vuelta a la lista de lecciones de la skill para mostrar progreso actualizado
    router.push({ 
      name: 'SkillLessons', 
      params: { skillId: skillId },
      query: { refreshed: 'true' } // Indicar que se acaba de completar una lección
    });
    
  } catch (error) {
    console.error('❌ Error actualizando datos tras completación:', error);
    // Fallback: navegar al dashboard si hay error
    router.push({ name: 'LearnDashboard' });
  }
};

// Función para extraer skillId desde levelId
const getSkillIdFromLevelId = (levelId) => {
  // Patrones: "u1s1l1" -> "u1s1" | "skill1-1" -> "skill1"
  if (levelId) {
    if (levelId.startsWith('skill') && levelId.includes('-')) {
      return levelId.split('-')[0];
    }
    if (levelId.includes('l')) {
      return levelId.split('l')[0]; // "u1s1l1" -> "u1s1"
    }
    if (levelId.match(/^u\d+s\d+$/)) {
      return levelId; // Ya es skillId
    }
  }
  return 'u1s1'; // Fallback
};
</script>

<style scoped>
.level-complete-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #FFB74D 0%, #FF8A65 30%, #FF007F 70%, #F06292 100%);
  padding: 0;
}

.completion-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.completion-header .close-btn {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #495057;
  text-decoration: none;
  padding: 8px;
  border-radius: 50%;
  transition: background-color 0.3s ease, color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.completion-header .close-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: #000000;
}

.completion-header h1 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.completion-main {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.completion-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  padding: 40px 30px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.completion-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #FFB74D, #FF8A65, #FF007F);
}

.celebration-container {
  position: relative;
  margin-bottom: 30px;
  display: flex;
  justify-content: center;
}

.celebration-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120%;
  height: 120%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 0, 127, 0.2) 0%, rgba(255, 0, 127, 0.05) 50%, transparent 70%);
  pointer-events: none;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
  to {
    transform: translate(-50%, -50%) scale(1.1);
    opacity: 0.8;
  }
}

.celebration-image {
  max-width: 180px;
  width: 100%;
  height: auto;
  border-radius: 16px;
  position: relative;
  z-index: 1;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.completion-content {
  margin-bottom: 30px;
}

.congrats-title {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #FF007F, #FF8A80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.level-name {
  font-size: 22px;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 24px;
  line-height: 1.3;
}

.level-description {
  font-size: 16px;
  color: #718096;
  margin-bottom: 0;
  line-height: 1.6;
  max-width: 350px;
  margin-left: auto;
  margin-right: auto;
}

.rewards-section {
  margin-bottom: 30px;
}

.rewards-card {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(135deg, #FFF5E6 0%, #FFE4B5 100%);
  padding: 16px 24px;
  border-radius: 16px;
  border: 2px solid #FFD700;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.rewards-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
}

.coin-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rewards-text {
  font-size: 16px;
  color: #8B4513;
  font-weight: 600;
}

.action-section {
  text-align: center;
}

.btn-continuar-modern {
  width: 100% !important;
  padding: 16px 24px !important;
  border: none !important;
  border-radius: 16px !important;
  font-size: 18px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: all 0.3s ease !important;
  background: linear-gradient(135deg, #FF007F 0%, #e91e63 100%) !important;
  color: white !important;
  box-shadow: 0 6px 20px rgba(255, 0, 127, 0.4) !important;
  text-transform: none !important;
}

.btn-continuar-modern:hover:not(:disabled) {
  background: linear-gradient(135deg, #e91e63 0%, #c2185b 100%) !important;
  transform: translateY(-2px) !important;
  box-shadow: 0 8px 25px rgba(255, 0, 127, 0.5) !important;
}

.btn-continuar-modern:active {
  transform: translateY(0) !important;
}

.btn-continuar-modern:disabled {
  opacity: 0.6 !important;
  cursor: not-allowed !important;
  transform: none !important;
}

.loading-message {
  text-align: center;
  padding: 40px 20px;
  font-size: 16px;
  color: #fff;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message-centered {
  color: #fff;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
}

/* Responsive design */
@media (max-width: 480px) {
  .completion-main {
    padding: 15px;
  }
  
  .completion-card {
    padding: 30px 20px;
    border-radius: 20px;
  }
  
  .completion-header h1 { 
    font-size: 18px; 
  }
  
  .congrats-title { 
    font-size: 28px; 
  }
  
  .level-name { 
    font-size: 20px; 
  }
  
  .level-description { 
    font-size: 15px; 
  }
  
  .rewards-text { 
    font-size: 15px; 
  }
  
  .celebration-image {
    max-width: 150px;
  }
}

@media (max-width: 360px) {
  .completion-card {
    margin: 10px;
    padding: 25px 15px;
  }
  
  .congrats-title { 
    font-size: 26px; 
  }
  
  .level-name { 
    font-size: 18px; 
  }
}
</style> 