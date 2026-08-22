# CanvasPro 开发规划文档

## 概览
- **目标**：1:1 复刻 Canvanizer 核心体验，四页面完整应用
- **技术栈**：Vue 3 + TS + Vite + Pinia + @dnd-kit + UnoCSS + Vue Router
- **预计工期**：6 周（30 个工作日），含 20% 缓冲
- **开发流程**：文档驱动 → 逐步确认 → 偏差即停 → 验收标准为准

---

## 阶段 0：项目初始化与基础设施 (Day 1-2)

### 0.1 环境搭建
```bash
npm create vite@latest canvas-pro -- --template vue-ts
cd canvas-pro
npm i vue@latest pinia vue-router@latest @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities lucide-vue-next
npm i -D typescript vite @types/node unocss @unocss/preset-uno @unocss/preset-attributify @unocss/transformer-directives eslint @vue/eslint-config-typescript prettier eslint-plugin-vue html-to-image pdf-lib file-saver @types/file-saver
```

### 0.2 配置文件
- `vite.config.ts`：路径别名、UnoCSS、Vue Router、代码分割（vendor-dnd、vendor-export、vendor-vue、vendor-router）
- `uno.config.ts`：主题色、暗黑模式、attributify、快捷键样式、滚动条、动画
- `tsconfig.json`：strict 模式、路径映射、vue-tsc 支持
- `.eslintrc.cjs` / `.prettierrc`：规范化
- `package.json`：scripts（dev、build、preview、lint、typecheck、test）

### 0.3 目录结构生成
按 PRD 第 9 节创建完整目录结构

### 0.4 基础布局与路由
- `main.ts`：注册 Pinia、Router、UnoCSS、全局指令
- `App.vue`：`<RouterView />` + 全局 Portal（Modals/Toasts）
- `router/index.ts`：四大路由 + 懒加载
- 全局样式：CSS 变量、重置、滚动条、选择态、焦点态

### 0.5 类型系统与模板定义
- `src/types/`：CanvasInstance、StickyNote、CanvasBlock、ViewportState、CanvasTemplate、CanvasSnapshot
- `src/templates/`：business-model、lean-canvas、swot、index.ts

---

## 阶段 1：首页与引导教程页 (Day 3-5)

### 1.1 首页
| 组件 | 功能 |
|------|------|
| `HomeView.vue` | 页面容器 |
| `HeroSection.vue` | 产品 Slogan、CTA 按钮、动画演示 |
| `TemplateGallery.vue` | 3+ 模板卡片、悬停预览、点击新建 |
| `RecentCanvases.vue` | 最近画布列表（localStorage 读取）、空状态引导 |
| `FeatureHighlights.vue` | 核心功能亮点展示 |

**验收**：
- 2s 内首屏渲染
- 模板卡片点击 → 跳转 `/canvas/new?template=xxx`
- 最近画布点击 → 跳转 `/canvas/:id`
- 响应式三断点正常

### 1.2 引导教程页
| 组件 | 功能 |
|------|------|
| `GuideView.vue` | 页面容器、进度条、跳过按钮 |
| `GuideStep.vue` | 单步教程：标题、演示动画/GIF、文字说明、交互区域 |
| `GuideSteps/` | 6 步教程组件：创建便利贴、编辑、拖拽、跨区块、缩放平移、导出分享 |
| `KeyboardShortcutsTable.vue` | 完整快捷键表、Mac/Win 切换 |

**验收**：
- 分步交互式（非模态），可拖拽进度条跳转
- 每步包含演示动画 + 可操作练习区
- 完成可直接跳转编辑器
- 支持重播、键盘 ←/→ 翻页

---

## 阶段 2：画布编辑器核心架构 (Day 6-10)

### 2.1 状态管理
| Store | 关键状态/Action |
|-------|-----------------|
| `canvas.ts` | `canvases[]`、`currentCanvas`、`currentTemplate`、`mode`、`createCanvas`、`switchCanvas`、`deleteCanvas`、`updateCanvas`、`addSnapshot`、`restoreSnapshot`、`importCanvas`、`persist` |
| `ui.ts` | `viewport`、`presentationMode`、`theme`、`sidebarOpen`、`activeModal`、`zoom` |
| `settings.ts` | `language`、`autoSaveInterval`、`defaultExportFormat`、`snapToGrid`、`showAlignmentGuides` |

### 2.2 画布容器与视口
| 组件 | 核心职责 |
|------|----------|
| `CanvasGrid.vue` | 根容器、视口 transform、缩放平移事件、双击重置、触控手势 |
| `useViewport.ts` | 缩放/平移逻辑、边界限制、动画过渡、重置 |

