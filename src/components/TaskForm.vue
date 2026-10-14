<script setup>
import { computed, reactive, watch } from 'vue'

// El formulario trabaja sobre una copia editable y solo emite datos validados al componente padre.
// The form edits a local copy and emits validated data only to its parent component.
const props = defineProps({
  task: { type: Object, default: null },
  projects: { type: Array, required: true },
})

const emit = defineEmits(['save', 'close'])

const emptyForm = (projects = []) => ({
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium',
  category: 'Desarrollo',
  projectId: projects[0]?.id ?? 'project-product',
})

const form = reactive(emptyForm(props.projects))
const errors = computed(() => ({
  title: form.title.trim() ? '' : 'Añade un título para continuar.',
}))

watch(
  () => [props.task, props.projects],
  ([task, projects]) =>
    Object.assign(form, task ? { ...emptyForm(projects), ...task } : emptyForm(projects)),
  { immediate: true },
)

function submit() {
  if (errors.value.title) return
  emit('save', {
    title: form.title.trim(),
    description: form.description.trim(),
    dueDate: form.dueDate,
    priority: form.priority,
    category: form.category,
    projectId: form.projectId,
  })
}
</script>

<template>
  <div class="modal-backdrop" @click.self="emit('close')">
    <section
      class="task-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-form-title"
    >
      <header class="modal-header">
        <div>
          <span class="eyebrow">{{ task ? 'ACTUALIZA TU PLAN' : 'UN PASO A LA VEZ' }}</span>
          <h2 id="task-form-title">{{ task ? 'Editar tarea' : 'Nueva tarea' }}</h2>
        </div>
        <button class="icon-button" type="button" aria-label="Cerrar" @click="emit('close')">×</button>
      </header>

      <form class="task-form" @submit.prevent="submit">
        <label class="form-label">
          <span>Título <b>*</b></span>
          <input
            v-model="form.title"
            autofocus
            maxlength="100"
            placeholder="¿Qué necesitas hacer?"
            :aria-invalid="Boolean(errors.title)"
            aria-describedby="title-error"
          />
          <small id="title-error" class="field-error">{{ errors.title }}</small>
        </label>

        <label class="form-label">
          <span>Descripción <em>OPCIONAL</em></span>
          <textarea v-model="form.description" rows="3" maxlength="280" placeholder="Añade contexto o próximos pasos..."></textarea>
        </label>

        <div class="form-row">
          <label class="form-label">
            <span>Fecha límite <em>OPCIONAL</em></span>
            <input v-model="form.dueDate" type="date" />
          </label>
          <label class="form-label">
            <span>Prioridad</span>
            <select v-model="form.priority">
              <option value="high">Alta</option>
              <option value="medium">Media</option>
              <option value="low">Baja</option>
            </select>
          </label>
        </div>

        <label class="form-label">
          <span>Proyecto</span>
          <select v-model="form.projectId">
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
        </label>

        <label class="form-label">
          <span>Categoría</span>
          <select v-model="form.category">
            <option>Desarrollo</option>
            <option>Diseño</option>
            <option>Planificación</option>
            <option>Comunicación</option>
            <option>Personal</option>
          </select>
        </label>

        <footer class="form-actions">
          <button class="button button-quiet" type="button" @click="emit('close')">Cancelar</button>
          <button class="button button-primary" type="submit" :disabled="Boolean(errors.title)">
            {{ task ? 'Guardar cambios' : 'Crear tarea' }}
          </button>
        </footer>
      </form>
    </section>
  </div>
</template>
