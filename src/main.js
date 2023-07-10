import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import {createPinia} from 'pinia'
import axios from 'axios'
import router from './router/index'
import './assets/icofont/iconfont.css'





const pinia=createPinia()
const app=createApp(App)

app.config.globalProperties.$http=axios
app.use(pinia)
app.use(router)

app.mount('#app')

