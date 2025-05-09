<template>
  <div class="game-container">
    <div class="game-content">
      <!-- 信息区 -->
      <div class="game-info-area">
        <h2 v-if="isPreStarting" class="game-description">找到新扑克牌</h2> <!-- 在{{ remainingClicks }}次内 -->

        <h2 v-if="isPlaying">
          <span>剩余{{ remainingClicks }}次点击</span>
          <!-- {{ $nbsp }}
          <span>当前{{ score }}分</span>
          {{ $nbsp }} -->
        </h2>

        <h2 v-if="isEnding">
          <span>{{ isSuccess ? '恭喜通关！' : '游戏结束' }}</span>
          <br>
          <span>分数：{{ score }}</span>
        </h2>
      </div>

      <!-- 游戏区 -->
      <div class="game-play-area">
        <div id="cardsArea" v-bind:style="{ 'grid-template-columns': gridColumns }" style="position: relative;">
          <!-- 遮罩层 -->
          <div class="overlay" v-show="isOverlayVisible">
            <div class="loader"></div> <!-- 转圈加载动画 -->
          </div>

          <div class="card" v-for="(card, index) in dynaMatrix" :key="index" v-on:click="checkClick(index)">
            <div v-bind:style="{ visibility: matrix[index].isFront ? 'visible' : 'hidden' }">
              <img :src="matrix[index].card.image" alt="poker card" class="card-image">
            </div>
          </div>
        </div>
      </div>

      <!-- 控制区 -->
      <div class="game-control-area">
        <button @click="startGame" v-bind:disabled="!isPreStarting">开始游戏</button>
        <button @click="initGame" >再玩一局</button>
        <button v-on:click="nextLevel" >下一难度</button>
        <button @click="$router.push('/home')" >返回首页</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DiscoverNewLocationView',
  props: {
    size: {
      type: Number,
      required: true,
      validator: value => Number.isInteger(value) && value > 0 // 确保是正整数
    }
  },
  data() {
    return {
      isOverlayVisible: false, // 新增：控制遮罩层显示

      isPreStarting: true,
      isPlaying: false,
      isEnding: false,

      isSuccess: false,

      matrix: [], // 卡牌矩阵

      randomLocations: [], // 随机位置数组

      randomLocationsPointer: -1, // 随机位置数组上的指针

      randomLocation: -1, // 随机位置数组上的指针指向的元素值

      remainingClicks: 3, // 剩余点击次数

      score: 0,

      cards: [
        // 红桃
        { value: 'A', suit: '♥️', image: require('@/assets/pokercards/HeartA.png') },
        { value: '2', suit: '♥️', image: require('@/assets/pokercards/Heart2.png') },
        { value: '3', suit: '♥️', image: require('@/assets/pokercards/Heart3.png') },
        { value: '4', suit: '♥️', image: require('@/assets/pokercards/Heart4.png') },
        { value: '5', suit: '♥️', image: require('@/assets/pokercards/Heart5.png') },
        { value: '6', suit: '♥️', image: require('@/assets/pokercards/Heart6.png') },
        { value: '7', suit: '♥️', image: require('@/assets/pokercards/Heart7.png') },
        { value: '8', suit: '♥️', image: require('@/assets/pokercards/Heart8.png') },
        { value: '9', suit: '♥️', image: require('@/assets/pokercards/Heart9.png') },
        { value: '10', suit: '♥️', image: require('@/assets/pokercards/Heart10.png') },
        { value: 'J', suit: '♥️', image: require('@/assets/pokercards/HeartJ.png') },
        { value: 'Q', suit: '♥️', image: require('@/assets/pokercards/HeartQ.png') },
        { value: 'K', suit: '♥️', image: require('@/assets/pokercards/HeartK.png') },
        // 黑桃
        { value: 'A', suit: '♠️', image: require('@/assets/pokercards/SpadeA.png') },
        { value: '2', suit: '♠️', image: require('@/assets/pokercards/Spade2.png') },
        { value: '3', suit: '♠️', image: require('@/assets/pokercards/Spade3.png') },
        { value: '4', suit: '♠️', image: require('@/assets/pokercards/Spade4.png') },
        { value: '5', suit: '♠️', image: require('@/assets/pokercards/Spade5.png') },
        { value: '6', suit: '♠️', image: require('@/assets/pokercards/Spade6.png') },
        { value: '7', suit: '♠️', image: require('@/assets/pokercards/Spade7.png') },
        { value: '8', suit: '♠️', image: require('@/assets/pokercards/Spade8.png') },
        { value: '9', suit: '♠️', image: require('@/assets/pokercards/Spade9.png') },
        { value: '10', suit: '♠️', image: require('@/assets/pokercards/Spade10.png') },
        { value: 'J', suit: '♠️', image: require('@/assets/pokercards/SpadeJ.png') },
        { value: 'Q', suit: '♠️', image: require('@/assets/pokercards/SpadeQ.png') },
        { value: 'K', suit: '♠️', image: require('@/assets/pokercards/SpadeK.png') },
        // 梅花
        { value: 'A', suit: '♣️', image: require('@/assets/pokercards/ClubA.png') },
        { value: '2', suit: '♣️', image: require('@/assets/pokercards/Club2.png') },
        { value: '3', suit: '♣️', image: require('@/assets/pokercards/Club3.png') },
        { value: '4', suit: '♣️', image: require('@/assets/pokercards/Club4.png') },
        { value: '5', suit: '♣️', image: require('@/assets/pokercards/Club5.png') },
        { value: '6', suit: '♣️', image: require('@/assets/pokercards/Club6.png') },
        { value: '7', suit: '♣️', image: require('@/assets/pokercards/Club7.png') },
        { value: '8', suit: '♣️', image: require('@/assets/pokercards/Club8.png') },
        { value: '9', suit: '♣️', image: require('@/assets/pokercards/Club9.png') },
        { value: '10', suit: '♣️', image: require('@/assets/pokercards/Club10.png') },
        { value: 'J', suit: '♣️', image: require('@/assets/pokercards/ClubJ.png') },
        { value: 'Q', suit: '♣️', image: require('@/assets/pokercards/ClubQ.png') },
        { value: 'K', suit: '♣️', image: require('@/assets/pokercards/ClubK.png') },
        // 方块
        { value: 'A', suit: '♦️', image: require('@/assets/pokercards/DiamondA.png') },
        { value: '2', suit: '♦️', image: require('@/assets/pokercards/Diamond2.png') },
        { value: '3', suit: '♦️', image: require('@/assets/pokercards/Diamond3.png') },
        { value: '4', suit: '♦️', image: require('@/assets/pokercards/Diamond4.png') },
        { value: '5', suit: '♦️', image: require('@/assets/pokercards/Diamond5.png') },
        { value: '6', suit: '♦️', image: require('@/assets/pokercards/Diamond6.png') },
        { value: '7', suit: '♦️', image: require('@/assets/pokercards/Diamond7.png') },
        { value: '8', suit: '♦️', image: require('@/assets/pokercards/Diamond8.png') },
        { value: '9', suit: '♦️', image: require('@/assets/pokercards/Diamond9.png') },
        { value: '10', suit: '♦️', image: require('@/assets/pokercards/Diamond10.png') },
        { value: 'J', suit: '♦️', image: require('@/assets/pokercards/DiamondJ.png') },
        { value: 'Q', suit: '♦️', image: require('@/assets/pokercards/DiamondQ.png') },
        { value: 'K', suit: '♦️', image: require('@/assets/pokercards/DiamondK.png') },
        // 大小王
        { value: 'JOKER', suit: '🃏', image: require('@/assets/pokercards/JOKER-A.png') },
        { value: 'joker', suit: '🃏', image: require('@/assets/pokercards/JOKER-B.png') }
      ]
    };
  },

  computed: {
    gridColumns() {
      return `repeat(${this.size}, 80px)`; // 列数和列宽
    },

    dynaMatrix() {
      this.matrix = Array.from({ length: this.size * ((this.size - 1) >= 6 ? 6 : (this.size - 1)) }, () => ({
        card: this.cards[Math.floor(Math.random() * this.cards.length)],
        isFront: false
      }));
      return this.matrix;
    }
  },

  created() {
    this.initGame();
  },

  methods: {
    initGame() {
      this.isPreStarting = true;
      this.isPlaying = false;
      this.isEnding = false;

      this.isSuccess = false;

      this.score = 0;

      this.matrix = [], // 卡牌矩阵

        this.randomLocations = [], // 位置索引数组

        this.randomLocationsPointer = -1; // 随机位置数组上的指针

      this.randomLocation = -1; // matrix的随机位置，取自randomLocations

      this.remainingClicks = 3;

      this.matrix = Array.from({ length: this.size * ((this.size - 1) >= 6 ? 6 : (this.size - 1)) }, () => ({
        card: this.cards[Math.floor(Math.random() * this.cards.length)],
        isFront: false
      }));

      this.randomLocations = this.getRandomLocations(); // 随机位置索引数组

      console.log('游戏初始化完毕！');
    },

    startGame() {
      this.isPreStarting = false;
      this.isPlaying = true;

      console.log('游戏开始！');
      this.displayACard();
    },

    getRandomLocations() {
      const contents = new Set();
      while (contents.size < this.matrix.length) {
        const randomLocation = Math.floor(Math.random() * this.matrix.length)
        contents.add(randomLocation);
      }
      return Array.from(contents); // 将 Set 转换为数组
    },

    // 展示一张卡牌
    displayACard() {

      if (!this.isPlaying) return;

      this.randomLocationsPointer++;

      if (this.randomLocationsPointer < this.randomLocations.length) {
        this.randomLocation = this.randomLocations[this.randomLocationsPointer];
        console.log('卡牌位置:', this.randomLocation);

        // 显示遮罩层
        this.isOverlayVisible = true;

        this.matrix[this.randomLocation].isFront = true;
        this.remainingClicks = 3;

        // 延迟隐藏遮罩层（例如 1500ms 后）
        setTimeout(() => {
          this.isOverlayVisible = false;
        }, 1000);
      } else {
        // 需要展示的新卡超出界限，游戏胜利
        this.gameWin();
      }
    },

    // 检测卡牌点击
    checkClick(index) {
      if (!this.isPlaying) return;

      // 卡片已经翻面才计入有效点击次数
      if (this.matrix[index].isFront) {
        this.remainingClicks--;
      }

      if (this.remainingClicks < 0) {
        // 游戏失败
        this.gameLose();
      }

      if (this.remainingClicks >= 0) {
        if (index === this.randomLocation) {
          this.score += 20;
          // 成功后继续展示新卡
          this.displayACard();
        }
      }
    },

    gameWin() {
      console.log('游戏胜利！');

      this.isSuccess = true;
      this.endGame();
    },

    gameLose() {
      console.log('游戏失败！');

      this.isSuccess = false;
      this.endGame();
    },

    endGame() {
      console.log('游戏结束！');

      this.isPlaying = false;
      this.isEnding = true;

      this.saveGameHistory();
      
      if (this.$store.state.isOnlineMode == true) {
        this.$router.push({
          path: '/resultview',
        })
      }
    },

    async saveGameHistory() {
      try {
        this.$store.commit('setMyScore', this.score);

        const gameHistory = {
          gameType: 'DiscoverNewLocation',
          score: this.score,
          gameData: JSON.stringify([
            { success: this.isSuccess ? 1 : 0 },
            { foundCards: this.isSuccess ? this.contents.length : this.indexArrPointer - 1 },
            { size: this.size }
          ]),
          playedAt: new Date().toISOString(),
          roomId: this.$store.state.isOnlineMode == true ? this.$store.state.roomId : null,

        };

        const response = await this.$axios.post('/api/game/history', gameHistory, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        console.log('游戏历史保存成功:', response.data);
      } catch (error) {
        console.error('保存游戏历史失败:', error);
      }
    },

    nextLevel() {
      this.initGame();

      if (this.size === 9) {
        alert("已经是最高难度了，不能再升级了！");
        return;
      }

      this.$router.push({
        path: '/discoverLocation',
        query: {
          size: this.size + 1
        }
      })
    }
  }
};
</script>