**关键交互**：
- Ctrl+滚轮 / 捏合缩放（以鼠标/手指为中心）
- 空白处拖拽 / 空格+拖拽 平移
- 双击空白重置视口
- 触控：单指平移、双指缩放、双指双击重置

### 2.3 区块系统
| 组件 | 核心职责 |
|------|----------|
| `CanvasBlock.vue` | 区块容器、Header、折叠、Droppable 区域、区块拖拽排序 |
| `BlockHeader.vue` | 标题编辑、计数、+按钮、折叠/展开、颜色条 |
| `Minimap.vue` | 右下角缩略图、视口指示器、点击跳转 |

**区块特性**：
- 网格模式：CSS Grid 自动布局，宽度按 `widthPercent`
- 自由模式：绝对定位，可拖拽调整位置大小
- Header 双击编辑标题
- 折叠动画、空状态提示

### 2.4 便利贴核心组件
| 组件 | 核心职责 |
|------|----------|
| `StickyNote.vue` | 便利贴容器、编辑态/预览态、拖拽手柄、缩放手柄、操作菜单 |
| `NoteEditor.vue` | 富文本编辑器（contenteditable + 格式工具条） |
| `NoteFormatToolbar.vue` | 加粗/斜体/下划线/删除线/列表/链接/颜色 |
| `ColorPicker.vue` | 7 色选择器、当前色高亮 |
| `ResizeHandle.vue` | 右下角缩放手柄、保持比例/自由缩放 |

**便利贴交互细节**：
- **创建**：双击画布/区块空白、区块 + 按钮 → 默认位置、默认大小、黄色
- **编辑**：单击标题/内容进入编辑态 → 富文本工具条浮现 → 失焦/ESC 保存
- **拖拽**：色条/标题栏按下 → 幽灵态半透明跟随 → 显示对齐红线 → 松手定位
- **跨区块**：拖拽穿越区块边界 → 自动更新 `blockId`、重新计算 order
- **缩放**：右下角手柄拖拽 → 实时调整 width/height → 最小 120x80px
- **操作菜单**：悬停/选中显示 → 复制/删除/置顶/置底/锁定/改色/评论
- **锁定**：锁定后不可拖拽/编辑/删除，仅可解锁

### 2.5 拖拽引擎封装
| 文件 | 职责 |
|------|------|
| `useDragDrop.ts` | 封装 @dnd-kit：Sensor 配置、拖拽态管理、跨区块逻辑、对齐红线 |
| `AlignmentGuides.vue` | 红线渲染：基线、中心线、边缘对齐、吸附阈值 8px |

**拖拽配置**：
- Sensor：PointerSensor(激活 8px/200ms) + KeyboardSensor + TouchSensor(激活 8px/200ms)
- 碰撞检测：closestCenter
- 拖拽态 CSS：`opacity: 0.4`、`transform: rotate(3deg)`、`box-shadow: 0 20px 40px`
- 幽灵元素：完全复制原节点样式
- 吸附：拖拽时计算与其他便利贴/区块边缘距离，<8px 显示红线、松手自动吸附

---

## 阶段 3：数据持久化、多画布、快照 (Day 11-14)

### 3.1 localStorage 封装
- `useLocalStorage.ts`：泛型封装、防抖写入、配额检查、损坏自愈、版本迁移

### 3.2 多画布管理
- `CanvasSwitcher.vue`：下拉列表、新建/重命名/复制/删除/导入导出
- 快捷键：`Ctrl+Shift+N` 新建、`Ctrl+Shift+D` 复制

### 3.3 快照版本控制
- `SnapshotsPanel.vue`：侧边栏面板、时间倒序、预览便利贴数、一键恢复/删除
- 自动创建：每 30 分钟、重大操作后
- 手动创建：Toolbar 按钮 + `Ctrl+S`
- 限制：最多 20 个，超限移除最旧

### 3.4 数据损坏自愈
- 启动时校验 `isValidCanvasArray`
- 损坏自动清理、创建新画布
- 导入 JSON 时 ID 去重、版本兼容

---

## 阶段 4：导出与分享 (Day 15-18)

### 4.1 导出菜单与对话框
- `ExportMenu.vue`：下拉菜单 PNG/PDF/Markdown/JSON/分享链接
- `ExportDialog.vue`：Tab 切换、格式专属配置、预览

### 4.2 PNG 导出
- `export-png.ts`：`html-to-image`、filter 忽略工具栏/弹窗、1-3x 倍率、背景色可选

