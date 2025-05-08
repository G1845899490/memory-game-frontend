<template>
    <div>
        <h2>PK 结果</h2>
        <p>你的分数: {{ myScore }}<br></p>
        <p v-if="!opponentHasResult">{{ opponentUsername }} 游戏中...</p>
        <p v-else>
            {{ opponentUsername }} 的分数: {{ opponentScore }}<br>
            结果: {{ myScore > opponentScore ? '胜利' : myScore < opponentScore ? '失败' : '平局' }} </p>
                <button @click="goHome">返回首页</button>
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

                // 如果response.data为空
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