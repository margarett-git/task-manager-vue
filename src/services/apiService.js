const API_BASE_URL = 'https://jsonplaceholder.typicode.com'
const REQUEST_TIMEOUT_MS = 8000

const requestInterceptors = [
  (config) => ({
    ...config,
    headers: {
      Accept: 'application/json',
      ...(config.body ? { 'Content-Type': 'application/json' } : {}),
      ...config.headers,
    },
  }),
]

const responseInterceptors = [
  async (response) => {
    if (!response.ok) {
      const error = new Error(`La API respondió con HTTP ${response.status}.`)
      error.status = response.status
      throw error
    }

    return response
  },
]

async function request(path, options = {}) {
  // El cliente centraliza timeout, interceptores y errores para que todos los verbos HTTP se comporten igual.
  // The client centralizes timeout, interceptors, and errors so every HTTP method behaves consistently.
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  let config = { ...options, signal: controller.signal }

  try {
    for (const interceptor of requestInterceptors) {
      config = interceptor(config)
    }

    let response = await fetch(`${API_BASE_URL}${path}`, config)
    for (const interceptor of responseInterceptors) {
      response = await interceptor(response)
    }

    return response.status === 204 ? null : response.json()
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('La solicitud a la API agotó el tiempo de espera.')
    }
    if (error instanceof TypeError) {
      throw new Error('No se pudo conectar con la API. Comprueba tu conexión.')
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}

export const apiService = {
  // GET consulta tareas de demostración; el estado local tiene prioridad después de la primera carga.
  // GET fetches demo tasks; local state takes precedence after the first load.
  getTasks() {
    return request('/todos?_limit=8')
  },

  // POST crea una tarea remota; el cliente conserva el registro local incluso si el servidor falla.
  // POST creates a remote task; the client keeps its local record even if the server fails.
  createTask(task) {
    return request('/todos', {
      method: 'POST',
      body: JSON.stringify(toApiTask(task)),
    })
  },

  // PUT actualiza la copia remota asociada a la tarea.
  // PUT updates the remote copy associated with the task.
  updateTask(task) {
    return request(`/todos/${task.apiId}`, {
      method: 'PUT',
      body: JSON.stringify(toApiTask(task)),
    })
  },

  // DELETE elimina la copia remota sin retrasar la actualización de la interfaz local.
  // DELETE removes the remote copy without delaying the local UI update.
  deleteTask(task) {
    return request(`/todos/${task.apiId}`, { method: 'DELETE' })
  },
}

function toApiTask(task) {
  return {
    title: task.title,
    completed: task.completed,
    userId: 1,
  }
}
