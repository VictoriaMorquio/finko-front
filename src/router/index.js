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
import LevelIntroView from '@/views/Learn/LevelIntroView.vue'
import LessonContentView from '@/views/Learn/LessonContentView.vue'
import LessonQuizView from '@/views/Learn/LessonQuizView.vue'
import LevelCompletedView from '@/views/Learn/LevelCompletedView.vue'

// Invest Views
import InvestmentsDashboardView from '@/views/Invest/InvestmentsDashboardView.vue'
import InvestmentDetailView from '@/views/Invest/InvestmentDetailView.vue'
import BuyStockView from '@/views/Invest/BuyStockView.vue'
import SellStockView from '@/views/Invest/SellStockView.vue'

// Chat Views
import ChatView from '@/views/Chat/ChatView.vue'

// Profile Views
import ProfileView from '@/views/Profile/ProfileView.vue'
import EditProfileView from '@/views/Profile/EditProfileView.vue'
import SettingsView from '@/views/Profile/SettingsView.vue'

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
    path: '/forgot-password/new',
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
    path: '/learn/level/:levelId/intro',
    name: 'LevelIntro',
    component: LevelIntroView,
    meta: { requiresAuth: true }
  },
  {
    path: '/learn/lesson/:lessonId',
    name: 'LessonContent',
    component: LessonContentView,
    meta: { requiresAuth: true }
  },
  {
    path: '/learn/lesson/:lessonId/quiz',
    name: 'LessonQuiz',
    component: LessonQuizView,
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
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
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
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router 