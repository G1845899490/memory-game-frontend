<template>
  <div class="home">
    <h1></h1>
    <!-- <img alt="Vue logo" src="../assets/logo.png"> -->
    <br>
    <h1>欢迎来到记忆力训练游戏</h1>
    <br>
    <h3>翻牌记忆游戏</h3>
    <div class="difficulty-options">
      <button @click="playRecallOldLocationGame(4)">2×2</button>
      <button @click="playRecallOldLocationGame(6)">2×3</button>
      <button @click="playRecallOldLocationGame(9)">3×3</button>
      <button @click="playRecallOldLocationGame(12)">3×4</button>
      <button @click="playRecallOldLocationGame(16)">4×4</button>
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
      <button @click="playDiscoverNewContentGame(4)">2×2</button>
      <button @click="playDiscoverNewContentGame(6)">2×3</button>
      <button @click="playDiscoverNewContentGame(9)">3×3</button>
      <button @click="playDiscoverNewContentGame(12)">3×4</button>
      <button @click="playDiscoverNewContentGame(16)">4×4</button>
      <button @click="playDiscoverNewContentGame(20)">5×4</button>
    </div>
    <br>
    <!-- 添加用户管理区域 -->
    <div class="user-management">
      <button @click="$router.push('/history')">游戏历史</button>
      <button @click="$router.push('/change-password')">修改密码</button>
      <button @click="confirmLogout">退出登录</button>
    </div>
  </div>
</template>

<script>

export default {
  name: 'HomeView',
  methods: {
    playRecallOldLocationGame(size) {
      // 通过路由跳转到 MemoryView，并传递 size 参数
      this.$router.push({
        path: '/recalllocation',
        query: { size: size } // 使用 query 参数传递 size
      });
    },
    playRecallOldContentGame() {
      this.$router.push('/recallcontent');
    },
    playDiscoverNewLocationGame(size) {
      this.$router.push({
        path: '/discoverlocation',
        query: { size: size } 
      });
    },
    playDiscoverNewContentGame(size) {
      // 通过路由跳转到 MemoryView，并传递 size 参数
      this.$router.push({
        path: '/discovercontent',
        query: { size: size } // 使用 query 参数传递 size
      });
    },
    confirmLogout() {
      if (confirm('确认要退出登录吗？')) {
        localStorage.removeItem('token');
        this.$router.push('/login');
      }
    }
  }
}
</script>

<style scoped>
.difficulty-options {
  margin-top: 20px;
  display: flex; /* 使用 Flexbox 布局 */
  justify-content: center; /* 居中对齐 */
  gap: 20px; /* 按钮之间的间距，调整此值以控制空格大小 */
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
</style>
