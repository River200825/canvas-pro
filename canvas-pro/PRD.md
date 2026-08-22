# 个人商业画布工具 - 产品需求文档 (PRD)

## 1. 产品概述

### 1.1 产品名称
**CanvasPro** - 专业级个人商业画布工具

### 1.2 产品定位
**1:1 复刻 Canvanizer 核心体验** 的单页应用，面向培训演示、课后作业、个人商业建模。零后端、纯前端、即开即用、数据本地存储。

### 1.3 目标用户
- 培训讲师：课堂演示商业模式画布填写全过程
- 学员/学习者：课后作业练习、个人商业模式设计
- 创业初学者：快速绘制和迭代商业模式

### 1.4 核心价值
- **零门槛**：无需注册登录，打开即用
- **专业级交互**：1:1 复刻 Canvanizer 拖拽、缩放、自由定位
- **完整页面体系**：首页 → 引导教程 → 画布编辑器 → 案例库 → 预览分享
- **教学友好**：演示模式、作业提交导出、只读分享链接

---

## 2. 页面架构（四大核心页面）

| 页面 | 路由 | 核心功能 |
|------|------|----------|
| **首页** | `/` | 产品介绍、模板预览、快速新建、最近画布、登录入口(预留) |
| **引导教程页** | `/guide` | 交互式分步教程、视频演示、键盘速查表、模板选择入口 |
| **画布编辑器** | `/canvas/:id` | 核心工作区，Canvanizer 级交互 |
| **案例库/预览页** | `/examples/:id` | 只读预览、一键复制到编辑器、导出、分享 |

---

## 3. 核心功能需求

### 3.1 画布模板系统
| 优先级 | 模板 | 说明 |
|--------|------|------|
| P0 | 商业模式画布 | 标准 9 大模块，按 Osterwalder 标准顺序 |
| P0 | 精益画布 | Ash Maurya 9 模块 |
| P0 | SWOT 分析 | 4 象限布局 |
| P1 | 更多模板 | Pitch Planner、Customer Journey、Empathy Map 等（可扩展） |

### 3.2 便利贴/卡片系统 —— **核心交互，必须 1:1 复刻 Canvanizer**

| 交互 | Canvanizer 行为 | 实现要求 |
|------|-----------------|----------|
| **创建** | 双击画布任意空白处、区块内双击、区块 header "+" | 三种方式均支持 |
| **编辑** | 单击标题/内容直接内联编辑，Enter 换行，Esc 取消，失焦保存 | 完全一致 |
| **自由拖拽** | 鼠标按住色条/标题栏拖拽，**任意位置放置**，不吸附网格 | **必须** 自由定位 |
| **跨区块拖拽** | 拖拽穿越区块边界，自动更新归属区块 | **必须** |
| **缩放大小** | 右下角拖拽手柄调整宽高 | **必须** |
| **颜色** | 点击色条弹出 7 色选择器 | 完全一致 |
| **格式化** | 加粗、斜体、下划线、删除线、列表、链接 | 基础富文本 |
| **操作菜单** | 悬停/选中显示：复制、删除、置顶、置底、锁定、评论 | 核心项优先 |
| **多选** | Shift+点击 / 框选多张，批量移动/删除/改色 | P1 |

### 3.3 画布视图操作 —— **1:1 复刻**
| 操作 | 行为 |
|------|------|
| **缩放** | Ctrl+滚轮 / 触控捏合 / 工具栏 +/- / 重置 100% |
| **平移** | 空白处按住拖拽 / 空格+拖拽 / 触控单指拖拽 / 双击空白重置 |
| **全屏** | F / 工具栏按钮，隐藏所有 UI 仅留画布 |
| **小地图** | 右下角缩略图导航（P1） |
| **对齐辅助** | 拖拽时显示红线对齐基线、中心线、边缘 | P1 |

### 3.4 区块管理
- 区块可折叠/展开
- 区块可拖拽重排（改变列布局）
- 区块标题可编辑
- 区块背景色可自定义

### 3.5 数据持久化（本地优先）
- **localStorage 自动保存**：防抖 500ms，节流 2s
- **多画布管理**：创建、切换、重命名、复制、删除、导入/导出 JSON
- **版本快照**：手动/自动创建，最多保留 20 个，支持回滚
- **数据损坏自愈**：启动校验，损坏自动清理并创建新画布

### 3.6 导出功能
| 格式 | 要求 |
|------|------|
| PNG | 高清（1x/2x/3x），可选背景透明/白色 |
| PDF | A4/A3、横纵向、页眉页脚、文字可选中、矢量质量 |
| Markdown | 结构化，含元数据 |
| JSON | 完整数据备份，版本兼容 |
| 分享链接 | Base64 编码画布数据，只读模式打开 |

### 3.7 演示/教学辅助
- **演示模式**：全屏、隐藏工具栏、←/→ 切换画布、空格平移
- **引导教程页**：分步交互式教程（非模态弹窗），可重播
- **只读预览页**：URL 直接打开，显示"编辑副本"按钮
- **键盘快捷键**：完整映射表，`/guide` 页可查

