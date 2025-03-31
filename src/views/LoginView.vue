<template>
  <div class="login-form-container">
    <h2>登录</h2>

    <div class="form-group">
      <label for="username">用户名：</label>
      <input id="username" v-model="username" placeholder="用户名" @input="checkUsername" />
      <span v-if="usernameChecking" class="status-text checking">检查中...</span>
      <span v-else-if="usernameExists" class="status-text error">用户名可用</span>
      <span v-else-if="usernameChecked && !usernameExists" class="status-text success">用户名不存在</span>
    </div>

    <div class="form-group">
      <label for="password">密码：</label>
      <input id="password" v-model="password" type="password" placeholder="密码" @input="passwordWrong = false" />
      <span v-if="passwordWrong" class="status-text password wrong">密码错误</span>

    </div>

    <div class="button-group">
      <button @click="login" :disabled="!username || !password || (usernameChecked && !usernameExists)"
        :class="{ 'disabled-button': !username || !password || (usernameChecked && !usernameExists) }">登录</button>
      <button @click="$router.push('/register')">注册</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      username: '',
      password: '',
      usernameChecking: false,
      usernameExists: false,
      usernameChecked: false,
      checkUsernameTimeout: null,
      passwordWrong: false
    };
  },
  methods: {
    checkUsername() {
      // 清除之前的超时
      clearTimeout(this.checkUsernameTimeout);

      // 重置检查状态
      this.usernameChecked = false;

      // 如果用户名为空，不进行检查
      if (!this.username) {
        this.usernameChecking = false;
        this.usernameExists = false;
        return;
      }

      // 设置检查中状态
      this.usernameChecking = true;

      // 使用防抖，避免频繁请求
      this.checkUsernameTimeout = setTimeout(async () => {
        try {
          const response = await this.$axios.get(`/api/auth/check-username?username=${encodeURIComponent(this.username)}`);
          this.usernameExists = response.data.exists;
          this.usernameChecked = true;
        } catch (error) {
          console.error('检查用户名出错:', error);
        } finally {
          this.usernameChecking = false;
        }
      }, 500); // 500毫秒的延迟
    },

    async login() {
      try {
        const response = await this.$axios.post('/api/auth/login', {
          username: this.username,
          password: this.password
        });
        console.log(response);
        console.log(response.data === "passwordwrong");

        if (response.data === "passwordwrong") {
          this.passwordWrong = true;
          console.log("密码错误");

        } else {
          console.log("密码正确");
          localStorage.setItem('token', response.data);
          this.$router.push('/home');
        }

      } catch (error) {
        alert('登录失败：' + (error.response?.data || error.message));
      }
    }
  }
};
</script>

<style scoped>
/* 'scoped' 确保样式只应用在这个组件内 */

.login-form-container {
  width: 350px;
  /* 或者使用 max-width */
  margin: 50px auto;
  /* 上下边距50px, 左右自动 (实现水平居中) */
  padding: 30px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
}

.login-form-container h2 {
  text-align: center;
  margin-bottom: 25px;
  /* 标题和表单内容的间距 */
  color: #333;
}

.form-group {
  display: flex;
  /* 启用 Flexbox 布局 */
  align-items: center;
  /* 垂直居中对齐标签和输入框 */
  margin-bottom: 20px;
  /* 每个表单组下方的间距 */
}

.form-group label {
  width: 80px;
  /* 固定标签宽度 */
  text-align: right;
  /* 标签文字右对齐 */
  margin-right: 10px;
  /* 标签和输入框之间的间距 */
  color: #555;
  flex-shrink: 0;
  /* 防止标签宽度在空间不足时被压缩 */
}

.form-group input {
  flex-grow: 1;
  /* 输入框占据剩余空间 */
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  /* 让 padding 和 border 不会增加元素总宽度 */
}

.button-group {
  display: flex;
  justify-content: center;
  /* 按钮居中排列 */
  gap: 20px;
  /* 按钮之间的间距 */
  margin-top: 30px;
  /* 按钮组与上方元素的间距 */
}

.button-group button {
  padding: 10px 25px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s ease, transform 0.1s ease;
}

.button-group button:first-child {
  /* 登录按钮样式 */
  background-color: #007bff;
  color: white;
}

.button-group button:first-child:hover {
  background-color: #0056b3;
}

.button-group button:last-child {
  /* 注册按钮样式 */
  background-color: #6c757d;
  color: white;
}

.button-group button:last-child:hover {
  background-color: #5a6268;
}

.button-group button:active {
  /* 点击效果 */
  transform: scale(0.98);
}

.button-group button.disabled-button {
  background-color: #cccccc;
  color: #666666;
  cursor: not-allowed;
}

.button-group button.disabled-button:hover {
  background-color: #cccccc;
}
</style>