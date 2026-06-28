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

## 宝塔面板 + PM2 部署

本项目使用 Express 后端 + JSON 数据存储，适合用宝塔面板的 PM2 管理器部署。

### 一、上传项目到服务器

1. 将项目文件夹上传到服务器，例如：`/www/wwwroot/card-nav`

2. 目录结构应包含：
```
card-nav/
├── server.js           # 后端服务
├── ecosystem.config.js # PM2 配置文件（新建）
├── data/               # 数据目录
├── package.json
└── package-lock.json
```

### 二、安装依赖

SSH 登录服务器，执行：
```bash
cd /www/wwwroot/card-nav
npm install
```

### 三、宝塔面板配置 PM2

1. 打开 **宝塔面板** → **软件商店** → **PM2管理器**
2. 点击 **添加项目**
3. 配置如下：
   - 项目名称：`card-nav`
   - 项目路径：`/www/wwwroot/card-nav`
   - 启动文件：`server.js`
   - 运行目录：`/www/wwwroot/card-nav`
   - 端口：`3002`
4. 点击 **添加**，然后 **启动**

### 四、PM2 常用命令

```bash
# 启动项目
pm2 start card-nav

# 停止项目
pm2 stop card-nav

# 重启项目
pm2 restart card-nav

# 查看日志
pm2 logs card-nav

# 监控状态
pm2 monit

# 查看进程列表
pm2 list

# 开机自启
pm2 save
pm2 startup
```

### 五、查看 PM2 日志

如果项目启动失败，查看详细日志：
```bash
pm2 logs card-nav --lines 100
```

日志路径通常在：`~/.pm2/logs/`

### 六、Nginx 反向代理配置

后端部署完成后，还需配置 Nginx 让前端和后端都能通过域名访问。

在宝塔中新建网站后，修改 Nginx 配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件（如果有）
    location / {
        root /www/wwwroot/card-nav/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 七、常见问题

**Q: PM2 启动后显示"运行中"但访问不了？**
A: 检查防火墙是否放行 3002 端口，以及 Nginx 是否正确配置。

**Q: 日志显示 `MODULE_NOT_FOUND`？**
A: 确认已执行 `npm install`，且在项目目录下操作。

**Q: 宝塔看不见日志？**
A: 使用命令行 `pm2 logs card-nav` 查看，或到 `~/.pm2/logs/` 目录查看日志文件。

---

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