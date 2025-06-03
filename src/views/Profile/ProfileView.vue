<template>
  <div class="profile-page-container">
    <PageHeader
        title="Perfil"
        :show-settings="true"
        @right-action-clicked="navigateToSettings"
    />

    <div v-if="loading" class="loading-spinner">Cargando perfil...</div>
    <div v-else-if="error" class="error-message-fullpage">
      {{ error }}
      <br>
      <button @click="retryLoadUser" class="retry-button">Reintentar</button>
    </div>

    <template v-else-if="user">
        <section class="user-info-section">
        <div class="profile-picture-container">
            <img 
              :src="getProfilePicUrl(user.profilePic)" 
              :alt="`Foto de perfil de ${user.username}`" 
              class="profile-picture"
              @error="onImageError"
            >
        </div>
        <h2 class="username">@{{ user.username }}</h2>
        <p v-if="hasJoinDate(user)" class="join-date">Se unió en {{ formatJoinDate(user) }}</p>
        </section>

        <section class="user-stats-section">
            <StatCard 
              :value="getCoinsDisplay(user)" 
              label="Monedas" 
            />
            <StatCard 
              :value="getStreakDisplay(user)" 
              label="Racha actual" 
            />
            <StatCard 
              :value="getLevelsDisplay(user)" 
              label="Niveles completados" 
            />
        </section>

        <section class="achievements-section" v-if="user.achievements && user.achievements.length > 0">
            <h2 class="section-title-profile">Achievements</h2>
            <div class="achievements-carousel horizontal-scroll">
                <AchievementCard
                    v-for="achievement in user.achievements"
                    :key="achievement.id"
                    :title="achievement.title"
                    :image="achievement.image"
                    :bg-color="achievement.bgColor"
                />
            </div>
        </section>

        <div class="edit-profile-button-container">
            <BaseButton 
                variant="primary" 
                size="large"
                full-width
                @click="navigateToEditProfile"
            >
                Editar Perfil
            </BaseButton>
        </div>
    </template>

    <div v-else class="error-message-fullpage">
      No se pudieron cargar los datos del perfil.
      <br>
      <button @click="retryLoadUser" class="retry-button">Reintentar</button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useProfileStore } from '@/stores/profile';
import { useAuthStore } from '@/stores/auth';
import { API_CONFIG } from '@/config/api';
import PageHeader from '@/components/common/PageHeader.vue';
import StatCard from '@/components/common/StatCard.vue';
import AchievementCard from '@/components/common/AchievementCard.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const router = useRouter();
const route = useRoute();
const profileStore = useProfileStore();
const authStore = useAuthStore();

const loading = ref(false);
const error = ref(null);

const user = computed(() => {
  const userData = authStore.currentUser;
  console.log('👤 PROFILE - User data:', userData);
  console.log('🏆 PROFILE - User achievements:', userData?.achievements);
  console.log('🏆 PROFILE - Achievements type:', typeof userData?.achievements);
  console.log('🏆 PROFILE - Achievements length:', userData?.achievements?.length);
  return userData;
});

// Watch para detectar cuando se navega al perfil
watch(() => route.name, (newRouteName, oldRouteName) => {
  if (newRouteName === 'Profile' && oldRouteName && oldRouteName !== 'Profile') {
    // Solo refrescar si no venimos de EditProfile Y no se acaba de actualizar
    if (oldRouteName !== 'EditProfile' && !profileStore.wasJustUpdated) {
      refreshUserStatsQuietly();
    }
  }
});

const loadUserData = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Si acabamos de actualizar el perfil, no hacer refresh (evitar 401)
    if (profileStore.wasJustUpdated) {
      console.log('Profile was just updated, skipping refresh to avoid 401');
      console.log('Username mostrado en perfil:', authStore.currentUser?.username);
      profileStore.clearJustUpdated();
      return;
    }
    
    // Solo hacer fetchUser si realmente no tenemos datos del usuario
    // No solo por los stats, ya que pueden estar ausentes sin problemas
    if (!authStore.currentUser) {
      await authStore.fetchUser();
    } else {
      // Si ya tenemos datos, refrescar silenciosamente para obtener stats actualizadas
      try {
        await authStore.refreshUserData();
      } catch (refreshError) {
        console.warn('Could not refresh user data, using cached data:', refreshError);
        // No lanzar error, usar datos cached
      }
    }
    
  } catch (err) {
    console.error("Error loading user data:", err);
    error.value = err.message || "Error al cargar los datos del perfil";
  } finally {
    loading.value = false;
  }
};

const refreshUserStatsQuietly = async () => {
  if (!authStore.currentUser) return;
  
  try {
    await authStore.refreshUserData();
  } catch (err) {
    console.warn('Quiet refresh failed, using cached data:', err);
  }
};

const retryLoadUser = () => {
  loadUserData();
};

onMounted(async () => {
  await loadUserData();
});

const navigateToSettings = () => {
  router.push({ name: 'Settings' });
};

const navigateToEditProfile = () => {
  router.push({ name: 'EditProfile' });
};

const getProfilePicUrl = (profilePic) => {
  if (!profilePic) {
    return '/images/profile-pic-default.png';
  }
  
  // Si la URL ya es completa (empieza con http), la usamos tal como está
  if (profilePic.startsWith('http://') || profilePic.startsWith('https://')) {
    return profilePic;
  }
  
  // Si es una ruta relativa, la construimos con la URL base del backend
  if (profilePic.startsWith('/')) {
    return `${API_CONFIG.BASE_URL}${profilePic}`;
  }
  
  // Si no tiene formato reconocido, usar imagen por defecto
  return '/images/profile-pic-default.png';
};

