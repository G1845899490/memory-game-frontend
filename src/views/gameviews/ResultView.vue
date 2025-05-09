<template>
    <div class="result-container">
        <div class="result-content">
            <h2 class="result-title">PK 结果</h2>
            
            <div class="score-section">
                <div class="score-item">
                    <h3>你的分数</h3>
                    <p class="score">{{ myScore }}</p>
                </div>
                
                <div class="score-item">
                    <h3>{{ opponentUsername }}</h3>
                    <p v-if="!opponentHasResult" class="status">游戏中...</p>
                    <p v-else class="score">{{ opponentScore }}</p>
                </div>
            </div>

            <div v-if="opponentHasResult" class="result-section">
                <p class="result-text">{{ myScore > opponentScore ? '胜利' : myScore < opponentScore ? '失败' : '平局' }}</p>
            </div>

            <button @click="goHome" class="home-button">返回首页</button>
        </div>
    </div>
</template>

<script>

export default {
    name: 'ResultView',
    data() {
        return {
            myScore: this.$store.state.myScore,
            opponentScore: -1,
            opponentUsername: this.$store.state.enemyUsername,
            opponentHasResult: false,
            pollInterval: null
        };
    },

    created() {
        this.checkResult();
        this.pollInterval = setInterval(this.checkResult, 3000);
    },

    beforeDestroy() { clearInterval(this.pollInterval); },

    methods: {
        async checkResult() {
            try {
                const response = await this.$axios.get(`/api/match/resultquery/${this.$store.state.roomId}/${this.$store.state.enemyUsername}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });

                console.log("查询结果:", response.data);

                // 如果response.data为空，表示对方还没有结果，等待
                if (response.data === '') {
                    this.opponentHasResult = false;
                    return;
                }
                
                if (response.data >= 0) {
                    this.opponentHasResult = true;
                    this.opponentScore = response.data;
                    clearInterval(this.pollInterval);
                }
            } catch (error) {
                console.error('查询结果失败:', error);
            }
        },

        goHome() {
            // 清除前端和后端匹配状态
            this.removeRoom();

            this.$store.commit('setIsMatching', false);
            this.$store.commit('setIsMatched', false);
            this.myScore = -1;
            this.$store.commit('setMyScore', -1);
            this.opponentHasResult = false;
            this.opponentScore = -1;
            this.opponentUsername = '';
            this.$store.commit('setEnemyUsername', '');
            this.$store.commit('setRoomId', '');
            let destination = {
                path: '',
                level: -1,
            };
            this.$store.commit('setDestination', destination);

            this.$router.push({ name: 'home' })
        },

        removeRoom() {
            this.$axios.post('/api/match/removeroom', {
                roomId: this.$store.state.roomId,
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            }).then(response => {
                console.log("房间删除成功:", response.data);
            }).catch(error => {
                console.error("房间删除失败:", error);
            });
        }
    }
};
</script>

<style scoped>
.result-container {
    max-width: 600px; /* 设置最大宽度 */
    margin: 0 auto; /* 水平居中 */
    padding: 20px; /* 设置内边距 */
    min-height: 100vh; /* 最小高度占满视口 */
    display: flex; /* 使用弹性布局 */
    flex-direction: column; /* 垂直方向排列 */
    justify-content: flex-start; /* 顶部对齐 */
    align-items: center; /* 水平居中 */
    padding-top: 100px; /* 从顶部开始留出一定距离 */
}

.result-content {
    background-color: #fff; /* 设置背景色为白色 */
    padding: 30px; /* 设置内边距 */
    border-radius: 8px; /* 设置圆角 */
    box-shadow: 0 2px 4px rgba(165, 44, 44, 0.05); /* 添加阴影效果 */
    width: 100%; /* 宽度占满容器 */
    text-align: center; /* 文字居中 */
}

.result-title {
    font-size: 28px; /* 设置标题文字大小 */
    color: #333; /* 设置标题文字颜色 */
    margin: 0 0 30px 0; /* 设置外边距 */
    font-weight: 600; /* 设置文字粗细 */
}

.score-section {
    display: flex; /* 使用弹性布局 */
    justify-content: space-around; /* 均匀分布 */
    margin-bottom: 30px; /* 与下方内容保持间距 */
    gap: 20px; /* 设置间距 */
}

.score-item {
    flex: 1; /* 平均分配空间 */
    padding: 20px; /* 设置内边距 */
    background-color: #f8f9fa; /* 设置背景色 */
    border-radius: 6px; /* 设置圆角 */
}

.score-item h3 {
    font-size: 18px; /* 设置标题文字大小 */
    color: #495057; /* 设置标题文字颜色 */
    margin: 0 0 10px 0; /* 设置外边距 */
}

.score {
    font-size: 32px; /* 设置分数文字大小 */
    color: #333; /* 设置分数文字颜色 */
    font-weight: 600; /* 设置文字粗细 */
    margin: 0; /* 移除默认外边距 */
}

.status {
    font-size: 16px; /* 设置状态文字大小 */
    color: #6c757d; /* 设置状态文字颜色 */
    margin: 0; /* 移除默认外边距 */
}

.result-section {
    margin: 20px 0; /* 设置外边距 */
    padding: 15px; /* 设置内边距 */
    border-radius: 6px; /* 设置圆角 */
}

.result-text {
    font-size: 20px; /* 设置结果文字大小 */
    color: #333; /* 设置结果文字颜色 */
    font-weight: 500; /* 设置文字粗细 */
    margin: 0; /* 移除默认外边距 */
}

.home-button {
    padding: 10px 30px; /* 设置按钮内边距 */
    background-color: #6c757d; /* 设置按钮背景色 */
    color: white; /* 设置按钮文字颜色 */
    border: none; /* 移除边框 */
    border-radius: 6px; /* 设置圆角 */
    font-size: 16px; /* 设置文字大小 */
    cursor: pointer; /* 鼠标悬停时显示手型光标 */
    transition: all 0.3s ease; /* 添加过渡效果 */
    margin-top: 20px; /* 与上方内容保持间距 */
}

.home-button:hover {
    background-color: #5a6268; /* 鼠标悬停时背景色变深 */
    transform: translateY(-2px); /* 鼠标悬停时按钮轻微上浮 */
}

/* 响应式布局 */
@media (max-width: 768px) {
    .result-container {
        padding: 15px; /* 在小屏幕上减小内边距 */
    }

    .result-content {
        padding: 20px; /* 在小屏幕上减小内边距 */
    }

    .result-title {
        font-size: 24px; /* 在小屏幕上减小标题文字大小 */
    }

    .score-section {
        flex-direction: column; /* 在小屏幕上改为垂直排列 */
        gap: 15px; /* 减小间距 */
    }

    .score {
        font-size: 28px; /* 在小屏幕上减小分数文字大小 */
    }

    .result-text {
        font-size: 18px; /* 在小屏幕上减小结果文字大小 */
    }

    .home-button {
        padding: 8px 25px; /* 在小屏幕上减小按钮内边距 */
        font-size: 14px; /* 在小屏幕上减小文字大小 */
    }
}
</style>