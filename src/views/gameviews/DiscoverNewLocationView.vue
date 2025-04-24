<template>
  <div class="game-container">
    <!-- 信息区 -->
    <div class="game-stage">
      <h2 v-if="isPreStarting" class="game-description">在{{ remainingClicks }}次内点击新出现的扑克牌</h2>

      <h2 v-if="isPlaying">
        <span>剩余{{ remainingClicks }}次点击</span>
        {{ $nbsp }}
        <span>当前{{ score }}分</span>
        {{ $nbsp }}
      </h2>

      <h2 v-if="isEnding">
        {{ isSuccess ? '恭喜通关！' : '游戏结束' }}
        {{ $nbsp }}
        <span>最终{{ score }}分</span>
      </h2>
    </div>

    <!-- 游戏区 -->
    <div class="game-stage">
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
    <div class="game-stage">
      <button @click="startGame" class="start-button" v-bind:disabled="!isPreStarting">开始游戏</button>
      <button @click="initGame" class="play-again-button">再玩一局</button>
      <button v-on:click="nextLevel">下一难度</button>
      <button @click="$router.push('/home')" class="back-button">返回首页</button>
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
    },

    async saveGameHistory() {
      try {
        const gameHistory = {
          gameType: 'DiscoverNewLocation',
          score: this.score,
          gameData: JSON.stringify([
            { success: this.isSuccess ? 1 : 0 },
            { foundCards: this.isSuccess ? this.contents.length : this.indexArrPointer - 1 },
            { size: this.size }
          ]),
          playedAt: new Date().toISOString()
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
#cardsArea {
  display: grid;
  justify-content: center;
  gap: 10px;
  position: relative;
  /* 确保遮罩的 absolute 定位相对于此容器 */
}

.card {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  /* 填满格子宽度 */
  height: 105px;
  border: 1px solid black;
  background-color: lightgray;
  overflow: hidden;
  /* 防止图片溢出 */
}

.card-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  /* 保持图片比例 */
}

/* 遮罩层样式 */
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000000;
  /* 不透明黑色遮罩 */
  z-index: 10;
  /* 确保遮罩在卡牌上方 */
  display: flex;
  justify-content: center;
  align-items: center;
  /* 居中加载动画 */
  animation: fadeOut 1.0s ease forwards;
  /* 淡出动画 */
}

/* 转圈加载动画 */
.loader {
  width: 40px;
  height: 40px;
  border: 5px solid #ffffff;
  /* 白色边框 */
  border-top: 5px solid #3498db;
  /* 蓝色顶部边框，突出旋转效果 */
  border-radius: 50%;
  animation: spin 1s linear infinite;
  /* 持续旋转 */
}

/* 淡出动画 */
@keyframes fadeOut {
  0% {
    opacity: 1;
    /* 开始时完全不透明 */
  }

  80% {
    opacity: 1;
    /* 前 80% 时间（1.2s）保持不透明 */
  }

  100% {
    opacity: 0;
    /* 最后 20% 时间（0.3s）快速淡出 */
  }
}

/* 旋转动画 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
