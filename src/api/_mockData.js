// src/api/_mockData.js

// Para authService y profileService
export let users = [ // 'export let' para permitir modificaciones desde los servicios (ej. signup, delete)
  {
    id: '1',
    email: 'pedro@finko.com',
    username: 'pedrogarcia',
    fullname: 'Pedro García',
    password: '123456', // En una real app, hashed
    joinDate: '2024',
    profilePic: '/images/profile-pic.png',
    stats: {
      coins: 12345,
      currentStreak: 12,
      levelsCompleted: 12,
    },
    achievements: [
      { id: 'ach1', title: 'Primera lección', image: '/images/achievement1.png', bgColor: '#FCE9BF' },
      { id: 'ach2', title: 'Racha de 5 días', image: '/images/achievement2.png', bgColor: '#FADBC5' },
      { id: 'ach3', title: '10 Niveles', image: '/images/achievement3.png', bgColor: '#F0F0F0' },
    ]
  }
];


// Para learnService
export const mockUnits = [
  { id: 'unit1', title: 'Unidad 1:<br>Fundamentos del Dinero', description: 'Conoce las bases del dinero y tus finanzas.', image: '/images/unidad1.jpg', bgColor: '#FBEAE3' },
  { id: 'unit2', title: 'Unidad 2:<br>Introducción a la Inversión', description: 'Empieza a entender cómo hacer crecer tu dinero.', image: '/images/unidad2.jpg', bgColor: '#FDF0F3'},
  { id: 'unit3', title: 'Unidad 3:<br>¿Dónde Puedo Invertir?', description: 'Descubre los tipos básicos de activos.', image: '/images/unidad3.jpg', bgColor: '#FBEAE3' },
  { id: 'unit4', title: 'Unidad 4:<br>Primeros Pasos como Inversor', description: 'Aprende cómo comenzar a invertir.', image: '/images/unidad4.jpg', bgColor: '#F5F5F5' },
  { id: 'unit5', title: 'Unidad 5:<br>Estrategias Avanzadas', description: 'Explora técnicas más sofisticadas.', image: '/images/unidad5.jpg', bgColor: '#FBEAE3' },
  { id: 'unit6', title: 'Unidad 6:<br>Planificación Financiera', description: 'Crea un plan sólido para tu futuro.', image: '/images/unidad6.jpg', bgColor: '#FDF0F3' },
];

export const mockUnitSkills = [
  {
    unitId: 'unit1',
    title: 'Unidad 1: Habilidades', // Título principal de la pantalla de habilidades
    skills: [
      { id: 'skill1-1', title: '¿Qué es el dinero?', image: '/images/u1h1.jpg', progress: 100 },
      { id: 'skill1-2', title: 'Ingresos y gastos', image: '/images/u1h2.jpg', progress: 60 },
      { id: 'skill1-3', title: 'Ahorro:<br>El primer paso', image: '/images/u1h3.jpg', progress: 25 },
      { id: 'skill1-4', title: 'Deuda:<br>Amiga o Enemiga', image: '/images/u1h4.jpg', progress: 0 },
      { id: 'skill1-5', title: 'Metas Financieras', image: '/images/u1h5.jpg', progress: 0 },
    ]
  },
  // ... más habilidades para otras unidades
];

export const mockLessonIntros = {
    'u1s1l1': { // Nueva lección con flujo completo de 5 steps
        id: 'u1s1l1',
        title: "Nivel 1: Funciones del Dinero",
        description: "Aprende qué es el dinero, sus funciones principales y cómo ha evolucionado a lo largo de la historia. Este nivel te dará una base sólida sobre conceptos financieros fundamentales.",
        image: "/images/lessons/money-intro.jpg",
        type: 'intro',
        firstStepId: 'u1s1l1s1',
        firstStepType: 'content'
    },
    'skill1-1': { // Corresponde al ID de la habilidad que inicia esta lección/nivel
        id: 'lesson1', // ID de la lección/nivel
        title: "Nivel 1",
        description: "¡Bienvenido al mundo de las finanzas personales! En este nivel, aprenderás los fundamentos del presupuesto, el ahorro y la inversión. ¡Prepárate para tomar el control de tu futuro financiero!",
        image: "/images/nivel1.png", // Imagen grande para la intro del nivel
        type: 'intro',
        firstStepId: 'step1-1-1' // ID del primer paso de esta lección
    },
    // ... más intros para otras lecciones/habilidades
};

