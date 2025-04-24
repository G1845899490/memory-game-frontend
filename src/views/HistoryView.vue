<template>
  <div>
    <div class="header">
      <h2>历史记录</h2>
    </div>

    <div class="filter-sort-container">
      <div class="filter-group1">
        <label>类型：</label>
        <select v-model="selectedGameType">
          <option value="">全部</option>
          <option v-for="type in gameTypes" :key="type" :value="type">{{ type }}</option>
        </select>
      </div>

      <!-- <select> 元素会将 value 作为字符串传递，因此 v-model="selectSuccess" 的值可能是 "-1"、"0" 或 "1"。 -->
      <div class="filter-group2">
        <label>是否成功：</label>
        <select v-model.number="selectSuccess">
          <option value="-1">全部</option>
          <option value="0">失败</option>
          <option value="1">成功</option>
        </select>
      </div>

      <div class="sort-group">
        <label>排序：</label>
        <select v-model="sortField">
          <option value="score">得分</option>
          <option value="playedAt">日期</option>
        </select>
        <select v-model="sortOrder">
          <option value="asc">升序</option>
          <option value="desc">降序</option>
        </select>
      </div>

      <button class="back-button" @click="$router.push('/home')">返回首页</button>

    </div>

    <table>
      <thead>
        <tr>
          <th v-for="(header, index) in dynamicHeaders" :key="index">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(record, index) in paginatedHistory" :key="record.id">
          <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
          <td>{{ record.gameType }}</td>
          <td>{{ getGameData(record.gameData).prop1 }}</td>
          <td>{{ record.score }}</td>
          <td>{{ getGameData(record.gameData).prop2 }}</td>
          <td>{{ getGameData(record.gameData).prop3 }}</td>
          <td>{{ formatDate(record.playedAt) }}</td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <button :disabled="currentPage === 1" @click="currentPage--">上一页</button>
      <span>第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
      <button :disabled="currentPage === totalPages" @click="currentPage++">下一页</button>
    </div>
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
      history: [],
      currentPage: 1,
      pageSize: 10,

      handledHistory: [],
      selectedGameType: '',
      selectSuccess: -1,
      sortField: 'playedAt',
      sortOrder: 'desc',
      gameTypes: ['DiscoverNewLocation', 'DiscoverNewContent', 'RecallOldLocation', 'RecallOldContent'],
    };
  },

  computed: {
    // 动态表头
    dynamicHeaders() {
      if (!this.selectedGameType) {
        return ['序号', '游戏类型', '是否成功', '得分', '参数1', '参数2', '日期'];
      }
      switch (this.selectedGameType) {
        case 'RecallOldLocation':
          return ['序号', '游戏类型', '是否成功', '得分', '翻牌次数', '回忆时间(秒)', '日期'];
        case 'RecallOldContent':
          return ['序号', '游戏类型', '是否成功', '得分', '游戏级别', '数字串长度', '日期'];
        case 'DiscoverNewLocation':
          return ['序号', '游戏类型', '是否成功', '得分', '找到数量', '矩阵尺寸', '日期'];
        case 'DiscoverNewContent':
          return ['序号', '游戏类型', '是否成功', '得分', '记忆时间', '回忆时间', '日期'];
        default:
          return ['序号', '游戏类型', '是否成功', '得分', '参数1', '参数2', '日期'];
      }
    },

    // 筛选游戏类型
    filteredHistory1() {
      let result = [];
      if (!this.selectedGameType) {
        result = this.history;
      }
      if (!!this.selectedGameType) {
        result = this.history.filter(record => record.gameType === this.selectedGameType);
      }
      console.log("filteredHistory1", result);
      return result;
    },

    // 筛选游戏成功状态
    filteredHistory2() {
      let result = [...this.filteredHistory1];
      if (this.selectSuccess === -1) {
        console.log("selectSuccess -1", this.selectSuccess);
        console.log("filteredHistory2", result);
        return result;
      }
      if (this.selectSuccess !== -1) {
        console.log("selectSuccess0/1", this.selectSuccess);
        result = result.filter(record => {
          const gameData = JSON.parse(record.gameData);
          return Number(gameData[0].success) === Number(this.selectSuccess);
        });
        console.log("filteredHistory2", result);
        return result;
      }

    },

    // 筛选完成后按选择过滤并排序
    filteredAndSortedHistory() {
      let result = [...this.filteredHistory2];
      result.sort((a, b) => {
        // 集合中两个元素（a 和 b）如何比较并排序
        // 过滤条件
        let aValue, bValue;
        if (this.sortField === 'score') {
          aValue = a.score;
          bValue = b.score;
        } else if (this.sortField === 'playedAt') {
          aValue = new Date(a.playedAt).getTime();
          bValue = new Date(b.playedAt).getTime();
        } else {
          // // 处理需要从 gameData 中获取的字段
          // const aData = this.getGameData(a.gameData);
          // const bData = this.getGameData(b.gameData);
          // // obj[field]：访问对象属性值
          // aValue = aData[this.sortField];
          // bValue = bData[this.sortField];
        }
        // 排序
        return this.sortOrder === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      });
      console.log("filteredAndSortedHistory", result);
      return result;
    },

    // 排序后分页
    paginatedHistory() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;

      let result = this.filteredAndSortedHistory.slice(start, end);

      console.log("paginatedHistory", result);
      return result;
    },

    // 总页总数
    totalPages() {
      return Math.ceil(this.filteredAndSortedHistory.length / this.pageSize);
    }
  },

  watch: {
    // 监听游戏类型筛选
    selectedGameType(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.currentPage = 1; // 重置到第1页
      }
    },
    // 监听成功状态筛选
    selectSuccess(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.currentPage = 1; // 重置到第1页
      }
    },
    // 监听排序字段
    sortField(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.currentPage = 1; // 重置到第1页
      }
    },
    // 监听排序顺序
    sortOrder(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.currentPage = 1; // 重置到第1页
      }
    }
  },

  methods: {
    getGameData(gameData) {
      try {
        // 字符串转对象（data是一个数组对象，又是一个对象数组）
        const data = JSON.parse(gameData);
        // console.log("data:", data);

        let key1, key2, key3, val1, val2, val3;

        // 从 data 数组中提取属性名和值
        if (Array.isArray(data) && data.length >= 3) {
          // 提取第一个对象的属性名和值
          key1 = Object.keys(data[0])[0];
          val1 = Number(data[0][key1]);

          // 提取第二个对象的属性名和值
          key2 = Object.keys(data[1])[0];
          val2 = Number(data[1][key2]);

          // 提取第三个对象的属性名和值
          key3 = Object.keys(data[2])[0];
          val3 = Number(data[2][key3]);
        }

        // 打印验证
        // console.log("Keys:", key1, key2, key3); // "success", "reverseCount", "recallTime"
        // console.log("Values:", val1, val2, val3); // 1, 5, 10

        return {
          prop1: val1 === 1 ? "成功" : "失败",
          prop2: val2,
          prop3: val3
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
      console.log("response.data:", response.data);

      this.history = response.data;

      // console.log(this.history[0]);
      // console.log(this.history[0].gameData);
    } catch (error) {
      alert('获取历史记录失败：' + (error.response?.data || error.message));
    }
  }
};
</script>
<style scoped>
table {
  width: 60%;
  margin: 20px auto;
  border-collapse: collapse;
}

th,
td {
  border: 1px solid black;
  padding: 8px;
  text-align: center;
  font-size: 14px;
}

th {
  background-color: #f5f5f5;
  font-weight: bold;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background-color: #fff;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.pagination span {
  font-size: 14px;
  color: #666;
}

.filter-sort-container {
  margin: 20px auto;
  width: 60%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-group,
.sort-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
}

.sort-group select,
.filter-group select {
  min-width: 80px;
}

.back-button {
  padding: 8px 16px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.back-button:hover {
  background-color: #5a6268;
}
</style>
