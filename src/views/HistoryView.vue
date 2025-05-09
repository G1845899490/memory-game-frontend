<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">我的游戏历史</h2>
      <button class="back-button" @click="$router.push('/home')">返回首页</button>
    </div>

    <div class="filter-sort-container">
      <div class="filter-group">
        <div class="filter-item">
          <label class="form-label">游戏类型：</label>
          <select v-model="selectedGameType" class="form-control">
            <option value="">全部</option>
            <option v-for="type in gameTypes" :key="type" :value="type">{{ type }}</option>
          </select>
        </div>

        <div class="filter-item">
          <label class="form-label">游戏状态：</label>
          <select v-model.number="selectSuccess" class="form-control">
            <option value="-1">全部</option>
            <option value="0">失败</option>
            <option value="1">成功</option>
          </select>
        </div>

        <div class="filter-item">
          <label class="form-label">排序方式：</label>
          <select v-model="sortField" class="form-control">
            <option value="score">得分</option>
            <option value="playedAt">日期</option>
          </select>
          <select v-model="sortOrder" class="form-control">
            <option value="asc">升序</option>
            <option value="desc">降序</option>
          </select>
        </div>
      </div>
    </div>

    <div class="table-container">
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
    </div>

    <div class="pagination">
      <button class="pagination-btn" :disabled="currentPage === 1" @click="currentPage--">上一页</button>
      <span class="pagination-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
      <button class="pagination-btn" :disabled="currentPage === totalPages" @click="currentPage++">下一页</button>
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
.page-container {
  max-width: 1200px; /* 设置页面容器的最大宽度，确保在大屏幕上内容不会过宽 */
  margin: 0 auto; /* 水平居中显示 */
  padding: 15px; /* 设置内边距，使内容与容器边缘保持适当距离 */
}

.page-header {
  display: flex; /* 使用弹性布局 */
  justify-content: space-between; /* 标题和按钮分别靠左和靠右对齐 */
  align-items: center; /* 垂直居中对齐 */
  margin-bottom: 15px; /* 与下方内容保持间距 */
}

.page-title {
  font-size: 24px; /* 设置标题文字大小 */
  color: #333; /* 设置标题文字颜色为深灰色 */
  margin: 0; /* 移除默认外边距 */
}

.back-button {
  padding: 8px 20px; /* 设置按钮内边距，上下8px，左右20px */
  background-color: #6c757d; /* 设置按钮背景色为灰色 */
  color: white; /* 设置按钮文字颜色为白色 */
  border: none; /* 移除按钮边框 */
  border-radius: 6px; /* 设置按钮圆角 */
  cursor: pointer; /* 鼠标悬停时显示手型光标 */
  font-size: 14px; /* 设置按钮文字大小 */
  transition: all 0.3s ease; /* 添加过渡效果，使交互更流畅 */
}

.back-button:hover {
  background-color: #5a6268; /* 鼠标悬停时按钮背景色变深 */
  transform: translateY(-2px); /* 鼠标悬停时按钮轻微上浮 */
}

.filter-sort-container {
  background-color: #f8f9fa; /* 设置筛选区域背景色为浅灰色 */
  padding: 12px; /* 设置内边距 */
  border-radius: 8px; /* 设置圆角 */
  margin-bottom: 15px; /* 与下方内容保持间距 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* 添加轻微阴影效果 */
}

.filter-group {
  display: flex; /* 使用弹性布局 */
  flex-wrap: wrap; /* 允许元素换行 */
  gap: 15px; /* 设置元素之间的间距 */
  justify-content: flex-start; /* 元素靠左对齐 */
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

.table-container {
  background-color: #fff; /* 设置表格容器背景色为白色 */
  border-radius: 8px; /* 设置圆角 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* 添加轻微阴影效果 */
  overflow-x: auto; /* 允许横向滚动 */
  margin-bottom: 15px; /* 与下方内容保持间距 */
}

table {
  width: 100%; /* 表格宽度占满容器 */
  border-collapse: collapse; /* 合并表格边框 */
  font-size: 15px; /* 设置表格文字大小 */
}

th, td {
  padding: 10px 15px; /* 设置单元格内边距 */
  text-align: center; /* 文字居中对齐 */
  border-bottom: 1px solid #dee2e6; /* 设置底部边框 */
  line-height: 1.7; /* 设置行高，使文字更加舒适 */
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

.pagination {
  display: flex; /* 使用弹性布局 */
  justify-content: center; /* 水平居中对齐 */
  align-items: center; /* 垂直居中对齐 */
  gap: 15px; /* 设置元素之间的间距 */
  margin-bottom: 10px; /* 与底部保持间距 */
}

.pagination-btn {
  padding: 8px 20px; /* 设置按钮内边距 */
  border: 1px solid #dee2e6; /* 设置边框 */
  background-color: #fff; /* 设置背景色为白色 */
  color: #495057; /* 设置文字颜色 */
  border-radius: 4px; /* 设置圆角 */
  cursor: pointer; /* 鼠标悬停时显示手型光标 */
  transition: all 0.3s ease; /* 添加过渡效果 */
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f8f9fa; /* 鼠标悬停时背景色变化 */
  border-color: #ced4da; /* 鼠标悬停时边框颜色变化 */
}

.pagination-btn:disabled {
  background-color: #f8f9fa; /* 禁用状态下的背景色 */
  color: #adb5bd; /* 禁用状态下的文字颜色 */
  cursor: not-allowed; /* 禁用状态下的鼠标样式 */
}

.pagination-info {
  font-size: 14px; /* 设置页码信息文字大小 */
  color: #6c757d; /* 设置页码信息文字颜色 */
}

/* 响应式布局 */
@media (max-width: 768px) {
  .page-container {
    padding: 10px; /* 在小屏幕上减小内边距 */
  }

  .filter-group {
    flex-direction: column; /* 在小屏幕上改为垂直排列 */
    gap: 10px; /* 减小元素间距 */
  }

  .filter-item {
    width: 100%; /* 在小屏幕上占满宽度 */
  }

  .form-control {
    width: 100%; /* 在小屏幕上占满宽度 */
  }

  .table-container {
    margin: 0 -15px; /* 在小屏幕上移除左右边距 */
    border-radius: 0; /* 在小屏幕上移除圆角 */
  }

  th, td {
    padding: 8px 12px; /* 在小屏幕上减小内边距 */
    font-size: 14px; /* 在小屏幕上减小字体大小 */
  }
}
</style>
