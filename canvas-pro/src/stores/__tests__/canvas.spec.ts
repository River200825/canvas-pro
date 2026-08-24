import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useCanvasStore } from '../canvas'
import { templates } from '@/templates'

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('canvas store', () => {
  it('init 时无数据则自动创建默认画布', () => {
    const store = useCanvasStore()
    store.init()
    expect(store.canvases).toHaveLength(1)
    expect(store.currentCanvas).not.toBeNull()
    expect(store.currentCanvas?.templateId).toBe('business-model-canvas')
  })

  it('createCanvas 使用指定模板', () => {
    const store = useCanvasStore()
    store.init()
    const canvas = store.createCanvas('测试 SWOT', 'swot')
    expect(canvas.templateId).toBe('swot')
    expect(canvas.blocks).toHaveLength(4)
    expect(canvas.name).toBe('测试 SWOT')
    expect(store.currentCanvasId).toBe(canvas.id)
  })

  it('createCanvas 复制模板区块且互不共享引用', () => {
    const store = useCanvasStore()
    store.init()
    const canvas = store.createCanvas(undefined, 'lean-canvas')
    canvas.blocks[0].collapsed = true
    expect(templates.find(t => t.id === 'lean-canvas')!.blocks[0].collapsed).toBe(false)
  })

  it('switchCanvas / renameCanvas / duplicateCanvas / deleteCanvas', () => {
    const store = useCanvasStore()
    store.init()
    const first = store.canvases[0]
    const second = store.createCanvas('第二张', 'swot')

    store.switchCanvas(first.id)
    expect(store.currentCanvasId).toBe(first.id)

    store.renameCanvas(first.id, '改名了')
    expect(store.canvases.find(c => c.id === first.id)?.name).toBe('改名了')

    const copy = store.duplicateCanvas(second.id)
    expect(copy.name).toBe('第二张 (副本)')
    expect(store.currentCanvasId).toBe(copy.id)

    store.deleteCanvas(copy.id)
    expect(store.canvases).toHaveLength(2)
    expect(store.currentCanvasId).toBe(first.id)
  })

  it('deleteCanvas 删除最后一张时自动新建', () => {
    const store = useCanvasStore()
    store.init()
    const only = store.canvases[0]
    store.deleteCanvas(only.id)
    expect(store.canvases).toHaveLength(1)
    expect(store.canvases[0].id).not.toBe(only.id)
  })

  it('addNote / updateNote / deleteNote', () => {
    const store = useCanvasStore()
    store.init()
    const canvas = store.currentCanvas!
    const blockId = canvas.blocks[0].id

    const note = store.addNote(blockId, 10, 20, 'blue')
    expect(note.blockId).toBe(blockId)
    expect(note.x).toBe(10)
    expect(note.color).toBe('blue')

    store.updateNote(note.id, { title: '标题', content: '内容' })
    expect(store.currentCanvas!.notes[0].title).toBe('标题')

    store.deleteNote(note.id)
    expect(store.currentCanvas!.notes).toHaveLength(0)
  })

  it('moveNote 跨区块更新 blockId 与 order', () => {
    const store = useCanvasStore()
    store.init()
    const canvas = store.currentCanvas!
    const [b1, b2] = canvas.blocks
    const n1 = store.addNote(b1.id)
    store.moveNote(n1.id, b2.id, 5)
    expect(n1.blockId).toBe(b2.id)
    expect(n1.order).toBe(5)
  })

  it('reorderNotes 按目标位置重排 order', () => {
    const store = useCanvasStore()
    store.init()
    const blockId = store.currentCanvas!.blocks[0].id
    const a = store.addNote(blockId)
    const b = store.addNote(blockId)
    const c = store.addNote(blockId)
    a.order = 0
    b.order = 1
    c.order = 2

    store.reorderNotes(blockId, c.id, a.id) // c 移到 a 前面
    const orders = store
      .currentCanvas!.notes.filter(n => n.blockId === blockId)
      .sort((x, y) => x.order - y.order)
      .map(n => n.id)
    expect(orders).toEqual([c.id, a.id, b.id])
  })

  it('duplicateNote 生成新 id 且内容一致', () => {
    const store = useCanvasStore()
    store.init()
    const note = store.addNote(null)
    store.updateNote(note.id, { title: '原', content: '体' })
    const copy = store.duplicateNote(note.id)!
    expect(copy.id).not.toBe(note.id)
    expect(copy.title).toBe('原')
    expect(copy.content).toBe('体')
    expect(store.currentCanvas!.notes).toHaveLength(2)
  })

  it('锁定便利贴不可删除（组件层拦截，store 保持中性）', () => {
    const store = useCanvasStore()
    store.init()
    const note = store.addNote(null)
    store.updateNote(note.id, { locked: true })
    expect(store.currentCanvas!.notes[0].locked).toBe(true)
  })

  it('快照：创建、上限 20、恢复、删除', () => {
    const store = useCanvasStore()
    store.init()

    for (let i = 0; i < 25; i++) {
      store.createSnapshot(`快照${i}`)
    }
    const snapshots = store.currentCanvas!.snapshots
    expect(snapshots).toHaveLength(20)
    expect(snapshots[0].name).toBe('快照24') // 最新在前

    store.addNote(null, 1, 2)
    expect(store.currentCanvas!.notes).toHaveLength(1)
    store.restoreSnapshot(snapshots[0].id)
    expect(store.currentCanvas!.notes).toHaveLength(0) // 快照时无便利贴

    store.deleteSnapshot(snapshots[0].id)
    expect(store.currentCanvas!.snapshots).toHaveLength(19)
  })

  it('importCanvas 重新生成 id 并追加', () => {
    const store = useCanvasStore()
    store.init()
    const source = store.currentCanvas!
    const json = JSON.stringify({ ...source, name: '导入源' })
    const imported = store.importCanvas(json)
    expect(imported.id).not.toBe(source.id)
    expect(imported.name).toContain('导入源')
    expect(store.canvases).toHaveLength(2)
  })

  it('持久化：刷新后 init 恢复数据', () => {
    const store = useCanvasStore()
    store.init()
    store.createCanvas('持久化验证', 'swot')
    const count = store.canvases.length

    // 模拟新页面加载：新 pinia 实例读同一 localStorage
    setActivePinia(createPinia())
    const store2 = useCanvasStore()
    store2.init()
    expect(store2.canvases.length).toBe(count)
    expect(store2.canvases.some(c => c.name === '持久化验证')).toBe(true)
  })

  it('持久化：损坏数据自愈并重建', () => {
    localStorage.setItem('canvas-pro:v1', '{broken json')
    const store = useCanvasStore()
    store.init()
    expect(store.canvases).toHaveLength(1)
    expect(store.currentCanvas).not.toBeNull()
  })

  it('selectNote / getSelectedNote', () => {
    const store = useCanvasStore()
    store.init()
    const note = store.addNote(null)
    store.selectNote(note.id)
    expect(store.selectedNoteId).toBe(note.id)
    expect(store.getSelectedNote()?.id).toBe(note.id)
    store.selectNote(null)
    expect(store.getSelectedNote()).toBeNull()
  })

  describe('撤销 / 重做（A1）', () => {
    it('删除可 Ctrl+Z 撤销、Ctrl+Y 重做', () => {
      const store = useCanvasStore()
      store.init()
      const note = store.addNote(null)
      store.updateNote(note.id, { title: '重要' })
      expect(store.canUndo).toBe(true)

      store.deleteNote(note.id)
      expect(store.currentCanvas!.notes).toHaveLength(0)

      store.undo()
      expect(store.currentCanvas!.notes).toHaveLength(1)
      expect(store.currentCanvas!.notes[0].title).toBe('重要')

      store.redo()
      expect(store.currentCanvas!.notes).toHaveLength(0)
    })

    it('连续编辑产生多步撤销，上限 50 步', () => {
      const store = useCanvasStore()
      store.init()
      const note = store.addNote(null)
      for (let i = 0; i < 60; i++) {
        store.updateNote(note.id, { title: `v${i}` })
      }
      // 60 次修改 + 1 次 addNote，栈上限 50（最旧的入栈记录被淘汰）
      expect(store.canUndo).toBe(true)
      for (let i = 0; i < 50; i++) store.undo()
      expect(store.canUndo).toBe(false)
      // 退到栈底：仍剩 1 张便利贴（addNote 那步已被挤出栈）
      expect(store.currentCanvas!.notes).toHaveLength(1)
      expect(store.currentCanvas!.notes[0].title).toBe('v9')
    })

    it('切换画布后撤销栈清空', () => {
      const store = useCanvasStore()
      store.init()
      store.addNote(null)
      expect(store.canUndo).toBe(true)
      const second = store.createCanvas('另一张')
      expect(store.canUndo).toBe(false)
      store.switchCanvas(store.canvases[0].id)
      expect(store.canUndo).toBe(false)
      void second
    })

    it('恢复快照前自动创建「恢复前」备份快照', () => {
      const store = useCanvasStore()
      store.init()
      store.addNote(null, 1, 1)
      store.createSnapshot('检查点')
      store.addNote(null, 2, 2)
      expect(store.currentCanvas!.notes).toHaveLength(2)

      const snapshotId = store.currentCanvas!.snapshots[0].id
      store.restoreSnapshot(snapshotId)

      expect(store.currentCanvas!.notes).toHaveLength(1) // 回到检查点状态
      const backup = store.currentCanvas!.snapshots.find(s => s.name.startsWith('恢复前'))
      expect(backup).toBeTruthy()
      expect(backup!.notes).toHaveLength(2) // 备份的是恢复前状态
      // 且可通过撤销回退恢复操作
      expect(store.canUndo).toBe(true)
      store.undo()
      expect(store.currentCanvas!.notes).toHaveLength(2)
    })

    it('fillExample 批量填充只算一步撤销', () => {
      const store = useCanvasStore()
      store.init()
      store.fillExample({
        'key-partners': [{ t: '伙伴', c: '内容' }],
        'value-propositions': [{ t: '价值', c: '卖点' }],
      })
      expect(store.currentCanvas!.notes).toHaveLength(2)

      store.undo()
      expect(store.currentCanvas!.notes).toHaveLength(0)
    })
  })

  describe('数据版本号（A7）', () => {
    it('存储格式为带版本的包装对象，旧版裸数组可迁移', () => {
      const store = useCanvasStore()
      store.init()
      store.createCanvas('版本验证')
      const raw = JSON.parse(localStorage.getItem('canvas-pro:v1')!)
      expect(raw.version).toBe(1)
      expect(Array.isArray(raw.canvases)).toBe(true)
      expect(raw.canvases.some((c: { name: string }) => c.name === '版本验证')).toBe(true)

      // 旧版裸数组格式迁移
      localStorage.setItem(
        'canvas-pro:v1',
        JSON.stringify([{ id: 'legacy', templateId: 'swot', name: '旧数据', mode: 'grid', notes: [], blocks: [], viewport: { x: 0, y: 0, scale: 1 }, createdAt: 0, updatedAt: 0, snapshots: [] }])
      )
      setActivePinia(createPinia())
      const store2 = useCanvasStore()
      store2.init()
      expect(store2.canvases.some(c => c.name === '旧数据')).toBe(true)
    })
  })
})
