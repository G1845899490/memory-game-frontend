<!-- views/gameviews/MatchView.vue -->
<template>
    <div>
        <h2 v-if="this.$store.state.isMatching">匹配中...</h2>
        <h2 v-if="this.$store.state.isMatched">匹配成功，对手是：{{ this.$store.state.enemyUsername }}</h2>
        <h2 v-if="this.$store.state.isMatched">即将进入游戏：{{ this.countDown }}</h2>

        <button @click="cancelMatch">取消匹配</button>
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