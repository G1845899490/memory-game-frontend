<template>
  <div class="recall-old-content">
    <!-- 开始阶段 -->
    <div v-if="isPreStarting" class="game-stage">
      <h2>数字串记忆游戏</h2>
      <p class="game-description">尽可能记住更长的数字串，挑战你的极限！</p>
      <button @click="startGame">开始游戏</button>
      <button @click="goHome">返回首页</button>
    </div>

    <!-- 记忆阶段 -->
    <div v-if="isMemorizing" class="game-stage">
      <h2>请记住以下数字串：</h2>
      <div class="number-string">{{ numberString }}</div>
      <div class="countdown">剩余时间：{{ countdown }}秒</div>
    </div>

    <!-- 回忆阶段 -->
    <div v-if="isRecalling" class="game-stage">
      <h2>请输入刚才记忆的数字串：</h2>
      <input ref="numberInput" v-model="userInput" type="text" placeholder="" @keyup.enter="checkAnswer"
        class="number-input" />
        <br>
      <button @click="checkAnswer" >验证</button>
      <button @click="goHome">返回首页</button>

    </div>

    <!-- 结束阶段 -->
    <div v-if="isEnding" class="game-stage">
      <div v-if="isCorrect">
        <h2>恭喜你答对了</h2>
        <p>数字串生长中...</p>
        <button @click="goHome">返回首页</button>

      </div>
      <div v-else>
        <h2>游戏结束</h2>
        <div class="game-result">
          <p>最长记忆位数：{{ numberString.length - 1 }}</p>
        </div>
        <button @click="resetGame">再玩一局</button>
        <button @click="goHome">返回首页</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecallOldContentView',
  data() {
    return {
      isPreStarting: true,
      isMemorizing: false,
      isRecalling: false,
      isEnding: false,
      isCorrect: false,
      numberString: '',
      countdown: 0,
      userInput: '',
      timer: null,
      currentLevel: 1,
      baseMemoryTime: 0 // 基础记忆时间（秒）
    };
  },
  methods: {
    // 生成随机数字串
    generateNumberString(length) {
      let result = '';
      for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10);
      }
      return result;
    },

    // 在已有数字串后增加一位随机数
    extendNumberString() {
      const newDigit = Math.floor(Math.random() * 10);
      return this.numberString + newDigit;
    },

    // 开始游戏
    startGame() {
      this.isPreStarting = false;
      this.isMemorizing = true;
      this.currentLevel = 1;
      // 初始长度为3位数字
      this.numberString = this.generateNumberString(3);
      this.startCountdown();
    },

    // 开始倒计时
    startCountdown() {
      // 根据当前数字长度动态计算记忆时间
      this.countdown = this.baseMemoryTime + Math.floor(this.numberString.length / 2);

      this.timer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          clearInterval(this.timer);
          this.isMemorizing = false;
          this.isRecalling = true;
          // 使用 nextTick 确保在 DOM 更新后设置焦点
          this.$nextTick(() => {
            this.$refs.numberInput.focus();
          });
        }
      }, 1000);
    },

    // 验证答案
    checkAnswer() {
      this.isCorrect = this.userInput === this.numberString;
      this.isRecalling = false;
      this.isEnding = true;

      if (this.isCorrect) {
        // 如果回答正确，延迟一秒后进入下一级
        setTimeout(() => {
          this.nextLevel();
        }, 1000);
      } else {
        // 如果回答错误，保存游戏记录
        this.saveGameHistory();
        if (this.$store.state.isOnlineMode == true) {
          this.$router.push({
            path: '/resultview',
          })
        }
      }
    },

    // 进入下一级
    nextLevel() {
      this.isEnding = false;
      this.isMemorizing = true;
      this.userInput = '';
      this.currentLevel++;

      // 在原数字串基础上增加一位
      this.numberString = this.extendNumberString();
      this.startCountdown();
    },

    // 重置游戏
    resetGame() {
      this.isPreStarting = true;
      this.isMemorizing = false;
      this.isRecalling = false;
      this.isEnding = false;
      this.isCorrect = false;
      this.userInput = '';
      this.numberString = '';
      this.currentLevel = 1;
      if (this.timer) {
        clearInterval(this.timer);
      }
    },

    // 保存游戏历史
    async saveGameHistory() {
      try {
        // 减1是因为失败时当前数字串是记忆失败的那一个
        const finalLevel = this.currentLevel - 1;
        const finalDigits = this.numberString.length - 1;
        let result = finalDigits * 10 >= 30 ? finalDigits * 10 : 0;
        this.$store.commit('setMyScore', result);

        const gameHistory = {
          gameType: 'RecallOldContent',
          score: result, // 每位数字10分
          gameData: JSON.stringify([
            { success: 0 }, // 最终都是因为失败结束
            { finalLevel: finalLevel },
            { digitCount: finalDigits }
          ]),
          playedAt: new Date().toISOString(),
          roomId: this.$store.state.isOnlineMode == true ? this.$store.state.roomId : null,

        };

        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }
        };

        const response = await this.$axios.post('/api/game/history', gameHistory, config);
        console.log('游戏历史保存成功:', response.data);

      } catch (error) {
        console.error('保存游戏历史失败:', error);
      }
    },

    goHome() {
      if (this.$store.state.isOnlineMode == true) {
        // this.saveGameHistory();
      }

      this.resetGame();
      this.isPreStarting = false;
      this.$router.push({
        path: '/home'
      })
    }
  },


  beforeDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
