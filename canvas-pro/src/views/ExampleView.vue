<template>
  <div class="min-h-screen bg-canvas-bg">
    <header class="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-canvas-border" data-export-ignore>
      <div class="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <button class="btn-ghost text-sm gap-1.5" @click="router.push('/')">
          <ArrowLeft class="w-4 h-4" /> 返回首页
        </button>
        <span class="text-base font-bold text-text">案例库</span>
        <span class="w-20" />
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-10">
      <template v-if="exampleId && example">
        <button class="btn-ghost text-sm gap-1.5 mb-6 !px-2" @click="router.push('/examples')">
          <ArrowLeft class="w-4 h-4" /> 全部案例
        </button>
        <h1 class="text-3xl font-bold text-text mb-2">{{ example.name }}</h1>
        <p class="text-text-muted mb-8">{{ example.tagline }}</p>

        <div class="tpl-grid mb-8" :style="gridStyle ?? undefined">
          <div
            v-for="block in bmcBlocks"
            :key="block.id"
            class="rounded-xl border border-canvas-border shadow-block overflow-hidden bg-white dark:bg-gray-800"
            :style="{ borderTopColor: block.color || '#e2e8f0', borderTopWidth: '3px', ...(block.area ? { gridArea: block.area } : {}) }"
          >
            <div
              class="px-3 py-2 border-b border-canvas-border font-semibold text-sm"
              :style="{ backgroundColor: (block.color || '#e2e8f0') + '33', color: '#334155' }"
            >
              {{ block.title }}
            </div>
            <div class="p-2 space-y-2 min-h-[90px]">
              <div
                v-for="(note, i) in exampleContent[block.id] ?? []"
                :key="i"
                class="rounded-lg shadow-sm p-2 pl-3 relative overflow-hidden"
                :style="{ backgroundColor: NOTE_BG[(block.order + i) % NOTE_BG.length] }"
              >
                <p v-if="note.t" class="font-semibold text-xs text-gray-800">{{ note.t }}</p>
                <p class="text-xs text-gray-700 whitespace-pre-line leading-relaxed mt-0.5">{{ note.c }}</p>
              </div>
              <p v-if="(exampleContent[block.id] ?? []).length === 0" class="text-xs text-gray-400 italic p-2 text-center">暂无内容</p>
            </div>
          </div>
        </div>

        <div class="card p-6 flex flex-wrap items-center justify-between gap-4">
          <p class="text-sm text-text-muted max-w-xl">{{ example.desc }}。复制到编辑器后可自由修改为你的方案。</p>
          <div class="flex gap-2">
            <button class="btn-secondary gap-2" @click="copyToEditor(true)">
              <Download class="w-4 h-4" /> 导出 JSON
            </button>
            <button class="btn-primary gap-2" @click="copyToEditor(false)">
              <Copy class="w-4 h-4" /> 复制到编辑器
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 class="text-3xl font-bold text-text mb-2">经典商业案例</h1>
            <p class="text-text-muted">学习知名公司的商业模式画布，一键复制后修改为你自己的方案</p>
          </div>
          <div class="relative w-full md:w-72 shrink-0">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              v-model="searchQuery"
              class="input !pl-9"
              placeholder="搜索案例..."
              aria-label="搜索案例"
            />
          </div>
        </div>

        <div class="flex flex-wrap gap-2 mb-6">
          <button
            v-for="cat in CATEGORIES"
            :key="cat.id"
            class="px-3 py-1.5 text-sm rounded-full border transition-colors"
            :class="
              activeCategory === cat.id
                ? 'bg-primary-600 text-white border-primary-600'
                : 'border-canvas-border text-text-muted hover:border-primary-400 hover:text-primary-600'
            "
            @click="activeCategory = cat.id"
          >
            {{ cat.label }} ({{ countByCategory(cat.id) }})
          </button>
        </div>

        <div v-if="filteredIds.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <button
            v-for="id in filteredIds"
            :key="id"
            class="card p-0 overflow-hidden text-left group hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            @click="router.push(`/examples/${String(id)}`)"
          >
            <div class="h-28 flex items-end justify-between p-4" :style="{ background: `linear-gradient(135deg, ${EXAMPLES[id].gradient})` }">
              <span class="text-white font-bold text-lg drop-shadow">{{ EXAMPLES[id].short }}</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-white/25 text-white backdrop-blur-sm">
                {{ categoryLabel(EXAMPLES[id].category) }}
              </span>
            </div>
            <div class="p-4">
              <h3 class="font-semibold text-text group-hover:text-primary-600 transition-colors">{{ EXAMPLES[id].name }}</h3>
              <p class="text-sm text-text-muted mt-1">{{ EXAMPLES[id].desc }}</p>
              <p class="text-xs text-primary-600 mt-2">{{ noteCount(id) }} 条要点</p>
            </div>
          </button>
        </div>
        <div v-else class="card p-10 text-center border-dashed">
          <SearchX class="w-10 h-10 mx-auto text-text-muted mb-3" />
          <p class="text-text-muted">没有匹配「{{ searchQuery }}」的案例</p>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Copy, Download, Search, SearchX } from 'lucide-vue-next'
