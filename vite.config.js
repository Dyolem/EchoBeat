import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import Icons from "unplugin-icons/vite"
import IconsResolver from "unplugin-icons/resolver"
import Components from "unplugin-vue-components/vite"
import { ElementPlusResolver } from "unplugin-vue-components/resolvers"
import AutoImport from "unplugin-auto-import/vite"
import vueJsx from "@vitejs/plugin-vue-jsx"
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    Icons({
      /* options */
      compiler: "vue3",
    }),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [
        IconsResolver({
          prefix: "echo",
          // customCollections: [
          //   "custom",
          //   "inline",
          //   // custom external packages
          //   "plain-color-icons",
          //   "test-color-icons",
          // ],
        }),
        ElementPlusResolver(),
      ],
    }),
  ],
  //设置根路径
  // base: '/music-vue/',
  //跨域设置
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3200",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
      "/proxy": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proxy/, ""),
      },
      "/QQMusic": {
        target: "http://localhost:3300",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/QQMusic/, ""),
      },
    },
  },
  define: {
    "process.env.BASE_URL": '"/"',
  },
  esbuild: {
    drop: ["console", "debugger"],
  },
  resolve: {
    alias: [
      {
        find: "@",
        replacement: path.resolve(__dirname, "./src"),
      },
    ],
  },
})
