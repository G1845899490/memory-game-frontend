const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '/api': { // 当你的前端请求地址以 /api 开头时，Vue Dev Server 会将这些请求代理到目标服务器(后端服务地址http://localhost:8080)
        target: 'http://localhost:8080',
        changeOrigin: true // 修改请求头中的 Host 为目标 URL 的 host（有些后端服务器根据 host 做路由判断时需要开启）
      }
    }
  }
});