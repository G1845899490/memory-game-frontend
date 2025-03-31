import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import MemoryGameView from '@/views/MemoryGameView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import HistoryView from '@/views/HistoryView.vue'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/home',
    name: 'home',
    component: HomeView
  },
  {
    path: '/memory',
    name: 'memory',
    component: MemoryGameView,
    props: route => ({ size: Number(route.query.size) }) 
  },
  {
    path: '/history',
    name: 'history',
    component: HistoryView
  }
  
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
