<script setup lang="ts">
import Disclaimer from '../components/Disclaimer.vue'
import FlowSteps from '../components/FlowSteps.vue'
import PrivacyControls from '../components/PrivacyControls.vue'
import { SECTIONS } from '../data/sections'

defineProps<{
  saveLocally: boolean
}>()

const emit = defineEmits<{
  start: []
  'update:saveLocally': [value: boolean]
  clear: []
}>()
</script>

<template>
  <section class="card card-border bg-base-100">
    <div class="card-body">
      <h1 id="page-title" tabindex="-1">Personality and interest discovery</h1>
      <p>
        A private questionnaire that stays in your browser. It asks about personality and work interests, then writes a
        prompt you can copy into any chat model. This page does not contact a server or an AI model.
      </p>
      <Disclaimer />
      <h2>What you will do</h2>
      <FlowSteps :sections="SECTIONS" active="none" :active-index="0" :navigable="false" />
      <ul class="list rounded-box bg-base-200">
        <li class="list-row"><div class="list-col-grow">Personality, about 15–20 minutes. Public-domain IPIP-NEO-120 items.</div></li>
        <li class="list-row"><div class="list-col-grow">Work interests, about 5–10 minutes. The O*NET Interest Profiler Short Form, unchanged.</div></li>
        <li class="list-row"><div class="list-col-grow">Work values, about 3 minutes. Optional and unvalidated. You can skip it.</div></li>
        <li class="list-row"><div class="list-col-grow">Work style, about 3 minutes. Optional, exploratory, and unvalidated. You can skip it.</div></li>
      </ul>
      <p>You can go back and change answers. There is no ability test.</p>
      <PrivacyControls
        :save-locally="saveLocally"
        @update:save-locally="emit('update:saveLocally', $event)"
        @clear="emit('clear')"
      />
      <div class="card-actions">
        <button type="button" class="btn btn-primary" @click="emit('start')">Start</button>
      </div>
    </div>
  </section>
</template>
