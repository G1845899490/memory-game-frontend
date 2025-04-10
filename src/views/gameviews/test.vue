<template>
    <div class="recall-old-location">
        <!--倒计时区-->
        <div id="countDownBanner">
            <h2 v-bind:style="{ visibility: isMemorzing||isRecalling ? 'visible' : 'hidden' }">剩余时间：{{ memoryCountDown }}秒</h2>
        </div>

        <!--问题描述区-->
        <div id="questionBanner">
            <h2 v-bind:style="{ visibility: isRecalling || isEnding ? 'visible' : 'hidden' }">{{ question }}</h2>
        </div>

        <!--卡牌区-->
        <div id="cardsArea" v-bind:style="{ 'grid-template-columns': gridColumns }">
            <div class="card" v-for="(card, index) in cards.slice(0, size)" :key="index"
                v-on:click="handleCardClick(index)">
                <div>
                    {{ card }}
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
            <button v-on:click="goHome">回到首页
            </button>
            <button v-on:click="goGetHistory">游戏历史
            </button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'DiscoverNewContentView',
    props: {
        size: {
            type: Number,
            required: true,
            validator: value => Number.isInteger(value) && value > 0 // 确保是正整数
        }
    },
    data() {
        return {
            memoryCountDown: null, // 记忆倒计时秒数
            recallCountDown: null, // 回想倒计时秒数
            recallTime: null, // 回想时间统计
            reverseCount: null, // 翻牌次数
            isPreStarting: false, // 是否在预开始
            isMemorzing: false, // 是否在记忆
            isRecalling: false, // 是否在回想
            isEnding: false, // 是否在结束阶段
            cards: [], // 先初始化为空数组
            targetCardIndex: null, // 答案索引，先设为空
            question: '找到新出现的图片', 
            countDownTimer: null // 存储倒数定时器 ID，先设为空
        }
    },

    computed: {
        gridColumns() {
            // 根据 size 的值动态返回列数和列宽
            if (this.size === 4) return "repeat(2, max-content)";
            if (this.size === 6) return "repeat(3, max-content)";
            if (this.size === 9) return "repeat(3, max-content)";
            if (this.size === 12) return "repeat(4, max-content)";
            if (this.size === 16) return "repeat(4, max-content)";
        }
    },

    created() {
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
            this.isMemorzing = false;
            this.isRecalling = false;
            this.isEnding = false;
            this.cards = this.generateRandomContents().map(element => ({ // .map() 是数组方法，返回一个旧数组内每个元素改造为对象后的新数组
                content: element,
                isFront: false // 默认卡牌背面朝上
            }));
            this.targetCardIndex = Math.floor(Math.random() * this.size); // 注意范围别超了
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
                var result = Math.round(success * (1 / reverseCount) * (1 / (recallTime + 1)) * 25 * this.size);
                const gameHistory = {
                    gameType: 'RecallOldLocation',
                    score: result,
                    gameData: JSON.stringify([{'success': Number(success)}, {'reverseCount': Number(reverseCount)}, {'recallTime': Number(recallTime)}]),
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

        goGetHistory() {
            this.initGame();
            this.isPreStarting = false;
            this.$router.push({
                path: '/history'
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
}

#controllerBanner button {
    margin: 15px;
}
</style>
