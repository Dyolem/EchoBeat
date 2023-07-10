import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  //设置根路径
  // base: '/music-vue/',
  //跨域设置
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3200',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/proxy': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy/, '')
      },
      '/QQMusic': {
        target: 'http://localhost:3300',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/QQMusic/, '')
      },
    }
  },
  define: {
    'process.env.BASE_URL': '"/"'
  }
})
