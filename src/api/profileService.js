import { users } from './_mockData'; // Compartir los usuarios con authService
import httpClient from './httpClient';
import { API_CONFIG } from '../config/api.js';

const MOCK_DELAY = 300;
const USE_MOCK_DATA = API_CONFIG.USE_MOCK_DATA;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const mockUserProfile = {
  id: 1,
  name: 'Pedro García',
  email: 'pedro@finko.com',
  avatar: '/images/avatar-pedro.png',
  phone: '+34 666 123 456',
  dateOfBirth: '1990-05-15',
  occupation: 'Desarrollador',
  investmentExperience: 'Principiante',
  riskTolerance: 'Moderado',
  investmentGoals: ['Ahorro para jubilación', 'Crecimiento a largo plazo'],
  registeredDate: '2024-01-15',
  stats: {
    totalInvested: 3750.00,
    totalGains: 67.15,
    completedLessons: 12,
    currentStreak: 5,
    level: 3,
    xp: 1250
  }
}

const mockAchievements = [
  {
    id: 1,
    title: 'Primera Inversión',
    description: 'Realizaste tu primera inversión',
    image: '/images/achievement1.png',
    unlockedAt: '2024-01-15',
    isUnlocked: true,
    category: 'inversión'
  },
  {
    id: 2,
    title: 'Estudiante Dedicado',
    description: 'Completa 10 lecciones',
    image: '/images/achievement2.png',
    unlockedAt: '2024-01-18',
    isUnlocked: true,
    category: 'aprendizaje'
  },
  {
    id: 3,
    title: 'Diversificador',
    description: 'Invierte en 3 activos diferentes',
    image: '/images/achievement3.png',
    unlockedAt: null,
    isUnlocked: false,
    category: 'inversión'
  },
  {
    id: 4,
    title: 'Racha de Aprendizaje',
    description: 'Completa lecciones 7 días consecutivos',
    image: '/images/achievement1.png',
    unlockedAt: null,
    isUnlocked: false,
    category: 'aprendizaje'
  }
]

const mockSettings = {
  notifications: {
    pushNotifications: true,
    emailNotifications: true,
    marketUpdates: true,
    lessonReminders: true,
    portfolioAlerts: false
  },
  privacy: {
    profileVisibility: 'private',
    shareAchievements: true,
    analyticsOptOut: false
  },
  app: {
    theme: 'light',
    language: 'es',
    currency: 'EUR',
    autoSync: true
  },
  security: {
    twoFactorAuth: false,
    biometricLogin: false,
    sessionTimeout: 30
  }
}

