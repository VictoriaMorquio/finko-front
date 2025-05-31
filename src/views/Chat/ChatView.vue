<template>
  <div class="chat-page-container">
    <PageHeader
        title="Resuelve dudas"
        :show-back="true"
        :back-route="{ name: 'LearnDashboard' }"
    />

    <main class="chat-messages-area" ref="chatArea">
      <ChatMessage
        v-for="message in chatStore.messages"
        :key="message.id"
        :message="message"
        :user-name="authStore.currentUser?.username || 'Tú'"
        :user-avatar="authStore.currentUser?.profilePic || '/images/avatar-pedro.png'"
      />
      <div v-if="chatStore.isLoadingResponse" class="typing-indicator">
        Asistente está escribiendo...
      </div>
    </main>

    <footer class="chat-input-container">
      <input
        type="text"
        v-model="newMessage"
        placeholder="Resuelve tu duda"
        @keypress.enter="sendMessage"
        :disabled="chatStore.isLoadingResponse"
      >
      <BaseButton
        @click="sendMessage"
        :disabled="chatStore.isLoadingResponse || !newMessage.trim()"
        variant="finko-signup"
        style="margin-left: 10px; padding: 12px 18px; border-radius: 25px; min-width: auto;"
        :full-width="false"
      >
        Enviar
      </BaseButton>
    </footer>
    <!-- BottomNavigationBar es global -->
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import { useChatStore } from '@/stores/chat';
import { useAuthStore } from '@/stores/auth';
import PageHeader from '@/components/common/PageHeader.vue';
import ChatMessage from '@/components/chat/ChatMessage.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const chatStore = useChatStore();
const authStore = useAuthStore();
const newMessage = ref('');
const chatArea = ref(null);

onMounted(() => {
  if (chatStore.messages.length === 0) {
    chatStore.fetchInitialMessages();
  }
  scrollToBottom();
});

watch(() => chatStore.messages, () => {
  nextTick(() => {
    scrollToBottom();
  });
}, { deep: true });

const sendMessage = () => {
  if (newMessage.value.trim() && !chatStore.isLoadingResponse) {
    chatStore.sendMessage(newMessage.value);
    newMessage.value = '';
  }
};

const scrollToBottom = () => {
  if (chatArea.value) {
    chatArea.value.scrollTop = chatArea.value.scrollHeight;
  }
};
</script>

<style scoped>
/* Estilos de resuelve-dudas.html */
.chat-page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* App.vue maneja el padding-bottom para la nav bar */
}
/* PageHeader maneja la cabecera */

.chat-messages-area {
  padding: 20px 15px;
  flex-grow: 1;
  overflow-y: auto;
  background-color: #FFFFFF;
}
/* ChatMessage es un componente */

.typing-indicator {
    font-style: italic;
    color: #757575;
    padding: 5px 0 10px 60px; /* Alineado con burbujas IA */
    font-size: 14px;
}


.chat-input-container {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: #FFFFFF;
  border-top: 1px solid #F0F0F0;
  /* position: sticky;
  bottom: 70px;  App.vue ahora añade padding-bottom global, así que no es necesario que sea sticky con offset.
                Se quedará pegado al final del contenido antes de la nav bar.
                Si se quiere que esté siempre visible incluso con scroll, entonces sí sticky.
  */
   position: sticky;
   bottom: 0; /* Se pega al fondo del viewport, pero App.vue tiene padding-bottom de 70px */
   z-index: 999; /* Debajo de la nav bar principal pero encima del contenido */
   margin-bottom: -70px; /* Compensar el padding-bottom de App.vue */
}
 #app-container:has(.bottom-nav) .chat-input-container {
    /* Si la nav bar está presente, el input se pega encima de ella */
    bottom: 70px;
    margin-bottom: 0; /* No necesita compensación */
}


.chat-input-container input[type="text"] {
  flex-grow: 1;
  padding: 14px 18px;
  border: none;
  border-radius: 25px;
  background-color: #F5F3F7;
  font-size: 15px;
  color: #333333;
  outline: none;
}
.chat-input-container input::placeholder {
  color: #A098A7;
}

@media (max-width: 360px) {
  .chat-input-container input[type="text"] { font-size: 14px; padding: 12px 15px; }
}
</style> 