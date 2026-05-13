# 友人帐腾讯云自建 API 设计

## 背景

友人帐公开留言需要稳定保存在自己的服务器上，避免依赖海外 Supabase 节点，也避免前端直接暴露数据库连接信息。当前作品集已经部署在腾讯云服务器，项目也已有 `express` 和 `better-sqlite3` 依赖，因此采用同域 API + SQLite 是最小可控方案。

## 方案

- 前端请求同域 `GET /api/friend-book-entries` 读取公开留言。
- 前端请求同域 `POST /api/friend-book-entries` 提交新留言。
- 腾讯云服务器本地运行 `node server/friend-book-api.js`。
- Nginx 把 `/api/friend-book-entries` 反向代理到 `127.0.0.1:3008`。
- 数据写入服务器本地 SQLite 文件，默认路径由 `FRIEND_BOOK_DB_PATH` 控制。

## 数据边界

服务器保存公开留言：

- 昵称
- 访客身份介绍
- 作品集评价
- 最近游戏
- 头像、奖章、展示日期
- 创建和更新时间

浏览器本地继续保存：

- 小游戏进度
- 当前头像选择
- 最近拉取的远程留言缓存
- 发布失败后的待同步草稿

## 部署要点

服务器环境变量：

```bash
FRIEND_BOOK_API_PORT=3008
FRIEND_BOOK_DB_PATH=/var/lib/xiaoci-portfolio/friend-book.sqlite
```

Nginx 需要把 API 转发给本地 Node 服务：

```nginx
location /api/friend-book-entries {
  proxy_pass http://127.0.0.1:3008/api/friend-book-entries;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

Node 服务建议用 systemd 或 pm2 守护运行。SQLite 文件目录需要给运行 Node 服务的用户写权限。