### 3.8 界面与主题
- **主题**：浅色/深色/跟随系统，CSS 变量实现
- **响应式**：≥1200px 标准网格、768-1199px 两列、<768px 单列堆叠
- **触屏完整支持**：拖拽、缩放、编辑、长按菜单

---

## 4. 交互流程

### 4.1 新用户首次访问
```
打开首页 → 点击"新建画布" → 选择模板 → 进入编辑器 → 自动显示引导教程（可跳过） → 开始使用
```

### 4.2 创建便利贴流程
```
双击画布空白 / 区块双击 / 点击区块 "+" → 新建便利贴出现 → 自动聚焦标题 → 输入标题 → Enter → 输入内容 → 点击外部/ESC 完成
```

### 4.3 拖拽交互流程
```
鼠标按下色条/标题栏 → 进入拖拽态（半透明幽灵态） → 自由移动 → 显示对齐红线 → 松手定位 → 自动更新归属区块
```

### 4.4 导出分享流程
```
工具栏导出按钮 → 选择格式 → 配置选项 → 下载/复制链接
```

---

## 5. 验收标准（AC）

| 编号 | 验收项 | 通过标准 |
|------|--------|----------|
| AC-01 | 首页加载 | 2s 内渲染首页，显示模板卡片、最近画布 |
| AC-02 | 引导教程 | 分步交互式，可跳过、可重播，覆盖核心操作 |
| AC-03 | 编辑器加载 | 2s 内渲染 9 区块画布，工具栏、区块、空状态完整 |
| AC-04 | 创建便利贴 | 双击空白/区块/点击+ 均可创建，自动聚焦标题 |
| AC-05 | 编辑便利贴 | 单击标题/内容内联编辑，支持富文本，ESC 取消 |
| AC-06 | 自由拖拽 | 任意位置拖拽、跨区块移动、右下角缩放、对齐红线 |
| AC-07 | 跨区块归属 | 拖拽跨越区块边界自动更新 blockId |
| AC-08 | 缩放平移 | Ctrl+滚轮/触控缩放，空白拖拽/空格拖拽平移，双击重置 |
| AC-09 | 模板切换 | 工具栏下拉切换 3+ 模板，区块布局自动重排 |
| AC-10 | 多画布 | 新建/切换/重命名/复制/删除/导入导出 JSON |
| AC-11 | 快照版本 | 手动/自动创建，列表预览，一键回滚，最多 20 个 |
| AC-12 | 导出 PNG | 1-3x 倍率，背景可选，清晰无模糊 |
| AC-13 | 导出 PDF | A4/A3 横纵，文字可选中，分页不断裂 |
| AC-14 | 演示模式 | F 全屏，隐藏 UI，←/→ 切画布，Esc 退出 |
| AC-15 | 分享链接 | Base64 只读链接，打开即预览，显示"编辑副本" |
| AC-16 | 首页/案例/预览 | 四页面路由完整，SEO 基础 meta |
| AC-16 | 响应式 | 三断点布局正常，触控拖拽缩放编辑全可用 |
| AC-17 | 快捷键 | 核心 15+ 快捷键全部生效，/guide 页可查 |
| AC-18 | 数据恢复 | 刷新/关闭浏览器后内容/位置/颜色/缩放完全恢复 |

---

## 6. 范围外（V1 不做）
- 实时协作/多人编辑
- 后端账号体系、云同步
- AI 智能生成画布
- 图片上传/嵌入
- 评论/备注/侧边栏笔记（预留 UI 占位）
- 自定义区块形状（非矩形）
- 插件/扩展系统
- 小地图导航（P1）

---

## 7. 非功能性需求

### 性能指标
- 首屏加载 < 2s（首包 < 200KB gzip）
- 画布渲染 60fps，200+ 便利贴流畅拖拽
- localStorage 读写 < 50ms

### 兼容性
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- 响应式三断点、触屏完整支持

### 可用性
- 无障碍：键盘可达、ARIA、WCAG AA 对比度
- 错误兜底：存储满降级 IndexedDB、损坏自愈

### 安全性
- 纯前端，无数据上传
- 分享链接仅含画布数据
- CSP 限制外部资源

---

## 8. 技术选型（锁定）

| 类别 | 选型 | 理由 |
|------|------|------|
| 框架 | Vue 3 + TypeScript + Vite | 生态成熟、TS 支持佳 |
| 状态管理 | Pinia | 官方推荐、轻量 |
| **拖拽引擎** | **@dnd-kit/core + @dnd-kit/sortable + @dnd-kit/utilities** | **原生 TS、无依赖、支持自由定位、触屏、虚拟列表** |
| 样式 | UnoCSS (attributify 模式) | 原子化、按需、主题变量友好 |
| 图标 | lucide-vue-next | SVG、Tree-shaking |
| 导出-PNG | html-to-image | 成熟、支持 filter 忽略元素 |
| 导出-PDF | pdf-lib (手动布局) | 矢量质量、文字可选中、分页可控 |
| 导出-MD/JSON | 原生实现 | 无额外依赖 |
| 部署 | GitHub Pages / Cloudflare Pages / Vercel | 免费 CDN、CI/CD |

---

## 9. 目录结构

