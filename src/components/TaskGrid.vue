<script setup>
import TaskCard from './TaskCard.vue'

// Grid enruta eventos de cada tarjeta y ofrece un estado vacío cuando no hay coincidencias.
// The grid routes each card's events and provides an empty state when nothing matches.
defineProps({
  tasks: { type: Array, required: true },
  projects: { type: Array, required: true },
})

defineEmits(['toggle', 'edit', 'delete', 'add'])
</script>

<template>
  <TransitionGroup v-if="tasks.length" name="task-list" tag="section" class="task-grid" aria-label="Lista de tareas">
    <TaskCard
      v-for="task in tasks"
      :key="task.id"
      :task="task"
      :project-name="projects.find((project) => project.id === task.projectId)?.name || 'Sin proyecto'"
      @toggle="$emit('toggle', $event)"
      @edit="$emit('edit', $event)"
      @delete="$emit('delete', $event)"
    />
  </TransitionGroup>

  <section v-else class="empty-state">
    <div class="empty-icon" aria-hidden="true">✳</div>
    <h2>Todo despejado por aquí</h2>
    <p>No encontramos tareas con estos filtros. Prueba a cambiarlos o crea una nueva.</p>
    <button class="button button-primary" type="button" @click="$emit('add')">Crear una tarea</button>
  </section>
</template>
