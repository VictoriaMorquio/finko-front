import { defineStore } from 'pinia'
import chatService from '@/api/chatService'

export const useChatStore = defineStore('chat', {
  state: () => ({
    messages: [],
    isLoadingResponse: false,
    error: null,
  }),
  actions: {
    async fetchInitialMessages() {
      this.isLoadingResponse = true
      this.error = null
      try {
        const initialMessages = await chatService.getInitialMessages()
        this.messages = initialMessages
      } catch (err) {
        this.error = err.message || 'Fallo al cargar mensajes iniciales.'
        console.error(err)
      } finally {
        this.isLoadingResponse = false
      }
    },
    async sendMessage(text) {
      if (!text.trim()) return

      const userMessage = {
        id: `msg-${Date.now()}`,
        text: text.trim(),
        sender: 'user',
        timestamp: new Date().toISOString(),
      }

      this.messages.push(userMessage)
      this.isLoadingResponse = true
      this.error = null

      try {
        const iaResponse = await chatService.getIaResponse(text.trim())
        this.messages.push(iaResponse)
      } catch (err) {
        this.error = err.message || 'Fallo al obtener respuesta del IA.'
        this.messages.push({
          id: `err-${Date.now()}`,
          text: "Lo siento, no pude procesar tu solicitud en este momento.",
          sender: 'ia',
          timestamp: new Date().toISOString()
        })
        console.error(err)
      } finally {
        this.isLoadingResponse = false
      }
    },
    clearChat() {
      this.messages = []
      this.fetchInitialMessages()
    }
  },
}) 