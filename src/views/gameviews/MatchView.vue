<!-- views/gameviews/MatchView.vue -->
<template>
    <div class="match-container">
        <div class="match-content">
            <div class="match-status">
                <h2 v-if="this.$store.state.isMatching" class="status-text">匹配中...</h2>
                <h2 v-if="this.$store.state.isMatched" class="status-text">匹配成功，对手是：{{ this.$store.state.enemyUsername }}</h2>
                <h2 v-if="this.$store.state.isMatched" class="countdown-text">即将进入游戏：{{ this.countDown }}</h2>
            </div>

            <button @click="cancelMatch" class="cancel-button">取消匹配</button>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'MatchView',

    data() {
        return {
            pollInterval: null,
            countDownTimer: null,
            countDown: 3,
        };
    },

    created() {
        // console.log('=========MatchView created========');
        this.apply();
    },

    beforeDestroy() {
        clearInterval(this.pollInterval);
        clearInterval(this.countDownTimer);
    },

    methods: {
        async apply() {
            this.$store.commit('setIsMatched', false);
            console.log("apply()执行");

            const response = await this.$axios.post('/api/match/apply', {
                username: localStorage.getItem('username'),
                gameType: this.$store.state.destination.path,
                gameLevel: this.$store.state.destination.level,
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            this.$store.commit('setIsMatching', response.data);

            console.log("state.isMatching: " + this.$store.state.isMatching);
            console.log("matching: ", response.data);

            if (this.$store.state.isMatching) {
                this.matchQuery();
            }
        },

        async matchQuery() {
            console.log("matchQuery()执行");
            this.pollInterval = setInterval(async () => {
                console.log("matchQuery()定时器执行");

                const response = await this.$axios.get(`/api/match/matchquery`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });

                console.log("matchQuery()匹配查询返回: ", response.data);

                if (response.data != 'no') {
                    this.$store.commit('setIsMatching', false);
                    this.$store.commit('setIsMatched', true);
                    const [roomId, enemyUsername] = response.data.split(',');
                    this.$store.commit('setRoomId', roomId);
                    this.$store.commit('setEnemyUsername', enemyUsername);
                    // 匹配成功后启动倒计时
                    this.startCountDown();
                    // 匹配成功后清除定时器
                    clearInterval(this.pollInterval);
                    this.pollInterval = null;
                }
            }, 5000);
        },

        startCountDown() {
            this.countDownTimer = setInterval(() => {
                if (this.countDown > 0) {
                    this.countDown--;
                } else {
                    // 倒计时结束，开启游戏
                    this.enterGame();
                    clearInterval(this.countDownTimer);
                    this.countDownTimer = null;
                }
            }, 1000);
        },

        enterGame() {
            console.log("enterGame()执行");

            let path = this.$store.state.destination.path;
            let level = this.$store.state.destination.level;

            console.log("enterGame()中的path: " + path);
            console.log("enterGame()中的level: " + level);

            // 检查当前路由是否已经是目标路由
            if (this.$route.path === path && this.$route.query.level === level) {
                console.log("已经在目标路由，无需导航");
                return;
            }

            if (path === '/recallcontent') {
                this.$router.push({
                    path: path,
                })
                return;
            }

            if (path === '/discoverlocation') {
                this.$router.push({
                    path: path,
                    query: { size: level }
                })
                return;
            }

            this.$router.push({
                path: path,
                query: { level: level }
            });
        },

        async cancelMatch() {
            this.$store.state.isMatching = false;
            this.$store.state.isMatched = false;

            await axios.post(`/api/match/removeuser`, {
                username: localStorage.getItem('username'),
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            this.$router.push({ name: 'home' });
        }
    }
};
</script>

<style scoped>
.match-container {
    max-width: 600px; /* 设置最大宽度 */
    margin: 0 auto; /* 水平居中 */
    padding: 20px; /* 设置内边距 */
    min-height: 100vh; /* 最小高度占满视口 */
    display: flex; /* 使用弹性布局 */
    flex-direction: column; /* 垂直方向排列 */
    justify-content: flex-start; /* 改为顶部对齐 */
    align-items: center; /* 水平居中 */
    padding-top: 100px; /* 从顶部开始留出一定距离 */
}

.match-content {
    background-color: #fff; /* 设置背景色为白色 */
    padding: 30px; /* 设置内边距 */
    border-radius: 8px; /* 设置圆角 */
    box-shadow: 0 2px 4px rgba(165, 44, 44, 0.05); /* 添加阴影效果 */
    width: 100%; /* 宽度占满容器 */
    text-align: center; /* 文字居中 */
}

.match-status {
    margin-bottom: 30px; /* 与按钮保持间距 */
}

.status-text {
    font-size: 24px; /* 设置文字大小 */
    color: #333; /* 设置文字颜色 */
    margin: 0 0 15px 0; /* 设置外边距 */
    font-weight: 600; /* 设置文字粗细 */
}

.countdown-text {
    font-size: 20px; /* 设置文字大小 */
    color: #495057; /* 设置文字颜色 */
    margin: 10px 0; /* 设置外边距 */
}

.cancel-button {
    padding: 10px 30px; /* 设置按钮内边距 */
    background-color: #6c757d; /* 设置按钮背景色 */
    color: white; /* 设置按钮文字颜色 */
    border: none; /* 移除边框 */
    border-radius: 6px; /* 设置圆角 */
    font-size: 16px; /* 设置文字大小 */
    cursor: pointer; /* 鼠标悬停时显示手型光标 */
    transition: all 0.3s ease; /* 添加过渡效果 */
}

.cancel-button:hover {
    background-color: #5a6268; /* 鼠标悬停时背景色变深 */
    transform: translateY(-2px); /* 鼠标悬停时按钮轻微上浮 */
}

/* 响应式布局 */
@media (max-width: 768px) {
    .match-container {
        padding: 15px; /* 在小屏幕上减小内边距 */
    }

    .match-content {
        padding: 20px; /* 在小屏幕上减小内边距 */
    }

    .status-text {
        font-size: 20px; /* 在小屏幕上减小文字大小 */
    }

    .countdown-text {
        font-size: 18px; /* 在小屏幕上减小文字大小 */
    }

    .cancel-button {
        padding: 8px 25px; /* 在小屏幕上减小按钮内边距 */
        font-size: 14px; /* 在小屏幕上减小文字大小 */
    }
}
</style>