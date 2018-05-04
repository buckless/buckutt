import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.config.productionTip = false

window.app = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

// force / as initial URL
Vue.nextTick(() => {
    app.$router.replace('/')
})
