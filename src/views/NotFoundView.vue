<template>
  <div class="not-found-page">
    <PageHeader title="Página No Encontrada" :show-back="true" :back-route="{ name: 'LearnDashboard' }"/>
    <div class="content">
      <h1>404</h1>
      <p>Lo sentimos, la página que buscas no existe.</p>
      <BaseButton @click="$router.push({ name: 'LearnDashboard' })" variant="primary">
        Volver al Inicio
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import PageHeader from '@/components/common/PageHeader.vue';
import BaseButton from '@/components/common/BaseButton.vue';
</script>

<style scoped>
.not-found-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  text-align: center;
}
.content {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 20px;
}
.content h1 {
  font-size: 72px;
  font-weight: bold;
  color: #FF007F;
  margin-bottom: 10px;
}
.content p {
  font-size: 18px;
  color: #555;
  margin-bottom: 30px;
}
</style> 