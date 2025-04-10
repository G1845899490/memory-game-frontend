<template>
  <div class="recall-old-content">
    <!-- 开始阶段 -->
    <div v-if="isPreStarting" class="game-stage">
      <h2>数字串记忆游戏</h2>
      <p class="game-description">记忆数字串，每次正确会增加一位数，挑战你的极限！</p>
      <button @click="startGame" class="start-button">开始游戏</button>
      <button @click="goHome" class="start-button">返回首页</button>
    </div>

    <!-- 记忆阶段 -->
    <div v-if="isMemorizing" class="game-stage">
      <h2>请记住以下数字串</h2>
      <div class="number-string">{{ numberString }}</div>
      <div class="countdown">剩余时间：{{ countdown }}秒</div>
    </div>

    <!-- 回忆阶段 -->
    <div v-if="isRecalling" class="game-stage">
      <h2>请输入刚才记忆的数字串</h2>
      <div class="level-info">当前级别：{{ currentLevel }}（{{ numberString.length }}位数字）</div>
      <input ref="numberInput" v-model="userInput" type="text" placeholder="请输入数字串" @keyup.enter="checkAnswer"
        class="number-input" />
      <button @click="checkAnswer" class="verify-button">验证</button>
      <button @click="goHome" class="verify-button">返回首页</button>

    </div>

    <!-- 结束阶段 -->
    <div v-if="isEnding" class="game-stage">
      <div v-if="isCorrect">
        <h2>恭喜你答对了！</h2>
        <p>进入下一级难度...</p>
        <button @click="goHome" class="start-button">返回首页</button>

      </div>
      <div v-else>
        <h2>游戏结束</h2>
        <div class="game-result">
          <p>你的最终级别：{{ currentLevel - 1 }}</p>
          <p>成功记忆数字位数：{{ numberString.length - 1 }}</p>
          <p class="correct-answer">
            正确答案：{{ numberString }}
          </p>
          <p>你的答案：{{ userInput }}</p>
        </div>
        <button @click="resetGame" class="play-again-button">再玩一局</button>
        <button @click="goHome" class="play-again-button">返回首页</button>

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

        const gameHistory = {
          gameType: 'RecallOldContent',
          score: finalDigits * 10 >= 30 ? finalDigits * 10 : 0, // 每位数字10分
          gameData: JSON.stringify([
            { success: 0 }, // 最终都是因为失败结束
            { finalLevel: finalLevel },
            { digitCount: finalDigits }
          ]),
          playedAt: new Date().toISOString()
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
  text-align: center;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.game-stage {
  margin: 20px auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.game-description {
  color: #666;
  margin-bottom: 20px;
}

.number-string {
  font-size: 42px;
  font-weight: bold;
  margin: 30px 0;
  padding: 20px;
  background-color: #e9f7ff;
  border-radius: 8px;
  letter-spacing: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.countdown {
  font-size: 24px;
  color: #ff5722;
  margin: 20px 0;
  font-weight: bold;
}

.level-info {
  color: #4CAF50;
  font-size: 18px;
  margin: 10px 0 20px;
}

.number-input {
  padding: 12px 15px;
  font-size: 20px;
  margin: 15px;
  width: 300px;
  text-align: center;
  border: 2px solid #ddd;
  border-radius: 6px;
  transition: border-color 0.3s;
}

.number-input:focus {
  border-color: #4CAF50;
  outline: none;
}

button {
  padding: 12px 25px;
  font-size: 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin: 15px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #3e8e41;
}

.start-button {
  font-size: 18px;
  padding: 15px 30px;
}

.game-result {
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.correct-answer {
  font-size: 20px;
  color: #f44336;
  margin: 15px 0;
  font-weight: bold;
}
</style>