import { useCanvasStore } from '@/stores'
import { getTemplateById } from '@/templates'
import { getGridStyle } from '@/templates/layout'
import { exportJSON } from '@/utils/export'

type CategoryId = 'all' | 'platform' | 'sharing' | 'saas' | 'hardware'

interface ExampleInfo {
  name: string
  short: string
  desc: string
  tagline: string
  gradient: string
  category: Exclude<CategoryId, 'all'>
}

/** 案例内容：按商业模式画布 9 大区块组织 */
type NoteSeed = { t?: string; c?: string }
type ExampleContent = Record<string, NoteSeed[]>

const EXAMPLES: Record<string, ExampleInfo> = {
  uber: {
    name: 'Uber 商业模式',
    short: 'Uber',
    desc: '经典双边市场平台模式',
    tagline: '连接司机与乘客的按需出行平台，核心在于网络效应与动态定价。',
    gradient: '#000000, #333333',
    category: 'platform',
  },
  airbnb: {
    name: 'Airbnb 商业模式',
    short: 'Airbnb',
    desc: '共享经济住宿平台',
    tagline: '让房主闲置房源变现的共享经济典范，关键资源是社区信任体系。',
    gradient: '#ff5a5f, #00a699',
    category: 'sharing',
  },
  dropbox: {
    name: 'Dropbox 商业模式',
    short: 'Dropbox',
    desc: 'Freemium SaaS 模式',
    tagline: '免费增值获客、推荐机制裂变、订阅制变现的经典 SaaS 路径。',
    gradient: '#0061ff, #00c2ff',
    category: 'saas',
  },
  spotify: {
    name: 'Spotify 商业模式',
    short: 'Spotify',
    desc: '内容订阅双轨制',
    tagline: '免费广告与付费订阅并行，以版权内容与推荐算法构建护城河。',
    gradient: '#1db954, #191414',
    category: 'saas',
  },
  tesla: {
    name: 'Tesla 商业模式',
    short: 'Tesla',
    desc: '直销 + 软件生态',
    tagline: '跳过经销商直营交付，用 OTA 升级与超充网络锁定长期价值。',
    gradient: '#cc0000, #17181c',
    category: 'hardware',
  },
}

