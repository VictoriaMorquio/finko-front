import {
    mockUnits,
    mockUnitSkills,
    mockLessonIntros,
    mockLessonSteps,
    mockLevelCompletedData
} from './_mockData';
const MOCK_DELAY = 400;

export default {
  getLearnDashboard: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const generalProgress = Math.floor(Math.random() * 100); // Progreso aleatorio
        resolve({
          generalProgress,
          units: mockUnits,
        });
      }, MOCK_DELAY);
    });
  },

  getUnitSkills: (unitId) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
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

  submitQuizAnswer: (lessonId, stepId, answer) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const lesson = mockLessonSteps[lessonId];
            const step = lesson?.steps?.[stepId];
            if (step && step.type === 'quiz') {
                const isCorrect = step.correctAnswer === answer;
                resolve({
                    correct: isCorrect,
                    correctAnswer: step.correctAnswer, // Enviar la respuesta correcta para feedback
                    feedback: isCorrect ? (step.feedback?.correct || "¡Correcto!") : (step.feedback?.incorrect || "Respuesta incorrecta.")
                });
            } else if (step && step.type === 'true-false') {
                const isCorrect = step.correctAnswer.toString() === answer.toString();
                 resolve({
                    correct: isCorrect,
                    correctAnswer: step.correctAnswer,
                    feedback: isCorrect ? (step.feedback?.correct || "¡Correcto!") : (step.feedback?.incorrect || "Respuesta incorrecta.")
                });
            }
            else {
                reject({ message: "Pregunta no encontrada o no es un quiz." });
            }
        }, MOCK_DELAY / 2);
    });
  },
  getLevelCompletedData: (levelId) => { // levelId puede ser igual a unitId
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const data = mockLevelCompletedData[levelId];
            if (data) {
                resolve(data);
            } else {
                reject({ message: `Datos de nivel completado para ${levelId} no encontrados.` });
            }
        }, MOCK_DELAY);
    });
  }
}; 