<template>
  <div class="message-group" :class="{ 'user-message': message.sender === 'user', 'ia-message': message.sender === 'ia' }">
    <div class="message-sender-name">{{ senderName }}</div>
    <div class="message-row">
      <img :src="avatarSrc" :alt="`Avatar ${senderName}`" class="avatar">
      <div class="message-bubble">
        {{ message.text }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  message: {
    type: Object,
    required: true,
    // Espera: { id: '1', text: 'Hola', sender: 'user'/'ia', timestamp: ... }
    //         o { id: '1', text: 'Hola', sender: { type: 'user'/'ia', name: 'Pedro', avatar: '...' }, timestamp: ... }
  },
  userName: { // Nombre del usuario actual para mostrar "Tú" o su nombre
      type: String,
      default: "Pedro" // Desde el HTML de ejemplo
  },
  iaName: {
      type: String,
      default: "Asistente financiero IA"
  },
  userAvatar: {
      type: String,
      default: "/images/avatar-pedro.png"
  },
  iaAvatar: {
      type: String,
      default: "/images/avatar-ia.png"
  }
});

const senderName = computed(() => {
  if (props.message.sender === 'user') {
    // Podrías usar el nombre del usuario del store si está logueado
    return "Tú"; // O props.userName
  }
  return props.iaName;
});

const avatarSrc = computed(() => {
  return props.message.sender === 'user' ? props.userAvatar : props.iaAvatar;
});
</script>

<style scoped>
/* Copied from resuelve-dudas.html (chat) */
.message-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.message-sender-name {
  font-size: 13px;
  color: #757575;
  margin-bottom: 4px;
}

.message-row {
  display: flex;
  align-items: flex-end; /* Alinea el avatar con la parte inferior de la burbuja */
  gap: 10px;
}

.message-bubble {
  max-width: 75%;
  padding: 12px 15px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.5;
  word-wrap: break-word;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  background-color: #E0E0E0; /* Placeholder si la imagen no carga */
  flex-shrink: 0; /* Evita que el avatar se encoja */
}

/* Mensajes del Asistente IA */
.ia-message .message-sender-name {
  text-align: left;
  margin-left: 46px; /* Espacio del avatar + gap */
}
.ia-message .message-bubble {
  background-color: #F5F3F7; /* Un lila/gris muy pálido */
  color: #333333;
  border-bottom-left-radius: 5px;
}

/* Mensajes del Usuario */
.user-message {
  align-self: flex-end;
}
.user-message .message-sender-name {
  text-align: right;
  margin-right: 46px;
}
.user-message .message-row {
  flex-direction: row-reverse;
}
.user-message .message-bubble {
  background-color: #FF007F; /* Fucsia */
  color: white;
  border-bottom-right-radius: 5px;
}

@media (max-width: 360px) {
  .message-bubble { font-size: 14px; padding: 10px 12px;}
  .avatar { width: 32px; height: 32px; }
  .ia-message .message-sender-name { margin-left: 42px; }
  .user-message .message-sender-name { margin-right: 42px; }
}
</style> 