<style scoped>
.game-container {
  max-width: 1200px; /* 设置最大宽度 */
  margin: 0 auto; /* 水平居中 */
  padding: 20px; /* 设置内边距 */
  min-height: 100vh; /* 占满视口高度 */
  display: flex; /* 使用弹性布局 */
  flex-direction: column; /* 垂直方向排列 */
  align-items: center; /* 水平居中 */
  padding-top: 0; /* 移除顶部间距 */
}

.game-content {
  width: 100%; /* 宽度占满容器 */
  height: 100vh; /* 高度占满视口 */
  display: flex; /* 使用弹性布局 */
  justify-content: space-between; /* 水平均匀分布 */
  align-items: center; /* 改为垂直居中 */
  gap: 20px; /* 区域之间的间距 */
  margin-top: 0px; /* 整体向上移动 */
}

.game-info-area {
  width: 200px; /* 设置固定宽度 */
  margin-bottom: 10px; /* 与下方内容保持间距 */
  padding: 15px; /* 设置内边距 */
  margin-top: -50px; /* 减小上部留白 */
}

.game-play-area {
  flex: 1; /* 占据剩余空间 */
  max-width: 800px; /* 设置最大宽度 */
  margin-bottom: 20px; /* 与下方内容保持间距 */
  padding: 1px; /* 设置内边距 */
}

