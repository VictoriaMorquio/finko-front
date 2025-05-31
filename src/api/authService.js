import { users } from './_mockData'; // Usar los usuarios del mockData centralizado
const MOCK_DELAY = 500;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export default {
  async login(credentials) {
    await delay(MOCK_DELAY)
    
    const { email, password } = credentials
    const user = users.find(u => u.email === email && u.password === password)
    
    if (!user) {
      throw new Error('Email o contraseña incorrectos')
    }

    const { password: _, ...userWithoutPassword } = user

    return {
      token: 'finko_jwt_token_' + Date.now(),
      user: userWithoutPassword
    }
  },

  async signup({ fullname, username, email, password }) {
    await delay(MOCK_DELAY)
    
    // Verificar si el email ya existe
    const existingEmailUser = users.find(u => u.email === email)
    if (existingEmailUser) {
      throw new Error('Este email ya está registrado')
    }

    // Verificar si el username ya existe
    const existingUsernameUser = users.find(u => u.username === username)
    if (existingUsernameUser) {
      throw new Error('Este nombre de usuario ya está en uso')
    }

    // Crear nuevo usuario
    const newUser = {
      id: (users.length + 1).toString(),
      email,
      username,
      fullname,
      password, // En una app real, esto estaría hasheado
      joinDate: '2024',
      profilePic: '/images/profile-pic-default.png',
      stats: {
        coins: 100, // Coins iniciales de bienvenida
        currentStreak: 0,
        levelsCompleted: 0,
      },
      achievements: []
    }

    // Añadir al array de usuarios (simulación)
    users.push(newUser)

    const { password: _, ...userWithoutPassword } = newUser

    return {
      token: 'finko_jwt_token_' + Date.now(),
      user: userWithoutPassword
    }
  },

  async requestPasswordReset(emailOrUsername) {
    await delay(MOCK_DELAY)
    
    const user = users.find(u => u.email === emailOrUsername || u.username === emailOrUsername)
    
    if (!user) {
      throw new Error('No se encontró una cuenta con ese email o nombre de usuario')
    }

    // En una app real, aquí se enviaría un email
    return {
      message: 'Se ha enviado un enlace de recuperación a tu email.'
    }
  },

  async confirmNewPassword(token, newPassword) {
    await delay(MOCK_DELAY)
    
    // En una app real, aquí se verificaría el token
    if (!token || token.length < 10) {
      throw new Error('Token de recuperación inválido o expirado')
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres')
    }

    // Simular actualización de contraseña
    return {
      message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.'
    }
  },

  async getCurrentUser() {
    await delay(200)
    
    // En una app real, esto validaría el token y devolvería los datos del usuario
    const currentUser = users[0] // Usuario por defecto para testing
    const { password: _, ...userWithoutPassword } = currentUser
    
    return userWithoutPassword
  }
} 