### 4.3 PDF 导出（核心难点）
- `export-pdf.ts`：`pdf-lib` 手动布局
  - 遍历区块+便利贴计算坐标
  - 分页算法：内容不跨页断裂、自动分页
  - 文字矢量可选中、颜色矩形绘制
  - 页眉：画布名/模板/时间；页脚：页码
  - 支持 A4/A3、横纵向、边距配置

### 4.4 Markdown/JSON 导出
- `export-markdown.ts`：结构化输出、元数据头
- `export-json.ts`：完整序列化、版本字段

### 4.5 分享链接
- `share-link.ts`：Base64 编码/解码、URL 片段 `#data=`
- `PreviewView.vue`：只读模式、隐藏工具栏、显示"编辑副本"按钮
- `ShareDialog.vue`：链接复制、二维码、新标签打开

---

## 阶段 5：案例库与预览页 (Day 19-21)

### 5.1 案例库页
| 组件 | 功能 |
|------|------|
| `ExampleView.vue` | 页面容器、分类筛选、搜索 |
| `ExampleCard.vue` | 缩略图、标题、作者、标签、点击预览 |
| `ExampleDetail.vue` | 模态框预览、一键复制到编辑器、导出 |

**内置案例**：3-5 个经典案例（Uber、Airbnb、Dropbox 等商业模式画布）

### 5.2 只读预览页
- `PreviewView.vue`：URL 解码 Base64 → 渲染只读画布
- 隐藏所有编辑 UI、工具栏
- 显示"编辑副本"按钮 → 跳转编辑器并复制数据
- 支持缩放/平移/全屏预览

---

## 阶段 6：打磨、教学、PWA、部署 (Day 22-26)

### 6.1 主题与响应式
- `ThemeToggle.vue`：循环切换 Light/Dark/Auto、监听 `prefers-color-scheme`
- 响应式断点：≥1200px/768-1199px/<768px
- 触屏适配：最小点击区 44px、长按菜单、双指手势不冲突

### 6.2 键盘快捷键完整实现
| 快捷键 | 功能 | 实现位置 |
|--------|------|----------|
| `N` | 新建便利贴 | `useKeyboardShortcuts` + 编辑器焦点判断 |
| `Delete`/`Backspace` | 删除选中 | 同 |
| `Ctrl+S` | 创建快照 | 同 |
| `Ctrl+Shift+S` | 保存画布 | 同 |
| `Ctrl+E` | 打开导出 | 同 |
| `F` | 切换全屏 | 同 |
| `Esc` | 退出全屏/关闭弹窗 | 同 |
| `Ctrl+0` | 重置视图 | 同 |
| `Ctrl++` / `Ctrl+-` | 放大/缩小 | 同 |
| `Space+拖拽` | 平移画布 | `useViewport` |
| `←` / `→` | 演示模式切画布 | `PresentationMode` |
| `?` / `Shift+/` | 显示快捷键帮助 | `ShortcutHelp.vue` |
| `Ctrl+Z` / `Ctrl+Y` | 撤销/重做 | P1（History Store） |
| `Ctrl+C` / `Ctrl+V` | 复制/粘贴便利贴 | 同 |

### 6.3 演示模式
- `PresentationToggle.vue`：全屏切换
- 隐藏：Toolbar、区块 Header 操作、便利贴操作菜单、侧边栏
- 保留：缩放、平移、键盘 ←/→ 切画布
- `Esc` 退出

### 6.4 引导教程页完善
- 每步包含：演示 GIF/视频 + 可操作练习区 + 文字说明
- 进度条可拖拽、键盘翻页、跳过按钮
- 完成后可直接跳转编辑器或首页

### 6.5 无障碍与细节
- ARIA：`role="list"` 区块、`role="listitem"` 便利贴、`aria-label` 所有操作
- 键盘聚焦可见轮廓、Tab 顺序合理
- 颜色对比度 WCAG AA
- `prefers-reduced-motion` 禁用动画
- 存储满降级 IndexedDB（`idb-keyval`）

### 6.6 PWA 支持
- `vite-plugin-pwa`：Service Worker、离线缓存、安装提示
- `manifest.json`：名称、图标、主题色、显示模式 standalone

### 6.7 文档与部署
- `README.md`：项目介绍、快速开始、截图、部署指南
- `docs/usage.md`：用户手册、快捷键表、导出说明
- `docs/development.md`：架构、扩展模板、自定义颜色
- GitHub Actions：push main → build → deploy to GitHub Pages/Cloudflare Pages
- 发布清单：版本号、CHANGELOG、Git Tag、Release、部署验证

---

## 阶段 7：测试与验收 (Day 27-30)

### 7.1 单元测试 - 覆盖率 ≥ 80%
- `useStickyNotes`：增删改查、移动、排序、跨区块
- `useLocalStorage`：存取、配额、迁移、损坏自愈
- `useViewport`：缩放、平移、边界、重置
- `export-*`：序列化格式、分页算法
- 模板定义完整性