.game-control-area {
  width: 200px; /* 设置固定宽度 */
  margin-bottom: 20px; /* 与下方内容保持间距 */
  padding: 15px; /* 设置内边距 */
  display: flex; /* 使用弹性布局 */
  flex-direction: column; /* 垂直排列按钮 */
  gap: 15px; /* 按钮之间的间距 */
}

.game-control-area button {
  padding: 10px 20px; /* 设置按钮内边距 */
  font-size: 15px; /* 设置文字大小 */
  border: none; /* 移除边框 */
  border-radius: 6px; /* 设置圆角 */
  background-color: #e9ecef; /* 设置默认背景色为浅灰色 */
  color: #495057; /* 设置文字颜色为深灰色 */
  cursor: pointer; /* 设置鼠标样式 */
  transition: all 0.3s ease; /* 添加过渡效果 */
  width: 140px; /* 统一按钮宽度 */
}

.game-control-area button:hover {
  background-color: #dee2e6; /* 鼠标悬停时的背景色 */
  transform: translateY(-2px); /* 悬停时上移效果 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); /* 添加轻微阴影 */
}

.game-control-area button:active {
  transform: translateY(0); /* 点击时恢复位置 */
  box-shadow: none; /* 移除阴影 */
}

.game-control-area button:disabled {
  background-color: #f8f9fa; /* 禁用状态的背景色 */
  color: #adb5bd; /* 禁用状态的文字颜色 */
  cursor: not-allowed; /* 禁用状态的鼠标样式 */
  transform: none; /* 移除变换效果 */
  box-shadow: none; /* 移除阴影 */
}

