import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// El plugin habilita el compilado de SFC de Vue sin añadir una capa de configuración innecesaria.
// The plugin enables Vue SFC compilation without adding an unnecessary configuration layer.
export default defineConfig({
  plugins: [vue()],
})
