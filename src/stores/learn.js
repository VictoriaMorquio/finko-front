import { defineStore } from 'pinia'
import { ref } from 'vue'
import learnService from '@/api/learnService'

export const useLearnStore = defineStore('learn', {
  state: () => ({
    generalProgress: 0,
    units: [],
    currentUnitSkills: null,
    currentSkillLessons: null,
    currentLesson: null,
    loading: false,
    error: null,
  }),
  getters: {
    getUnitById: (state) => (unitId) => {
      return state.units.find(unit => unit.id === unitId);
    },
    getSkillById: (state) => (skillId) => {
        if (!state.currentUnitSkills) return null;
        return state.currentUnitSkills.skills.find(skill => skill.id === skillId);
    }
  },
  actions: {
    async fetchLearnDashboardData() {
      this.loading = true;
      this.error = null;
      try {
        const data = await learnService.getLearnDashboard();
        this.generalProgress = data.generalProgress;
        this.units = data.units;
      } catch (err) {
        this.error = err.message || 'Fallo al cargar datos de aprendizaje.';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async fetchUnitSkills(unitId) {
      this.loading = true;
      this.error = null;
      this.currentUnitSkills = null;
      try {
        const data = await learnService.getUnitSkills(unitId);
        this.currentUnitSkills = data;
      } catch (err) {
        this.error = err.message || `Fallo al cargar habilidades para la unidad ${unitId}.`;
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async fetchSkillLessons(skillId) {
      this.loading = true;
      this.error = null;
      this.currentSkillLessons = null;
      try {
        const data = await learnService.getSkillLessons(skillId);
        this.currentSkillLessons = data;
      } catch (err) {
        this.error = err.message || `Fallo al cargar lecciones para la habilidad ${skillId}.`;
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async fetchLessonIntro(lessonId) {
        this.loading = true;
        this.error = null;
        this.currentLesson = null;
        try {
            const data = await learnService.getLessonIntro(lessonId);
            this.currentLesson = data;
        } catch (err) {
            this.error = err.message || `Fallo al cargar introducción de la lección ${lessonId}.`;
        } finally {
            this.loading = false;
        }
    },
    async fetchLessonStep(lessonId, stepId) {
      console.log('🏪 STORE - fetchLessonStep called:', { lessonId, stepId });
      this.loading = true;
      this.error = null;
      try {
        const stepData = await learnService.getLessonStep(lessonId, stepId);
        console.log('🏪 STORE - stepData received from backend:', stepData);
        console.log('🏪 STORE - stepData.options specifically:', stepData.options);
        console.log('🏪 STORE - stepData keys:', Object.keys(stepData));
        console.log('🏪 STORE - Full stepData structure:', JSON.stringify(stepData, null, 2));
        
        // Preservar allSteps si ya existe y es para la misma lección
        const existingLesson = this.currentLesson && this.currentLesson.id === lessonId ? this.currentLesson : null;
        
        this.currentLesson = {
            id: lessonId,
            title: existingLesson?.title || 'Lección ' + lessonId,
            // Preservar allSteps si existe
            ...(existingLesson?.allSteps && { allSteps: existingLesson.allSteps }),
            // Preservar otras propiedades existentes si las hay
            ...existingLesson,
            // Actualizar con los datos del step actual
            currentStep: stepData,
            lessonId: lessonId,
            stepId: stepId
        };
        
        console.log('🏪 STORE - currentLesson updated:', this.currentLesson);
        console.log('🏪 STORE - allSteps preserved:', this.currentLesson.allSteps?.length || 'No allSteps');
      } catch (err) {
        this.error = err.message || `Fallo al cargar el paso ${stepId} de la lección ${lessonId}.`;
        console.error('🏪 STORE - Error in fetchLessonStep:', err);
      } finally {
        this.loading = false;
      }
    },
    async fetchLessonSteps(lessonId) {
      this.loading = true;
      this.error = null;
      try {
        const lessonData = await learnService.getLessonSteps(lessonId);
        this.currentLesson = {
            ...(this.currentLesson && this.currentLesson.id === lessonId ? this.currentLesson : {}),
            ...lessonData,
            allSteps: lessonData.steps
        };
        return lessonData;
      } catch (err) {
        this.error = err.message || `Fallo al cargar pasos de la lección ${lessonId}.`;
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    async submitQuizAnswer(lessonId, stepId, answer) {
        this.loading = true;
        this.error = null;
        try {
            const result = await learnService.submitQuizAnswer(lessonId, stepId, answer);
            if (this.currentLesson && this.currentLesson.currentStep && this.currentLesson.currentStep.id === stepId) {
                this.currentLesson.currentStep.result = result;
                this.currentLesson.currentStep.answered = true;
            }
            return result;
        } catch (err) {
            this.error = err.message || 'Error al enviar respuesta.';
            throw err;
        } finally {
            this.loading = false;
        }
    },
    async fetchLevelCompletedData(levelId) {
        console.log('🏪 STORE - fetchLevelCompletedData called with levelId:', levelId);
        this.loading = true;
        this.error = null;
        this.currentLesson = null;
        try {
            const data = await learnService.getLevelCompletedData(levelId);
            console.log('🏪 STORE - Level completed data received:', data);
            this.currentLesson = data;
        } catch (err) {
            console.error('🏪 STORE - Error in fetchLevelCompletedData:', err);
            this.error = err.message || `Fallo al cargar datos de nivel ${levelId} completado.`;
        } finally {
            this.loading = false;
        }
    },
    updateSkillProgress(skillId, newProgress) {
        if (this.currentUnitSkills) {
            const skill = this.currentUnitSkills.skills.find(s => s.id === skillId);
            if (skill) {
                skill.progress = newProgress;
            }
        }
    },
    // Métodos para sistema de repasos
    async checkReviewStatus(lessonId) {
        this.loading = true;
        this.error = null;
        try {
            const reviewStatus = await learnService.getReviewStatus(lessonId);
            return reviewStatus;
        } catch (err) {
            console.warn('⚠️ Error al verificar estado de repasos:', err.message);
            // Devolver estado por defecto en caso de error
            return {
                lessonId,
                hasPendingReviews: false,
                pendingReviewsCount: 0,
                nextReviewStepId: null,
                message: 'No hay repasos pendientes'
            };
        } finally {
            this.loading = false;
        }
    },
    async fetchNextReviewStep(lessonId) {
        this.loading = true;
        this.error = null;
        try {
            const reviewStep = await learnService.getNextReviewStep(lessonId);
            // Actualizar currentLesson con el step de repaso
            this.currentLesson = {
                ...(this.currentLesson && this.currentLesson.id === lessonId ? this.currentLesson : { id: lessonId, title: 'Lección ' + lessonId }),
                currentStep: reviewStep,
                lessonId: lessonId,
                stepId: reviewStep.id,
                isReviewMode: true
            };
            return reviewStep;
        } catch (err) {
            console.warn('⚠️ Error al cargar paso de repaso:', err.message);
            throw err; // Re-lanzar para que handleQuizNavigation pueda manejar la finalización
        } finally {
            this.loading = false;
        }
    },
    async resetReviewQueue(lessonId) {
        try {
            const result = await learnService.resetReviewQueue(lessonId);
            // Limpiar modo repaso si existe
            if (this.currentLesson) {
                this.currentLesson.isReviewMode = false;
            }
            return result;
        } catch (err) {
            console.warn('⚠️ Error al resetear cola de repasos:', err.message);
            throw err; // Re-lanzar para que el llamador pueda decidir qué hacer
        }
    }
  },
}) 