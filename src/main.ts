import { createApp } from 'vue'
import App from './App.vue'
import './style.css'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
  })
}

createApp(App).mount('#app')
