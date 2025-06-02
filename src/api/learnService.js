import httpClient from './httpClient';
import { API_CONFIG } from '../config/api.js';
import {
  mockLessonIntros,
  mockLessonSteps,
  mockLevelCompletedData
} from './_mockData';

const USE_MOCK_DATA = API_CONFIG.USE_MOCK_DATA;
const MOCK_DELAY = 400;

// Servicios reales para API
const realLearnService = {
  async getLearnDashboard() {
    const response = await httpClient.get('/learn/dashboard');
    return response;
  },

  async getUnitSkills(unitId) {
    const response = await httpClient.get(`/learn/units/${unitId}/skills`);
    return response;
  },

  async getSkillLessons(skillId) {
    const response = await httpClient.get(`/learn/skills/${skillId}/lessons`);
    return response;
  },

  // Los siguientes endpoints están en desarrollo, mantenemos mock por ahora
  async getLessonIntro(lessonId) {
    // Mock temporal hasta que el backend implemente este endpoint
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const intro = mockLessonIntros[lessonId];
    if (intro) {
      return intro;
    } else {
      throw new Error(`Introducción para lección ${lessonId} no encontrada.`);
    }
  },

  async getLessonStep(lessonId, stepId) {
    // Mock temporal hasta que el backend implemente este endpoint
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const lesson = mockLessonSteps[lessonId];
    if (lesson && lesson.steps && lesson.steps[stepId]) {
      return { id: stepId, lessonId, ...lesson.steps[stepId] };
    } else {
      throw new Error(`Paso ${stepId} para lección ${lessonId} no encontrado.`);
    }
  },

  async getLevelCompletedData(levelId) {
    // Mock temporal hasta que el backend implemente este endpoint
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    const levelData = mockLevelCompletedData[levelId];
    if (levelData) {
      return levelData;
    } else {
      throw new Error(`Datos de nivel completado para ${levelId} no encontrados.`);
    }
  },

  async submitQuiz(quizData) {
    // Mock temporal hasta que el backend implemente este endpoint
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    console.log('Mock: Quiz submitted:', quizData);
    return { 
      success: true, 
      score: Math.floor(Math.random() * 100) + 1,
      message: 'Quiz completado correctamente'
    };
  }
};

// Servicios mock (solo para desarrollo cuando USE_MOCK_DATA es true)
const mockLearnService = {
  getLearnDashboard: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const generalProgress = Math.floor(Math.random() * 100);
        resolve({
          generalProgress,
          units: [
            { id: 'unit1', title: 'Unidad 1:<br>Fundamentos del Dinero', description: 'Conoce las bases del dinero y tus finanzas.', image: '/images/unidad1.jpg', bgColor: '#FBEAE3' },
            { id: 'unit2', title: 'Unidad 2:<br>Introducción a la Inversión', description: 'Empieza a entender cómo hacer crecer tu dinero.', image: '/images/unidad2.jpg', bgColor: '#FDF0F3'},
            { id: 'unit3', title: 'Unidad 3:<br>¿Dónde Puedo Invertir?', description: 'Descubre los tipos básicos de activos.', image: '/images/unidad3.jpg', bgColor: '#FBEAE3' },
            { id: 'unit4', title: 'Unidad 4:<br>Primeros Pasos como Inversor', description: 'Aprende cómo comenzar a invertir.', image: '/images/unidad4.jpg', bgColor: '#F5F5F5' }
          ],
        });
      }, MOCK_DELAY);
    });
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
          resolve(unitSkills);
        } else {
          reject({ message: `Habilidades para la unidad ${unitId} no encontradas.` });
        }
      }, MOCK_DELAY);
    });
  },

  getLessonIntro: (lessonId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const intro = mockLessonIntros[lessonId];
        if (intro) {
          resolve(intro);
        } else {
          reject({ message: `Introducción para lección ${lessonId} no encontrada.` });
        }
      }, MOCK_DELAY);
    });
  },

  getLessonStep: (lessonId, stepId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const lesson = mockLessonSteps[lessonId];
        if (lesson && lesson.steps && lesson.steps[stepId]) {
          resolve({ id: stepId, lessonId, ...lesson.steps[stepId] });
        } else {
          reject({ message: `Paso ${stepId} para lección ${lessonId} no encontrado.` });
        }
      }, MOCK_DELAY);
    });
  },

  getLevelCompletedData: (levelId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const levelData = mockLevelCompletedData[levelId];
        if (levelData) {
          resolve(levelData);
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
  }
};

export default USE_MOCK_DATA ? mockLearnService : realLearnService; 