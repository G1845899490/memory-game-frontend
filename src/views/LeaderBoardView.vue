<template>
  <div class="leaderboard-container">
    <!-- 游戏类型选择 -->
    <div class="filter-sort-container">
      <div class="filter-group">
        <div class="filter-item">
          <label class="form-label">游戏类型：</label>
          <select v-model="selectedGameType" @change="fetchLeaderboard" class="form-control">
            <option value="DiscoverNewLocation">发现新位置</option>
            <option value="DiscoverNewContent">发现新内容</option>
            <option value="RecallOldLocation">回忆旧位置</option>
            <option value="RecallOldContent">回忆旧内容</option>
          </select>
        </div>
        <div class="filter-item">
          <button class="back-button" @click="goHome">返回首页</button>
        </div>
      </div>
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

.filter-sort-container {
  background-color: #f8f9fa; /* 设置筛选区域背景色为浅灰色 */
  padding: 12px; /* 设置内边距 */
  border-radius: 8px; /* 设置圆角 */
  margin-bottom: 20px; /* 与下方内容保持间距 */
  box-shadow: 0 2px 4px rgba(165, 44, 44, 0.05); /* 添加轻微阴影效果 */
  max-width: 760px; /* 减小最大宽度，与表格对齐 */
  margin-left: auto; /* 水平居中 */
  margin-right: auto; /* 水平居中 */
}

.filter-group {
  display: flex; /* 使用弹性布局 */
  flex-wrap: wrap; /* 允许元素换行 */
  justify-content: space-between; /* 两端对齐，一个靠左一个靠右 */
  align-items: center; /* 垂直居中对齐 */
}

.filter-item {
  display: flex; /* 使用弹性布局 */
  align-items: center; /* 垂直居中对齐 */
  gap: 10px; /* 设置元素之间的间距 */
}

.form-label {
  font-size: 14px; /* 设置标签文字大小 */
  color: #495057; /* 设置标签文字颜色 */
  white-space: nowrap; /* 防止标签文字换行 */
}

.form-control {
  padding: 6px 12px; /* 设置输入框内边距 */
  border: 1px solid #ced4da; /* 设置边框 */
  border-radius: 4px; /* 设置圆角 */
  font-size: 14px; /* 设置文字大小 */
  color: #495057; /* 设置文字颜色 */
  background-color: #fff; /* 设置背景色为白色 */
  min-width: 120px; /* 设置最小宽度 */
}

.leaderboard-table {
  max-width: 780px; /* 设置最大宽度，与筛选区域对齐 */
  margin: 0 auto; /* 水平居中 */
  background-color: #fff; /* 设置背景色为白色 */
  border-radius: 8px; /* 设置圆角 */
  box-shadow: 0 2px 4px rgba(165, 44, 44, 0.05); /* 添加轻微阴影效果 */
  overflow-x: auto; /* 允许横向滚动 */
}

table {
  width: 100%; /* 表格宽度占满容器 */
  border-collapse: collapse; /* 合并表格边框 */
  font-size: 15px; /* 设置表格文字大小 */
}

th, td {
  padding: 12px 15px; /* 设置单元格内边距 */
  text-align: center; /* 文字居中对齐 */
  border-bottom: 1px solid #dee2e6; /* 设置底部边框 */
  line-height: 1.4; /* 设置行高 */
}

th {
  background-color: #f8f9fa; /* 设置表头背景色 */
  font-weight: 600; /* 设置表头文字粗细 */
  color: #495057; /* 设置表头文字颜色 */
  font-size: 15px; /* 设置表头文字大小 */
}

tbody tr:hover {
  background-color: #f8f9fa; /* 鼠标悬停时行背景色变化 */
}

.highlight {
  background-color: #e3f2fd; /* 高亮当前用户的行 */
  font-weight: 500; /* 加粗显示 */
}

.pagination {
  display: flex; /* 使用弹性布局 */
  justify-content: center; /* 水平居中对齐 */
  align-items: center; /* 垂直居中对齐 */
  gap: 15px; /* 减小元素之间的间距 */
  margin: 15px auto; /* 减小上下外边距 */
  max-width: 760px; /* 与表格对齐 */
}

.pagination button {
  padding: 4px 10px; /* 减小按钮内边距 */
  border: 1px solid #dee2e6; /* 设置边框 */
  background-color: #fff; /* 设置背景色为白色 */
  color: #495057; /* 设置文字颜色 */
  border-radius: 4px; /* 设置圆角 */
  cursor: pointer; /* 鼠标悬停时显示手型光标 */
  font-size: 13px; /* 减小文字大小 */
  transition: all 0.3s ease; /* 添加过渡效果 */
}

.pagination button:hover:not(:disabled) {
  background-color: #f8f9fa; /* 鼠标悬停时背景色变化 */
  border-color: #ced4da; /* 鼠标悬停时边框颜色变化 */
}

.pagination button:disabled {
  background-color: #f8f9fa; /* 禁用状态下的背景色 */
  color: #adb5bd; /* 禁用状态下的文字颜色 */
  cursor: not-allowed; /* 禁用状态下的鼠标样式 */
}

.pagination span {
  font-size: 13px; /* 减小页码信息文字大小 */
  color: #6c757d; /* 设置页码信息文字颜色 */
}

.my-rank {
  position: fixed; /* 固定定位 */
  bottom: 0; /* 固定在底部 */
  left: 0; /* 左对齐 */
  width: 100%; /* 宽度占满 */
  background-color: #fff; /* 设置背景色为白色 */
  padding: 12px 0; /* 设置内边距 */
  border-top: 1px solid #dee2e6; /* 上边框 */
  text-align: center; /* 文字居中 */
  z-index: 10; /* 确保显示在最上层 */
  box-shadow: 0 -2px 4px rgba(165, 44, 44, 0.05); /* 添加上方阴影 */
}

.my-rank h3 {
  font-size: 16px; /* 设置标题文字大小 */
  color: #333; /* 设置标题文字颜色 */
  margin: 0 0 8px 0; /* 设置标题下边距 */
  font-weight: 600; /* 设置文字粗细 */
}

.my-rank p {
  margin: 4px 0; /* 设置段落间距 */
  font-size: 14px; /* 设置文字大小 */
  color: #495057; /* 设置文字颜色 */
}

/* 响应式布局 */
@media (max-width: 768px) {
  .my-rank {
    padding: 10px 0; /* 在小屏幕上减小内边距 */
  }

  .my-rank h3 {
    font-size: 15px; /* 在小屏幕上减小标题文字大小 */
  }

  .my-rank p {
    font-size: 13px; /* 在小屏幕上减小文字大小 */
  }
}

.back-button {
  padding: 6px 20px; /* 设置按钮内边距 */
  background-color: #6c757d; /* 设置按钮背景色为灰色 */
  color: white; /* 设置按钮文字颜色为白色 */
  border: none; /* 移除按钮边框 */
  border-radius: 4px; /* 设置按钮圆角 */
  cursor: pointer; /* 鼠标悬停时显示手型光标 */
  font-size: 14px; /* 设置按钮文字大小 */
  transition: all 0.3s ease; /* 添加过渡效果 */
}

.back-button:hover {
  background-color: #5a6268; /* 鼠标悬停时按钮背景色变深 */
  transform: translateY(-2px); /* 鼠标悬停时按钮轻微上浮 */
}
</style>