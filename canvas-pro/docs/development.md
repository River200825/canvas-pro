# CanvasPro 开发指南

## 架构概览

```
Views（页面）
  └── Components（组件，受控：状态提升到 Store）
        └── Stores（Pinia：canvas / ui / settings）
              └── useLocalStorage（防抖持久化 + 配额处理）
```

- **canvas store**：画布数组、当前画布、选中便利贴、快照；所有数据变更统一走 store 并立即持久化
- **ui store**：视口（演示模式）、主题（持久化 + 跟随系统）、全局弹窗（`activeModal: 'export' | 'snapshots' | 'shortcuts' | null`）
- **settings store**：导出偏好（PNG 倍率等）
- **组件无副作用**：数据操作只调用 store action，组件不直接触碰 localStorage

### 视口设计

每个画布实例持有独立 `viewport {x, y, scale}`（存在 canvas store），编辑器内所有缩放平移都作用于它；ui store 的 viewport 仅作演示模式等全局状态使用。缩放以鼠标为中心的实现见 `CanvasGrid.vue#handleWheel`。

### 传统画布布局

`src/templates/layout.ts` 为每个模板定义 `grid-template-areas`（10 列基准：顶部五列各占 2 列、底部成本/收入各占 5 列）。区块通过 `CanvasBlock.area` 字段声明归属区域，`CanvasGrid` 注入整体样式。小屏（<900px）通过 scoped 媒体查询退化为两列流式布局。

## 如何新增模板

1. 在 `src/templates/` 新建文件（参考 `swot.ts`）：

```ts
import type { CanvasTemplate, CanvasBlock } from '@/types'

const myBlocks: CanvasBlock[] = [
  { id: 'my-block-1', title: '区块一', titleEn: 'Block 1', order: 0, widthPercent: 50, color: '#e0f2fe', collapsed: false },
  // ...
]

export const myTemplate: CanvasTemplate = {
  id: 'my-template',
  name: '我的模板',
  nameEn: 'My Template',
  description: '模板描述',
  blocks: myBlocks,
}
```

2. 在 `src/templates/index.ts` 注册到 `templates` 数组
3. （可选）在 `layout.ts` 的 `GRID_LAYOUTS` 中添加该模板的传统布局，并给区块加 `area` 字段
4. 模板卡片会自动出现在首页模板库

## 如何新增便利贴颜色

编辑 `src/types/note.ts` 的 `NOTE_COLORS` 数组（含浅色 bg/border 与深色 darkBg/darkBorder），`NoteColorId` 联合类型同步添加。颜色选择器与案例库自动生效。

## 快捷键扩展

所有快捷键集中定义在 `src/composables/useKeyboardShortcuts.ts` 的 `shortcuts` 数组：

```ts
{ key: 'k', ctrl: true, editorOnly: true, description: '描述', action: () => { /* ... */ } }
```

- `editorOnly: true` 表示仅在 `/canvas` 路由生效，且输入框聚焦时自动禁用
- 用户可见的快捷键表在 `KeyboardShortcutsTable.vue` 中维护，新增后请同步

## PDF 导出实现说明

`src/utils/export-pdf.ts`：

1. `html-to-image` 将画布区域渲染为高分辨率 PNG（`data-export-ignore` 元素被过滤）
2. 按 `paper × orientation` 建页；内容按可用高度切片，逐页嵌入（内容不跨页断裂由切片对齐保证）
3. 页眉（画布名/模板/时间）与页脚（页码）使用 pdf-lib 标准字体绘制；非 Latin-1 字符以 `?` 兜底
4. 中文正文以图像嵌入，规避标准 14 字体不支持 CJK 的问题

## PWA

`vite.config.ts` 中 `VitePWA` 配置：

- `registerType: 'autoUpdate'`：有新版本时自动刷新
- 预缓存所有构建产物（js/css/html/svg/png）
- manifest 图标使用 SVG（`favicon.svg`），如需提升兼容性可补充 192/512 PNG

## 开发规范

- Vue 3 `<script setup lang="ts">`，禁用 `any`，strict 模式
- Composables 以 `useXxx` 命名
- Commit 遵循 Conventional Commits：`feat:` `fix:` `refactor:` `docs:` `chore:`
- 提交前运行 `npm run typecheck` 与 `npm run build`

## 部署

GitHub Actions（`.github/workflows/deploy.yml`）在 push 到 `main` 时自动构建并发布到 GitHub Pages。base 路径 `/canvas-pro/` 与仓库名对应；若仓库名变更需同步修改 `vite.config.ts` 的 `base` 与路由 hash base。
