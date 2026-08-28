# Rich-Text-Box
### 一、项目简介

综合性Web应用，包含以下功能：
1. 数值排序Web服务 - 接收多个数值，支持从大到小/从小到大排序
2. 天气显示 - 自动获取用户位置并显示当地天气
3. DeepSeek AI问答 - 集成DeepSeek大模型进行交互式问答

### 二、环境要求

- Node.js 14.0 或更高版本
- npm 或 yarn 包管理器
- 现代浏览器（Chrome、Firefox、Safari、Edge 等）
- DeepSeek API Key（用于AI问答功能）

### 三、安装步骤

1. 确保已安装 Node.js（版本 14.0 或更高）
   检查命令：node -v

2. 进入源代码目录
   cd 源代码

3. 安装项目依赖
   npm install

   这将安装以下依赖：
   - express：Web服务器框架
   - cors：跨域支持
   - axios：HTTP请求库

### 四、运行方法

1. 进入源代码目录
   cd 源代码

2. 启动服务器
   npm start
   或
   node server.js

3. 打开浏览器访问
   http://localhost:3000

### 五、使用说明

【排序服务】
1. 输入多个数值（支持逗号、空格、换行分隔）
2. 选择排序方式（从小到大/从大到小）
3. 点击"开始排序"按钮获取结果

【天气显示】
1. 允许浏览器获取地理位置权限
2. 自动显示当前位置的天气信息
3. 如无法获取位置，默认显示北京天气

【DeepSeek AI问答】
1. 输入 DeepSeek API Key（可从 https://platform.deepseek.com/ 获取）
2. API Key 会保存在浏览器本地存储中
3. 在输入框中输入问题，点击发送即可

### 六、API接口说明

排序接口：POST /api/sort
请求体：{ "numbers": ["5", "2", "8"], "order": "asc" }

聊天接口：POST /api/chat
请求体：{ "message": "你好", "apiKey": "your-api-key" }

### 七、注意事项

- 首次运行需要安装依赖（npm install）
- DeepSeek API Key 需要自行申请
- 天气功能需要浏览器授权地理位置权限
- 确保网络连接正常以访问外部API
- 服务器默认运行在 3000 端口
