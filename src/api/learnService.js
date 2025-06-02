import httpClient from './httpClient';
import { API_CONFIG } from '../config/api.js';
import { mockLessonSteps, mockLevelCompletedData } from './_mockData.js';
import { processImageUrls } from '@/utils/imageUtils.js';

const USE_MOCK_DATA = API_CONFIG.USE_MOCK_DATA;
const MOCK_DELAY = 400;

// Servicios reales para API - TODOS LOS ENDPOINTS IMPLEMENTADOS
const realLearnService = {
  async getLearnDashboard() {
    const response = await httpClient.get('/learn/dashboard');
    return processImageUrls(response);
  },

  async getUnitSkills(unitId) {
    const response = await httpClient.get(`/learn/units/${unitId}/skills`);
    return processImageUrls(response);
  },

  async getSkillLessons(skillId) {
    const response = await httpClient.get(`/learn/skills/${skillId}/lessons`);
    return processImageUrls(response);
  },

  async getLessonIntro(lessonId) {
    const response = await httpClient.get(`/learn/lessons/${lessonId}/intro`);
    return processImageUrls(response);
  },

  async getLessonStep(lessonId, stepId) {
    const response = await httpClient.get(`/learn/lessons/${lessonId}/steps/${stepId}`);
    return processImageUrls(response);
  },

  async getLessonSteps(lessonId) {
    const response = await httpClient.get(`/learn/lessons/${lessonId}/steps`);
    return processImageUrls(response);
  },

  async getLevelCompletedData(levelId) {
    const response = await httpClient.get(`/learn/levels/${levelId}/completed`);
    return processImageUrls(response);
  },

  async submitQuiz(quizData) {
    const response = await httpClient.post('/learn/quiz/submit', quizData);
    return response;
  },

  // Alias para compatibilidad con el store
  async submitQuizAnswer(lessonId, stepId, answer) {
    // Construir el objeto que espera el backend
    const quizData = {
      lessonId: lessonId,
      stepId: stepId,
      answer: answer
    };
    console.log('🚀 REAL SERVICE - Enviando quiz data al backend:', quizData);
    return this.submitQuiz(quizData);
  },

  // Nuevos endpoints para sistema de repasos
  async getReviewStatus(lessonId) {
    const response = await httpClient.get(`/learn/lessons/${lessonId}/review/status`);
    return processImageUrls(response);
  },

  async getNextReviewStep(lessonId) {
    const response = await httpClient.get(`/learn/lessons/${lessonId}/review/next`);
    return processImageUrls(response);
  },

  async resetReviewQueue(lessonId) {
    const response = await httpClient.post(`/learn/lessons/${lessonId}/review/reset`);
    return processImageUrls(response);
  }
};

