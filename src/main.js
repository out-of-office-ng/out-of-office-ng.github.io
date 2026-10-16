import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { initAnalytics } from './lib/analytics.js'

const app = mount(App, {
  target: document.getElementById('app'),
})

initAnalytics()

export default app
