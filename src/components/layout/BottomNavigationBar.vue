<template>
  <nav class="bottom-nav">
    <router-link 
      v-for="item in navItems" 
      :key="item.name"
      :to="item.route" 
      class="nav-item"
      :class="{ 'active': $route.name === item.name }"
    >
      <div class="nav-icon" v-html="item.icon"></div>
      <span class="nav-label">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  {
    name: 'LearnDashboard',
    route: '/learn',
    label: 'Aprender',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 16l-5 2.72L7 16v-3.73L12 15l5-2.73V16z"/>
    </svg>`
  },
  {
    name: 'InvestmentsDashboard',
    route: '/invest',
    label: 'Invertir',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6h-6z"/>
    </svg>`
  },

  {
    name: 'Profile',
    route: '/profile',
    label: 'Perfil',
    icon: `<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>`
  }
]
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  border-top: 1px solid #E0E0E0;
  display: flex;
  justify-content: space-around;
  padding: 12px 0 12px 0;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  z-index: 1000;
  height: 85px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #757575;
  transition: color 0.2s ease;
  flex: 1;
  padding: 6px 8px;
}

.nav-item.active {
  color: #2196F3;
}

.nav-item:hover {
  color: #1976D2;
}

.nav-icon {
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon svg {
  width: 28px;
  height: 28px;
}

.nav-label {
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}

/* Responsive para tablets */
@media (min-width: 768px) {
  .bottom-nav {
    height: 95px;
    padding: 16px 0;
  }
  
  .nav-icon {
    margin-bottom: 6px;
  }
  
  .nav-icon svg {
    width: 32px;
    height: 32px;
  }
  
  .nav-label {
    font-size: 14px;
  }
}
</style> 