import { h, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const examples = {
  uber: { name: 'Uber Business Model', desc: 'Classic two-sided marketplace business model canvas' },
  airbnb: { name: 'Airbnb Business Model', desc: 'Sharing economy platform model' },
  dropbox: { name: 'Dropbox Business Model', desc: 'Freemium SaaS model' },
}

const example = computed(() => examples[route.params.id])

export default {
  render() {
    return h('div', { class: 'min-h-screen bg-canvas-bg p-8' }, [
      h('div', { class: 'max-w-4xl mx-auto' }, [
        h('div', { class: 'mb-8' }, [
          h('h1', { class: 'text-3xl font-bold text-text mb-2' }, this.example.name),
          h('p', { class: 'text-text-muted' }, this.example.desc)
        ]),
        h('div', { class: 'card p-8 text-center' }, [
          h('p', { class: 'text-text-muted mb-4' }, 'Example canvas preview - in development'),
          h('button', { class: 'btn-primary', onClick: () => this.$router.push('/canvas/new?template=business-model-canvas') }, 'Copy to Editor')
        ])
      ])
    ])
  },
}
