<template>
  <div>
    <h2>游戏历史</h2>
    <table>
      <thead>
        <tr>
          <th>游戏类型</th>
          <th>是否成功</th>
          <th>得分</th>
          <th>翻牌次数</th>
          <th>回忆时间(秒)</th>
          <th>日期</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="record in history" :key="record.id">
          <td>{{ record.gameType }}</td>
          <td>{{ getGameData(record.gameData).success }}</td>
          <td>{{ record.score }}</td>
          <td>{{ getGameData(record.gameData).reverseCount }}</td>
          <td>{{ getGameData(record.gameData).recallTime }}</td>
          <td>{{ formatDate(record.playedAt) }}</td>
        </tr>
      </tbody>
    </table>
    <button @click="$router.push('/home')">返回游戏</button>
  </div>
</template>

<script>
// 导入 Day.js 及其插件
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// 启用插件
dayjs.extend(utc);
dayjs.extend(timezone);

export default {
  name: 'HistoryView',
  data() {
    return {
      history: []
    };
  },
  methods: {
    getGameData(gameData) {
      try {
        const data = JSON.parse(gameData);
        return {
          success: data[0]?.success === 1 ? "成功" : "失败",
          reverseCount: data[1]?.reverseCount ?? 0,
          recallTime: data[2]?.recallTime ?? 0
        };
      } catch (error) {
        console.error('解析游戏数据失败:', error);
        return {
          success: -1,
          reverseCount: -1,
          recallTime: -1
        };
      }
    },
    formatDate(playedAt) {
      // 将 UTC 时间转换为 Asia/Shanghai 时间
      return dayjs.utc(playedAt).tz('Asia/Shanghai').format('YYYY/MM/DD HH:mm:ss');
    }
  },
  async created() {
    try {
      const response = await this.$axios.get('/api/game/history', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      this.history = response.data;
      console.log(this.history);
    } catch (error) {
      alert('获取历史记录失败：' + (error.response?.data || error.message));
    }
  }
};
</script>

<style scoped>
table {
  width: 80%;
  margin: 20px auto;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid black;
  padding: 10px;
  text-align: center;
}
</style>