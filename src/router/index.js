import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Auth Views
import LoginView from '@/views/Auth/LoginView.vue'
import SignupView from '@/views/Auth/SignupView.vue'
import ForgotPasswordEmailView from '@/views/Auth/ForgotPasswordEmailView.vue'
import ForgotPasswordNewView from '@/views/Auth/ForgotPasswordNewView.vue'

// Learn Views
import LearnDashboardView from '@/views/Learn/LearnDashboardView.vue'
import UnitSkillsView from '@/views/Learn/UnitSkillsView.vue'
import SkillLessonsView from '@/views/Learn/SkillLessonsView.vue'
import LevelIntroView from '@/views/Learn/LevelIntroView.vue'
import LessonContentView from '@/views/Learn/LessonContentView.vue'
import LessonQuizView from '@/views/Learn/LessonQuizView.vue'
import TrueFalseStepView from '@/views/Learn/TrueFalseStepView.vue'
import DragDropStepView from '@/views/Learn/DragDropStepView.vue'
import LevelCompletedView from '@/views/Learn/LevelCompletedView.vue'

// Invest Views
import InvestmentsDashboardView from '@/views/Invest/InvestmentsDashboardView.vue'
import InvestmentDetailView from '@/views/Invest/InvestmentDetailView.vue'
import BuyStockView from '@/views/Invest/BuyStockView.vue'
import SellStockView from '@/views/Invest/SellStockView.vue'
import InvestmentSearchView from '@/views/Invest/InvestmentSearchView.vue'

// Chat Views
import ChatView from '@/views/Chat/ChatView.vue'

// Profile Views
import ProfileView from '@/views/Profile/ProfileView.vue'
import EditProfileView from '@/views/Profile/EditProfileView.vue'
import ChangePasswordView from '@/views/Profile/ChangePasswordView.vue'
import SettingsView from '@/views/Profile/SettingsView.vue'
import ContactView from '@/views/Profile/ContactView.vue'

// Other
import NotFoundView from '@/views/NotFoundView.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/signup',
    name: 'Signup',
    component: SignupView
  },
  {
    path: '/forgot-password',
    name: 'ForgotPasswordEmail',
    component: ForgotPasswordEmailView
  },
  {
    path: '/forgot-password/new/:token',
    name: 'ForgotPasswordNew',
    component: ForgotPasswordNewView
  },
  {
    path: '/learn',
    name: 'LearnDashboard',
    component: LearnDashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/learn/unit/:unitId/skills',
    name: 'UnitSkills',
    component: UnitSkillsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/learn/skill/:skillId/lessons',
    name: 'SkillLessons',
    component: SkillLessonsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/learn/level/:levelId/intro',
    name: 'LevelIntro',
    component: LevelIntroView,
    meta: { requiresAuth: true }
  },
  {
    path: '/learn/lesson/:lessonId/:stepId?',
    name: 'LessonContent',
    component: LessonContentView,
    meta: { requiresAuth: true }
  },
  {
    path: '/learn/lesson/:lessonId/quiz/:stepId?',
    name: 'LessonQuiz',
    component: LessonQuizView,
    meta: { requiresAuth: true }
  },
  {
    path: '/learn/lesson/:lessonId/step/:stepId/true-false',
    name: 'TrueFalseStep',
    component: TrueFalseStepView,
    meta: { requiresAuth: true }
  },
  {
    path: '/learn/lesson/:lessonId/step/:stepId/drag-drop',
    name: 'DragDropStep',
    component: DragDropStepView,
    meta: { requiresAuth: true }
  },
  {
    path: '/learn/level/:levelId/completed',
    name: 'LevelCompleted',
    component: LevelCompletedView,
    meta: { requiresAuth: true }
  },
  {
    path: '/invest',
    name: 'InvestmentsDashboard',
    component: InvestmentsDashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/invest/search',
    name: 'InvestmentSearch',
    component: InvestmentSearchView,
    meta: { requiresAuth: true }
  },
  {
    path: '/invest/:id',
    name: 'InvestmentDetail',
    component: InvestmentDetailView,
    meta: { requiresAuth: true }
  },
  {
    path: '/invest/:id/buy',
    name: 'BuyStock',
    component: BuyStockView,
    meta: { requiresAuth: true }
  },
  {
    path: '/invest/:id/sell',
    name: 'SellStock',
    component: SellStockView,
    meta: { requiresAuth: true }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: ChatView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/edit',
    name: 'EditProfile',
    component: EditProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile/change-password',
    name: 'ChangePassword',
    component: ChangePasswordView,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/contact',
    name: 'Contact',
    component: ContactView,
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

router.beforeEach(async (to, from, next) => {
  // Verificar si la ruta requiere autenticación
  if (!to.meta.requiresAuth) {
    next()
    return
  }

  // Obtener el token directamente del localStorage
  const token = localStorage.getItem('finko_auth_token')
  
  if (!token) {
    next('/login')
    return
  }

  // Para rutas que requieren autenticación pero ya tenemos token,
  // dejamos que el componente individual maneje la carga de datos
  next()
})

export default router 