export const mockLessonSteps = {
    'u1s1l1': { // ID de la lección
        title: "Nivel 1: Funciones del Dinero", // Título general para la barra de progreso
        totalSteps: 5, // Número total de pasos en esta lección
        firstStepId: 'u1s1l1s1',
        firstStepType: 'content',
        steps: [
            {
                id: 'u1s1l1s1',
                type: 'content',
                title: 'Introducción al dinero',
                text: '<p>El dinero es un medio de intercambio que facilita el comercio...</p>',
                image: '/images/lessons/money-intro.jpg'
            },
            {
                id: 'u1s1l1s2', 
                type: 'true-false',
                statement: 'El dinero siempre ha existido en forma de monedas y billetes',
                correctAnswer: 'false',
                feedback: {
                    correct: '¡Correcto! El dinero ha evolucionado desde el trueque hasta las formas digitales actuales.',
                    incorrect: 'No es correcto. El dinero ha tenido muchas formas a lo largo de la historia, desde el trueque hasta las monedas digitales.'
                }
            },
            {
                id: 'u1s1l1s3',
                type: 'content', 
                title: 'Funciones del dinero',
                text: '<p>El dinero cumple tres funciones principales: medio de intercambio, unidad de cuenta y reserva de valor...</p>',
                image: '/images/lessons/money-functions.jpg'
            },
            {
                id: 'u1s1l1s4',
                type: 'drag-drop',
                question: 'Clasifica estos elementos según su función monetaria',
                categories: [
                    {
                        id: 'intercambio',
                        title: 'Medio de Intercambio',
                        description: 'Facilita el comercio',
                        color: '#4CAF50'
                    },
                    {
                        id: 'cuenta',
                        title: 'Unidad de Cuenta', 
                        description: 'Mide valor',
                        color: '#2196F3'
                    },
                    {
                        id: 'valor',
                        title: 'Reserva de Valor',
                        description: 'Guarda riqueza',
                        color: '#FF9800'
                    }
                ],
                items: [
                    {
                        id: 'item1',
                        text: 'Comprar café con billetes',
                        correctCategory: 'intercambio'
                    },
                    {
                        id: 'item2', 
                        text: 'Precios en el supermercado',
                        correctCategory: 'cuenta'
                    },
                    {
                        id: 'item3',
                        text: 'Cuenta de ahorros',
                        correctCategory: 'valor'
                    },
                    {
                        id: 'item4',
                        text: 'Pagar la renta',
                        correctCategory: 'intercambio'
                    }
                ]
            },
            {
                id: 'u1s1l1s5',
                type: 'quiz',
                question: '¿Cuál NO es una función del dinero?',
                options: [
                    { id: 'a', text: 'Medio de intercambio' },
                    { id: 'b', text: 'Unidad de cuenta' }, 
                    { id: 'c', text: 'Reserva de valor' },
                    { id: 'd', text: 'Generación de energía' }
                ],
                correctAnswer: 'd',
                feedback: {
                    correct: '¡Exacto! La generación de energía no es una función del dinero.',
                    incorrect: 'Revisa las tres funciones principales del dinero: medio de intercambio, unidad de cuenta y reserva de valor.'
                }
            }
        ]
    },
    'lesson1': { // Mantener compatibilidad con datos anteriores
        title: "Nivel 1: Fundamentos", // Título general para la barra de progreso
        totalSteps: 3, // Número total de pasos en esta lección
        steps: {
            'step1-1-1': { // ID del paso (lessonId-skillId-stepNumber)
                type: 'content', // 'content', 'quiz', 'true-false'
                title: "El Trueque – El Problema Inicial", // Título de la pantalla de lección
                text: "En la antigüedad, las personas intercambiaban bienes y servicios directamente, sin usar dinero. Este sistema, conocido como trueque, presentaba varios desafíos.",
                image: "/images/paso2.png",
                nextStepId: 'step1-1-2',
                progressPercentage: 33,
            },
            'step1-1-2': {
                type: 'quiz',
                image: "/images/paso2.png", // O una imagen relevante para la pregunta
                question: "¿Qué es el ahorro?",
                options: [
                    { id: 'opt1', text: "Es la parte del ingreso que no se destina al gasto y se reserva para necesidades futuras." },
                    { id: 'opt2', text: "Gastar todo el dinero que se recibe inmediatamente." },
                    { id: 'opt3', text: "Invertir en acciones de alto riesgo sin un plan." },
                    { id: 'opt4', text: "Pedir préstamos constantemente para cubrir gastos." }
                ],
                correctAnswer: 'opt1', // ID de la opción correcta
                feedback: {
                    correct: "¡Exacto! Ahorrar es fundamental para la seguridad financiera.",
                    incorrect: "No exactamente. El ahorro implica guardar una porción de tus ingresos."
                },
                nextStepId: 'step1-1-3',
                progressPercentage: 66,
            },
            'step1-1-3': {
                type: 'true-false',
                image: '/images/paso4.png',
                statement: "El trueque es un sistema de intercambio de bienes y servicios sin el uso de dinero.",
                correctAnswer: true, // o 'true' como string si el valor del radio es string
                feedback: {
                    correct: "¡Correcto! Esa es la definición de trueque.",
                    incorrect: "En realidad, esa es la definición correcta de trueque."
                },
                nextStepId: null, // Fin de la lección, podría ir a LevelCompleted
                isLastStep: true, // Indicador de último paso
                progressPercentage: 100,
                levelCompletedId: 'unit1' // ID para la pantalla de nivel completado
            }
            // ... más pasos
        }
    }
    // ... más lecciones
};

