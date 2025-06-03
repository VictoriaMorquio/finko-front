<template>
  <div class="lesson-progress-container">
    <div class="progress-bar-track">
      <div 
        class="progress-bar-fill" 
        :class="{ 'review-progress': isReviewMode }"
        :style="{ width: progressPercentage + '%' }"
      ></div>
    </div>
    <div class="progress-info">
      <span class="progress-text">{{ currentStepNumber }}/{{ totalSteps }}</span>
      <span v-if="lessonTitle" class="lesson-title">{{ lessonTitle }}</span>
    </div>
    <p v-if="isReviewMode" class="review-text">🔄 Modo Repaso - Repasa las preguntas que fallaste</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentStepNumber: {
    type: Number,
    required: true
  },
  totalSteps: {
    type: Number,
    required: true
  },
  lessonTitle: {
    type: String,
    default: ''
  },
  isReviewMode: {
    type: Boolean,
    default: false
  }
});

const progressPercentage = computed(() => {
  if (props.totalSteps === 0) return 0;
  return Math.round((props.currentStepNumber / props.totalSteps) * 100);
});
</script>

<style scoped>
.lesson-progress-container {
  background-color: #FBEAE3;
  padding: 15px 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.progress-bar-track {
  background-color: #E0E0E0;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-bar-fill {
  background-color: #4CAF50;
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease-in-out;
}

.review-progress {
  background: linear-gradient(90deg, #FF6B35, #F7931E) !important;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-text {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.lesson-title {
  font-size: 15px;
  font-weight: bold;
  color: #111;
  flex: 1;
  text-align: center;
  margin: 0 10px;
}

.review-text {
  text-align: center;
  color: #FF6B35;
  font-size: 13px;
  font-weight: 500;
  margin: 8px 0 0 0;
  animation: fade-in 0.5s ease-in;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 360px) {
  .lesson-progress-container {
    padding: 12px 15px;
  }
  
  .lesson-title {
    font-size: 13px;
  }
  
  .progress-text {
    font-size: 13px;
  }
}
</style> 