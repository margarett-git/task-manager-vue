<script setup>
import ApiStatusBadge from './ApiStatusBadge.vue'

// Props y eventos mantienen la navegación desacoplada del estado global de tareas.
// Props and events keep navigation decoupled from the global task state.
defineProps({
  pendingCount: { type: Number, required: true },
  completedCount: { type: Number, required: true },
  theme: { type: String, required: true },
  apiStatus: { type: String, required: true },
  apiError: { type: String, default: '' },
})

defineEmits(['toggle-theme', 'add-task'])
</script>

<template>
  <header class="topbar">
    <a class="brand" href="#" aria-label="Taskflow, inicio" @click.prevent>
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M5 12.5 9.2 17 19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </span>
      <span class="brand-name">taskflow<span>.</span></span>
    </a>

    <div class="nav-right">
      <div class="nav-stats" aria-label="Resumen de tareas">
        <span class="nav-stat"><i class="stat-dot pending-dot"></i>{{ pendingCount }} pendientes</span>
        <span class="stat-divider"></span>
        <span class="nav-stat"><i class="stat-dot complete-dot"></i>{{ completedCount }} completadas</span>
      </div>
      <ApiStatusBadge :status="apiStatus" :error="apiError" />
      <button
        class="icon-button theme-toggle"
        type="button"
        :aria-label="theme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'"
        :title="theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'"
        @click="$emit('toggle-theme')"
      >
        <svg v-if="theme === 'dark'" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.5 15.3A8.5 8.5 0 0 1 8.7 3.5 8.5 8.5 0 1 0 20.5 15.3Z" />
        </svg>
      </button>
      <button class="button button-primary nav-add" type="button" @click="$emit('add-task')">
        <span aria-hidden="true">+</span><span>Nueva tarea</span>
      </button>
    </div>
  </header>
</template>
