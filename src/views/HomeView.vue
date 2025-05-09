<template>
  <div class="home"> <!-- :style="{ backgroundImage: `url(${isOnlineMode ? onlineBg : normalBg})` }" -->

    <!-- 用户管理区域 -->
    <div class="user-management">
      <button @click="$router.push('/history')">游戏历史</button>
      <button @click="getLeaderBoard">排行榜</button>
      <button @click="toggleOnlineMode">{{ modeText }}</button>
      <button @click="$router.push('/change-password')">修改密码</button>
      <button @click="confirmLogout">退出登录</button>
    </div>

    <!-- 游戏选择区域 -->
    <div class="game-select">
      <div class="game-type">
        <h3>数字串记忆</h3>
        <div class="difficulty-options">
          <button @click="playRecallOldContentGame">开始游戏</button>
          <!-- 选择初始长度 -->
        </div>
      </div>
      <br>
      <div class="game-type">
        <h3>翻牌记忆</h3>
        <div class="difficulty-options">
          <button @click="playRecallOldLocationGame(1)">2×2</button>
          <button @click="playRecallOldLocationGame(2)">2×3</button>
          <button @click="playRecallOldLocationGame(3)">3×3</button>
          <button @click="playRecallOldLocationGame(4)">3×4</button>
          <button @click="playRecallOldLocationGame(5)">4×4</button>
        </div>
      </div>
      <br>
      <div class="game-type">
        <h3>扑克牌闪记</h3>
        <div class="difficulty-options">
          <button @click="playDiscoverNewLocationGame(5)">5×4</button>
          <button @click="playDiscoverNewLocationGame(6)">6×5</button>
          <button @click="playDiscoverNewLocationGame(7)">7×6</button>
          <button @click="playDiscoverNewLocationGame(8)">8×6</button>
          <button @click="playDiscoverNewLocationGame(9)">9×6</button>
          <!-- 选择初始矩阵大小 -->
        </div>
      </div>
      <br>
      <div class="game-type">
        <h3>发现新内容</h3>
        <div class="difficulty-options">
          <button @click="playDiscoverNewContentGame(1)">2×2</button>
          <button @click="playDiscoverNewContentGame(2)">2×3</button>
          <button @click="playDiscoverNewContentGame(3)">3×3</button>
          <button @click="playDiscoverNewContentGame(4)">3×4</button>
          <button @click="playDiscoverNewContentGame(5)">4×4</button>
          <button @click="playDiscoverNewContentGame(6)">5×4</button>
        </div>
      </div>
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
.user-management {
  margin-top: 30px; /* 与上方内容保持30px的间距 */
  margin-bottom: 40px; /* 增加与游戏选择区域的间距 */
  display: flex; /* 使用弹性布局，使按钮水平排列 */
  justify-content: center; /* 按钮在水平方向上居中对齐 */
  gap: 20px; /* 按钮之间的间距为20px */
}

.user-management button {
  padding: 10px 20px; /* 内边距 */
  margin: 1px; /* 外边距 */
  font-size: 15px; /* 字体大小 */
  border: none; /* 移除边框 */
  border-radius: 6px; /* 圆角 */
  background-color: #e9ecef; /* 浅灰色背景 */
  color: #495057; /* 深灰色文字 */
  cursor: pointer; /* 鼠标指针样式 */
  transition: all 0.3s ease; /* 所有属性过渡效果 */
  width: 120px; /* 按钮宽度 */
}

.user-management button:hover {
  background-color: #dee2e6; /* 悬停时背景色 */
  transform: translateY(-2px); /* 悬停时上移效果 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); /* 悬停时阴影 */
}

.user-management button:active {
  transform: translateY(0); /* 点击时恢复位置 */
  box-shadow: none; /* 移除阴影 */
}

.user-management button:disabled {
  background-color: #f8f9fa; /* 禁用时背景色 */
  color: #adb5bd; /* 禁用时文字颜色 */
  cursor: not-allowed; /* 禁用时鼠标样式 */
  transform: none; /* 移除变换效果 */
  box-shadow: none; /* 移除阴影 */
}

.game-select {
  max-width: 700px; /* 增加最大宽度 */
  margin: 0 auto; /* 水平居中 */
  padding: 8px; /* 内边距 */
  display: flex; /* 使用弹性布局 */
  flex-direction: column; /* 设置为垂直方向排列 */
  gap: 7px; /* 增加游戏类型之间的间距 */
}

.game-type {
  padding: 12px 15px; /* 增加内边距 */
  margin-bottom: 0; /* 移除底部间距，使用gap控制 */
  background-color: #ffffff; /* 白色背景 */
  border-radius: 8px; /* 增加圆角 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* 增强阴影效果 */
  width: 95%; /* 增加宽度占比 */
  margin-left: auto; /* 水平居中 */
  margin-right: auto; /* 水平居中 */
}

.game-type h3 {
  margin: 0 0 8px 0; /* 调整边距 */
  text-align: center; /* 标题居中 */
  color: #333; /* 标题颜色 */
  font-size: 1.4em; /* 增加标题大小 */
  border-bottom: 1px solid #f0f0f0; /* 分隔线 */
  padding-bottom: 6px; /* 增加分隔线与文字的间距 */
}

.difficulty-options {
  margin-top: 8px; /* 增加与上方内容的间距 */
  display: flex; /* 使用弹性布局，使按钮水平排列 */
  justify-content: center; /* 按钮在水平方向上居中对齐 */
  gap: 10px; /* 增加按钮之间的间距 */
  flex-wrap: wrap; /* 允许按钮换行 */
  max-width: 600px; /* 增加按钮区域的最大宽度 */
  margin-left: auto; /* 水平居中 */
  margin-right: auto; /* 水平居中 */
}

.difficulty-options button {
  padding: 6px 12px; /* 增加按钮内边距 */
  font-size: 15px; /* 增加按钮文字大小 */
  cursor: pointer; /* 鼠标悬停时显示手型光标 */
  background-color: #f8f9fa; /* 按钮背景色 */
  color: #333; /* 按钮文字颜色 */
  border: 1px solid #e9ecef; /* 按钮边框 */
  border-radius: 6px; /* 增加按钮圆角 */
  transition: all 0.3s ease; /* 添加过渡效果 */
  min-width: 70px; /* 增加最小宽度 */
}

.difficulty-options button:hover {
  background-color: #e9ecef; /* 鼠标悬停时按钮背景色变深 */
  transform: translateY(-2px); /* 鼠标悬停时按钮轻微上浮 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 添加阴影效果 */
}

.difficulty-options button:active {
  transform: translateY(0); /* 点击时按钮回到原位 */
  box-shadow: none; /* 移除阴影效果 */
}

/* 响应式布局 */
@media (max-width: 768px) {
  .game-select {
    max-width: 95%; /* 在小屏幕上使用百分比宽度 */
  }
  
  .game-type {
    width: 98%; /* 在小屏幕上增加宽度占比 */
    padding: 10px; /* 调整内边距 */
  }
  
  .game-type h3 {
    font-size: 1.3em; /* 在小屏幕上稍微减小标题大小 */
  }
  
  .difficulty-options {
    max-width: 100%; /* 在小屏幕上允许按钮区域占满容器 */
  }
  
  .difficulty-options button {
    font-size: 14px; /* 在小屏幕上稍微减小按钮文字大小 */
    padding: 5px 10px; /* 调整按钮内边距 */
  }
}
</style>
