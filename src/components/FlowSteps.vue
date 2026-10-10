<script setup lang="ts">
import type { SectionDef } from '../data/sections'

const props = defineProps<{
  sections: readonly SectionDef[]
  active: 'section' | 'results' | 'none'
  activeIndex: number
  navigable: boolean
}>()

const emit = defineEmits<{
  section: [index: number]
  results: []
}>()

function reached(index: number): boolean {
  if (props.navigable || props.active === 'results') return true
  return props.active === 'section' && index <= props.activeIndex
}
</script>

<template>
  <ul class="steps steps-vertical mb-4 w-full lg:steps-horizontal">
    <li
      v-for="(item, index) in sections"
      :key="item.id"
      class="step"
      :class="reached(index) ? 'step-primary' : ''"
    >
      <button
        v-if="navigable"
        type="button"
        class="cursor-pointer"
        :aria-current="active === 'section' && index === activeIndex ? 'step' : undefined"
        @click="emit('section', index)"
      >
        {{ item.title }}
      </button>
      <span v-else>{{ item.title }}</span>
    </li>
    <li class="step" :class="active === 'results' || navigable ? 'step-primary' : ''">
      <button
        v-if="navigable"
        type="button"
        class="cursor-pointer"
        :aria-current="active === 'results' ? 'step' : undefined"
        @click="emit('results')"
      >
        Final result
      </button>
      <span v-else>Final result</span>
    </li>
  </ul>
</template>
