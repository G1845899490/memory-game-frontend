<template>
  <div class="change-password-container">
    <h2>修改密码</h2>
    <div class="form-group">
      <label>旧密码：</label>
      <input type="password" v-model="oldPassword" placeholder="请输入旧密码" />
    </div>
    <div class="form-group">
      <label>新密码：</label>
      <input type="password" v-model="newPassword" placeholder="请输入新密码" />
    </div>
    <div class="form-group">
      <label>确认新密码：</label>
      <input type="password" v-model="confirmPassword" placeholder="请再次输入新密码" />
    </div>
    <div class="button-group">
      <button @click="changePassword" :disabled="!isFormValid">确认修改</button>
      <button @click="$router.push('/home')">返回</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChangePasswordView',
  data() {
    return {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  },
  computed: {
    isFormValid() {
      // 验证逻辑：旧密码、新密码和确认密码都不能为空，且新密码和确认密码必须一致
      // 如果所有操作数都是真值，&& 的结果就是最后一个操作数的值
      // console.log(1 && 2 && 3); // 输出 3
      // console.log(1 && 0 && 3); // 输出 0
      return this.oldPassword && this.newPassword && this.confirmPassword && this.newPassword === this.confirmPassword;
    }
  },
  methods: {
    async changePassword() {
      // if (this.newPassword !== this.confirmPassword) {
      //   alert('两次输入的新密码不一致！');
      //   return;
      // }

      try {
        const response = await this.$axios.put('/api/user/password', {
          oldPassword: this.oldPassword,
          newPassword: this.newPassword
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.data === 'success') {
          alert('密码修改成功！请重新登陆');
          localStorage.removeItem('token'); // 清除token
          this.$router.push('/login'); // 跳转到登录页
        } else {
          alert('旧密码验证失败！');
        }
      } catch (error) {
        alert('修改密码失败：' + (error.response?.data || error.message));
      }
    }
  }
}
</script>

<style scoped>
.change-password-container {
  width: 400px;
  margin: 50px auto;
  padding: 30px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: inline-block;
  width: 100px;
  text-align: right;
  margin-right: 10px;
}

.form-group input {
  width: 200px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.button-group {
  text-align: center;
  margin-top: 20px;
}

.button-group button {
  margin: 0 10px;
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.button-group button:first-child {
  background-color: #007bff;
  color: white;
}

.button-group button:last-child {
  background-color: #6c757d;
  color: white;
}

.button-group button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}
</style>