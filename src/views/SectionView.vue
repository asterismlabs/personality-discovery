<script setup lang="ts">
import { computed } from 'vue'
import CheckboxItem from '../components/CheckboxItem.vue'
import LikertItem from '../components/LikertItem.vue'
import { presentItem, type PresentedItem } from '../data/catalog'
import { EXTERNAL_LINKS } from '../data/links'
import { ONET_INSTRUCTION, ONET_SPONSOR } from '../data/onetIpShortForm'
import type { SectionDef } from '../data/sections'
import type { ResponseScale } from '../data/types'

const props = defineProps<{
  stage: 'intro' | 'items'
  section: SectionDef
  sectionNumber: number
  sectionCount: number
  page: number
  pages: readonly (readonly string[])[]
  answers: Readonly<Record<string, number>>
  error: string
  errorItemId: string
}>()

const emit = defineEmits<{
  next: []
  back: []
  skip: []
  'go-to-page': [page: number]
  answer: [id: string, value: number]
}>()

const pageIds = computed(() => props.pages[props.page] ?? [])
const presented = computed(() =>
  pageIds.value
    .map((id) => presentItem(id, props.section.scale))
    .filter((item): item is PresentedItem => item !== null),
)
const likertItems = computed(() =>
  presented.value.filter((item): item is PresentedItem & { scale: ResponseScale } => item.scale !== null),
)
const checkItems = computed(() => presented.value.filter((item) => item.kind === 'check'))
const areaName = computed(() => presented.value.find((item) => item.areaName)?.areaName ?? null)
const continueLabel = computed(() => {
  const lastPage = props.page >= props.pages.length - 1
  const lastSection = props.sectionNumber === props.sectionCount
  if (props.stage === 'intro') return 'Start this section'
  if (lastPage && lastSection) return 'See results'
  if (lastPage) return 'Next section'
  return 'Continue'
})
</script>

<template>
  <section>
    <h1 id="page-title" tabindex="-1">{{ section.title }}</h1>
    <template v-if="stage === 'intro'">
      <p>{{ section.summary }}</p>
      <p>Estimated time: {{ section.minutes }}.</p>
      <p v-if="section.optional"><span class="badge badge-outline">Optional. You can skip this section.</span></p>
      <p v-if="!section.validated && section.exploratory"><span class="badge badge-neutral">Exploratory, unvalidated</span></p>
      <p v-else-if="!section.validated"><span class="badge badge-neutral">Unvalidated</span></p>
      <template v-if="section.id === 'interests'">
        <p>{{ ONET_INSTRUCTION }}</p>
        <p>{{ ONET_SPONSOR }}</p>
        <p>
          This application includes information from the
          <a class="link" :href="EXTERNAL_LINKS.onetTools">O*NET Career Exploration Tools</a>. Used under the
          <a class="link" :href="EXTERNAL_LINKS.ccByNd">CC BY-ND 4.0</a> license. O*NET® is a trademark of USDOL/ETA.
        </p>
      </template>
      <p v-if="section.id === 'personality'">
        Rate each statement from Very Inaccurate to Very Accurate. Item order is mixed. A few items only check that
        the page is being read. Those are not scored.
      </p>
    </template>
    <template v-else>
      <p><span class="badge badge-ghost">Page {{ page + 1 }} of {{ pages.length }}</span></p>
      <h2 v-if="areaName">{{ areaName }}</h2>
      <p v-if="section.kind === 'checklist'">Leave unchecked any activity you would not like to do.</p>
      <div v-if="error" id="page-error" class="alert alert-error mb-4" role="alert">
        <span>{{ error }}</span>
      </div>
      <div v-if="likertItems.length" class="item-list">
        <LikertItem
          v-for="item in likertItems"
          :key="item.id"
          :item-id="item.id"
          :text="item.text"
          :scale="item.scale"
          :model-value="answers[item.id]"
          :invalid="errorItemId === item.id"
          @update:model-value="emit('answer', item.id, $event)"
        />
      </div>
      <fieldset v-if="checkItems.length" class="fieldset rounded-box border border-base-300 bg-base-100 p-4 lg:grid-cols-2">
        <CheckboxItem
          v-for="item in checkItems"
          :key="item.id"
          :item-id="item.id"
          :text="item.text"
          :checked="answers[item.id] === 1"
          @update:checked="emit('answer', item.id, $event ? 1 : 0)"
        />
      </fieldset>
    </template>
    <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
      <nav v-if="stage === 'items'" class="join" aria-label="Pages in this section">
        <button
          v-for="number in pages.length"
          :key="number"
          type="button"
          class="btn join-item"
          :class="number - 1 === page ? 'btn-primary' : 'btn-outline'"
          :aria-current="number - 1 === page ? 'page' : undefined"
          @click="emit('go-to-page', number - 1)"
        >
          {{ number }}
        </button>
      </nav>
      <div class="join ms-auto">
        <button type="button" class="btn btn-outline join-item" @click="emit('back')">Back</button>
        <button v-if="stage === 'intro' && section.optional" type="button" class="btn btn-outline join-item" @click="emit('skip')">
          Skip this section
        </button>
        <button type="button" class="btn btn-primary join-item" @click="emit('next')">{{ continueLabel }}</button>
      </div>
    </div>
  </section>
</template>