const EXAMPLE_CONTENT: Record<string, ExampleContent> = {
  uber: {
    'key-partners': [
      { t: '司机群体', c: '兼职/全职司机构成运力基础' },
      { t: '地图与支付服务商', c: 'Google Maps、信用卡机构' },
    ],
    'key-activities': [
      { t: '平台研发', c: 'App、调度与动态定价算法' },
      { t: '城市扩张运营', c: '本地化合规与补贴获客' },
    ],
    'key-resources': [
      { t: '双边网络效应', c: '更多司机⇄更快接单⇄更多乘客' },
      { t: '出行数据', c: '路线与定价优化燃料' },
    ],
    'value-propositions': [
      { t: '乘客：一键叫车', c: '随叫随到、价格透明、无需现金' },
      { t: '司机：灵活增收', c: '自由接单、按需变现闲置时间' },
    ],
    'customer-relationships': [
      { t: '自助式服务', c: '全程 App 自动化' },
      { t: '双向评分', c: '信用体系保障安全与质量' },
    ],
    channels: [{ t: 'iOS / Android App', c: '唯一服务入口，口碑裂变邀请' }],
    'customer-segments': [
      { t: '城市出行者', c: '无车族、打车刚需人群' },
      { t: '想赚钱的车主', c: '有车且希望灵活兼职的人群' },
    ],
    'cost-structure': [
      { t: '司机分成与补贴', c: '收入大头随订单浮动' },
      { t: '研发与市场扩张', c: '技术投入与新城市冷启动' },
    ],
    'revenue-streams': [
      { t: '车费抽成 ~25%', c: '每单收入的核心来源' },
      { t: '高峰溢价与会员', c: '动态定价差额、Uber One 订阅' },
    ],
  },
  airbnb: {
    'key-partners': [
      { t: '房主社区', c: '全球房源供给方' },
      { t: '支付/保险机构', c: '交易托管与房源保障' },
    ],
    'key-activities': [
      { t: '信任体系建设', c: '实名认证、评价、房源审核' },
      { t: '社区运营', c: '房东学院、Superhost 激励' },
    ],
    'key-resources': [
      { t: '全球房源网络', c: '不拥有房产的平台型库存' },
      { t: '评价信任数据', c: '千万级真实住后评价' },
    ],
    'value-propositions': [
      { t: '旅客：住得像当地人', c: '独特房源、价格常低于酒店' },
      { t: '房主：闲置变现', c: '空房变收入，时间自主' },
    ],
    'customer-relationships': [
      { t: '评价互评', c: '建立双边信任' },
      { t: 'AirCover 保障', c: '房东/房客双向保护计划' },
    ],
    channels: [{ t: '网站与 App + 口碑', c: '社交传播驱动低成本获客' }],
    'customer-segments': [
      { t: '个性化旅行者', c: '追求体验与性价比的游客' },
      { t: '有空闲空间的房主', c: '整套/单间/沙发皆可上架' },
    ],
    'cost-structure': [
      { t: '平台研发与客服', c: '产品迭代与 7×24 支持' },
      { t: '市场与合规', c: '品牌营销、各地短租法规应对' },
    ],
    'revenue-streams': [
      { t: '双端服务费', c: '房客约 14%、房主约 3%' },
      { t: '增值体验', c: 'Airbnb Experiences 抽成' },
    ],
  },
  dropbox: {
    'key-partners': [
      { t: '平台渠道', c: 'Apple/Google/Microsoft 预装合作' },
      { t: '企业服务商', c: 'Slack、Zoom 等集成生态' },
    ],
    'key-activities': [
      { t: '同步技术研发', c: '多端秒级同步是核心壁垒' },
      { t: '增长实验', c: '推荐裂变与转化漏斗优化' },
    ],
    'key-resources': [
      { t: '同步技术专利', c: '增量上传与冲突处理算法' },
      { t: '用户文件资产', c: '存得越深迁移成本越高' },
    ],
    'value-propositions': [
      { t: '文件无处不在', c: '任何设备秒开最新版本' },
      { t: '简单到零学习成本', c: '一个文件夹解决同步' },
    ],
    'customer-relationships': [
      { t: '自助产品驱动', c: '免费版即完整体验' },
      { t: '推荐激励', c: '邀好友双方各得空间' },
    ],
    channels: [{ t: '线上自渠道', c: '官网下载 + 推荐裂变，CAC 极低' }],
    'customer-segments': [
      { t: '个人用户', c: '照片文档跨设备需求' },
      { t: '中小团队', c: 'Dropbox Business 协作场景' },
    ],
    'cost-structure': [
      { t: '存储与带宽', c: 'AWS 基础设施成本' },
      { t: '免费用户承载', c: 'Freemium 模式的固有开销' },
    ],
    'revenue-streams': [
      { t: '订阅制收费', c: 'Plus / Family / Business 月年付' },
      { t: '空间加购', c: '容量升级一次性付费' },
    ],
  },
  spotify: {
    'key-partners': [
      { t: '三大唱片公司', c: 'Universal/Sony/Warner 版权授权' },
      { t: '播客创作者', c: '独家内容合作' },
    ],
    'key-activities': [
      { t: '推荐算法', c: 'Discover Weekly 个性化歌单' },
      { t: '版权谈判', c: '持续的内容成本控制' },
    ],
    'key-resources': [
      { t: '曲库与播客', c: '亿级曲目内容池' },
      { t: '听歌行为数据', c: '驱动推荐与广告投放' },
    ],
    'value-propositions': [
      { t: '免费合法听歌', c: '广告支持的零门槛入口' },
      { t: 'Premium 无干扰体验', c: '离线、无广告、高音质' },
    ],
    'customer-relationships': [
      { t: '个性化陪伴', c: '年度总结、AI DJ 情感连接' },
      { t: '家庭/学生套餐', c: '多场景价格锚点' },
    ],
    channels: [{ t: '全平台客户端', c: '手机/车机/音箱全场景覆盖' }],
    'customer-segments': [
      { t: '免费用户', c: '可被广告触达的音乐听众' },
      { t: '付费订阅者', c: '愿为体验付费的核心乐迷' },
    ],
    'cost-structure': [
      { t: '版权版税', c: '占收入约 70% 的最大开支' },
      { t: '研发与流媒体带宽', c: '算法团队与分发成本' },
    ],
    'revenue-streams': [
      { t: 'Premium 订阅 ~87%', c: '月费为主的现金流' },
      { t: '广告收入 ~13%', c: '免费层音频与展示广告' },
    ],
  },
  tesla: {
    'key-partners': [
      { t: '电池供应商', c: '松下/LG/宁德时代' },
      { t: '超充网络合作场站', c: '充电基础设施共建' },
    ],
    'key-activities': [
      { t: '三电技术研发', c: '电池管理、电机、自动驾驶' },
      { t: '直营销售交付', c: '跳过经销商的 DTC 模式' },
    ],
    'key-resources': [
      { t: 'OTA 软件平台', c: '整车可持续升级的电子架构' },
      { t: '超级工厂产能', c: 'Gigafactory 规模效应' },
    ],
    'value-propositions': [
      { t: '高性能电动车', c: '加速与智能体验重新定义汽车' },
      { t: '越用越好的车', c: 'OTA 持续新增功能' },
    ],
    'customer-relationships': [
      { t: '直营透明定价', c: '无砍价环节的品牌信任' },
      { t: '车主社区', c: '粉丝文化与口碑传播' },
    ],
    channels: [
      { t: '线上订购 + 直营门店', c: '官网下单、体验店试驾' },
      { t: '超级充电网络', c: '高频触点强化品牌' },
    ],
    'customer-segments': [
      { t: '科技先锋买家', c: '愿为创新支付溢价的早期用户' },
      { t: '大众市场', c: 'Model 3/Y 下探主流价位' },
    ],
    'cost-structure': [
      { t: '电池与原材料', c: '锂价波动的最大变量' },
      { t: '工厂资本开支', c: '新产能建设重投入' },
    ],
    'revenue-streams': [
      { t: '整车销售', c: '核心收入来源' },
      { t: '软件与能源', c: 'FSD 订阅、超充、储能业务' },
    ],
  },
}

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'platform', label: '双边平台' },
  { id: 'sharing', label: '共享经济' },
  { id: 'saas', label: 'Freemium SaaS' },
  { id: 'hardware', label: '硬件生态' },
]