```
canvas-pro/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/           # 静态资源
│   ├── components/
│   │   ├── canvas/       # 画布核心组件
│   │   │   ├── CanvasGrid.vue        # 画布容器、缩放平移、小地图
│   │   │   ├── CanvasBlock.vue       # 区块、header、折叠、Droppable
│   │   │   ├── StickyNote.vue        # 便利贴、编辑、拖拽手柄、缩放手柄
│   │   │   ├── BlockHeader.vue
│   │   │   ├── Minimap.vue           # 小地图导航
│   │   │   └── AlignmentGuides.vue   # 对齐红线
│   │   ├── toolbar/      # 顶部工具栏
│   │   │   ├── Toolbar.vue
│   │   │   ├── CanvasSwitcher.vue
│   │   │   ├── TemplateSelector.vue
│   │   │   ├── ExportMenu.vue
│   │   │   ├── ThemeToggle.vue
│   │   │   ├── PresentationToggle.vue
│   │   │   └── ZoomControl.vue
│   │   ├── modals/       # 弹窗/面板
│   │   │   ├── ColorPicker.vue
│   │   │   ├── ExportDialog.vue
│   │   │   ├── ShareDialog.vue
│   │   │   ├── ShortcutHelp.vue
│   │   │   ├── NoteFormatToolbar.vue # 富文本工具条
│   │   │   └── ConfirmDialog.vue
│   │   ├── sidebar/      # 侧边栏（预留）
│   │   │   ├── SnapshotsPanel.vue
│   │   │   ├── LayersPanel.vue
│   │   │   └── CommentsPanel.vue
│   │   └── common/       # 通用基础组件
│   ├── views/            # 页面级组件（路由对应）
│   │   ├── HomeView.vue          # 首页
│   │   ├── GuideView.vue         # 引导教程页
│   │   ├── CanvasEditorView.vue  # 画布编辑器
│   │   ├── ExampleView.vue       # 案例预览页
│   │   └── PreviewView.vue       # 只读预览页
│   ├── composables/      # 组合式函数
│   │   ├── useCanvas.ts
│   │   ├── useStickyNotes.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── useDragDrop.ts
│   │   ├── useViewport.ts
│   │   └── useExport.ts
│   ├── stores/           # Pinia 状态
│   │   ├── canvas.ts
│   │   ├── ui.ts
│   │   └── settings.ts
│   ├── router/           # Vue Router
│   │   └── index.ts
│   ├── templates/        # 画布模板定义
│   │   ├── business-model.ts
│   │   ├── lean-canvas.ts
│   │   ├── swot.ts
│   │   └── index.ts
│   ├── types/            # TypeScript 类型
│   │   ├── canvas.ts
│   │   ├── note.ts
│   │   ├── template.ts
│   │   └── viewport.ts
│   ├── utils/            # 工具函数
│   │   ├── export-png.ts
│   │   ├── export-pdf.ts
│   │   ├── export-markdown.ts
│   │   ├── export-json.ts
│   │   ├── share-link.ts
│   │   ├── alignment.ts
│   │   └── helpers.ts
│   ├── styles/           # 全局样式
│   │   ├── main.css
│   │   ├── variables.css
│   │   └── reset.css
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── uno.config.ts
├── .eslintrc.cjs
├── .prettierrc
└── README.md
```

---

## 10. 关键数据结构

```typescript
// 视口状态
interface ViewportState {
  x: number
  y: number
  scale: number
}

// 便利贴 - 支持自由定位
interface StickyNote {
  id: string
  blockId: string | null  // null 表示自由模式不属于任何区块
  title: string
  content: string         // HTML 字符串，支持富文本
  color: NoteColorId
  order: number
  x: number               // 相对画布坐标
  y: number
  width: number
  height: number
  zIndex: number
  locked: boolean
  createdAt: number
  updatedAt: number
}

// 画布区块
interface CanvasBlock {
  id: string
  title: string
  titleEn: string
  order: number
  widthPercent: number    // 网格模式下列宽
  x?: number              // 自由模式下坐标
  y?: number
  width?: number
  height?: number
  color?: string
  collapsed: boolean
}

// 画布实例
interface CanvasInstance {
  id: string
  templateId: string
  name: string
  mode: 'grid' | 'free'   // 网格模式 / 自由模式
  notes: StickyNote[]
  blocks: CanvasBlock[]
  viewport: ViewportState
  createdAt: number
  updatedAt: number
  snapshots: CanvasSnapshot[]
}
```

---

## 11. 开发流程约束（强制）

1. **文档驱动开发**：每个任务开始前必须阅读对应 PRD/DEVELOPMENT_PLAN 章节
2. **逐步确认**：完成一个子任务 → 自测通过 → 向用户确认 → 才能进入下一步
3. **偏差即停**：实现偏离文档需求时立即停止，更新文档或修正代码
4. **验收标准为准**：以 PRD 第 5 节 AC 表为最终验收依据
5. **文档同步**：代码变更涉及架构/接口/数据结构时，同步更新两份文档

---

*文档版本：v2.0*
*创建日期：2026-08-20*
*更新日期：2026-08-20*
*状态：待评审确认*