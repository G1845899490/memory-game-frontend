<template>
    <div class="recall-old-location">
        <!--倒计时区-->
        <div id="countDownBanner">
            <h2 v-bind:style="{ visibility: isCountingDown ? 'visible' : 'hidden' }">剩余时间：{{ memoryCountDown }}秒</h2>
        </div>

        <!--问题描述区-->
        <div id="questionBanner">
            <h2 v-bind:style="{ visibility: isRecalling || isEnding ? 'visible' : 'hidden' }">{{ question }}</h2>
        </div>

        <!--卡牌区-->
        <!-- gridColumns返回网格的列数和列宽 -->
        <div id="cardsArea" v-bind:style="{ 'grid-template-columns': gridColumns }">
            <!-- :key="index"：为每个卡牌 <div> 绑定一个唯一的 key，这里使用 index（从 0 到 size-1） -->
            <div class="card" v-for="(card, index) in cards.slice(0, dynaSize)" :key="index"
                v-on:click="handleCardClick(index)">
                <div v-bind:style="{ visibility: cards[index].isFront ? 'visible' : 'hidden' }">
                    {{ card.content }}
                </div>
            </div>
        </div>

        <!--游戏控制区-->
        <div id="controllerBanner">
            <button v-bind:disabled="!isPreStarting" v-on:click="memoryCountingDown">
                开始记忆
            </button>
            <button v-bind:disabled="isPreStarting || isEnding" v-on:click="initGame">结束本局
            </button>
            <button v-bind:disabled="!isEnding" v-on:click="initGame">再玩一局
            </button>
            <button v-bind:disabled="isRecalling || isCountingDown" v-on:click="nextLevel">下一难度
            </button>
            <button v-on:click="goHome">回到首页
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'RecallOldLocationView',

    props: {
        level: {
            type: Number,
            required: true,
            validator: value => Number.isInteger(value) && value > 0 // 确保是正整数
        }
    },

    data() {
        return {
            // data 中的this 并不指向 Vue 实例本身，而是指向当前 data 对象。直接调用 methods 中的方法（如 this.generateRandomContents）会导致错误
            // 所以可以先将data内属性初始化为null或''，在合适的地方再赋值
            size: 0, // 记忆数量
            memoryCountDown: null, // 记忆倒计时秒数
            recallCountDown: null, // 回想倒计时秒数
            recallTime: null, // 回想时间统计
            reverseCount: null, // 翻牌次数
            isPreStarting: false, // 是否在预开始
            isCountingDown: false, // 是否在倒计时
            isRecalling: false, // 是否在回想
            isEnding: false, // 是否在结束阶段
            cards: [], // 先初始化为空数组
            targetCardIndex: null, // 答案索引，先设为空
            question: '', // 问题描述，先设为空
            countDownTimer: null // 存储倒数定时器 ID，先设为空
        }
    },

    computed: {
        gridColumns() {
            // 根据 level 的值确定size的值，并动态返回列数和列宽,
            if (this.level === 1) return "repeat(2, max-content)";
            if (this.level === 2) return "repeat(3, max-content)";
            if (this.level === 3) return "repeat(3, max-content)";
            if (this.level === 4) return "repeat(4, max-content)";
            if (this.level === 5) return "repeat(4, max-content)";
        },

        dynaSize() {
            console.log("level: " + this.level);
            if (this.level === 1) this.size = 4;
            if (this.level === 2) this.size = 6;
            if (this.level === 3) this.size = 9;
            if (this.level === 4) this.size = 12;
            if (this.level === 5) this.size = 16;
            return this.size;
        }
    },

    created() {
        console.log("created()执行了");
        this.initGame();
    },

    methods: {
        // 初始化游戏状态
        initGame() {
            // 先清除定时器，防止有定时器仍在运行，错误改变游戏状态
            if (this.countDownTimer) {
                clearInterval(this.countDownTimer);
                this.countDownTimer = null;
            }

            this.memoryCountDown = 2;
            this.recallCountDown = 2;
            this.recallTime = 0;
            this.reverseCount = 0;
            this.isPreStarting = true;
            this.isCountingDown = false;
            this.isRecalling = false;
            this.isEnding = false;
            this.cards = this.generateRandomContents().map(element => ({ // .map() 是数组方法，返回一个旧数组内每个元素改造为对象后的新数组
                content: element,
                isFront: false // 默认卡牌背面朝上
            }));
            this.targetCardIndex = Math.floor(Math.random() * this.dynaSize); // 注意范围别超了
            this.question = '找出卡牌 ' + this.cards[this.targetCardIndex].content;
            console.log("targetCardIndex: " + this.targetCardIndex); // 暴露答案
        },


        // 记忆倒计时
        memoryCountingDown() {
            this.isPreStarting = false;
            this.isCountingDown = true;
            for (var i = 0; i < this.size; i++) {
                this.cards[i].isFront = true;
            }

            // 设置定时器
            this.countDownTimer = setInterval(() => { // setInterval 是 JavaScript 提供的一个内置函数，用于定时重复执行某个函数，返回一个唯一的定时器 ID 来停止定时器
                if (this.memoryCountDown > 0) {
                    this.memoryCountDown--;
                } else {
                    clearInterval(this.countDownTimer); // clearInterval 停止由 setInterval 创建的定时器，函数不再定时执行
                    this.countDownTimer = null;

                    this.isCountingDown = false;
                    for (var i = 0; i < this.size; i++) {
                        this.cards[i].isFront = false;
                    }
                    this.isRecalling = true;
                    this.recallCountingDown();
                }
            }, 1000);
        },


        // 回忆倒计时
        recallCountingDown() {
            // 设置定时器
            this.countDownTimer = setInterval(() => {
                // 维护回忆倒数时间和回忆时间
                if (this.recallCountDown > 0) {
                    this.recallCountDown--;
                    this.recallTime++;
                } else {
                    alert("时间到，正确答案是第" + (this.targetCardIndex + 1) + "个");
                    this.saveHistory(0, this.reverseCount, this.recallTime);
                    this.cards[this.targetCardIndex].isFront = true;
                    this.isRecalling = false;
                    this.isEnding = true;

                    if (this.$store.state.isOnlineMode == true) {
                        this.$router.push({
                            path: '/resultview',
                        })
                    }

                    clearInterval(this.countDownTimer);
                    this.countDownTimer = null;
                }
            }, 1000);
        },


        // 翻牌
        reverseCard(index) {
            if (this.isRecalling) { // Recalling阶段的点击才能翻转卡牌
                this.cards[index].isFront = !this.cards[index].isFront;
                this.reverseCount++; // 统计翻牌次数 
            }
        },
        // 验证翻牌结果
        checkCard(index) {
            if (this.isRecalling && this.cards[index].isFront && index === this.targetCardIndex) { // Recalling阶段正面状态的正确卡牌才能弹窗
                // 如果翻牌成功，立刻停止回忆计时
                clearInterval(this.countDownTimer);
                this.countDownTimer = null;

                alert("Nice！你只花了" + this.recallTime + "秒，" + this.reverseCount + "次翻牌");
                this.saveHistory(1, this.reverseCount, this.recallTime);
                this.isRecalling = false;
                this.isEnding = true;

                if (this.$store.state.isOnlineMode == true) {
                    this.$router.push({
                        path: '/resultview',
                    })
                }

            }
        },
        // 处理卡牌点击事件
        handleCardClick(index) {
            this.reverseCard(index); // 先执行 clickCard 逻辑
            this.$nextTick(() => {
                // this.$nextTick() 确保代码在 Vue DOM 更新队列执行后 执行。但 Vue视图的真正渲染，可能还需要等待下一帧，所以再用 setTimeout(..., 0) 让它在下一帧执行，确保视图已经更新。
                setTimeout(() => {
                    this.checkCard(index);
                }, 0);
            });
        },


        // 生成一个随机字母（A-Z）
        getRandomLetter() {
            const charCode = Math.floor(Math.random() * 26) + 65; // A-Z 的 ASCII 码范围是 65-90
            return String.fromCharCode(charCode);
        },
        // 生成并返回 16 个不重复的随机字母数组
        generateRandomContents() {
            const contents = new Set(); // 使用 Set 确保值唯一（不重复）
            while (contents.size < 16) {
                const randomLetter = this.getRandomLetter();
                contents.add(randomLetter);
            }
            return Array.from(contents); // 将 Set 转换为数组
        },

        goHome() {
            this.initGame();
            this.isPreStarting = false;
            this.$router.push({
                path: '/home'
            })
        },

        async saveHistory(success, reverseCount, recallTime) {
            try {
                // 构造游戏历史数据
                var result = success ? Math.round(success * (1 / reverseCount) * (1 / (recallTime + 1)) * 25 * this.size) : 0;
                // 保存result到vuex
                this.$store.commit('setMyScore', result);

                const gameHistory = {
                    gameType: 'RecallOldLocation',
                    score: result,
                    gameData: JSON.stringify([{ 'success': Number(success) }, { 'reverseCount': Number(reverseCount) }, { 'recallTime': Number(recallTime) }]),
                    playedAt: new Date().toISOString(),
                    roomId: this.$store.state.isOnlineMode == true ? this.$store.state.roomId : null,
                };

                const config = {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    }
                };

                // 发送 POST 请求
                const response = await this.$axios.post('/api/game/history', gameHistory, config);

                console.log('游戏历史保存成功:', response.data);

            } catch (error) {
                console.error('保存游戏历史失败:', error);
                alert('保存失败：' + (error.response?.data?.message || error.message));
            }
        },

        nextLevel() {
            this.initGame();
            // this.isPreStarting = false;

            if (this.level === 5) {
                alert("已经是最高难度了，不能再升级了！");
                return;
            }

            this.$router.push({
                path: '/recalllocation',
                query: {
                    level: this.level + 1
                }
            })
        }
    }
}
</script>

