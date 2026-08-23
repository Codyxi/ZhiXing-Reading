# 📚 ZhiXing-Reading - 读书蒸馏

> 🧠 将阅读转化为知识，让书籍真正成为你的"第二大脑"

一个基于 **Next.js 14** 的 AI 辅助读书笔记与知识管理工具，帮助你深度理解书籍内容，构建个人知识体系。

## ✨ 核心功能

| 功能 | 描述 |
|------|------|
| 📖 **书籍管理** | 添加、分类、管理你的阅读清单，支持封面展示 |
| 🤖 **AI 对话** | 与 AI 深入讨论书籍内容，获取多角度见解 |
| 🧠 **知识蒸馏** | AI 自动提取书籍核心观点、关键概念和知识要点 |
| 🎯 **圆桌讨论** | 多个 AI 角色模拟深度讨论，碰撞思想火花 |
| 📊 **知识图谱** | 3D 可视化书籍与知识之间的关联关系 |
| 📝 **智能笔记** | AI 辅助生成结构化读书笔记 |

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/Codyxi/ZhiXing-Reading.git
cd ZhiXing-Reading
2. 安装依赖
bash
复制
npm install
3. 配置 AI API Key
bash
复制
# 复制示例配置文件
cp .llm-config.example.json .llm-config.json
然后编辑 .llm-config.json，填入你的 API Key：

json
复制
{
  "baseUrl": "https://api.openai.com/v1",
  "apiKey": "sk-你的API Key",
  "model": "gpt-4o",
  "temperature": 0.7,
  "maxTokens": 4096
}
4. 启动开发服务器
bash
复制
npm run dev
5. 打开浏览器
访问 http://localhost:3000

🤖 支持的 AI 平台
✅ OpenAI - GPT-4o, GPT-4, GPT-3.5-turbo
✅ DeepSeek - DeepSeek Chat, DeepSeek Coder
✅ Moonshot - Kimi (moonshot-v1-8k/32k/128k)
✅ 智谱 GLM - GLM-4, GLM-4-Flash
✅ 硅基流动 - Qwen, Yi, ChatGLM 等开源模型
✅ Ollama - 本地部署的开源模型
✅ 其他 - 任何 OpenAI 兼容的 API
配置示例
OpenAI:

json
复制
{
  "baseUrl": "https://api.openai.com/v1",
  "apiKey": "sk-...",
  "model": "gpt-4o"
}
DeepSeek:

json
复制
{
  "baseUrl": "https://api.deepseek.com/v1",
  "apiKey": "sk-...",
  "model": "deepseek-chat"
}
Ollama (本地):

json
复制
{
  "baseUrl": "http://localhost:11434/v1",
  "apiKey": "ollama",
  "model": "qwen2.5:7b"
}
🛠️ 技术栈
前端框架: Next.js 14 (App Router)
开发语言: TypeScript
UI 样式: Tailwind CSS
3D 渲染: Three.js + React Three Fiber
知识图谱: 3d-force-graph
图标库: Lucide React
📁 项目结构
复制
ZhiXing-Reading/
├── src/
│   ├── app/              # Next.js 路由 & API
│   │   ├── api/
│   │   │   ├── chat/    # AI 对话接口
│   │   │   ├── distill/ # 知识蒸馏接口
│   │   │   └── roundtable/ # 圆桌讨论接口
│   │   ├── layout.tsx   # 布局组件
│   │   └── page.tsx     # 主页面
│   ├── components/       # UI 组件
│   │   ├── chat/         # 对话组件
│   │   ├── dashboard/    # 仪表盘
│   │   ├── graph/        # 知识图谱
│   │   ├── shelf/        # 书架
│   │   └── thinktank/    # 圆桌讨论
│   └── lib/              # 核心逻辑
│       ├── llm.ts        # LLM 调用模块
│       ├── store.tsx     # 状态管理
│       └── utils.ts      # 工具函数
├── mock-data/            # 示例数据
├── public/               # 静态资源
├── .gitignore           # Git 忽略配置
├── .llm-config.example.json # LLM 配置示例
├── package.json         # 项目配置
└── README.md            # 项目说明
📸 界面预览
（可选：添加截图或 GIF 演示）

🔒 安全设计
✅ API Key 存储在本地 .llm-config.json
✅ 该文件已被 .gitignore 忽略，不会上传到 GitHub
✅ 提供了 .llm-config.example.json 示例文件
✅ 代码中零硬编码敏感信息
🤝 贡献指南
欢迎提交 Issue 和 Pull Request！

Fork 本仓库
创建功能分支: git checkout -b feature/amazing-feature
提交更改: git commit -m 'Add amazing feature'
推送分支: git push origin feature/amazing-feature
提交 Pull Request
📄 开源协议
本项目采用 MIT License 开源协议。

🙏 致谢
Next.js - React 生产级框架
Tailwind CSS - 实用优先的 CSS 框架
Three.js - JavaScript 3D 库
Lucide - 精美的开源图标
<p align="center"> 用 ❤️ 构建 | 让每一本书都成为知识的基石 </p>
项目地址: https://github.com/Codyxi/ZhiXing-Reading
