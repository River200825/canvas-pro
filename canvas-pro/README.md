# CanvasPro

专业级个人商业画布工具，1:1 复刻 [Canvanizer](https://canvanizer.com) 核心体验。纯前端应用，数据全部保存在浏览器本地。

## 功能特性

- **三种经典模板**：商业模式画布（传统 9 宫格布局）、精益画布、SWOT 分析，每个区块带填写引导
- **便利贴头脑风暴**：双击创建（自动聚焦）、行内编辑（中文输入法友好）、Pointer 拖拽跨区块（触屏可用）、右键菜单、多选批量操作、7 色标记、锁定保护、复制粘贴
- **撤销 / 重做**：Ctrl+Z / Ctrl+Y，50 步历史，误删无忧
- **多画布管理**：新建 / 重命名 / 复制 / 删除（带确认）/ 导入 JSON（带预览）
- **快照版本控制**：手动（Ctrl+S）+ 每 30 分钟自动快照，恢复前自动备份，最多 20 个
- **多格式导出**：PNG（1x/2x/3x、透明背景）、PDF（A4/A3、横纵向、自动分页）、Markdown、JSON（带版本号）
- **演示模式**：F 键全屏，隐藏所有 UI，←/→ 切换画布，页码指示
- **移动端可用**：双指捏合缩放、触屏拖拽便利贴、小屏工具栏自适应
- **主题切换**：浅色 / 深色 / 跟随系统
- **键盘快捷键**：18 个快捷键，编辑器内按 `?` 查看
- **PWA**：可安装到桌面，离线可用，新版本由用户确认后更新
- **案例库**：内置 Uber / Airbnb / Dropbox / Spotify / Tesla 五个真实案例，编辑器内可一键载入示例
- **交互教程**：8 步引导，含可实际操作的练习沙盒

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（http://localhost:3000/canvas-pro/）
npm run dev

# 类型检查
npm run typecheck

# 单元测试（83 项，覆盖率 86%+）
npm run test

# 测试覆盖率报告
npm run test:coverage

# 生产构建（输出到 dist/）
npm run build

# 本地预览生产构建
npm run preview
```

> 注意：应用使用 `/canvas-pro/` 作为 base 路径（与 GitHub Pages 仓库名对应），本地开发访问 `http://localhost:3000/canvas-pro/`。

## 技术栈

| 类别 | 选型 |
|------|------|
| 框架 | Vue 3.5（`<script setup>` + TypeScript strict） |
| 状态管理 | Pinia |
| 路由 | Vue Router 4（hash 模式） |
| 原子化 CSS | UnoCSS（presetUno + attributify） |
| 构建 | Vite 5 |
| PDF 导出 | pdf-lib（手动分页布局） |
| PNG 导出 | html-to-image |
| PWA | vite-plugin-pwa（Workbox） |
| 图标 | lucide-vue-next |

## 目录结构

```
src/
├── components/
│   ├── canvas/        # 画布核心：CanvasGrid / CanvasBlock / BlockHeader / StickyNote / CanvasSwitcher / SnapshotsPanel
│   ├── export/        # ExportDialog
│   ├── guide/         # 教程：GuideStep / PracticeArea / KeyboardShortcutsTable
│   ├── home/          # 首页：HeroSection / TemplateGallery / RecentCanvases / FeatureHighlights
│   └── toolbar/       # Toolbar / ThemeToggle
├── composables/       # useKeyboardShortcuts / useLocalStorage
├── router/            # 路由定义（懒加载）
├── stores/            # Pinia：canvas（画布数据）/ ui（视口、主题、弹窗）/ settings（导出偏好）
├── templates/         # 模板定义 + layout.ts（传统画布 grid-template-areas 布局）
├── types/             # 类型：CanvasInstance / CanvasBlock / StickyNote / ViewportState
├── utils/             # export.ts（PNG/MD/JSON）、export-pdf.ts（PDF 分页）
└── views/             # HomeView / GuideView / CanvasEditorView / ExampleView
```

## 数据存储

- 画布数据：`localStorage['canvas-pro:v1']`，每次操作自动持久化
- 主题偏好：`localStorage['canvas-pro:theme']`
- 数据格式为完整 JSON，可通过导出 JSON → 导入实现跨设备迁移

## 部署

`vite build` 产物为纯静态文件，可部署到任何静态托管：

- **GitHub Pages**：仓库自带 `.github/workflows/deploy.yml`，push 到 `main` 自动部署（base 为 `/canvas-pro/`，对应仓库名 `canvas-pro`）
- **Cloudflare Pages / Netlify / Vercel**：构建命令 `npm run build`，输出目录 `dist`；若部署在根路径，需将 `vite.config.ts` 的 `base` 改为 `/`

## 文档

- [用户手册](docs/usage.md)：功能说明、快捷键表、导出说明
- [开发指南](docs/development.md)：架构设计、如何新增模板、自定义颜色
- [验收清单](docs/acceptance.md)：AC-01~18 验收状态与偏差记录