const NOTE_BG = ['#fef08a', '#bfdbfe', '#bbf7d0', '#fbcfe8', '#ffedd5', '#e9d5ff', '#f3f4f6', '#fed7aa', '#d9f99d']

const route = useRoute()
const router = useRouter()
const canvasStore = useCanvasStore()

const searchQuery = ref('')
const activeCategory = ref<CategoryId>('all')

const exampleId = computed(() => (route.params.id as string) in EXAMPLES ? String(route.params.id) : null)
const example = computed<ExampleInfo | null>(() => (exampleId.value ? EXAMPLES[exampleId.value] : null))
const exampleContent = computed<ExampleContent>(() => (exampleId.value ? EXAMPLE_CONTENT[exampleId.value] : {}))

const template = computed(() => getTemplateById('business-model-canvas'))
const gridStyle = computed(() => getGridStyle(template.value))
const bmcBlocks = computed(() => template.value.blocks.slice().sort((a, b) => a.order - b.order))

const filteredIds = computed(() =>
  Object.keys(EXAMPLES).filter(id => {
    const item = EXAMPLES[id]
    const matchCategory = activeCategory.value === 'all' || item.category === activeCategory.value
    const q = searchQuery.value.trim().toLowerCase()
    const matchSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.tagline.toLowerCase().includes(q)
    return matchCategory && matchSearch
  })
)

function countByCategory(cat: CategoryId): number {
  if (cat === 'all') return Object.keys(EXAMPLES).length
  return Object.values(EXAMPLES).filter(e => e.category === cat).length
}

function categoryLabel(cat: ExampleInfo['category']): string {
  return CATEGORIES.find(c => c.id === cat)?.label ?? cat
}

function noteCount(id: string): number {
  return Object.values(EXAMPLE_CONTENT[id]).reduce((sum, notes) => sum + notes.length, 0)
}

function copyToEditor(exportJson: boolean): void {
  if (!exampleId.value) return
  const canvas = canvasStore.createCanvas(EXAMPLES[exampleId.value].name.replace(' 商业模式', ''), 'business-model-canvas')

  // 将案例内容写入新画布
  let order = 0
  for (const [blockId, seeds] of Object.entries(EXAMPLE_CONTENT[exampleId.value])) {
    for (const seed of seeds) {
      const note = canvasStore.addNote(blockId)
      canvasStore.updateNote(note.id, {
        title: seed.t ?? '',
        content: seed.c ?? '',
        order: order++,
      })
    }
  }

  if (exportJson) {
    exportJSON(canvas)
  } else {
    router.push(`/canvas/${canvas.id}`)
  }
}
</script>

<style scoped>
@media (max-width: 899px) {
  .tpl-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    grid-template-areas: none !important;
    grid-template-rows: auto !important;
  }
  .tpl-grid > * {
    grid-area: auto !important;
  }
}
</style>
