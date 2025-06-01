<template>
  <div class="contact-page">
    <PageHeader
      title="Contacta con nosotros"
      :show-back="true"
      :back-route="{ name: 'Settings' }"
    />

    <main class="contact-content">
      <!-- Información principal -->
      <section class="contact-intro">
        <div class="contact-logo">
          <img src="/finko-logo.png" alt="Finko Logo" class="logo">
        </div>
        <p class="contact-description">
          ¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para ayudarte. 
          Puedes contactarnos a través de cualquiera de los siguientes medios.
        </p>
      </section>

      <!-- Información de contacto -->
      <section class="contact-info">
        <div class="contact-item">
          <div class="contact-icon">📧</div>
          <div class="contact-details">
            <h3>Email</h3>
            <p>soporte@finkofinance.com</p>
            <span class="contact-note">Respuesta en 24-48 horas</span>
          </div>
        </div>

        <div class="contact-item">
          <div class="contact-icon">📱</div>
          <div class="contact-details">
            <h3>WhatsApp</h3>
            <p>+34 660 062 181</p>
            <span class="contact-note">Lunes a Viernes, 9:00 - 18:00</span>
          </div>
        </div>

        <div class="contact-item">
          <div class="contact-icon">🌐</div>
          <div class="contact-details">
            <h3>Sitio Web</h3>
            <p>www.finkofinance.com</p>
            <span class="contact-note">Recursos y preguntas frecuentes</span>
          </div>
        </div>
      </section>

      <!-- Horarios de atención -->
      <section class="contact-schedule">
        <h2>Horarios de Atención</h2>
        <div class="schedule-grid">
          <div class="schedule-item">
            <span class="day">Lunes - Viernes</span>
            <span class="time">9:00 - 18:00</span>
          </div>
          <div class="schedule-item">
            <span class="day">Fines de semana</span>
            <span class="time">Cerrado</span>
          </div>
        </div>
      </section>

      <!-- Información adicional -->
      <section class="contact-additional">
        <div class="info-box">
          <h3>🚀 ¿Problemas técnicos?</h3>
          <p>Si experimentas algún problema técnico con la app, por favor incluye:</p>
          <ul>
            <li>Descripción detallada del problema</li>
            <li>Dispositivo y versión del sistema</li>
            <li>Pasos para reproducir el error</li>
          </ul>
        </div>

        <div class="info-box">
          <h3>💡 ¿Sugerencias?</h3>
          <p>¡Nos encanta escuchar tus ideas! Envíanos tus sugerencias para mejorar Finko y ayudarte a alcanzar tus objetivos financieros.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import PageHeader from '@/components/common/PageHeader.vue';
</script>

<style scoped>
.contact-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #FFFFFF;
}

.contact-content {
  padding: 20px;
  flex-grow: 1;
}

/* Sección de introducción */
.contact-intro {
  text-align: center;
  margin-bottom: 30px;
}

.contact-logo {
  margin-bottom: 20px;
}

.logo {
  width: 80px;
  height: auto;
}

.contact-description {
  font-size: 16px;
  color: #666666;
  line-height: 1.5;
  margin: 0;
}

/* Información de contacto */
.contact-info {
  margin-bottom: 30px;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  padding: 20px 0;
  border-bottom: 1px solid #F0F0F0;
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-icon {
  font-size: 24px;
  margin-right: 15px;
  margin-top: 5px;
}

.contact-details {
  flex: 1;
}

.contact-details h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111111;
  margin: 0 0 5px 0;
}

.contact-details p {
  font-size: 16px;
  color: #333333;
  margin: 0 0 5px 0;
  line-height: 1.4;
}

.contact-note {
  font-size: 14px;
  color: #888888;
  font-style: italic;
}

/* Horarios */
.contact-schedule {
  margin-bottom: 30px;
}

.contact-schedule h2 {
  font-size: 20px;
  font-weight: 600;
  color: #111111;
  margin-bottom: 15px;
  text-align: center;
}

.schedule-grid {
  background-color: #F8F9FA;
  border-radius: 12px;
  padding: 20px;
}

.schedule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #E0E0E0;
}

.schedule-item:last-child {
  border-bottom: none;
}

.day {
  font-weight: 500;
  color: #333333;
}

.time {
  color: #FF007F;
  font-weight: 600;
}

/* Información adicional */
.contact-additional {
  margin-bottom: 20px;
}

.info-box {
  background-color: #F8F9FA;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
}

.info-box:last-child {
  margin-bottom: 0;
}

.info-box h3 {
  font-size: 16px;
  font-weight: 600;
  color: #111111;
  margin: 0 0 10px 0;
}

.info-box p {
  font-size: 14px;
  color: #666666;
  margin: 0 0 10px 0;
  line-height: 1.5;
}

.info-box ul {
  margin: 0;
  padding-left: 20px;
}

.info-box li {
  font-size: 14px;
  color: #666666;
  margin-bottom: 5px;
  line-height: 1.4;
}

.info-box li:last-child {
  margin-bottom: 0;
}

/* Responsive */
@media (max-width: 360px) {
  .contact-content {
    padding: 15px;
  }
  
  .contact-description {
    font-size: 15px;
  }
  
  .contact-details h3 {
    font-size: 17px;
  }
  
  .contact-details p {
    font-size: 15px;
  }
  
  .contact-schedule h2 {
    font-size: 19px;
  }
  
  .schedule-grid,
  .info-box {
    padding: 15px;
  }
}
</style> 