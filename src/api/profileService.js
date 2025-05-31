import { users } from './_mockData'; // Compartir los usuarios con authService
const MOCK_DELAY = 300;

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

export default {
  // getProfileData(userId) ahora se maneja a través de authStore.currentUser

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
            fullname: profileDetails.name || users[userIndex].fullname, // 'name' from form
            // profilePic si se actualiza
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
                users.splice(userIndex, 1); // Eliminar usuario del mock
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
    
    // Simular validación
    if (profileData.email && !profileData.email.includes('@')) {
      throw new Error('Email inválido')
    }
    
    if (profileData.phone && profileData.phone.length < 9) {
      throw new Error('Teléfono inválido')
    }

    // Simular actualización exitosa
    Object.assign(mockUserProfile, profileData)
    
    return {
      ...mockUserProfile,
      ...profileData
    }
  },

  async changePassword(currentPassword, newPassword) {
    await delay(1000)
    
    // Simular validación de contraseña actual
    if (currentPassword !== '123456') {
      throw new Error('Contraseña actual incorrecta')
    }
    
    if (newPassword.length < 6) {
      throw new Error('La nueva contraseña debe tener al menos 6 caracteres')
    }

    // Simular cambio exitoso
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
    
    // Simular actualización de configuración
    Object.assign(mockSettings, newSettings)
    
    return {
      ...mockSettings,
      ...newSettings
    }
  },

  async uploadAvatar(file) {
    await delay(1500)
    
    // Simular validación de archivo
    if (!file || !file.type.startsWith('image/')) {
      throw new Error('Debe ser un archivo de imagen válido')
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      throw new Error('La imagen debe ser menor a 5MB')
    }

    // Simular subida exitosa
    const newAvatarUrl = '/images/profile-pic.png'
    mockUserProfile.avatar = newAvatarUrl
    
    return {
      avatarUrl: newAvatarUrl,
      message: 'Avatar actualizado correctamente'
    }
  },

  async deleteAccount() {
    await delay(1000)
    
    // En una implementación real, esto eliminaría la cuenta
    return { 
      success: true, 
      message: 'Cuenta eliminada correctamente. Lamentamos verte partir.' 
    }
  }
} 