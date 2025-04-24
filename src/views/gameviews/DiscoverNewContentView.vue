<template>
    <div class="discover-new-content-view">
        <!--倒计时区-->
        <div id="countDownBanner">
            <h2 v-bind:style="{ visibility: isMemorizing || isRecalling ? 'visible' : 'hidden' }">剩余时间：{{ countDown }}秒
            </h2>
        </div>

        <!-- 问题描述区 -->
        <div id="questionBanner">
            <h2 v-bind:style="{ visibility: isRecalling || isEnding ? 'visible' : 'hidden' }">找出新出现的图片</h2>
        </div>

        <!--卡牌区-->
        <div class="cardsArea" v-bind:style="{ 'grid-template-columns': gridColumns }">
            <div class="card" v-for="(card, index) in cards.slice(0, dynaSize)" :key="index" :class="{
                'right': index === randomIndex && isEnding,
                'wrong': index === clickedIndex && index !== randomIndex && isEnding,
            }" v-on:click="handleCardClick(index)">
                <div v-bind:style="{ visibility: card.isFront ? 'visible' : 'hidden' }">
                    {{ card.content }}
                </div>
            </div>
        </div>

        <!--游戏控制区-->
        <div class="controllerBanner">
            <button v-bind:disabled="!isPreStarting" v-on:click="startMemorizing">
                开始记忆
            </button>
            <button v-bind:disabled="!isMemorizing" v-on:click="startRecalling">
                立刻回忆
            </button>
            <button v-on:click="resetGame">
                重开一局
            </button>
            <button v-on:click="nextLevel">
                下一难度
            </button>
            <button v-on:click="goHome">
                回到首页
            </button>
        </div>
    </div>
</template>

<script>

