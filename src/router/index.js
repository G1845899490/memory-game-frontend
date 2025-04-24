import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import HistoryView from '@/views/HistoryView.vue'
import ChangePasswordView from '@/views/ChangePasswordView.vue'
import RecallOldLocationView from '@/views/gameviews/RecallOldLocationView.vue'
import RecallOldContentView from '@/views/gameviews/RecallOldContentView.vue'
import DiscoverNewLocationView from '@/views/gameviews/DiscoverNewLocationView.vue'
import DiscoverNewContentView from '@/views/gameviews/DiscoverNewContentView.vue'
import LeaderboardView from '@/views/LeaderBoardView.vue'


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
    path: '/recalllocation',
    name: 'recalllocation',
    component: RecallOldLocationView,
    props: route => ({ level: Number(route.query.level) })
  },
  {
    path: '/recallcontent',
    name: 'recallcontent',
    component: RecallOldContentView
  },
  {
    path: '/discoverlocation',
    name: 'discoverlocation',
    component: DiscoverNewLocationView,
    props: route => ({ size: Number(route.query.size) })
  },
  {
    path: '/discovercontent',
    name: 'discovercontent',
    component: DiscoverNewContentView,
    props: route => ({ level: Number(route.query.level) })
  },
  {
    path: '/history',
    name: 'history',
    component: HistoryView
  },
  {
    path: '/change-password',
    name: 'change-password',
    component: ChangePasswordView
  },
  {
    path: '/leaderboard',
    name: 'leaderboard',
    component: LeaderboardView
  }

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

// 定义允许直接访问的路由白名单
const publicRoutes = ['/login', '/register']

// 添加全局前置守卫
router.beforeEach((to, from, next) => {
  // 检查目标路由是否在白名单中
  const isPublicRoute = publicRoutes.includes(to.path) || to.path === '/'

  // 检查用户是否登录（这里用本地存储模拟）
  const isLoggedIn = !!localStorage.getItem('token') // 示例：登录后存储 token

  // if (to.path === '/recalllocation' || to.path === '/discoverlocation' || to.path === '/discovercontent'&& isLoggedIn) {
  //   // 如果是内存游戏路由且已登录，检查是否有 size 参数
  //   const size = Number(to.query.size)
  //   if (isNaN(size) || size <= 0) {
  //     // 如果没有有效的 size 参数，重定向到首页
  //     console.log("from.path: ", from.path)
  //     console.log("to.path: ", to.path);
  //     next('/home')
  //     return
  //   }
  // }

  if (to.path === '/recalllocation' && isLoggedIn) {
    // 如果是内存游戏路由且已登录，检查是否有 size 参数
    const level = Number(to.query.level)
    if (isNaN(level) || level <= 0) {
      // 如果没有有效的 level 参数，重定向到首页
      console.log("from.path: ", from.path)
      console.log("to.path: ", to.path);
      next('/home')
      return
    }
  }

  if (isPublicRoute) {
    // 如果是公开路由，直接放行
    console.log("from.path: ", from.path)
    console.log("to.path: ", to.path);
    next()
  } else if (!isLoggedIn) {
    // 如果不是公开路由且未登录，重定向到登录页
    console.log("from.path: ", from.path)
    console.log("to.path: ", to.path);
    next('/login')
  } else {
    // 已登录且访问受保护路由，放行
    console.log("from.path: ", from.path)
    console.log("to.path: ", to.path);
    next()
  }
})

export default router