// Servicios mock (solo para desarrollo cuando USE_MOCK_DATA es true)
const mockLearnService = {
  async getLearnDashboard() {
    // Simulamos delay de red
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockData = {
      user: {
        name: "Ana García",
        level: 12,
        coins: 1250,
        xp: 3400,
        streak: 7
      },
      units: [
        {
          id: "u1",
          title: "Fundamentos del Dinero",
          description: "Aprende los conceptos básicos sobre el dinero",
          progress: 65,
          totalSkills: 3,
          completedSkills: 2,
          image: "/images/units/money-basics.jpg"
        },
        {
          id: "u2", 
          title: "Ahorro e Inversión",
          description: "Estrategias para hacer crecer tu dinero",
          progress: 30,
          totalSkills: 4,
          completedSkills: 1,
          image: "/images/units/saving-investment.jpg"
        }
      ]
    };
    
    return processImageUrls(mockData);
  },

  async getLessonIntro(lessonId) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const lessonData = mockLessonSteps[lessonId];
    if (!lessonData) {
      throw new Error(`Lección ${lessonId} no encontrada`);
    }

    const mockData = {
      id: lessonData.id,
      title: lessonData.title,
      description: lessonData.description,
      firstStepId: lessonData.firstStepId,
      firstStepType: lessonData.firstStepType,
      totalSteps: lessonData.totalSteps,
      estimatedTime: '10-15 min',
      coinsReward: 50,
      xpReward: 100
    };
    
    return processImageUrls(mockData);
  },

  async getLessonStep(lessonId, stepId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const lessonData = mockLessonSteps[lessonId];
    if (!lessonData) {
      throw new Error(`Lección ${lessonId} no encontrada`);
    }

    const step = lessonData.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step ${stepId} no encontrado en lección ${lessonId}`);
    }

    const currentStepNumber = parseInt(stepId.split('s').pop()) || 1;
    const isLastStep = currentStepNumber >= lessonData.totalSteps;
    
    const mockData = {
      ...step,
      totalSteps: lessonData.totalSteps,
      currentStepNumber,
      isLastStep,
      allSteps: lessonData.steps, // Para navegación inteligente
      progressPercentage: (currentStepNumber / lessonData.totalSteps) * 100
    };
    
    return processImageUrls(mockData);
  },

  getUnitSkills: (unitId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const mockUnitSkills = [
          {
            unitId: 'unit1',
            title: 'Unidad 1: Habilidades',
            skills: [
              { id: 'skill1-1', title: '¿Qué es el dinero?', image: '/images/u1h1.jpg', progress: 100 },
              { id: 'skill1-2', title: 'Ingresos y gastos', image: '/images/u1h2.jpg', progress: 60 },
              { id: 'skill1-3', title: 'Ahorro:<br>El primer paso', image: '/images/u1h3.jpg', progress: 25 },
              { id: 'skill1-4', title: 'Deuda:<br>Amiga o Enemiga', image: '/images/u1h4.jpg', progress: 0 },
              { id: 'skill1-5', title: 'Metas Financieras', image: '/images/u1h5.jpg', progress: 0 },
            ]
          }
        ];
        const unitSkills = mockUnitSkills.find(us => us.unitId === unitId);
        if (unitSkills) {
          resolve(processImageUrls(unitSkills));
        } else {
          reject({ message: `Habilidades para la unidad ${unitId} no encontradas.` });
        }
      }, MOCK_DELAY);
    });
  },

  async getSkillLessons(skillId) {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Mock data para lecciones de skills
    const mockSkillLessons = {
      'u1s1': {
        skillId: 'u1s1',
        title: '¿Qué es el Dinero?',
        lessons: [
          {
            id: 'u1s1l1',
            title: 'Nivel 1: Funciones del Dinero',
            description: 'Historia básica y funciones del dinero',
            image: '/images/lessons/u1s1l1.jpg',
            type: 'lesson',
            totalSteps: 5,
            coinsReward: 50,
            xpReward: 100,
            progress: 100,
            status: 'completed'
          }
        ]
      }
    };

    const skillLessons = mockSkillLessons[skillId];
    if (skillLessons) {
      return processImageUrls(skillLessons);
    } else {
      throw new Error(`Lecciones para skill ${skillId} no encontradas.`);
    }
  },

  getLevelCompletedData: (levelId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const levelData = mockLevelCompletedData[levelId];
        if (levelData) {
          resolve(processImageUrls(levelData));
        } else {
          reject({ message: `Datos de nivel completado para ${levelId} no encontrados.` });
        }
      }, MOCK_DELAY);
    });
  },

  submitQuiz: (quizData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Mock: Quiz submitted:', quizData);
        resolve({ 
          success: true, 
          score: Math.floor(Math.random() * 100) + 1,
          message: 'Quiz completado correctamente'
        });
      }, MOCK_DELAY);
    });
  },

  // Alias para compatibilidad con el store
  submitQuizAnswer: (lessonId, stepId, answer) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const quizData = {
          lessonId: lessonId,
          stepId: stepId,
          answer: answer
        };
        console.log('🚀 MOCK SERVICE - Quiz answer submitted:', quizData);
        resolve({ 
          success: true, 
          correct: Math.random() > 0.5, // 50% de probabilidad de ser correcto
          message: Math.random() > 0.5 ? '¡Correcto!' : 'Respuesta incorrecta'
        });
      }, MOCK_DELAY);
    });
  },

  // Métodos mock para sistema de repasos
  getReviewStatus: (lessonId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simular que a veces hay repasos pendientes
        const hasPendingReviews = Math.random() > 0.7; // 30% probabilidad de tener repasos
        const pendingCount = hasPendingReviews ? Math.floor(Math.random() * 3) + 1 : 0;
        
        console.log('🚀 MOCK SERVICE - Review status:', { lessonId, hasPendingReviews, pendingCount });
        resolve({
          lessonId,
          hasPendingReviews,
          pendingReviewsCount: pendingCount,
          nextReviewStepId: hasPendingReviews ? `${lessonId}s${pendingCount + 2}` : null,
          message: hasPendingReviews ? `Tienes ${pendingCount} pregunta(s) pendiente(s) de repaso` : 'No hay repasos pendientes'
        });
      }, MOCK_DELAY);
    });
  },

  getNextReviewStep: (lessonId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simular que a veces no hay más steps de repaso
        if (Math.random() > 0.6) {
          console.log('🚀 MOCK SERVICE - No more review steps');
          reject(new Error('No hay más pasos de repaso'));
          return;
        }

        // Simular un step de repaso (mismo formato que step normal)
        const reviewStep = {
          id: `${lessonId}s3`, // Ejemplo de step de repaso
          lessonId: lessonId,
          type: 'quiz',
          title: 'Repaso: Ejercicio sobre el Trueque',
          question: '¿Cuál era el principal problema del trueque?',
          options: [
            { id: 'a', text: 'Era muy fácil' },
            { id: 'b', text: 'Requería coincidencia de necesidades' },
            { id: 'c', text: 'Era muy rápido' }
          ],
          feedback: {
            correct: '¡Correcto! Ese era el principal problema.',
            incorrect: 'No exactamente. El problema era la coincidencia de necesidades.'
          },
          isLastStep: false,
          isReviewStep: true // Indicador especial para el frontend
        };

        console.log('🚀 MOCK SERVICE - Next review step:', reviewStep);
        resolve(reviewStep);
      }, MOCK_DELAY);
    });
  },

  resetReviewQueue: (lessonId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('🚀 MOCK SERVICE - Review queue reset for:', lessonId);
        resolve({ success: true, message: 'Cola de repasos reseteada' });
      }, MOCK_DELAY);
    });
  }
};

export default USE_MOCK_DATA ? mockLearnService : realLearnService; 