### 7.2 E2E 测试 - 关键流程全覆盖
- 新用户：首页 → 新建 → 引导 → 编辑 → 导出
- 老用户：首页 → 最近画布 → 继续编辑 → 快照回滚
- 多画布：新建/切换/重命名/复制/删除/导入导出
- 导出：PNG/PDF/MD/JSON/分享链接
- 演示模式：全屏/切画布/退出
- 响应式：三断点、触控拖拽/缩放/编辑
- 分享链接：只读预览 → 编辑副本

### 7.3 手动验收清单（对应 PRD AC-01 到 AC-18）
逐项勾选、录屏备档

### 7.4 性能基准
- Lighthouse CI：Performance ≥ 90、Accessibility ≥ 95、Best Practices ≥ 90、SEO ≥ 90
- 包体积：`vite-bundle-analyzer`、首包 < 200KB gzip
- 200 便利贴拖拽 60fps

---

## 资源估算与风险缓冲

| 阶段 | 预计工时 | 缓冲 | 累计 |
|------|----------|------|------|
| 0: 初始化 | 2 天 | 0.5 天 | 2.5 天 |
| 1: 首页+引导 | 3 天 | 1 天 | 6.5 天 |
| 2: 编辑器核心 | 5 天 | 1.5 天 | 13 天 |
| 3: 数据+多画布+快照 | 4 天 | 1 天 | 18 天 |
| 4: 导出+分享 | 4 天 | 1.5 天 | 23.5 天 |
| 5: 案例+预览 | 3 天 | 0.5 天 | 27 天 |
| 6: 打磨+PWA+部署 | 5 天 | 1 天 | 33 天 |
| 7: 测试+验收 | 4 天 | 1 天 | 38 天 |
| **总计** | **30 天** | **8 天** | **~38 天 (7.5 周)** |

### 关键路径风险
1. **PDF 导出分页** → 4 天缓冲，pdf-lib 手动布局并行调试
2. **拖拽引擎稳定性** → 3 天缓冲，@dnd-kit 方案验证、触屏实测
3. **自由定位模式** → 坐标系转换、区块归属判断复杂
4. **触屏手势冲突** → 真机测试尽早介入、必要时简化
5. **首包体积** → 动态导入导出模块、代码分割、UnoCSS 按需

---

## 扩展性设计（V2 预留）

### 插件化模板系统
```typescript
interface CustomTemplate extends CanvasTemplate {
  isCustom: true
  createdBy: string
  version: number
}
```

### 协作基础设施预留
- `CanvasInstance.collaborators: Collaborator[]`
- 事件总线：`canvas:note-created`、`canvas:note-moved`、`canvas:viewport-changed`
- WebRTC/WebSocket 接口预留

### AI 生成接口预留
```typescript
interface AIGenerateRequest {
  prompt: string
  templateId: string
  language: 'zh' | 'en'
}
interface AIGenerateResponse {
  notes: Omit<StickyNote, 'id' | 'createdAt' | 'updatedAt'>[]
  blocks?: Omit<CanvasBlock, 'id'>[]
}
```

---

## 开发规范（强制执行）

### Git 工作流
- `main`：生产就绪
- `develop`：集成分支
- `feature/*`：功能分支
- `fix/*`：修复分支
- Commit：`feat:` `fix:` `refactor:` `docs:` `style:` `test:` `chore:`

### 代码规范
- Vue 3 `<script setup>` + TypeScript
- Props 显式类型、必填、默认值
- Composables `useXxx` 命名、返回 Ref/ComputedRef/函数
- 禁用 `any`、启用 `strictNullChecks`

### 组件设计原则
- 单一职责
- 受控组件：状态提升到 Store
- 无副作用：副作用在 Composables/Store

---

## 确认检查点（每步必走）

| 检查点 | 确认内容 | 负责人 |
|--------|----------|--------|
| 阶段开始 | 阅读对应 PRD/DEV_PLAN 章节，明确范围 | 开发者 |
| 编码完成 | 自测通过、TypeScript 无错误、构建通过 | 开发者 |
| 确认提交 | 向用户演示功能、对照 AC 表逐项确认 | 开发者 → 用户 |
| 用户确认 | 用户确认无误 → 标记完成 → 进入下一步 | 用户 |
| 文档同步 | 架构/接口/数据结构变更时同步更新 PRD/DEV_PLAN | 开发者 |

---

*文档版本：v2.0*
*创建日期：2026-08-20*
*更新日期：2026-08-20*
*状态：待评审确认*