const { defineConfig } = require('@vue/cli-service');

module.exports = defineConfig({
  transpileDependencies: true, // 保留原有配置
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
});