// Servicios mock
const mockProfile = {
  updateUserProfile: (userId, profileDetails) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const userIndex = users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          // Simular validación de email/username si cambian
          if (profileDetails.email && users.some(u => u.email === profileDetails.email && u.id !== userId)) {
            return reject({ message: "El email ya está en uso por otra cuenta." });
          }
          if (profileDetails.username && users.some(u => u.username === profileDetails.username && u.id !== userId)) {
            return reject({ message: "El nombre de usuario ya está en uso." });
          }

          users[userIndex] = {
            ...users[userIndex],
            username: profileDetails.username || users[userIndex].username,
            email: profileDetails.email || users[userIndex].email,
            fullname: profileDetails.name || users[userIndex].fullname,
          };
          const { password, ...userWithoutPassword } = users[userIndex];
          resolve(userWithoutPassword);
        } else {
          reject({ message: "Usuario no encontrado para actualizar." });
        }
      }, MOCK_DELAY);
    });
  },

  logout: () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Mock: User logged out from server.");
            resolve({ success: true });
        }, MOCK_DELAY / 2);
    });
  },

  deleteAccount: (userId) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const userIndex = users.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                users.splice(userIndex, 1);
                console.log(`Mock: User ${userId} account deleted.`);
                resolve({ success: true, message: "Cuenta eliminada correctamente." });
            } else {
                reject({ message: "Usuario no encontrado para eliminar." });
            }
        }, MOCK_DELAY);
    });
  },

  contactSupport: (messageData) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Mock: Support message received:", messageData);
            resolve({ success: true, message: "Tu mensaje ha sido enviado. Nos pondremos en contacto pronto." });
        }, MOCK_DELAY);
    });
  },

  async getProfile() {
    await delay(600)
    return mockUserProfile
  },

  async updateProfile(profileData) {
    await delay(800)
    
    if (profileData.email && !profileData.email.includes('@')) {
      throw new Error('Email inválido')
    }
    
    if (profileData.phone && profileData.phone.length < 9) {
      throw new Error('Teléfono inválido')
    }

    Object.assign(mockUserProfile, profileData)
    
    return {
      ...mockUserProfile,
      ...profileData
    }
  },

  async changePassword(currentPassword, newPassword, confirmNewPassword) {
    await delay(1000)
    
    if (currentPassword !== '123456') {
      throw new Error('Contraseña actual incorrecta')
    }
    
    if (newPassword.length < 8) {
      throw new Error('La nueva contraseña debe tener entre 8 y 128 caracteres')
    }

    if (newPassword.length > 128) {
      throw new Error('La nueva contraseña debe tener entre 8 y 128 caracteres')
    }

    if (newPassword !== confirmNewPassword) {
      throw new Error('Las contraseñas no coinciden')
    }

    return { success: true, message: 'Contraseña actualizada correctamente' }
  },

  async getAchievements() {
    await delay(400)
    return mockAchievements
  },

  async getSettings() {
    await delay(300)
    return mockSettings
  },

  async updateSettings(newSettings) {
    await delay(500)
    
    Object.assign(mockSettings, newSettings)
    
    return {
      ...mockSettings,
      ...newSettings
    }
  },

  async uploadAvatar(file) {
    await delay(1500)
    
    if (!file || !file.type.startsWith('image/')) {
      throw new Error('Debe ser un archivo de imagen válido')
    }
    
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('La imagen debe ser menor a 5MB')
    }

    const newAvatarUrl = '/images/profile-pic.png'
    mockUserProfile.avatar = newAvatarUrl
    
    return {
      avatarUrl: newAvatarUrl,
      message: 'Avatar actualizado correctamente'
    }
  },

  async deleteAccount(deleteData) {
    await delay(1000)
    
    // Simular validación de contraseña
    if (!deleteData.currentPassword) {
      throw new Error('Se requiere la contraseña actual')
    }
    
    // Simular validación del texto de confirmación
    if (deleteData.confirmDelete !== 'DELETE_MY_ACCOUNT') {
      throw new Error('El texto de confirmación debe ser exactamente: DELETE_MY_ACCOUNT')
    }
    
    // Simular validación de contraseña incorrecta ocasionalmente (para testing)
    if (deleteData.currentPassword === 'wrongpassword') {
      throw new Error('Contraseña incorrecta')
    }
    
    return { 
      success: true, 
      message: 'Cuenta eliminada permanentemente. Lamentamos verte partir.' 
    }
  }
}

// Servicios reales para API
const realProfile = {
  async updateUserProfile(userId, profileDetails) {
    return await httpClient.put('/auth/me', profileDetails);
  },

  async logout() {
    try {
      await httpClient.post('/auth/logout');
      return { success: true };
    } finally {
      localStorage.removeItem('finko_auth_token');
    }
  },

  async deleteAccount(deleteData) {
    const response = await httpClient.delete('/auth/me/account', {
      currentPassword: deleteData.currentPassword,
      confirmDelete: deleteData.confirmDelete
    });
    
    // Limpiar token después de eliminación exitosa
    localStorage.removeItem('finko_auth_token');
    
    return { 
      success: true, 
      message: response.message || 'Cuenta eliminada correctamente. Lamentamos verte partir.' 
    };
  },

  async contactSupport(messageData) {
    const response = await httpClient.post('/support/contact', messageData);
    return { 
      success: true, 
      message: response.message || 'Tu mensaje ha sido enviado. Nos pondremos en contacto pronto.' 
    };
  },

  async getProfile() {
    // El perfil se obtiene a través de /auth/me
    return await httpClient.get('/auth/me');
  },

  async updateProfile(profileData) {
    return await httpClient.put('/auth/me', profileData);
  },

  async changePassword(currentPassword, newPassword, confirmNewPassword) {
    return await httpClient.put('/auth/me/password', {
      currentPassword,
      newPassword,
      confirmNewPassword
    });
  },

  async getAchievements() {
    // Mantener mock por ahora ya que no está implementado en backend
    await delay(400);
    return mockAchievements;
  },

  async getSettings() {
    // Mantener mock por ahora ya que no está implementado en backend
    await delay(300);
    return mockSettings;
  },

  async updateSettings(newSettings) {
    // Mantener mock por ahora ya que no está implementado en backend
    await delay(500);
    Object.assign(mockSettings, newSettings);
    return { ...mockSettings, ...newSettings };
  },

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('profilePic', file);
    
    const response = await httpClient.postFile('/auth/me/profile-pic', formData);
    
    return {
      avatarUrl: response.profilePicUrl || response.avatarUrl,
      message: response.message || 'Avatar actualizado correctamente'
    };
  }
}

export default USE_MOCK_DATA ? mockProfile : realProfile; 