<style scoped>
#countDownBanner {
    text-align: center;
}

#questionBanner {
    text-align: center;
}

#cardsArea {
    display: grid;
    /*使用 CSS Grid 布局，创建规则的网格*/
    justify-content: center;
    gap: 10px;
    padding: 10px;
}

.card {
    display: inline-block;
    width: 100px;
    height: 100px;
    border: 1px solid black;
    margin: 5px;
    text-align: center;
    line-height: 100px;
    font-size: 28px;
    background-color: lightgray;
}

#controllerBanner {
    text-align: center;
    padding: 15px;
    display: flex; /* 使用弹性布局 */
    flex-direction: row; /* 水平排列 */
    justify-content: center; /* 水平居中 */
    gap: 15px; /* 设置按钮之间的间距 */
}

#controllerBanner button {
  padding: 10px 20px; /* 设置按钮内边距 */
  font-size: 15px; /* 设置文字大小 */
  border: none; /* 移除边框 */
  border-radius: 6px; /* 设置圆角 */
  background-color: #e9ecef; /* 设置默认背景色为浅灰色 */
  color: #495057; /* 设置文字颜色为深灰色 */
  cursor: pointer; /* 设置鼠标样式 */
  transition: all 0.3s ease; /* 添加过渡效果 */
  width: 120px; /* 统一按钮宽度 */
  margin: 0; /* 移除默认外边距 */
}

#controllerBanner button:hover {
  background-color: #dee2e6; /* 鼠标悬停时的背景色 */
  transform: translateY(-2px); /* 悬停时上移效果 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); /* 添加轻微阴影 */
}

#controllerBanner button:active {
  transform: translateY(0); /* 点击时恢复位置 */
  box-shadow: none; /* 移除阴影 */
}

#controllerBanner button:disabled {
  background-color: #f8f9fa; /* 禁用状态的背景色 */
  color: #adb5bd; /* 禁用状态的文字颜色 */
  cursor: not-allowed; /* 禁用状态的鼠标样式 */
  transform: none; /* 移除变换效果 */
  box-shadow: none; /* 移除阴影 */
}

</style>