#cardsArea {
  display: grid; /* 使用网格布局 */
  justify-content: center; /* 水平居中 */
  gap: 10px; /* 设置网格间距 */
  position: relative; /* 设置相对定位，作为遮罩层的参考 */
}

.card {
  display: flex; /* 使用弹性布局 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  width: 100%; /* 宽度占满格子 */
  height: 105px; /* 设置固定高度 */
  border: 1px solid black; /* 设置边框 */
  background-color: lightgray; /* 设置背景色 */
  overflow: hidden; /* 防止内容溢出 */
}

.card-image {
  max-width: 100%; /* 最大宽度占满容器 */
  max-height: 100%; /* 最大高度占满容器 */
  object-fit: contain; /* 保持图片比例 */
}

/* 遮罩层样式 */
.overlay {
  position: absolute; /* 绝对定位 */
  top: 0; /* 顶部对齐 */
  left: 0; /* 左侧对齐 */
  width: 100%; /* 宽度占满容器 */
  height: 100%; /* 高度占满容器 */
  background-color: #000000; /* 设置黑色背景 */
  z-index: 10; /* 确保遮罩在卡牌上方 */
  display: flex; /* 使用弹性布局 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  animation: fadeOut 1.0s ease forwards; /* 添加淡出动画 */
}

/* 转圈加载动画 */
.loader {
  width: 40px; /* 设置宽度 */
  height: 40px; /* 设置高度 */
  border: 5px solid #ffffff; /* 设置白色边框 */
  border-top: 5px solid #3498db; /* 设置蓝色顶部边框 */
  border-radius: 50%; /* 设置为圆形 */
  animation: spin 1s linear infinite; /* 添加旋转动画 */
}

/* 淡出动画 */
@keyframes fadeOut {
  0% {
    opacity: 1; /* 开始时完全不透明 */
  }

  80% {
    opacity: 1; /* 前80%时间保持不透明 */
  }

  100% {
    opacity: 0; /* 最后20%时间快速淡出 */
  }
}

/* 旋转动画 */
@keyframes spin {
  0% {
    transform: rotate(0deg); /* 开始角度 */
  }

  100% {
    transform: rotate(360deg); /* 结束角度 */
  }
}


</style>