export default {
    name: 'DiscoverNewContentView',

    props: {
        level: {
            type: Number,
            required: true,
            validator: value => Number.isInteger(value) && value > 0 // 确保是正整数
        }
    },

    data() {
        return {
            isPreStarting: true,
            isMemorizing: false,
            isRecalling: false,
            isEnding: false,

            countDown: -1,
            countDownTimer: null, // 存储倒数定时器 ID

            cards: [],
            randomCards: [],
            randomIndex: null, // 答案索引
            clickedIndex: null, // 新增：记录用户点击的卡牌索引

            success: 0,
            memoryTime: 0,
            recallTime: 0,
        }
    },

    created() {
        this.resetGame();
    },

    computed: {
        gridColumns() {
            console.log("gridColumns()执行了");

            console.log("this.level: " + this.level);


            // 根据 size 的值动态返回列数和列宽
            if (this.level === 1) return "repeat(2, max-content)";
            if (this.level === 2) return "repeat(3, max-content)";
            if (this.level === 3) return "repeat(3, max-content)";
            if (this.level === 4) return "repeat(4, max-content)";
            if (this.level === 5) return "repeat(4, max-content)";
            if (this.level === 6) return "repeat(5, max-content)";
        },

        dynaSize() {
            if (this.level === 1) this.size = 4;
            if (this.level === 2) this.size = 6;
            if (this.level === 3) this.size = 9;
            if (this.level === 4) this.size = 12;
            if (this.level === 5) this.size = 16;
            if (this.level === 6) this.size = 20;
            return this.size;
        }
    },

    methods: {
        resetGame() {
            this.isPreStarting = true;
            this.isMemorizing = false;
            this.isRecalling = false;
            this.isEnding = false;
            this.countDown = -1;
            this.cards = this.getRandomContents().map(element => ({ // .map() 是数组方法，将旧数组内每个元素改造为新对象后的新数组
                content: element,
                isFront: false
            }));
            this.randomCards = [];
            this.randomIndex = null;
            clearInterval(this.countDownTimer); // 清除倒计时器
            this.clickedIndex = null; // 重置点击索引
            this.success = 0;
            this.memoryTime = 0;
            this.recallTime = 0;
        },

        startMemorizing() {
            clearInterval(this.countDownTimer);
            this.isPreStarting = false;
            this.isMemorizing = true;

            this.cards.forEach(card => {
                card.isFront = true;
            });

            this.countDown = 2;
            this.countDownTimer = setInterval(() => {
                if (this.countDown > 0) {
                    this.memoryTime++;
                    this.countDown--;
                } else {
                    clearInterval(this.countDownTimer);
                    this.startRecalling();
                }
            }, 1000);
        },

        startRecalling() {
            clearInterval(this.countDownTimer);
            this.isMemorizing = false;
            this.isRecalling = true;

            this.randomCards = this.cards.slice(0, this.dynaSize).sort(() => Math.random() - 0.5);
            this.randomIndex = Math.floor(Math.random() * this.dynaSize);
            console.log("randomIndex: " + this.randomIndex); // 暴露答案
            let temp = this.cards[this.dynaSize];
            this.randomCards[this.randomIndex] = temp;
            this.cards = this.randomCards;

            this.countDown = 2;
            this.countDownTimer = setInterval(() => {
                if (this.countDown > 0) {
                    this.recallTime++;
                    this.countDown--;
                } else {
                    clearInterval(this.countDownTimer);
                    this.saveHistory(this.success, this.memoryTime, this.recallTime);
                    alert("时间到！你没有找到新出现的图片！");
                    this.startEnding();
                }
            }, 1000);
        },

        startEnding() {
            clearInterval(this.countDownTimer);
            this.isRecalling = false;
            this.isEnding = true;
        },

        // 生成一个随机字母（A-Z）
        getRandomLetter() {
            const charCode = Math.floor(Math.random() * 26) + 65; // A-Z 的 ASCII 码范围是 65-90
            return String.fromCharCode(charCode);
        },
        // 生成并返回 21 个不重复的随机字母数组
        getRandomContents() {
            const contents = new Set(); // 使用 Set 确保值唯一（不重复）
            while (contents.size < 21) {
                const randomLetter = this.getRandomLetter();
                contents.add(randomLetter);
            }
            return Array.from(contents); // 将 Set 转换为数组
        },

        handleCardClick(index) {
            this.clickedIndex = index; // 记录点击的索引
            if (this.isRecalling) {
                if (index === this.randomIndex) {
                    this.startEnding();
                    this.success = 1;
                    this.saveHistory(this.success, this.memoryTime, this.recallTime);
                    alert("Nice！你找到了新出现的图片！");
                } else {
                    this.startEnding();
                    this.saveHistory(this.success, this.memoryTime, this.recallTime);
                    alert("Oops！这不是新出现的图片！");
                }
            }
        },

        goHome() {
            this.resetGame();
            this.isPreStarting = false;
            this.$router.push({
                path: '/home'
            })
        },

        async saveHistory(success, memoryTime, recallTime) {
            try {
                var result = Math.round(success * (1 / (memoryTime + 1)) * (1 / (recallTime + 1)) * 1000 * this.dynaSize);
                const gameHistory = {
                    gameType: 'DiscoverNewContent',
                    score: result,
                    gameData: JSON.stringify([{ 'success': Number(success) }, { 'memoryTime': Number(memoryTime) }, { 'recallTime': Number(recallTime) }]),
                    playedAt: new Date().toISOString()
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
            this.resetGame();
            
            if (this.level < 6) {
                this.level++;
                this.$router.push({
                    path: '/discoverContent',
                    query: {
                        level: this.level
                    }
                })
            } else {
                alert("已经是最高难度了！");
            }
        },
    }
}
</script>


<style scoped>
.cardsArea {
    display: grid;
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
    transition: background-color 0.22s;
    /* 平滑过渡效果 */
}

.right {
    background-color: #00ff00;
    /* 绿色高亮 */
}

.wrong {
    background-color: #ff0000;
    /* 红色高亮 */
}

/* 新增控制区样式 */
.controllerBanner {
    display: flex;
    /* 使用 Flexbox */
    justify-content: center;
    /* 按钮水平居中 */
    gap: 20px;
    /* 按钮间距 */
    padding: 20px;
    /* 控制区内边距 */
    flex-wrap: wrap;
    /* 如果空间不足，允许换行 */
}

.controllerBanner button {
    padding: 10px 20px;
    /* 按钮内边距 */
    font-size: 16px;
    /* 字体大小 */
    border: none;
    /* 移除默认边框 */
    border-radius: 5px;
    /* 圆角 */
    background-color: #007bff;
    /* 默认背景色 */
    color: white;
    /* 文字颜色 */
    cursor: pointer;
    /* 鼠标悬停时显示手型 */
    transition: background-color 0.3s;
    /* 平滑过渡 */
}

.controllerBanner button:disabled {
    background-color: #cccccc;
    /* 禁用状态颜色 */
    cursor: not-allowed;
    /* 禁用时鼠标样式 */
}

.controllerBanner button:hover:not(:disabled) {
    background-color: #0056b3;
    /* 悬停时颜色 */
}
</style>