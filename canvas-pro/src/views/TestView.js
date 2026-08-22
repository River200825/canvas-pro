export default {
  render() {
    return h('div', { class: 'p-8' }, [
      h('h1', { class: 'text-3xl font-bold text-text mb-2' }, 'Test View'),
      h('p', { class: 'text-text-muted' }, 'Test page')
    ])
  },
}
