# card-nav

一个简洁高效的卡片式导航站点，支持多栏目管理、搜索过滤、右键菜单、置顶收藏，数据通过后端 API 持久化到 JSON 文件。

## 功能特点

- **多栏目管理** - 将链接按个人网站、GitHub 项目、学习资料等分类管理
- **快速搜索** - 按 Ctrl+K 聚焦搜索框，输入关键词即时过滤
- **右键菜单** - 右键空白处新增链接，右键卡片编辑/删除/置顶
- **置顶收藏** - 重要链接可置顶，置顶卡片排在最前
- **数据持久化** - 增删改自动保存到后端 JSON 文件

## 技术栈

- **前端** - React 18 + Vite 6 + TailwindCSS 3
- **后端** - Express 4 + Node.js
- **数据** - JSON 文件存储

## 本地开发

需要同时启动前端和后端服务。

```bash
# 安装依赖
npm install

# 终端1：启动后端（端口 3002）
npm run server

# 终端2：启动前端（端口 5173）
npm run dev
```

访问 http://localhost:5173

## 服务器部署结构

部署到服务器时只需上传以下文件：

```
card-nav/
├── server.js        # 后端服务
├── data/            # 数据目录（所有 JSON 数据）
├── package.json
└── package-lock.json
```

前端构建产物 `dist/` 可部署到 CDN 或静态托管服务。

## 部署到线上

### 1. 构建前端

```bash
npm run build
```

前端产物在 `dist/` 目录，可部署到任意的静态托管服务。

### 2. 部署后端到服务器

```bash
# 上传以下文件到服务器
scp server.js data/*.json package.json package-lock.json user@your-server:/path/to/card-nav/

# 安装依赖
npm install

# 使用 pm2 启动
npm install -g pm2
pm2 start server.js --name card-nav
pm2 save
pm2 startup
```

### 3. 配置 nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/card-nav/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

### 4. 修改前端 API 地址

部署前将 `src/App.jsx` 中的 API 地址改为服务器地址：

```javascript
const API_BASE = 'https://your-domain.com/api'
```

重新构建后部署。

### 5. 配置 HTTPS（推荐）

使用 Let's Encrypt 免费证书：

```bash
certbot --nginx -d your-domain.com
```

## 数据目录结构

```
src/data/
├── sidebar.json    # 左侧栏目配置
├── portfolio.json  # 个人网站数据
├── github.json     # GitHub 项目数据
├── learning.json   # 学习资料数据
└── ...
```

每个 JSON 文件格式：
```json
[
  {
    "id": "unique-id",
    "title": "链接标题",
    "description": "简短描述",
    "url": "https://example.com",
    "category": "分类",
    "favicon": "https://...",
    "pinned": false
  }
]
```

## 目录结构

```
card-nav/
├── server.js           # Express 后端
├── src/
│   ├── App.jsx         # 主组件
│   ├── components/     # UI 组件
│   │   ├── BentoCard.jsx
│   │   ├── CardModal.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── ContextMenu.jsx
│   │   ├── SidebarModal.jsx
│   │   └── SidebarContextMenu.jsx
│   ├── data/           # JSON 数据文件
│   └── index.css       # 样式
├── package.json
└── vite.config.js
```