const onImageError = (event) => {
  console.warn("Error al cargar imagen del backend, usando imagen por defecto");
  event.target.src = '/images/profile-pic-default.png';
};

const formatJoinDate = (user) => {
  // Buscar diferentes posibles campos de fecha que podría devolver el backend
  const possibleDateFields = [
    'joinDate', 
    'createdAt', 
    'created_at', 
    'registrationDate',
    'registration_date',
    'dateJoined',
    'date_joined'
  ];
  
  let dateValue = null;
  
  // Buscar el primer campo que exista
  for (const field of possibleDateFields) {
    if (user[field]) {
      dateValue = user[field];
      break;
    }
  }
  
  if (!dateValue) {
    return 'fecha no disponible';
  }
  
  try {
    // Intentar parsear la fecha
    const date = new Date(dateValue);
    
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      return dateValue; // Devolver el valor original si no se puede parsear
    }
    
    // Formatear la fecha en español
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long'
    });
  } catch (error) {
    return dateValue; // Devolver el valor original en caso de error
  }
};

const hasJoinDate = (user) => {
  // Buscar diferentes posibles campos de fecha que podría devolver el backend
  const possibleDateFields = [
    'joinDate', 
    'createdAt', 
    'created_at', 
    'registrationDate',
    'registration_date',
    'dateJoined',
    'date_joined'
  ];
  
  // Buscar el primer campo que exista
  for (const field of possibleDateFields) {
    if (user[field]) {
      return true;
    }
  }
  
  return false;
};

const getCoinsDisplay = (user) => {
  if (!user) return '0';
  
  // Manejar defensivamente cuando stats no existe (backend devuelve sin stats si son null)
  const coins = user.stats?.coins ?? 100; // Valor por defecto según backend
  return coins.toLocaleString();
};

const getStreakDisplay = (user) => {
  if (!user) return '0';
  
  const streak = user.stats?.currentStreak ?? 0; // Valor por defecto según backend
  return streak.toString();
};

const getLevelsDisplay = (user) => {
  if (!user) return '0';
  
  const levels = user.stats?.levelsCompleted ?? 0; // Valor por defecto según backend
  return levels.toString();
};

</script>

<style scoped>
/* Estilos de perfil.html */
.profile-page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-bottom: 70px; /* Espacio para la bottom navigation */
}

/* PageHeader gestiona la cabecera */

.user-info-section {
  padding: 15px 20px 10px; /* Muy reducido */
  text-align: center;
}

.profile-picture-container {
  width: 90px; /* Más pequeño */
  height: 90px; /* Más pequeño */
  border-radius: 50%;
  margin: 0 auto 8px auto; /* Muy poco margen */
  overflow: hidden;
  background-color: #FBEAE3;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.profile-picture {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info-section .username {
  font-size: 20px; /* Más pequeño */
  font-weight: 600;
  color: #111111;
  margin: 0;
}

.user-info-section .join-date {
  font-size: 13px; /* Más pequeño */
  color: #666666;
  margin: 3px 0 0 0;
}

.user-stats-section {
  display: flex;
  justify-content: space-around;
  padding: 0 20px 15px; /* Muy reducido */
  gap: 12px;
}

.achievements-section {
  padding: 0 20px 15px; /* Muy reducido */
}

.achievements-section .section-title-profile {
  font-size: 18px; /* Más pequeño */
  font-weight: 600;
  color: #111111;
  margin: 0 0 8px 0; /* Muy poco margen */
}

.achievements-carousel {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 5px;
}

/* Scroll horizontal personalizado */
.horizontal-scroll::-webkit-scrollbar {
  height: 4px; /* Más delgado */
}

.horizontal-scroll::-webkit-scrollbar-track {
  background: #F0F0F0;
  border-radius: 2px;
}

.horizontal-scroll::-webkit-scrollbar-thumb {
  background: #CCCCCC;
  border-radius: 2px;
}

.horizontal-scroll::-webkit-scrollbar-thumb:hover {
  background: #AAAAAA;
}

.edit-profile-button-container {
  padding: 0 20px 20px; /* Sin margin-top auto para que no empuje tanto */
}

/* COPIANDO EXACTAMENTE del EditProfileView */
.edit-profile-button-container :deep(.btn-primary) {
  width: 100% !important;
  padding: 15px !important;
  border: none !important;
  border-radius: 12px !important;
  font-size: 18px !important;
  font-weight: bold !important;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  background-color: #FF007F !important;
  color: white !important;
}

.edit-profile-button-container :deep(.btn-primary:hover:not(:disabled)) {
  background-color: #E60072 !important;
}

.edit-profile-button-container :deep(.btn-primary:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner, .error-message-fullpage {
    text-align: center;
    padding: 20px; /* Muy reducido */
    font-size: 16px;
    color: #555;
}

.error-message-fullpage {
    color: red;
}

.retry-button {
    margin-top: 10px;
    padding: 8px 16px;
    background-color: #FF007F;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
}

.retry-button:hover {
    background-color: #E60072;
}

@media (max-width: 360px) {
  .profile-picture-container { width: 80px; height: 80px; }
  .user-info-section .username { font-size: 18px; }
  .achievements-section .section-title-profile { font-size: 16px; }
  .user-info-section { padding: 10px 20px 8px; }
  .user-stats-section { padding: 0 20px 10px; gap: 8px; }
  .achievements-section { padding: 0 20px 10px; }
  .edit-profile-button-container { padding: 0 20px 15px; }
}
</style> 