import { defineStore } from 'pinia'
import { ref } from 'vue'
import learnService from '@/api/learnService'

export const useLearnStore = defineStore('learn', {
  state: () => ({
    generalProgress: 0,
    units: [],
    currentUnitSkills: null,
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
      this.loading = true;
      this.error = null;
      try {
        const stepData = await learnService.getLessonStep(lessonId, stepId);
        this.currentLesson = {
            ...(this.currentLesson && this.currentLesson.id === lessonId ? this.currentLesson : { id: lessonId, title: 'Lección ' + lessonId }),
            currentStep: stepData,
            lessonId: lessonId,
            stepId: stepId
        };
      } catch (err) {
        this.error = err.message || `Fallo al cargar el paso ${stepId} de la lección ${lessonId}.`;
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
        this.loading = true;
        this.error = null;
        this.currentLesson = null;
        try {
            const data = await learnService.getLevelCompletedData(levelId);
            this.currentLesson = data;
        } catch (err) {
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
    }
  },
}) 