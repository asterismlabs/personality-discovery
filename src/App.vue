<script setup lang="ts">
import { computed, nextTick, watch } from 'vue'
import FlowSteps from './components/FlowSteps.vue'
import SiteFooter from './components/SiteFooter.vue'
import { useSession } from './composables/useSession'
import AboutView from './views/AboutView.vue'
import ResultsView from './views/ResultsView.vue'
import SectionView from './views/SectionView.vue'
import WelcomeView from './views/WelcomeView.vue'

const session = useSession()
const state = session.state
const results = session.results
const prompt = session.prompt
const textExport = session.textExport
const jsonExport = session.jsonExport

const section = computed(() => session.sectionByIndex(state.position.sectionIndex))
const pages = computed(() => session.pagesFor(section.value))
const showSteps = computed(
  () => state.position.stage === 'intro' || state.position.stage === 'items' || state.position.stage === 'results',
)
const sectionStage = computed(() => (state.position.stage === 'items' ? 'items' : 'intro'))

watch(
  () => [state.position.stage, state.position.sectionIndex, state.position.page],
  async () => {
    await nextTick()
    document.getElementById('page-title')?.focus()
  },
)

watch(
  () => state.errorItemId,
  async (id) => {
    if (!id) return
    await nextTick()
    document.getElementById(`item-${id}`)?.focus()
  },
)
</script>

<template>
  <a class="btn btn-primary absolute top-2 left-2 z-20 -translate-y-[200%] focus:translate-y-0" href="#main">
    Skip to content
  </a>
  <header class="mb-6">
    <div class="navbar rounded-box border border-base-300 bg-base-100">
      <div class="flex-1">
        <p class="m-0 text-lg font-semibold pl-6">Personality and interest discovery</p>
      </div>
      <div v-if="state.position.stage !== 'welcome'" class="flex-none">
        <button type="button" class="btn btn-ghost" @click="session.goHome()">Home</button>
      </div>
    </div>
    <div v-if="showSteps" class="mt-4">
      <FlowSteps
        :sections="session.sections"
        :active="state.position.stage === 'results' ? 'results' : 'section'"
        :active-index="state.position.sectionIndex"
        :navigable="state.resultsUnlocked"
        @section="session.goToStep"
        @results="session.goToResults"
      />
    </div>
  </header>
  <main id="main" class="flex-1">
    <WelcomeView
      v-if="state.position.stage === 'welcome'"
      :save-locally="state.saveLocally"
      @start="session.next()"
      @update:save-locally="session.setSaveLocally"
      @clear="session.clearAll()"
    />
    <SectionView
      v-else-if="state.position.stage === 'intro' || state.position.stage === 'items'"
      :stage="sectionStage"
      :section="section"
      :section-number="state.position.sectionIndex + 1"
      :section-count="session.sections.length"
      :page="state.position.page"
      :pages="pages"
      :answers="state.answers"
      :error="state.error"
      :error-item-id="state.errorItemId"
      @next="session.next()"
      @back="session.back()"
      @skip="session.skipSection()"
      @go-to-page="session.goToPage"
      @answer="session.setAnswer"
    />
    <ResultsView
      v-else-if="state.position.stage === 'results'"
      :results="results"
      :prompt="prompt"
      :task-ids="state.taskIds"
      :custom-task="state.customTask"
      :context="state.context"
      :text-export="textExport"
      :json-export="jsonExport"
      :save-locally="state.saveLocally"
      @review="session.reviewSection"
      @follow-up="session.setFollowUp"
      @update:task-ids="state.taskIds = $event"
      @update:custom-task="state.customTask = $event"
      @update:context="state.context = $event"
      @update:save-locally="session.setSaveLocally"
      @clear="session.clearAll()"
    />
    <AboutView v-else />
  </main>
  <SiteFooter :showing-about="state.position.stage === 'about'" @about="session.openAbout()" @back="session.back()" />
</template>