export const mockLevelCompletedData = {
    'unit1': { // ID del nivel/unidad completado
        id: 'unit1',
        pageTitle: "Nivel Completado", // Para PageHeader
        headerImage: "/images/level-completed/celebration.png",
        congratsTitle: "¡Enhorabuena!",
        levelName: "Nivel 1: Fundamentos de Finanzas",
        description: "¡Has completado el primer nivel! Ya tienes los conocimientos básicos para comenzar tu aventura financiera.",
        rewards: {
            coins: 100,
            text: "100 monedas ganadas"
        },
        nextRouteName: 'LearnDashboard' // O la siguiente unidad/lección
    },
    'u1s1l1': {
        id: 'u1s1l1',
        pageTitle: "Nivel Completado",
        headerImage: "/images/level-completed/celebration.png",
        congratsTitle: "¡Excelente!",
        levelName: "Lección 1: Funciones del Dinero",
        description: "¡Felicitaciones! Has aprendido las funciones básicas del dinero y estás listo para el siguiente desafío.",
        rewards: {
            coins: 50,
            text: "50 monedas ganadas"
        },
        nextRouteName: 'SkillLessons'
    },
    'u1s1l2': {
        id: 'u1s1l2',
        pageTitle: "Nivel Completado",
        headerImage: "/images/level-completed/celebration.png",
        congratsTitle: "¡Fantástico!",
        levelName: "Lección 2: Historia del Dinero",
        description: "¡Increíble! Has dominado la historia del dinero y su evolución a través del tiempo.",
        rewards: {
            coins: 60,
            text: "60 monedas ganadas"
        },
        nextRouteName: 'SkillLessons'
    }
};


// Para investService
export const mockInvestmentsDashboard = {
  performanceLabel: "Ganancias y pérdidas",
  mainPercentage: +12.5,
  subInfo: 'Desde el inicio <span class="percentage">+12.5%</span>', // HTML permitido aquí
  chartData: {
    series: [{ name: 'Rendimiento', data: [60, 40, 50, 30, 45, 55, 40, 75, 50, 20, 40] }], // 11 puntos
    categories: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov"] // 11 etiquetas
  },
  investments: [
    { id: 'inv1', name: 'Tecnología Innovadora', category: 'Acciones', icon: '/images/inversion-tecno.png', performance: 5.2 },
    { id: 'inv2', name: 'Bonos del Estado', category: 'Bonos', icon: '/images/inversion-bonos.png', performance: -2.1 },
    { id: 'inv3', name: 'Moneda Digital Alfa', category: 'Criptomonedas', icon: '/images/inversion-crypto.png', performance: 10.8 },
    { id: 'inv4', name: 'Startup EcoFriendly', category: 'Private Equity', icon: '/images/inversion-tecno.png', performance: 1.5 },
  ]
};

