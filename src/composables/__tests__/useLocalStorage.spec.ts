import { beforeEach, describe, expect, it } from 'vitest'
import { useLocalStorage, useSessionStorage } from '../useLocalStorage'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

describe('useLocalStorage', () => {
  it('save 后 load 返回相同数据', () => {
    const { save, load } = useLocalStorage<{ a: number }[]>('test:key', [])
    save([{ a: 1 }])
    expect(load()).toEqual([{ a: 1 }])
  })

  it('无数据时返回默认值', () => {
    const { load } = useLocalStorage<string>('test:missing', 'fallback')
    expect(load()).toBe('fallback')
  })

  it('损坏 JSON 自愈：返回默认值且不抛异常', () => {
    localStorage.setItem('test:broken', '{not valid json')
    const { load } = useLocalStorage<number[]>('test:broken', [])
    expect(() => load()).not.toThrow()
    expect(load()).toEqual([])
  })

  it('remove 清除数据', () => {
    const { save, load, remove } = useLocalStorage<string>('test:remove', 'default')
    save('value')
    expect(load()).toBe('value')
    remove()
    expect(load()).toBe('default')
    expect(localStorage.getItem('test:remove')).toBeNull()
  })

  it('stored ref 响应式同步', () => {
    const { stored, save } = useLocalStorage<number>('test:reactive', 0)
    save(42)
    expect(stored.value).toBe(42)
  })

  it('不同 key 互不干扰', () => {
    const a = useLocalStorage<string>('test:a', 'A')
    const b = useLocalStorage<string>('test:b', 'B')
    a.save('A2')
    expect(b.load()).toBe('B')
  })

  it('非客户端环境（SSR）下安全返回默认值', () => {
    // happy-dom 下 window 存在，此处仅验证 API 不抛异常
    const { load } = useLocalStorage<string>('test:ssr', 'safe')
    expect(load()).toBe('safe')
  })
})

describe('useSessionStorage', () => {
  it('save 后 load 返回相同数据', () => {
    const { save, load } = useSessionStorage<string>('ss:key', '')
    save('会话数据')
    expect(load()).toBe('会话数据')
    expect(sessionStorage.getItem('ss:key')).toContain('会话数据')
  })

  it('与 localStorage 隔离', () => {
    const ls = useLocalStorage<string>('dual:key', 'L')
    const ss = useSessionStorage<string>('dual:key', 'S')
    ls.save('来自LS')
    expect(ss.load()).toBe('S')
  })

  it('损坏 JSON 返回默认值', () => {
    sessionStorage.setItem('ss:broken', '{{{')
    const { load } = useSessionStorage<number>('ss:broken', 7)
    expect(load()).toBe(7)
  })

  it('无数据返回默认值', () => {
    const { load } = useSessionStorage<string>('ss:missing', '默认')
    expect(load()).toBe('默认')
  })
})
