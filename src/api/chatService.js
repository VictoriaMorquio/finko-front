import { mockInitialChatMessages, mockIaResponses } from "./_mockData";
const MOCK_DELAY = 600;

export default {
  getInitialMessages: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(JSON.parse(JSON.stringify(mockInitialChatMessages))); // Enviar copia
      }, MOCK_DELAY / 2);
    });
  },

  getIaResponse: (userMessageText) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let responseText = "No entendí tu pregunta. ¿Podrías reformularla?";
        const lowerUserMessage = userMessageText.toLowerCase();

        // Buscar una respuesta mockeada que coincida (simple)
        for (const keyword in mockIaResponses) {
          if (lowerUserMessage.includes(keyword)) {
            responseText = mockIaResponses[keyword];
            break;
          }
        }

        resolve({
          id: `ia-msg-${Date.now()}`,
          text: responseText,
          sender: 'ia', // o { type: 'ia', name: 'Asistente IA', avatar: '...' }
          timestamp: new Date().toISOString(),
        });
      }, MOCK_DELAY);
    });
  },
}; 