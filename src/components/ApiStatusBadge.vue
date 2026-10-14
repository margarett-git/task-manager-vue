<script setup>
// El componente traduce estados técnicos a señales visibles y accesibles para la persona usuaria.
// This component turns technical states into visible, accessible feedback for the user.
defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['idle', 'loading', 'syncing', 'synced', 'error'].includes(value),
  },
  error: { type: String, default: '' },
})

const labels = {
  idle: 'Sin conexión',
  loading: 'Conectando',
  syncing: 'Sincronizando',
  synced: 'Sincronizado',
  error: 'Modo local',
}
</script>

<template>
  <span
    class="api-badge"
    :class="`api-${status}`"
    :title="error || labels[status]"
    role="status"
    aria-live="polite"
  >
    <span class="api-indicator"></span>
    <span>{{ labels[status] }}</span>
  </span>
</template>
