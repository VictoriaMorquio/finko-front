<template>
  <div class="stat-card">
    <div class="stat-value">{{ value }}</div>
    <div class="stat-label">{{ label }}</div>
  </div>
</template>

<script setup>
defineProps({
  value: [String, Number],
  label: String,
});
</script>

<style scoped>
/* Copied from perfil.html .stat-card */
.stat-card {
  background-color: #F9F9F9;
  padding: 15px;
  border-radius: 12px;
  text-align: center;
  flex: 1;
  min-width: 90px; /* Asegura que no se encojan demasiado */
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.stat-card .stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #111111;
  margin-bottom: 3px;
}

.stat-card .stat-label {
  font-size: 13px;
  color: #666666;
}

@media (max-width: 360px) {
  .stat-card .stat-value { font-size: 20px; }
  .stat-card .stat-label { font-size: 12px; }
}
</style> 