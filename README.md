# 点菜系统

基于 Go + Gin + PostgreSQL + React + TypeScript 的在线点菜系统。

## 功能特性

### 用户端
- 浏览菜单（按分类筛选）
- 购物车管理
- 下单并查看订单状态
- 用户注册/登录

### 管理端
- 菜品管理（增删改查）
- 分类管理
- 订单管理（状态流转）
- 数据统计

## 快速开始

### 1. 安装依赖

```bash
# 后端依赖
go mod tidy

# 前端依赖
cd frontend && npm install
```

### 2. 配置数据库

创建 PostgreSQL 数据库：

```sql
CREATE DATABASE cook;
```

设置环境变量（可选，默认值如下）：

```bash
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/cook?sslmode=disable"
export JWT_SECRET="your-secret-key"
```

### 3. 初始化数据

```bash
go run cmd/seed/main.go
```

这将创建：
- 管理员账号：admin / admin123
- 默认分类和菜品

### 4. 启动服务

```bash
# 构建前端
cd frontend && npm run build && cd ..

# 启动后端
go run cmd/server/main.go
```

访问 http://localhost:8080

### 5. 开发模式

```bash
# 终端1：启动后端
go run cmd/server/main.go

# 终端2：启动前端开发服务器
cd frontend && npm run dev
```

前端开发服务器会代理 API 请求到后端 8080 端口。

## API 接口

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录

### 菜品（公开）
- `GET /api/dishes` - 获取菜品列表
- `GET /api/dishes/:id` - 获取菜品详情
- `GET /api/categories` - 获取分类列表

### 订单（需登录）
- `POST /api/orders` - 创建订单
- `GET /api/orders` - 获取我的订单
- `GET /api/orders/:id` - 获取订单详情

### 管理端（需管理员权限）
- `POST /api/admin/dishes` - 创建菜品
- `PUT /api/admin/dishes/:id` - 更新菜品
- `DELETE /api/admin/dishes/:id` - 删除菜品
- `POST /api/admin/categories` - 创建分类
- `PUT /api/admin/categories/:id` - 更新分类
- `DELETE /api/admin/categories/:id` - 删除分类
- `GET /api/admin/orders` - 获取所有订单
- `PUT /api/admin/orders/:id/status` - 更新订单状态
- `GET /api/admin/stats` - 获取统计数据

## 技术栈

- **后端**: Go + Gin + GORM + PostgreSQL
- **前端**: React + TypeScript + Vite + Tailwind CSS
- **认证**: JWT
