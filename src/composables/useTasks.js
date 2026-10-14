import { computed, reactive } from 'vue'
import { apiService } from '../services/apiService.js'

const STORAGE_KEY = 'taskflow-vue-state-v1'
const defaultProjectId = 'project-product'

const starterProjects = [
  { id: defaultProjectId, name: 'Producto' },
  { id: 'project-marketing', name: 'Marketing' },
  { id: 'project-personal', name: 'Personal' },
]

const starterTasks = [
  {
    id: 'starter-1',
    title: 'Preparar el roadmap del trimestre',
    description: 'Alinear objetivos, hitos y responsables con el equipo de producto.',
    category: 'Planificación',
    projectId: defaultProjectId,
    priority: 'high',
    dueDate: '',
    completed: false,
    apiId: null,
  },
  {
    id: 'starter-2',
    title: 'Revisar el prototipo del dashboard',
    description: 'Validar los estados vacíos y compartir comentarios de experiencia.',
    category: 'Diseño',
    projectId: defaultProjectId,
    priority: 'medium',
    dueDate: '',
    completed: false,
    apiId: null,
  },
  {
    id: 'starter-3',
    title: 'Documentar los endpoints de usuarios',
    description: 'Añadir ejemplos de petición y respuesta para el equipo de frontend.',
    category: 'Desarrollo',
    projectId: defaultProjectId,
    priority: 'low',
    dueDate: '',
    completed: true,
    apiId: null,
  },
  {
    id: 'starter-4',
    title: 'Enviar resumen de la reunión',
    description: 'Compartir decisiones y próximos pasos con todas las personas asistentes.',
    category: 'Comunicación',
    projectId: 'project-marketing',
    priority: 'medium',
    dueDate: '',
    completed: false,
    apiId: null,
  },
]

// Un único estado reactivo mantiene coordinadas la lista, los filtros y la sincronización.
// One reactive state keeps the task list, filters, and synchronization status in sync.
const state = reactive({
  tasks: [],
  projects: [],
  statusFilter: 'all',
  priorityFilter: 'all',
  projectFilter: 'all',
  searchQuery: '',
  theme: 'light',
  apiStatus: 'idle',
  apiError: '',
  storageError: '',
  initialized: false,
})

const filteredTasks = computed(() => {
  const query = state.searchQuery.trim().toLocaleLowerCase()

  return state.tasks.filter((task) => {
    const matchesStatus =
      state.statusFilter === 'all' ||
      (state.statusFilter === 'completed' ? task.completed : !task.completed)
    const matchesPriority =
      state.priorityFilter === 'all' || task.priority === state.priorityFilter
    const matchesProject =
      state.projectFilter === 'all' || task.projectId === state.projectFilter
    const matchesQuery =
      !query ||
      [task.title, task.description, task.category]
        .join(' ')
        .toLocaleLowerCase()
        .includes(query)

    return matchesStatus && matchesPriority && matchesProject && matchesQuery
  })
})

const pendingCount = computed(() => state.tasks.filter((task) => !task.completed).length)
const completedCount = computed(() => state.tasks.filter((task) => task.completed).length)

function persist() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ tasks: state.tasks, projects: state.projects, theme: state.theme }),
    )
    state.storageError = ''
  } catch (error) {
    state.storageError =
      error instanceof Error ? error.message : 'No se pudo guardar el estado local.'
  }
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return false

    const saved = JSON.parse(raw)
    if (!saved || !Array.isArray(saved.tasks)) {
      throw new Error('El formato guardado no es válido.')
    }

    state.tasks = saved.tasks.filter(isTask)
    state.projects = Array.isArray(saved.projects)
      ? saved.projects.filter(isProject)
      : structuredClone(starterProjects)
    if (state.projects.length === 0) state.projects = structuredClone(starterProjects)
    state.tasks.forEach((task) => {
      if (!state.projects.some((project) => project.id === task.projectId)) {
        task.projectId = state.projects[0].id
      }
    })
    state.theme = saved.theme === 'dark' ? 'dark' : 'light'
    return true
  } catch (error) {
    state.storageError =
      error instanceof Error ? error.message : 'No se pudieron leer los datos locales.'
    return false
  }
}

function isProject(value) {
  return value && typeof value.id === 'string' && typeof value.name === 'string'
}

function isTask(value) {
  return (
    value &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.completed === 'boolean' &&
    ['high', 'medium', 'low'].includes(value.priority)
  )
}

