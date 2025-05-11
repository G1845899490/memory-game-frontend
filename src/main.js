import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

Vue.use(ElementUI)
Vue.config.productionTip = false

// axios.defaults.baseURL = 'http://localhost:8080'; // 配置 axios 发送请求时的默认后端 baseURL

// 配置 axios 发送请求时的默认后端 baseURL(使用环境变量)
axios.defaults.baseURL = process.env.VUE_APP_API_URL;

// 允许发送凭证（如 cookie），与后端 CORS 配置一致
axios.defaults.withCredentials = true;

// 禁用生产环境提示
Vue.config.productionTip = false;

Vue.prototype.$axios = axios; // 全局挂载 Axios

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