</script>

<style scoped>
.recall-old-content {
  text-align: center; /* 文本居中对齐 */
  padding: 20px; /* 内边距 */
  max-width: 800px; /* 最大宽度限制 */
  margin: 0 auto; /* 水平居中 */
  min-height: 100vh; /* 最小高度占满视口 */
  display: flex; /* 使用弹性布局 */
  flex-direction: column; /* 垂直排列 */
  justify-content: flex-start; /* 从顶部开始排列 */
  align-items: center; /* 水平居中 */
  padding-top: 100px; /* 顶部内边距，使内容向上偏移 */
}

.game-stage {
  width: 100%; /* 宽度占满容器 */
  margin: 0 auto; /* 水平居中 */
}

.game-description {
  color: #666; /* 深灰色文字 */
  margin-bottom: 20px; /* 底部外边距 */
}

.number-string {
  font-size: 62px; /* 大号字体 */
  font-weight: bold; /* 粗体 */
  margin: 30px 0; /* 上下外边距 */
  padding: 20px; /* 内边距 */
  border-radius: 8px; /* 圆角 */
  letter-spacing: 5px; /* 字间距 */
}

.countdown {
  font-size: 16px; /* 字体大小 */
  margin: 20px 0; /* 上下外边距 */
}

.number-input {
  padding: 12px 15px; /* 内边距 */
  font-size: 20px; /* 字体大小 */
  margin: 15px; /* 外边距 */
  width: 300px; /* 输入框宽度 */
  text-align: center; /* 文本居中 */
  border: 2px solid #e9ecef; /* 边框 */
  border-radius: 6px; /* 圆角 */
  transition: border-color 0.3s; /* 边框颜色过渡效果 */
}

.number-input:focus {
  border-color: #bec0c3; /* 聚焦时边框颜色 */
  outline: none; /* 移除默认轮廓 */
}

button {
  padding: 10px 20px; /* 内边距 */
  margin: 15px; /* 外边距 */
  font-size: 15px; /* 字体大小 */
  border: none; /* 移除边框 */
  border-radius: 6px; /* 圆角 */
  background-color: #e9ecef; /* 浅灰色背景 */
  color: #495057; /* 深灰色文字 */
  cursor: pointer; /* 鼠标指针样式 */
  transition: all 0.3s ease; /* 所有属性过渡效果 */
  width: 120px; /* 按钮宽度 */
}

button:hover {
  background-color: #dee2e6; /* 悬停时背景色 */
  transform: translateY(-2px); /* 悬停时上移效果 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); /* 悬停时阴影 */
}

button:active {
  transform: translateY(0); /* 点击时恢复位置 */
  box-shadow: none; /* 移除阴影 */
}

button:disabled {
  background-color: #f8f9fa; /* 禁用时背景色 */
  color: #adb5bd; /* 禁用时文字颜色 */
  cursor: not-allowed; /* 禁用时鼠标样式 */
  transform: none; /* 移除变换效果 */
  box-shadow: none; /* 移除阴影 */
}

.game-result {
  padding: 20px; /* 内边距 */
  border-radius: 8px; /* 圆角 */
  margin: 20px 0; /* 上下外边距 */
}
</style>