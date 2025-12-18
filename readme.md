### 项目说明：Advanced Search Block（WordPress 测试题）

本项目为一个 **基于 Gutenberg Block 的高级搜索插件**，用于完成测试题中关于 WordPress、REST API、React（Block Editor）与 Docker 的综合考核要求。
项目从零搭建开发环境，到插件实现、数据准备、交付说明，均可复现。

---

### 一、运行环境与技术栈

* 操作系统：Windows 11
* 容器环境：Docker Desktop + Docker Compose
* CMS：WordPress 6.x
* 数据库：MySQL 5.7
* 前端：

  * Gutenberg Block
  * React（@wordpress/scripts）
* 后端：

  * WordPress REST API
  * WP_Query
* 构建工具：Node.js + npm
* 包管理：npm
* 开发语言：PHP / JavaScript / SCSS

---

### 二、项目目录结构说明

```powershell
wp-advanced-search
├── docker-compose.yml
├── db
│   └── database.sql
├── plugin
│   └── advanced-search-block
│       ├── advanced-search-block.php
│       ├── src
│       │   └── advanced-search-block
│       │       ├── edit.js
│       │       ├── view.js
│       │       ├── editor.scss
│       │       ├── style.scss
│       │       └── block.json
│       ├── build
│       ├── package.json
│       ├── package-lock.json
│       └── readme.txt
└── uploads
```

说明：

* `docker-compose.yml`：一键启动 WordPress + MySQL
* `db/database.sql`：测试数据数据库备份
* `plugin/advanced-search-block`：核心插件代码
* `src`：Gutenberg Block 源码
* `build`：编译后产物（由 `npm run build` 生成）
* `node_modules` 已在 `.gitignore` 中忽略

---

### 三、Docker 环境启动流程

#### 启动容器

在项目根目录执行：

```bash
docker-compose up -d
```

容器说明：

* WordPress 访问地址：[http://localhost:8000](http://localhost:8000)
* MySQL 服务容器：wp_db
* WordPress 容器：wp_app

数据库配置（已在 docker-compose.yml 中定义）：

* 数据库名：wordpress
* 数据库用户：admin
* 数据库密码：Admin_123456

---

### 四、WordPress 初始化与插件启用

#### 首次访问 WordPress

访问：

```
http://localhost:8000
```

按向导完成安装（管理员账号示例）：

* 用户名：admin
* 密码：admin_123
* 邮箱：任意

#### 启用插件

后台路径：

```
Dashboard → Plugins → Advanced Search Block → Activate
```

---

### 五、插件开发流程说明

#### 创建 Gutenberg Block

插件使用官方脚手架创建：

在plugin目录下运行如下命令：

```bash
npx @wordpress/create-block advanced-search-block
npm install
```

#### 开发模式

```bash
npm start
```

#### 构建生产版本

```bash
npm run build
```

生成内容位于：

```
plugin/advanced-search-block/build
```

---

### 六、功能实现说明（对照测试题）

#### Advanced Search Gutenberg Block

在编辑器中插入：

```
Advanced Search Block
```

后台（Gutenberg）支持配置：

* Keyword（关键词）
* Category（分类，下拉）
* Tags（标签，多选）

---

#### URL 参数同步

Block 中所有搜索条件都会实时同步到 URL，例如：

```
/search?q=Test&cat=2&tags[]=12&tags[]=15&page=2
```

特性说明：

* URL 是唯一状态源
* 刷新页面状态不丢失
* 后台编辑器与前台行为一致

---

#### AJAX 搜索（REST API）

自定义 REST API：

```
GET /wp-json/advanced-search/v1/posts
```

支持参数：

* q：关键词
* cat：分类 ID
* tags[]：标签 ID 数组
* page：分页页码

后端使用 `WP_Query` 动态过滤文章。

---

#### 搜索结果展示

前台功能：

* AJAX 获取结果
* 无刷新更新列表
* 显示文章标题与链接
* 无结果时显示提示信息

---

#### Pagination（分页，加分项）

分页特性：

* 当前页高亮
* 上一页 / 下一页
* 页码窗口显示
* 超多页时自动省略（…）
* URL 同步分页状态

---

#### Tags（Nice to have）

实现内容：

* Gutenberg 编辑器中可多选 Tags
* 前台渲染为 checkbox
* URL 参数同步
* 后端 REST API 自动过滤

---

### 七、样式与 UI 说明

* 编辑器样式：`editor.scss`
* 前台样式：`style.scss`
* 设计目标：

  * 现代化
  * 简洁
  * 良好自适应
  * 与 WordPress 原生 UI 风格协调

---

### 八、数据库准备说明

#### 使用 Fake / Dummy Data

项目中已准备：

* 多篇 Post
* 多个 Category
* 多个 Tag

#### 数据库恢复方式

如果您使用的是bash环境，可以直接运行如下数据进行还原：

```bash
docker exec -i wp_db mysql -u admin -pAdmin_123456 wordpress < db/database.sql
```

如果您是使用的是powershell，您可以使用这个(在项目根目录下运行)：

```powershell
Get-Content db/database.sql | docker exec -i wp_db mysql -u admin -pAdmin_123456 wordpress
```



---

### 九、注意事项与设计说明

* 未将搜索状态存为 block attributes，而是统一由 URL 管理，适合搜索页场景
* 前台 `view.js` 做了初始化防重处理，避免 Gutenberg 重复执行
* 插件结构遵循官方 create-block 推荐实践
* `node_modules` 未提交，避免仓库体积过大

---

### 十、总结

本项目完整实现了测试题中要求的：

* WordPress + Docker 开发环境
* Gutenberg Block 开发
* REST API + AJAX 搜索
* URL 状态同步
* 分类 / 标签 / 分页（含加分项）
* 可复现、可检查、可交付
