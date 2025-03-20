import { createApp } from "vue"
import App from "./App.vue"
import { createPinia } from "pinia"
import axios from "axios"
import router from "./router/index"
import "./assets/icofont/iconfont.css"
import loadDirective from "./directives/load"
import elementSizeObserverDirective from "./directives/elementSizeObserver.js"
import piniaPluginPersistedstate from "pinia-plugin-persistedstate"
import "./style.css"
import "@/styles/scrollbar.css"

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
const app = createApp(App)

app.config.globalProperties.$http = axios
app.use(pinia)
app.use(router)
app.directive("load", loadDirective)
app.directive("size-ob", elementSizeObserverDirective)

app.mount("#app")
