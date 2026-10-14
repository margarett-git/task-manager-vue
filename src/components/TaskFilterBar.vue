<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

// Los filtros se reciben y emiten como valores controlados para que App conserve una sola fuente de verdad.
// Filters are received and emitted as controlled values so App remains the single source of truth.
defineProps({
  status: { type: String, required: true },
  priority: { type: String, required: true },
  search: { type: String, required: true },
  total: { type: Number, required: true },
})

defineEmits(['update:status', 'update:priority', 'update:search'])

const searchInput = ref(null)

// El atajo facilita volver a la búsqueda y se limpia al desmontar el componente.
// The shortcut makes search easy to reach and is removed when the component unmounts.
function focusSearch(event) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    searchInput.value?.focus()
  }
}

onMounted(() => window.addEventListener('keydown', focusSearch))
onUnmounted(() => window.removeEventListener('keydown', focusSearch))
</script>

<template>
  <section class="filter-toolbar" aria-label="Filtros de tareas">
    <div class="filter-tabs" role="tablist" aria-label="Filtrar por estado">
      <button
        v-for="tab in [
          { value: 'all', label: 'Todas' },
          { value: 'pending', label: 'Pendientes' },
          { value: 'completed', label: 'Completadas' },
        ]"
        :key="tab.value"
        class="filter-tab"
        :class="{ 'is-active': status === tab.value }"
        type="button"
        role="tab"
        :aria-selected="status === tab.value"
        @click="$emit('update:status', tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <div class="filter-tools">
      <label class="search-field">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m16 16 4 4"></path></svg>
        <input
          ref="searchInput"
          :value="search"
          type="search"
          placeholder="Buscar tareas..."
          aria-label="Buscar tareas"
          @input="$emit('update:search', $event.target.value)"
        />
        <kbd>⌘ K</kbd>
      </label>

      <label class="select-field">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M7 12h10m-7 6h4"></path></svg>
        <select
          :value="priority"
          aria-label="Filtrar por prioridad"
          @change="$emit('update:priority', $event.target.value)"
        >
          <option value="all">Prioridad</option>
          <option value="high">Alta</option>
          <option value="medium">Media</option>
          <option value="low">Baja</option>
        </select>
        <span class="select-chevron" aria-hidden="true">⌄</span>
      </label>
    </div>
  </section>
  <div class="results-line">
    <span>{{ total }} {{ total === 1 ? 'tarea' : 'tareas' }}</span>
    <span class="results-line-rule"></span>
    <span>Tu espacio de trabajo</span>
  </div>
</template>
