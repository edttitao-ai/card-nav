@ -33,85 +33,118 @@ npm run dev

访问 http://localhost:5173

## 服务器部署结构
## 宝塔面板 + PM2 部署

部署到服务器时只需上传以下文件：
本项目使用 Express 后端 + JSON 数据存储，适合用宝塔面板的 PM2 管理器部署。

### 一、上传项目到服务器

1. 将项目文件夹上传到服务器，例如：`/www/wwwroot/card-nav`

2. 目录结构应包含：
```
card-nav/
├── server.js        # 后端服务
├── data/            # 数据目录（所有 JSON 数据）
├── server.js           # 后端服务
├── ecosystem.config.js # PM2 配置文件（新建）
├── data/               # 数据目录
├── package.json
└── package-lock.json
```

前端构建产物 `dist/` 可部署到 CDN 或静态托管服务。

## 部署到线上

### 1. 构建前端
### 二、安装依赖

SSH 登录服务器，执行：
```bash
npm run build
cd /www/wwwroot/card-nav
npm install
```

前端产物在 `dist/` 目录，可部署到任意的静态托管服务。
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

### 2. 部署后端到服务器
### 四、PM2 常用命令

```bash
# 上传以下文件到服务器
scp server.js data/*.json package.json package-lock.json user@your-server:/path/to/card-nav/
# 启动项目
pm2 start card-nav

# 安装依赖
npm install
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

# 使用 pm2 启动
npm install -g pm2
pm2 start server.js --name card-nav
# 开机自启
pm2 save
pm2 startup
```

### 3. 配置 nginx
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

    # 前端静态文件
    # 前端静态文件（如果有）
    location / {
        root /path/to/card-nav/dist;
        root /www/wwwroot/card-nav/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API
    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:3002;
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. 修改前端 API 地址

部署前将 `src/App.jsx` 中的 API 地址改为服务器地址：

```javascript
const API_BASE = 'https://your-domain.com/api'
```
### 七、常见问题

重新构建后部署。
**Q: PM2 启动后显示"运行中"但访问不了？**
A: 检查防火墙是否放行 3002 端口，以及 Nginx 是否正确配置。

### 5. 配置 HTTPS（推荐）
**Q: 日志显示 `MODULE_NOT_FOUND`？**
A: 确认已执行 `npm install`，且在项目目录下操作。

使用 Let's Encrypt 免费证书：
**Q: 宝塔看不见日志？**
A: 使用命令行 `pm2 logs card-nav` 查看，或到 `~/.pm2/logs/` 目录查看日志文件。

```bash
certbot --nginx -d your-domain.com
```
---

## 数据目录结构