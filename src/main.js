import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { supabase, DEMO_USER_EMAIL } from './lib/supabase'
import './style.css'

const app = createApp(App)
app.use(router)
app.provide('supabase', supabase)
app.provide('demoUserEmail', DEMO_USER_EMAIL)
app.mount('#app')
