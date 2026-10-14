<script setup>
import { ref } from 'vue'

// Esta barra ofrece gestión ligera de proyectos y notifica cambios a App para persistirlos.
// This bar provides lightweight project management and notifies App to persist changes.
defineProps({
  projects: { type: Array, required: true },
  selectedProject: { type: String, required: true },
})

const emit = defineEmits(['update:selected-project', 'add', 'rename', 'delete'])

const adding = ref(false)
const editingId = ref('')
const draftName = ref('')

function startRename(project) {
  editingId.value = project.id
  draftName.value = project.name
}

function saveRename() {
  if (draftName.value.trim()) emit('rename', editingId.value, draftName.value)
  editingId.value = ''
}
</script>

<template>
  <section class="project-bar" aria-label="Proyectos">
    <div class="project-list">
      <button
        class="project-chip"
        :class="{ 'project-selected': selectedProject === 'all' }"
        type="button"
        @click="$emit('update:selected-project', 'all')"
      >
        Todos los proyectos
      </button>
      <div v-for="project in projects" :key="project.id" class="project-item">
        <input
          v-if="editingId === project.id"
          v-model="draftName"
          class="project-rename"
          aria-label="Nombre del proyecto"
          @keydown.enter.prevent="saveRename"
          @keydown.esc="editingId = ''"
          @blur="saveRename"
        />
        <button
          v-else
          class="project-chip"
          :class="{ 'project-selected': selectedProject === project.id }"
          type="button"
          @click="$emit('update:selected-project', project.id)"
        >
          <i class="project-chip-dot"></i>{{ project.name }}
        </button>
        <button class="project-action" type="button" :aria-label="`Renombrar ${project.name}`" title="Renombrar" @click="startRename(project)">↗</button>
        <button
          v-if="projects.length > 1"
          class="project-action project-remove"
          type="button"
          :aria-label="`Eliminar ${project.name}`"
          title="Eliminar proyecto"
          @click="$emit('delete', project.id)"
        >×</button>
      </div>
    </div>

    <form v-if="adding" class="project-add-form" @submit.prevent="$emit('add', draftName); draftName = ''; adding = false">
      <input v-model="draftName" autofocus maxlength="32" placeholder="Nombre del proyecto" aria-label="Nombre del nuevo proyecto" />
      <button class="project-action" type="submit" aria-label="Guardar proyecto">✓</button>
      <button class="project-action" type="button" aria-label="Cancelar" @click="adding = false; draftName = ''">×</button>
    </form>
    <button v-else class="project-add-button" type="button" @click="adding = true">+ Proyecto</button>
  </section>
</template>