function makeId() {
  return globalThis.crypto?.randomUUID?.() ?? `task-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function reportApiError(error) {
  state.apiStatus = 'error'
  state.apiError = error instanceof Error ? error.message : 'Error de sincronización desconocido.'
}

async function syncRemote(operation) {
  state.apiStatus = 'syncing'
  state.apiError = ''

  try {
    await operation()
    state.apiStatus = 'synced'
  } catch (error) {
    reportApiError(error)
  }
}

// La primera carga recupera el estado local; la API solo aporta tareas si aún no hay datos.
// First load restores local state; the API only supplies tasks when no saved data exists.
async function initialize() {
  if (state.initialized) return
  state.initialized = true
  const hasSavedState = loadSavedState()
  state.apiStatus = 'loading'

  try {
    const remoteTasks = await apiService.getTasks()
    if (!hasSavedState) {
      state.tasks = remoteTasks.map((task) => ({
        id: makeId(),
        title: task.title,
        description: '',
        category: 'Importada',
        projectId: defaultProjectId,
        priority: 'medium',
        dueDate: '',
        completed: task.completed,
        apiId: task.id,
      }))
      state.projects = structuredClone(starterProjects)
      if (state.tasks.length === 0) state.tasks = structuredClone(starterTasks)
      persist()
    }
    state.apiStatus = 'synced'
  } catch (error) {
    if (!hasSavedState) {
      state.projects = structuredClone(starterProjects)
      state.tasks = structuredClone(starterTasks)
      persist()
    }
    reportApiError(error)
  }
}

// Las mutaciones se aplican primero localmente y luego se sincronizan sin bloquear la interfaz.
// Mutations apply locally first, then sync remotely without blocking the interface.
function createTask(values) {
  const task = {
    ...values,
    projectId: values.projectId || state.projects[0]?.id || defaultProjectId,
    id: makeId(),
    completed: false,
    apiId: null,
  }
  state.tasks.unshift(task)
  persist()
  void syncRemote(async () => {
    const created = await apiService.createTask(task)
    if (created?.id) {
      task.apiId = created.id
      persist()
    }
  })
}

// Editar mantiene el identificador remoto y actualiza el almacenamiento antes de la petición de red.
// Editing preserves the remote identifier and updates storage before the network request.
function updateTask(id, values) {
  const index = state.tasks.findIndex((task) => task.id === id)
  if (index < 0) return

  state.tasks[index] = { ...state.tasks[index], ...values }
  const task = state.tasks[index]
  persist()
  if (task.apiId) void syncRemote(() => apiService.updateTask(task))
}

// El cambio de estado actualiza contadores y filtros reactivos de forma automática.
// Toggling completion automatically refreshes reactive counters and filters.
function toggleTask(id) {
  const task = state.tasks.find((item) => item.id === id)
  if (!task) return

  task.completed = !task.completed
  persist()
  if (task.apiId) void syncRemote(() => apiService.updateTask(task))
}

// La eliminación es inmediata en la UI; si existe copia remota, se envía también DELETE.
// Deletion is immediate in the UI; when a remote copy exists, DELETE is sent as well.
function deleteTask(id) {
  const index = state.tasks.findIndex((task) => task.id === id)
  if (index < 0) return

  const [task] = state.tasks.splice(index, 1)
  persist()
  if (task.apiId) void syncRemote(() => apiService.deleteTask(task))
}

function setTheme(theme) {
  state.theme = theme === 'dark' ? 'dark' : 'light'
  persist()
}

// Los proyectos se guardan junto con las tareas para conservar relaciones al recargar.
// Projects are saved alongside tasks so their relationships survive a reload.
function createProject(name) {
  const normalizedName = name.trim()
  if (
    !normalizedName ||
    state.projects.some((project) => project.name.toLocaleLowerCase() === normalizedName.toLocaleLowerCase())
  ) return

  state.projects.push({ id: makeId(), name: normalizedName })
  persist()
}

function updateProject(id, name) {
  const normalizedName = name.trim()
  const project = state.projects.find((item) => item.id === id)
  if (
    !project ||
    !normalizedName ||
    state.projects.some(
      (item) => item.id !== id && item.name.toLocaleLowerCase() === normalizedName.toLocaleLowerCase(),
    )
  ) return

  project.name = normalizedName
  persist()
}

function deleteProject(id) {
  if (state.projects.length <= 1) return
  const projectIndex = state.projects.findIndex((item) => item.id === id)
  if (projectIndex < 0) return

  const fallbackProject = state.projects.find((project) => project.id !== id)
  state.projects.splice(projectIndex, 1)
  state.tasks.forEach((task) => {
    if (task.projectId === id) task.projectId = fallbackProject.id
  })
  if (state.projectFilter === id) state.projectFilter = 'all'
  persist()
}

export function useTasks() {
  return {
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
  }
}
