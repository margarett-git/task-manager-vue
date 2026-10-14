<script setup>
import { computed } from 'vue'

// La tarjeta presenta una tarea y comunica las acciones al grid sin modificar props.
// The card displays one task and emits actions to the grid without mutating props.
const props = defineProps({
  task: { type: Object, required: true },
  projectName: { type: String, required: true },
})

defineEmits(['toggle', 'edit', 'delete'])

const priorityLabels = { high: 'Alta', medium: 'Media', low: 'Baja' }

const formattedDate = computed(() => {
  if (!props.task.dueDate) return ''
  return new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short' }).format(
    new Date(`${props.task.dueDate}T00:00:00`),
  )
})
</script>

<template>
  <article class="task-card" :class="[`priority-${task.priority}`, { 'task-completed': task.completed }]">
    <div class="card-topline">
      <span class="category-label">
        <i class="category-dot"></i>{{ task.category || 'General' }}
      </span>
      <div class="card-actions">
        <button class="card-icon-button" type="button" aria-label="Editar tarea" title="Editar" @click="$emit('edit', task)">↗</button>
        <button class="card-icon-button card-delete" type="button" aria-label="Eliminar tarea" title="Eliminar" @click="$emit('delete', task.id)">×</button>
      </div>
    </div>

    <div class="card-main">
      <button
        class="task-check"
        :class="{ checked: task.completed }"
        type="button"
        :aria-label="task.completed ? 'Marcar como pendiente' : 'Marcar como completada'"
        @click="$emit('toggle', task.id)"
      >
        <svg v-if="task.completed" viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8 3 3 6-6"></path></svg>
      </button>
      <div class="task-copy">
        <h3>{{ task.title }}</h3>
        <p v-if="task.description">{{ task.description }}</p>
        <p v-else class="task-description-empty">Sin descripción</p>
      </div>
    </div>

    <footer class="card-footer">
      <div class="card-meta">
        <span class="project-label">{{ projectName }}</span>
        <span class="priority-label"><i class="priority-mark"></i>{{ priorityLabels[task.priority] }}</span>
        <span v-if="formattedDate" class="due-date">
          <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2.2" y="3.5" width="11.6" height="10" rx="1.8"></rect><path d="M5 2v3m6-3v3M2.5 6.5h11"></path></svg>
          {{ formattedDate }}
        </span>
      </div>
      <span class="card-state">{{ task.completed ? 'Listo' : 'En curso' }}</span>
    </footer>
  </article>
</template>
