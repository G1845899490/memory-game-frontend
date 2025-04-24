<template>
  <div class="leaderboard-container">
    <!-- 游戏类型选择 -->
    <div class="game-type-selector">
      <label>选择游戏类型：</label>
      <select v-model="selectedGameType" @change="fetchLeaderboard">
        <option value="DiscoverNewLocation">发现新位置</option>
        <option value="DiscoverNewContent">发现新内容</option>
        <option value="RecallOldLocation">回忆旧位置</option>
        <option value="RecallOldContent">回忆旧内容</option>
      </select>
      <span>&nbsp;</span>
      <button @click="goHome">返回首页</button>
    </div>

    <!-- 排行榜列表 -->
    <div class="leaderboard-table" ref="tableContainer">
      <table>
        <thead>
          <tr>
            <th>排名</th>
            <th>玩家</th>
            <th>分数</th>
          </tr>
        </thead>
        <tbody @scroll="handleScroll">
          <tr v-for="(player, index) in leaderboardData" :key="index" :class="{ 'highlight': player.isCurrentUser }">
            <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
            <td>{{ player.username }}</td>
            <td>{{ player.score }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页控件 -->
    <div class="pagination">
      <button @click="prevPage" :disabled="currentPage === 1">上一页</button>
      <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
      <button @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
    </div>

    <!-- 个人成绩（固定底部） -->
    <div class="my-rank">
      <h3>我的成绩</h3>
      <p v-if="myRank.rank <= 100">排名: {{ myRank.rank }} | 分数: {{ myRank.score }}</p>
      <p v-else>未上榜 | 分数: {{ myRank.score }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LeaderBoardView',
  data() {
    return {
      selectedGameType: 'DiscoverNewLocation', // 默认游戏类型
      leaderboardData: [], // 当前页数据
      currentPage: 1, // 当前页码
      pageSize: 30, // 每页条数
      totalItems: 0, // 总条数（上限 100）
      totalPages: 0, // 总页数
      myRank: { rank: 0, score: 0 }, // 我的排名和分数
    };
  },

  created() {
    this.fetchLeaderboard();
  },

  watch: {
    selectedGameType(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.currentPage = 1; // 重置到第1页
        this.fetchLeaderboard(); // 重新获取排行榜数据
        console.log("selectedGameType变化了，重新获取排行榜数据");
        console.log("watched selectedGameType执行了");
      }
    }
  },

  methods: {
    async fetchLeaderboard() {
      try {
        const response = await this.$axios.get('/api/leaderboard', {
          params: {
            gameType: this.selectedGameType,
            page: this.currentPage,
            pageSize: this.pageSize,
          },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        let { leaderboard, total, myRank } = response.data;

        console.log("rank: " + myRank.rank);
        console.log("score: " + myRank.score);

        if (this.currentPage === 4) {
          leaderboard = leaderboard.slice(0, 10); // 仅获取前10条数据
        }

        // leaderboard是一个数组，循环遍历leaderboard的内容
        // leaderboard.forEach((element, index) => {
        //   console.log(index + " " + element.username);
        // });


        this.leaderboardData = leaderboard.map(player => ({
          ...player,
          isCurrentUser: player.username === this.getCurrentUsername(), // 假设有方法获取当前用户名
        }));

        // console.log('排行榜数据:', this.leaderboardData);
        // console.log(this.leaderboardData[0]);
        // console.log(this.leaderboardData[0].isCurrentUser);
        // console.log(this.leaderboardData[1]);
        // console.log(this.leaderboardData[1].isCurrentUser);

        this.totalItems = Math.min(total, 100); // 限制前 100
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        // this.myRank = myRank || { rank: 101, score: 0 }; // 未上榜时默认值
        this.myRank = myRank;
      } catch (error) {
        console.error('获取排行榜失败:', error);
      }
    },

    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.fetchLeaderboard();
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.fetchLeaderboard();
      }
    },

    handleScroll(event) {
      // 可选：实现滚动加载下一页
    },

    getCurrentUsername() {
      console.log('获取当前用户名' + localStorage.getItem('username'));

      return localStorage.getItem('username') || 'Guest';
    },

    goHome() {
      this.$router.push({
        path: '/home'
      })
    },
  },
};
</script>

<style scoped>
.leaderboard-container {
  padding: 20px;
  padding-bottom: 100px;
}

.game-type-selector {
  margin-bottom: 20px;
}

.leaderboard-table {
  max-height: 500px;
  overflow-y: auto;
}

table {
  width: 80%;
  max-width: 800px;
  margin: 0 auto;
  border-collapse: collapse;
}

th,
td {
  padding: 10px;
  border: 1px solid #ccc;
  text-align: center;
}

thead {
  background-color: #f5f5f5;
  position: sticky;
  top: 0;
}

.highlight {
  background-color: #ffff99;
}

.pagination {
  margin: 20px 0 30px 0;
  text-align: center;
  position: relative;
  z-index: 1;
}

.my-rank {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: #fff;
  padding: 15px 10px;
  border-top: 1px solid #ccc;
  text-align: center;
  z-index: 10;
  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
}

.my-rank h3 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.my-rank p {
  margin: 0;
  font-size: 14px;
}
</style>