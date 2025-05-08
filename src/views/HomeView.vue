<template>
  <div class="home"> <!-- :style="{ backgroundImage: `url(${isOnlineMode ? onlineBg : normalBg})` }" -->
    <h1></h1> <!-- 欢迎来到记忆力训练游戏 -->
    <!-- <img alt="Vue logo" src="../assets/logo.png"> -->
    <div>
      <button @click="toggleOnlineMode">{{ modeText }}</button>
    </div>
    <br>
    <br>
    <div>
      <button @click="getLeaderBoard">排行榜</button>
    </div>
    <h3>翻牌记忆游戏</h3>
    <div class="difficulty-options">
      <button @click="playRecallOldLocationGame(1)">2×2</button>
      <button @click="playRecallOldLocationGame(2)">2×3</button>
      <button @click="playRecallOldLocationGame(3)">3×3</button>
      <button @click="playRecallOldLocationGame(4)">3×4</button>
      <button @click="playRecallOldLocationGame(5)">4×4</button>
    </div>
    <br>
    <h3>数字串记忆游戏</h3>
    <div class="difficulty-options">
      <button @click="playRecallOldContentGame">开始游戏</button>
      <!-- 选择初始长度 -->
    </div>
    <br>
    <h3>扑克牌闪记游戏</h3>
    <div class="difficulty-options">
      <button @click="playDiscoverNewLocationGame(5)">5×4</button>
      <button @click="playDiscoverNewLocationGame(6)">6×5</button>
      <button @click="playDiscoverNewLocationGame(7)">7×6</button>
      <button @click="playDiscoverNewLocationGame(8)">8×6</button>
      <button @click="playDiscoverNewLocationGame(9)">9×6</button>
      <!-- 选择初始矩阵大小 -->
    </div>
    <br>
    <h3>发现新图片游戏</h3>
    <div class="difficulty-options">
      <button @click="playDiscoverNewContentGame(1)">2×2</button>
      <button @click="playDiscoverNewContentGame(2)">2×3</button>
      <button @click="playDiscoverNewContentGame(3)">3×3</button>
      <button @click="playDiscoverNewContentGame(4)">3×4</button>
      <button @click="playDiscoverNewContentGame(5)">4×4</button>
      <button @click="playDiscoverNewContentGame(6)">5×4</button>
    </div>
    <br>
    <!-- 用户管理区域 -->
    <div class="user-management">
      <button @click="$router.push('/history')">游戏历史</button>
      <button @click="$router.push('/change-password')">修改密码</button>
      <button @click="confirmLogout">退出登录</button>
    </div>
  </div>
</template>

<script>
// import normalBg from '@/assets/normal-bg.png';
// import onlineBg from '@/assets/online-bg.png';

export default {
  name: 'HomeView',

  data() {
    return {
      // normalBg,
      // onlineBg,
    };
  },

  computed: {
    isOnlineMode() { return this.$store.state.isOnlineMode; },
    modeText() {
      return this.isOnlineMode ? '联机模式' : '单机模式'; // 根据模式动态返回文字
    }
  },

  methods: {
    playRecallOldLocationGame(level) {
      let destination = {
        path: '/recalllocation',
        level: level
      }

      if (this.isOnlineMode) {
        console.log("当前是联机模式，即将跳转到匹配页面");

        console.log("destination.path：" + destination.path);
        console.log("destination.level：" + destination.level);

        this.$store.commit('setDestination', destination);

        console.log("state.destination.level: " + this.$store.state.destination.level);
        console.log("state.destination.path: " + this.$store.state.destination.path);


        this.$router.push({
          path: '/matchview',
        });

        return;
      }

      this.$router.push({
        path: '/recalllocation',
        query: { level: level } // 使用 query 参数传递 level
      });
    },

    playRecallOldContentGame() {
      let destination = {
        path: '/recallcontent',
        level: null
      }

      if (this.isOnlineMode) {
        console.log("当前是联机模式，即将跳转到匹配页面");

        console.log("destination.path：" + destination.path);
        console.log("destination.level：" + destination.level);

        this.$store.commit('setDestination', destination);

        console.log("state.destination.level: " + this.$store.state.destination.level);
        console.log("state.destination.path: " + this.$store.state.destination.path);

        this.$router.push({
          path: '/matchview',
        });

        return;
      }

      this.$router.push({
        path: '/recallcontent',
        query: {}
      });
    },

    playDiscoverNewLocationGame(size) {
      let destination = {
        path: '/discoverlocation',
        level: size
      }

      if (this.isOnlineMode) {
        console.log("当前是联机模式，即将跳转到匹配页面");

        console.log("destination.path：" + destination.path);
        console.log("destination.level：" + destination.level);

        this.$store.commit('setDestination', destination);

        console.log("state.destination.level: " + this.$store.state.destination.level);
        console.log("state.destination.path: " + this.$store.state.destination.path);

        this.$router.push({
          path: '/matchview',
        });

        return;
      }

      this.$router.push({
        path: '/discoverlocation',
        query: { size: size }
      });
    },

    playDiscoverNewContentGame(level) {
      let destination = {
        path: '/discovercontent',
        level: level
      }

      if (this.isOnlineMode) {
        console.log("当前是联机模式，即将跳转到匹配页面");

        console.log("destination.path：" + destination.path);
        console.log("destination.level：" + destination.level);

        this.$store.commit('setDestination', destination);

        console.log("state.destination.level: " + this.$store.state.destination.level);
        console.log("state.destination.path: " + this.$store.state.destination.path);

        this.$router.push({
          path: '/matchview',
        });

        return;
      }

      // 通过路由跳转到 MemoryView，并传递 size 参数
      this.$router.push({
        path: '/discovercontent',
        query: { level: level } // 使用 query 参数传递 size
      });
    },

    confirmLogout() {
      if (confirm('确认要退出登录吗？')) {
        localStorage.removeItem('token');
        this.$router.push('/login');
      }
    },

    getLeaderBoard() {
      this.$router.push('/leaderboard');
    },

    // 切换游戏模式
    toggleOnlineMode() {
      console.log("toggleOnlineMode方法被调用");
      this.$store.commit('setOnlineMode', !this.isOnlineMode);
      console.log("联机模式: " + this.isOnlineMode);
    }
  }
}
</script>

<style scoped>
.difficulty-options {
  margin-top: 20px;
  display: flex;
  /* 使用 Flexbox 布局 */
  justify-content: center;
  /* 居中对齐 */
  gap: 20px;
  /* 按钮之间的间距，调整此值以控制空格大小 */
}

.difficulty-options button {
  padding: 3px 6px;
  font-size: 16px;
  cursor: pointer;
}

.user-management {
  margin-top: 30px;
  display: flex;
  justify-content: center;
  gap: 20px;
}

.user-management button {
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
}

.user-management button:hover {
  background-color: #5a6268;
}

.home {
  min-height: 100vh;
  /* 确保容器高度占满视口 */
  background-size: cover;
  /* 图片覆盖整个容器 */
  /* background-position: center; 图片居中 */
  background-repeat: no-repeat;
  /* 防止重复 */
  /* background-image: url('~@/assets/normal-bg.png'); */
  /* 默认背景 */
  transition: background-image 0.3s ease;
  /* 平滑过渡 */
}
</style>
