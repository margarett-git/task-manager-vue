<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import Navbar from './components/Navbar.vue'
import TaskFilterBar from './components/TaskFilterBar.vue'
import TaskForm from './components/TaskForm.vue'
import TaskGrid from './components/TaskGrid.vue'
import ProjectBar from './components/ProjectBar.vue'
import { useTasks } from './composables/useTasks.js'

// App coordina interacciones y delega la persistencia y reglas de negocio al composable.
// App coordinates interactions and delegates persistence and business rules to the composable.
const {
  state,
  filteredTasks,
  pendingCount,
  completedCount,
  initialize,
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
  setTheme,
  createProject,
  updateProject,
  deleteProject,
} = useTasks()

const isFormOpen = ref(false)
const editingTask = ref(null)
const completedPercentage = computed(() =>
  state.tasks.length ? Math.round((completedCount.value / state.tasks.length) * 100) : 0,
)

watch(
  () => state.theme,
  (theme) => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      theme === 'dark' ? '#151821' : '#f6f7fb',
    )
  },
  { immediate: true },
)

onMounted(initialize)

function openCreateForm() {
  editingTask.value = null
  isFormOpen.value = true
}

function removeProject(id) {
  if (window.confirm('¿Eliminar este proyecto? Sus tareas pasarán a otro proyecto.')) {
    deleteProject(id)
  }
}

function openEditForm(task) {
  editingTask.value = { ...task }
  isFormOpen.value = true
}

function saveTask(values) {
  if (editingTask.value) updateTask(editingTask.value.id, values)
  else createTask(values)
  isFormOpen.value = false
}

function toggleTheme() {
  setTheme(state.theme === 'dark' ? 'light' : 'dark')
}
</script>

<template>
  <div class="app-shell">
    <Navbar
      :pending-count="pendingCount"
      :completed-count="completedCount"
      :theme="state.theme"
      :api-status="state.apiStatus"
      :api-error="state.apiError"
      @toggle-theme="toggleTheme"
      @add-task="openCreateForm"
    />

    <main class="main-content">
      <section class="welcome-section">
        <div class="welcome-copy">
          <div class="date-kicker"><span class="date-sparkle">✳</span> TU ESPACIO, A TU RITMO</div>
          <h1>Haz que las cosas <span>pasen.</span></h1>
          <p>Un poco de claridad puede cambiarlo todo. ¿Por dónde empezamos hoy?</p>
        </div>
        <div class="progress-card" aria-label="Progreso de tareas">
          <div class="progress-ring" :style="{ '--progress': `${completedPercentage}%` }">
            <span>{{ completedPercentage }}<small>%</small></span>
          </div>
          <div class="progress-copy">
            <strong>Buen trabajo</strong>
            <span>{{ completedCount }} de {{ state.tasks.length }} completadas</span>
          </div>
        </div>
      </section>

      <section class="tasks-section">
        <ProjectBar
          v-model:selected-project="state.projectFilter"
          :projects="state.projects"
          @add="createProject"
          @rename="updateProject"
          @delete="removeProject"
        />
        <div class="section-heading">
          <div>
            <span class="eyebrow">MANTÉN EL IMPULSO</span>
            <h2>Mis tareas <span class="heading-count">{{ state.tasks.length }}</span></h2>
          </div>
          <button class="button button-outline desktop-add" type="button" @click="openCreateForm">
            <span aria-hidden="true">+</span> Añadir tarea
          </button>
        </div>

        <TaskFilterBar
          v-model:status="state.statusFilter"
          v-model:priority="state.priorityFilter"
          v-model:search="state.searchQuery"
          :total="filteredTasks.length"
        />

        <p v-if="state.storageError" class="inline-notice" role="alert">
          No se pudo guardar en este dispositivo: {{ state.storageError }}
        </p>
        <TaskGrid
          :tasks="filteredTasks"
          :projects="state.projects"
          @toggle="toggleTask"
          @edit="openEditForm"
          @delete="deleteTask"
          @add="openCreateForm"
        />
      </section>

      <footer class="app-footer">
        <span>Hecho para avanzar, una tarea a la vez.</span>
        <span class="footer-heart">✳</span>
      </footer>
    </main>

    <TaskForm
      v-if="isFormOpen"
      :task="editingTask"
      :projects="state.projects"
      @save="saveTask"
      @close="isFormOpen = false"
    />
  </div>
</template>
