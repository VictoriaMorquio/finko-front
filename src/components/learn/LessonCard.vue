<template>
  <div class="lesson-card" @click="handleClick" :class="{ 'completed': lesson.status === 'completed', 'locked': lesson.status === 'locked' }">
    <div class="lesson-content">
      <div class="lesson-header">
        <h3 class="lesson-title">{{ lesson.title }}</h3>
        <div class="lesson-status">
          <div class="status-badge completed" v-if="lesson.status === 'completed'">
            ✓
          </div>
          <div class="status-badge locked" v-else>
            🔒
          </div>
        </div>
      </div>
      
      <p class="lesson-description">{{ lesson.description }}</p>
      
      <div class="lesson-footer">
        <div class="lesson-rewards">
          <span class="coins">🪙 {{ lesson.coinsReward }}</span>
        </div>
        <div class="lesson-steps">
          {{ lesson.totalSteps }} {{ lesson.totalSteps === 1 ? 'paso' : 'pasos' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  lesson: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['selected']);

const handleClick = () => {
  // Solo permitir clic si la lección no está bloqueada
  if (props.lesson.status !== 'locked') {
    emit('selected', props.lesson.id);
  }
};
</script>

<style scoped>
.lesson-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.lesson-card:not(.locked) {
  cursor: pointer;
}

.lesson-card:not(.locked):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.lesson-card.completed {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-left: 4px solid #10b981;
}

.lesson-card.locked {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-left: 4px solid #9ca3af;
  opacity: 0.7;
}

.lesson-content {
  width: 100%;
}

.lesson-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.lesson-title {
  font-size: 17px;
  font-weight: 600;
  color: #111;
  margin: 0;
  line-height: 1.3;
  flex: 1;
  margin-right: 16px;
}

.locked .lesson-title {
  color: #9ca3af;
}

.lesson-status {
  flex-shrink: 0;
}

.status-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
}

.status-badge.completed {
  background: #10b981;
  color: white;
}

.status-badge.locked {
  background: #9ca3af;
  color: white;
}

.lesson-description {
  font-size: 13px;
  color: #666;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.locked .lesson-description {
  color: #9ca3af;
}

.lesson-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lesson-rewards {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #888;
}

.locked .lesson-rewards {
  color: #9ca3af;
}

.coins {
  display: flex;
  align-items: center;
  gap: 4px;
}

.lesson-steps {
  font-size: 12px;
  color: #999;
}

.locked .lesson-steps {
  color: #9ca3af;
}

@media (max-width: 480px) {
  .lesson-card {
    padding: 16px;
  }
  
  .lesson-title {
    font-size: 15px;
  }
  
  .lesson-description {
    font-size: 12px;
  }
  
  .lesson-rewards {
    font-size: 12px;
    gap: 12px;
  }
  
  .lesson-steps {
    font-size: 11px;
  }
}
</style> 