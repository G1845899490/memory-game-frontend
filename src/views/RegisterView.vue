<template>
  <div class="register-form-container">
    <h2>注册</h2>

    <div class="form-group">
      <label for="register-username">用户名：</label>
      <input id="register-username" v-model="username" placeholder="请输入用户名" @input="checkUsername" />&nbsp;
      <span v-if="usernameChecking" class="status-text checking">检查中..</span>
      <span v-else-if="usernameExists" class="status-text error">已存在</span>
      <span v-else-if="usernameChecked && !usernameExists" class="status-text success">可用</span>
    </div>

    <div class="form-group">
      <label for="register-password">密码：</label>
      <input id="register-password" v-model="password" type="password" placeholder="请输入密码" />
    </div>

    <div class="form-group">
      <label for="register-email">邮箱：</label>
      <input id="register-email" v-model="email" type="email" placeholder="请输入邮箱" />
    </div>

    <div class="button-group">
      <button @click="register" :disabled=false
      :class="{ 'disabled-button': !username || !password || usernameChecking ||(usernameChecked && usernameExists) }">注册</button>
      <button @click="$router.push('/login')">登录</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RegisterView',
  data() {
    return {
      username: '',
      password: '',
      email: '',
      usernameChecking: false,
      usernameExists: false,
      usernameChecked: false,
      checkUsernameTimeout: null
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

    async register() {
      this.m1();
      console.log("1注册中...");
      try {
        console.log("注册中...");
        
        await this.$axios.post('/api/auth/register', {
          username: this.username,
          password: this.password,
          email: this.email
        });
        alert('注册成功，请登录');
        this.$router.push('/login');
      } catch (error) {
        console.log("注册失败");
      }
    }
  }
};
</script>

<style scoped>
.register-form-container {
  width: 380px;
  /* 可以根据内容适当调整宽度 */
  margin: 50px auto;
  padding: 30px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
}

.register-form-container h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}

.form-group {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.form-group label {
  width: 80px;
  /* 与登录表单保持一致或按需调整 */
  text-align: right;
  margin-right: 10px;
  color: #555;
  flex-shrink: 0;
}

.form-group input {
  /* flex-grow: 1; */
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  width: 60%;
}


.button-group {
  display: flex;
  justify-content: center;
  /* 居中按钮 */
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

/* 注册按钮（主操作）样式 */
.button-group button:first-child {
  background-color: #28a745;
  /* 使用绿色表示成功或创建 */
  color: white;
}

.button-group button:first-child:hover {
  background-color: #218838;
}

/* 去登录按钮（次要操作）样式 */
.button-group button:last-child {
  background-color: #6c757d;
  /* 使用灰色 */
  color: white;
}

.button-group button:last-child:hover {
  background-color: #5a6268;
}

.button-group button:active {
  transform: scale(0.98);
  /* 点击效果 */
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