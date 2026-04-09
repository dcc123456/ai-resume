# 🤖 AI Resume Optimizer

基于 AI 的智能简历优化工具，上传简历和职位描述（JD），一键生成高度匹配的定制化简历，提升面试邀约率。

## ✨ 功能特性

- 📄 **简历解析** — 支持 PDF/Word 格式上传，AI 自动提取结构化信息
- 🏢 **JD 分析** — 智能解析职位描述，提取关键技能和要求
- 🎯 **关键词匹配** — 自动计算简历与 JD 的关键词匹配度
- ✍️ **定制简历生成** — 基于 LLM 根据目标 JD 生成针对性简历
- 📥 **多格式导出** — 支持 Markdown 预览、Word 和 PDF 下载
- 📊 **历史记录** — 查看所有生成记录，追踪优化效果
- 🔐 **用户认证** — 注册/登录，数据隔离

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui |
| 后端 | Express 5 + TypeScript + tsx |
| 数据库 | MySQL 8.0 |
| 向量数据库 | ChromaDB |
| AI/LLM | MiniMax（OpenAI 兼容接口） |
| 文档处理 | pdf-parse / mammoth / docx / Puppeteer |
| 认证 | JWT + bcryptjs |

## 📁 项目结构

```
resume-ai/
├── client/                  # 前端 React 应用
│   ├── src/
│   │   ├── api/             # API 请求封装
│   │   ├── components/      # 通用组件
│   │   ├── pages/           # 页面组件
│   │   │   ├── Login.tsx        # 登录/注册
│   │   │   ├── Dashboard.tsx    # 首页仪表盘
│   │   │   ├── ResumeUpload.tsx # 简历上传
│   │   │   ├── JDInput.tsx      # JD 输入
│   │   │   ├── GenerateResume.tsx # 生成简历
│   │   │   └── History.tsx      # 历史记录
│   │   └── App.tsx          # 路由配置
│   ├── vite.config.ts
│   └── package.json
├── server/                  # 后端 Express 应用
│   ├── src/
│   │   ├── routes/          # API 路由
│   │   │   ├── auth.ts      # 认证 API
│   │   │   ├── resume.ts    # 简历 API
│   │   │   ├── jd.ts        # JD API
│   │   │   └── generate.ts  # 生成 API
│   │   ├── services/        # 业务逻辑
│   │   ├── llm/             # LLM 封装（MiniMax）
│   │   ├── prompts/         # Prompt 模板
│   │   ├── db/              # 数据库连接和 Schema
│   │   ├── middleware/       # 中间件（认证等）
│   │   └── utils/           # 工具函数
│   ├── .env                 # 环境变量（需自行创建）
│   └── package.json
├── docker-compose.yml       # MySQL + ChromaDB 基础设施
└── README.md
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- MySQL >= 8.0
- npm >= 9

### 1. 克隆项目

```bash
git clone git@github.com:dcc123456/ai-resume.git
cd resume-ai
```

### 2. 启动基础设施（可选，也可用本地 MySQL）

```bash
docker-compose up -d
```

### 3. 配置后端环境变量

```bash
cd server
cp .env.example .env
```

编辑 `.env` 文件：

```env
PORT=3000
JWT_SECRET=your-jwt-secret-change-in-production
JWT_EXPIRES_IN=7d
DB_HOST=localhost
DB_PORT=3306
DB_USER=resume_user
DB_PASSWORD=resume_pass
DB_NAME=resume_ai
LLM_PROVIDER=minimax
LLM_API_KEY=your-minimax-api-key
LLM_BASE_URL=https://api.minimax.chat/v1
LLM_MODEL=minimax-m2.7
```

### 4. 安装依赖并启动

```bash
# 后端
cd server
npm install
npm run dev

# 前端（新终端）
cd client
npm install
npm run dev
```

### 5. 访问应用

- 前端：http://localhost:5173
- 后端 API：http://localhost:3000

## 📡 API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/auth/register` | 用户注册 |
| POST | `/api/v1/auth/login` | 用户登录 |
| GET | `/api/v1/resume/` | 获取基础简历 |
| POST | `/api/v1/resume/upload` | 上传并解析简历 |
| PUT | `/api/v1/resume/` | 保存基础简历 |
| GET | `/api/v1/resume/download/raw` | 下载原始简历 |
| POST | `/api/v1/jd/parse` | 解析职位描述 |
| GET | `/api/v1/jd/list` | 获取 JD 列表 |
| DELETE | `/api/v1/jd/:id` | 删除 JD |
| POST | `/api/v1/generate/fromJd` | 根据 JD 生成简历 |
| GET | `/api/v1/generate/history` | 获取生成历史 |
| GET | `/api/v1/generate/:id/download/docx` | 下载 Word |
| GET | `/api/v1/generate/:id/download/pdf` | 下载 PDF |

## 🗄️ 数据库表结构

| 表名 | 说明 |
|------|------|
| `users` | 用户表（邮箱、密码、每日生成次数） |
| `base_resume` | 基础简历（原始文本、结构化 JSON、文件路径） |
| `job_description` | 职位描述（原始文本、解析 JSON、匹配率） |
| `custom_resume` | 定制简历（生成内容、匹配率、下载链接） |

## 🔧 环境变量说明

| 变量 | 必填 | 说明 |
|------|------|------|
| `PORT` | 否 | 后端端口，默认 3000 |
| `JWT_SECRET` | ✅ | JWT 签名密钥 |
| `JWT_EXPIRES_IN` | 否 | Token 过期时间，默认 7d |
| `DB_HOST` | ✅ | MySQL 地址 |
| `DB_PORT` | 否 | MySQL 端口，默认 3306 |
| `DB_USER` | ✅ | MySQL 用户名 |
| `DB_PASSWORD` | ✅ | MySQL 密码 |
| `DB_NAME` | ✅ | 数据库名 |
| `LLM_API_KEY` | ✅ | LLM API 密钥 |
| `LLM_PROVIDER` | 否 | LLM 供应商，默认 minimax |
| `LLM_BASE_URL` | 否 | LLM API 地址 |
| `LLM_MODEL` | 否 | 模型名称 |
| `DAILY_GENERATE_LIMIT` | 否 | 每日生成限制，默认 5 |

## 📄 License

MIT
