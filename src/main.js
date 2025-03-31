import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

Vue.config.productionTip = false

// axios.defaults.baseURL = 'http://localhost:8081'; // 配置 axios 的默认 baseURL

Vue.prototype.$axios = axios; // 全局挂载 Axios

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
