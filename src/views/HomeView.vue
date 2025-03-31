<template>
  <div class="home">
    <h1></h1>
    <img alt="Vue logo" src="../assets/logo.png">
    <br>
    <h1>欢迎来到记忆力训练游戏</h1>
    <br>
    <h3>请选择游戏难度</h3>
    <div class="difficulty-options">
      <button @click="setSize(4)">2×2</button>
      <button @click="setSize(6)">2×3</button>
      <button @click="setSize(9)">3×3</button>
      <button @click="setSize(12)">3×4</button>
      <button @click="setSize(16)">4×4</button>
    </div>
  </div>
</template>

<script>

export default {
  name: 'HomeView',
  methods: {
    setSize(size) {
      // 通过路由跳转到 MemoryView，并传递 size 参数
      this.$router.push({
        path: '/memory',
        query: { size: size } // 使用 query 参数传递 size
      });
    }
  }
}
</script>

<style scoped>
.difficulty-options {
  margin-top: 20px;
  display: flex; /* 使用 Flexbox 布局 */
  justify-content: center; /* 居中对齐 */
  gap: 20px; /* 按钮之间的间距，调整此值以控制空格大小 */
}
.difficulty-options button {
  padding: 3px 6px;
  font-size: 16px;
  cursor: pointer;
}
</style>