export const mockInvestmentDetails = {
  'inv1': {
    id: 'inv1',
    name: 'Tecnología Innovadora (TechCorp)',
    stockSymbol: 'TCORP',
    currentPrice: "29456.23", // String para mantener formato
    priceChangeValue: "+320.50 (1.10%)", // Valor y %
    priceChangePeriod: "Hoy", // "Hoy", "1 Año", etc.
    chartData: { // Datos de gráfica para detalle (12 meses)
      series: [{ name: 'Precio', data: [25000, 26000, 25500, 27000, 28000, 27500, 29000, 28500, 30000, 29500, 29300, 29456.23] }],
      categories: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    },
    metrics: [
      { label: "Total Invertido", value: "15,000€" },
      { label: "Retorno", value: "2,500€ (+16.7%)", positive: true },
      { label: "Acciones en Posesión", value: "0.507" },
      { label: "Precio Medio Compra", value: "29,585.79€" },
      { label: "Valor Actual Cartera", value: "17,500€" },
      { label: "Asignación de Cartera", value: "10%" }
    ],
    about: "TechCorp es líder en innovación y desarrollo de software de IA, con un fuerte crecimiento en el mercado global.",
    currentSharesOwned: 0.507 // Para cálculos de venta
  },
  'inv2': {
    id: 'inv2',
    name: 'Bonos del Estado Español',
    stockSymbol: 'ESGOVBOND',
    currentPrice: "102.50",
    priceChangeValue: "-0.15 (-0.15%)",
    priceChangePeriod: "Hoy",
    chartData: {
      series: [{ name: 'Precio', data: [103,102.8,103.1,102.5,102.6,102.2,102.5,102.3,102.6,102.7,102.4,102.5] }],
      categories: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    },
    metrics: [
      { label: "Total Invertido", value: "5,000€" },
      { label: "Retorno", value: "-105€ (-2.1%)", positive: false },
      { label: "Nominal en Posesión", value: "48.78" }, // 5000 / 102.5 (aprox)
      { label: "Precio Medio Compra", value: "103.00€" },
      { label: "Valor Actual Cartera", value: "4,895€" },
      { label: "Asignación de Cartera", value: "5%" }
    ],
    about: "Bonos soberanos emitidos por el gobierno de España, considerados de bajo riesgo.",
    currentSharesOwned: 48.78
  },
  // ... más detalles
};


// Para chatService
export const mockInitialChatMessages = [
  { id: 'init1', text: '¡Hola! Soy tu asistente financiero Finko. ¿Con qué te puedo ayudar hoy?', sender: 'ia', timestamp: new Date(Date.now() - 60000).toISOString() }
];

export const mockIaResponses = {
  "hola": "¡Hola! ¿En qué puedo ayudarte?",
  "adios": "¡Hasta luego! Que tengas un buen día.",
  "gasto e ingreso": "Ingresos: es el dinero que entra a tu cuenta, por ejemplo, tu sueldo. Los gastos son todas las salidas de dinero que tienes al pagar servicios (luz, gas, agua) y bienes (comida, vestimenta, etc.). Pero estos ingresos y gastos pueden ser (ambos) fijos y variables.",
  "invertir": "Invertir es poner tu dinero en algún tipo de activo (como acciones, bonos o bienes raíces) con la expectativa de que genere ganancias o aumente su valor con el tiempo. ¿Te gustaría saber más sobre algún tipo específico de inversión?",
  "ahorro": "El ahorro es la porción de tus ingresos que decides no gastar inmediatamente, reservándola para necesidades futuras, emergencias o para alcanzar metas financieras. Es el primer paso hacia la inversión.",
  "presupuesto": "Un presupuesto es un plan que te ayuda a controlar tus ingresos y gastos. Te permite ver a dónde va tu dinero y tomar decisiones informadas para alcanzar tus objetivos financieros. ¿Quieres que te ayude a crear uno?",
  "gracias": "¡De nada! Estoy aquí para ayudarte."
}; 