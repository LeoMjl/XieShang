# 偕裳 XieShang MVP

偕裳是一个个性化虚拟试穿 MVP。项目采用前后端分离架构，后端负责用户画像、AI 工作流调度和文件上传，前端负责需求收集、加载进度和结果展示。

## 功能

1. 用户形象固化：上传人物照片、身高和体重，生成用户基底全身形象。
2. 智能穿搭推荐试穿：输入场景需求，生成穿搭建议、商品图和最终试穿图。
3. 指定商品试穿：上传商品图片，直接生成虚拟试穿效果。

## 技术栈

- 后端：FastAPI、SQLAlchemy、LangGraph、DashScope
- 前端：React、TypeScript、Vite、Tailwind CSS、Zustand
- 数据库：PostgreSQL
- 基础设施：Docker Compose

## 本地环境要求

请先安装：

- Git
- Docker Desktop
- Python 3.11 或更高版本
- Node.js 20 或更高版本
- npm

## 克隆项目

```bash
git clone https://github.com/LeoMjl/XieShang.git
cd XieShang
```

也可以使用 SSH：

```bash
git clone git@github.com:LeoMjl/XieShang.git
cd XieShang
```

## 配置环境变量

复制环境变量模板：

```bash
cp .env.example backend/.env
```

Windows PowerShell：

```powershell
Copy-Item .env.example backend/.env
```

编辑 `backend/.env`，填入阿里云百炼 DashScope API Key：

```env
ALIYUN_API_KEY=your_aliyun_api_key_here
DATABASE_URL=postgresql://xieshang_user:xieshang_password@localhost:5432/xieshang_db
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
```

不要把真实 `.env` 文件提交到仓库。

## 启动数据库

在项目根目录执行：

```bash
docker compose up -d
```

该命令会启动 PostgreSQL，默认连接信息与 `.env.example` 一致。

## 启动后端

进入后端目录：

```bash
cd backend
```

创建并激活虚拟环境：

```bash
python -m venv venv
```

Windows PowerShell：

```powershell
.\venv\Scripts\Activate.ps1
```

macOS/Linux：

```bash
source venv/bin/activate
```

安装依赖：

```bash
pip install -r requirements.txt
```

启动 FastAPI：

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

后端启动后可以访问：

- API 根路径：http://localhost:8000/
- API 文档：http://localhost:8000/docs

## 启动前端

打开新的终端，进入前端目录：

```bash
cd frontend
```

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev -- --host 0.0.0.0 --port 3000
```

浏览器访问：

```text
http://localhost:3000
```

前端默认连接 `http://localhost:8000`。如果后端地址不同，可以在前端环境变量中设置 `VITE_API_BASE_URL`。

## 验证流程

1. 打开 `http://localhost:3000`。
2. 使用默认用户 ID，或输入自己的测试用户 ID。
3. 在“形象固化”区域填写身高、体重并上传人物照片。
4. 形象固化完成后，可以选择：
   - 输入场景需求，生成推荐并试穿。
   - 切换到“指定商品”，上传商品图片并试穿。

## 常用命令

后端依赖检查：

```bash
cd backend
pip check
```

前端构建：

```bash
cd frontend
npm run build
```

停止数据库：

```bash
docker compose down
```

## 目录结构

```text
.
├── backend/             # FastAPI 后端
│   ├── app/
│   │   ├── agents/      # AI agent 节点
│   │   ├── core/        # 配置和状态定义
│   │   ├── db/          # 数据库连接和模型
│   │   └── workflow/    # LangGraph 工作流
│   └── requirements.txt
├── frontend/            # React 前端
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── store/
│   └── package.json
├── docker-compose.yml
└── .env.example
```

## 注意事项

- `backend/.env`、`backend/venv`、`frontend/node_modules`、`frontend/dist`、`backend/uploads` 不应提交到仓库。
- 首次运行后端时会自动创建数据库表。
- 如果 AI 服务调用失败，后端部分 agent 会返回降级结果，便于 MVP 流程继续演示。
