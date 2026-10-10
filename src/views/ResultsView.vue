<script setup lang="ts">
import Disclaimer from '../components/Disclaimer.vue'
import ExportButtons from '../components/ExportButtons.vue'
import FollowUpChoice from '../components/FollowUpChoice.vue'
import PrivacyControls from '../components/PrivacyControls.vue'
import PromptGenerator from '../components/PromptGenerator.vue'
import { describeScale } from '../data/descriptions'
import type { PromptContext, TaskId } from '../prompt/buildPrompt'
import { FOLLOW_UP_QUESTION_CAP } from '../scoring/followUp'
import { levelLabel } from '../scoring/levels'
import type { LikertScaleScore } from '../scoring/likert'
import { describeNearTie, type DifferentiationLevel } from '../scoring/profile'
import type { FullResults } from '../scoring/scoreAll'

defineProps<{
  results: FullResults
  prompt: string
  taskIds: TaskId[]
  customTask: string
  context: PromptContext
  textExport: string
  jsonExport: string
  saveLocally: boolean
}>()

const emit = defineEmits<{
  review: [sectionId: string]
  followUp: [questionId: string, value: string]
  'update:taskIds': [value: TaskId[]]
  'update:customTask': [value: string]
  'update:context': [value: PromptContext]
  'update:saveLocally': [value: boolean]
  clear: []
}>()

function differentiationLabel(level: DifferentiationLevel): string {
  if (level === 'flat') return 'Flat'
  if (level === 'clear') return 'Clear'
  return 'Some'
}

function scoreLine(score: LikertScaleScore): string {
  if (score.insufficient || score.rawSum === null || score.mean === null || score.pomp === null || score.level === null) {
    return `Not enough answers (${String(score.answered)} of ${String(score.total)}).`
  }
  return `Raw sum ${String(score.rawSum)}, mean ${score.mean.toFixed(2)}, ${score.pomp.toFixed(1)}% of maximum, ${levelLabel(score.level)}. Based on ${String(score.answered)} of ${String(score.total)} items.`
}
</script>

<template>
  <section>
    <h1 id="page-title" tabindex="-1">Your results</h1>
    <Disclaimer />
    <div class="alert alert-warning mb-5 items-start">
      <span>
        Levels are Low, Moderate, or High compared with the middle of each scale, not with other people. They are not
        percentiles, and they are not normed.
      </span>
    </div>
    <div v-if="results.quality.length" class="alert alert-warning mb-5 items-start">
      <div>
      <h2>A note on these answers</h2>
      <ul>
        <li v-for="flag in results.quality" :key="flag.id">{{ flag.message }}</li>
      </ul>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6">
      <p class="mb-0">The detailed scores are collapsed. Open a section to read it.</p>

      <section aria-labelledby="personality-heading">
        <details class="collapse collapse-arrow card card-border bg-base-100" data-testid="personality-details">
          <summary class="collapse-title">
            <h2 id="personality-heading" class="mb-0">Personality</h2>
          </summary>
          <div class="collapse-content">
        <div class="card-body p-0">
          <p>IPIP-NEO-120. Domain scores use the items in that domain. Facet scores use four items each, so they are less stable.</p>
          <div class="grid items-start gap-3 lg:grid-cols-2">
            <article v-for="domain in results.personality" :key="domain.id" class="card card-border bg-base-100">
              <div class="card-body">
                <h3 class="card-title">{{ domain.name }}</h3>
                <p>{{ scoreLine(domain) }}</p>
                <p>{{ describeScale(domain.id, domain.level, domain.name) }}</p>
                <details class="collapse collapse-arrow bg-base-200">
                  <summary class="collapse-title">Facets of {{ domain.name }}</summary>
                  <div class="collapse-content">
                    <article v-for="facet in domain.facets" :key="facet.id" class="mb-3">
                      <h4>{{ facet.name }}</h4>
                      <p>{{ scoreLine(facet) }}</p>
                      <p class="mb-0">{{ describeScale(facet.id, facet.level, facet.name) }}</p>
                    </article>
                  </div>
                </details>
              </div>
            </article>
          </div>
          <div class="card-actions">
            <button type="button" class="btn btn-outline" @click="emit('review', 'personality')">Review personality answers</button>
          </div>
        </div>
          </div>
        </details>
      </section>

      <section aria-labelledby="interests-heading">
        <details class="collapse collapse-arrow card card-border bg-base-100" data-testid="interests-details">
          <summary class="collapse-title">
            <h2 id="interests-heading" class="mb-0">Work interests</h2>
          </summary>
          <div class="collapse-content">
        <div class="card-body p-0">
          <p>
            Counts of activities you checked on the O*NET Interest Profiler Short Form. Each area is 0 to 10. This is the
            score from the form, not a percentile.
          </p>
          <div class="stats border border-base-300 bg-base-100">
            <div class="stat">
              <div class="stat-title">Holland code</div>
              <div class="stat-value text-primary">{{ results.interests.hollandCode }}</div>
            </div>
          </div>
          <p v-if="results.interests.tieNote">{{ results.interests.tieNote }}</p>
          <ul class="list rounded-box border border-base-300 bg-base-100">
            <li v-for="group in results.interests.groups" :key="group.raw + group.letters.join('')" class="list-row">
              <div class="list-col-grow">
                <template v-for="(letter, index) in group.letters" :key="letter">
                  <span v-if="index > 0"> and </span>
                  {{ results.interests.areas.find((area) => area.letter === letter)?.name }} ({{ letter }}): {{ group.raw }}
                </template>
                <span v-if="group.letters.length > 1"> — tied</span>
              </div>
            </li>
          </ul>
          <h3>Shape of your interest profile</h3>
          <p>
            Two separate readings of the six counts. Elevation is how many activities you checked overall. Differentiation
            is how far the six areas spread apart. The cut points are this app's rules of thumb, not norms.
          </p>
          <div class="stats stats-vertical border border-base-300 bg-base-100 sm:stats-horizontal">
            <div class="stat">
              <div class="stat-title">Elevation</div>
              <div class="stat-value text-2xl" data-testid="profile-elevation">{{ results.profile.elevation.toFixed(1) }}</div>
              <div class="stat-desc">Mean count out of 10. {{ levelLabel(results.profile.elevationLevel) }}.</div>
            </div>
            <div class="stat">
              <div class="stat-title">Differentiation</div>
              <div class="stat-value text-2xl" data-testid="profile-differentiation">{{ results.profile.differentiation.toFixed(1) }}</div>
              <div class="stat-desc">Spread of the six counts. {{ differentiationLabel(results.profile.differentiationLevel) }}.</div>
            </div>
          </div>
          <p data-testid="profile-summary">{{ results.profile.summary }}</p>
          <template v-if="results.profile.nearTies.length">
            <h4>Close counts</h4>
            <p>Counts within 1 of each other are read as roughly equal preference. This is a rule of thumb, not a statistical interval.</p>
            <ul>
              <li v-for="group in results.profile.nearTies" :key="group.letters.join('')">{{ describeNearTie(group) }}</li>
            </ul>
          </template>
          <div class="card-actions">
            <button type="button" class="btn btn-outline" @click="emit('review', 'interests')">Review interest answers</button>
          </div>
        </div>
          </div>
        </details>
      </section>

      <section aria-labelledby="values-heading">
        <details class="collapse collapse-arrow card card-border bg-base-100" data-testid="values-details">
          <summary class="collapse-title">
            <h2 id="values-heading" class="mb-0">Work values</h2>
          </summary>
          <div class="collapse-content">
        <div class="card-body p-0">
          <p v-if="results.values === null">You skipped this section.</p>
          <template v-else>
            <p><span class="badge badge-neutral">Unvalidated</span></p>
            <div v-if="results.valuesCeiling" class="alert alert-info mb-3 items-start" role="note" data-testid="values-ceiling">
              <span>{{ results.valuesCeiling.message }}</span>
            </div>
            <div class="grid items-start gap-3 lg:grid-cols-2">
              <article v-for="scale in results.values" :key="scale.id" class="card card-border bg-base-100">
                <div class="card-body">
                  <h3 class="card-title">{{ scale.name }}</h3>
                  <p>{{ scoreLine(scale) }}</p>
                  <p class="mb-0">{{ describeScale(scale.id, scale.level, scale.name) }}</p>
                </div>
              </article>
            </div>
            <div class="card-actions">
              <button type="button" class="btn btn-outline" @click="emit('review', 'values')">Review values answers</button>
            </div>
          </template>
        </div>
          </div>
        </details>
      </section>

      <section aria-labelledby="work-style-heading">
        <details class="collapse collapse-arrow card card-border bg-base-100" data-testid="work-style-details">
          <summary class="collapse-title">
            <h2 id="work-style-heading" class="mb-0">Work style</h2>
          </summary>
          <div class="collapse-content">
        <div class="card-body p-0">
          <p v-if="results.workStyle === null">You skipped this section.</p>
          <template v-else>
            <p><span class="badge badge-neutral">Exploratory, unvalidated</span></p>
            <div class="grid items-start gap-3 lg:grid-cols-2">
              <article v-for="scale in results.workStyle" :key="scale.id" class="card card-border bg-base-100">
                <div class="card-body">
                  <h3 class="card-title">{{ scale.name }}</h3>
                  <p>{{ scoreLine(scale) }}</p>
                  <p class="mb-0">{{ describeScale(scale.id, scale.level, scale.name) }}</p>
                </div>
              </article>
            </div>
            <div class="card-actions">
              <button type="button" class="btn btn-outline" @click="emit('review', 'workStyle')">Review work-style answers</button>
            </div>
          </template>
        </div>
          </div>
        </details>
      </section>

      <section aria-labelledby="interpretation-heading">
        <details class="collapse collapse-arrow card card-border bg-base-100" data-testid="interpretation-details">
          <summary class="collapse-title">
            <h2 id="interpretation-heading" class="mb-0">This app's interpretation, not part of the O*NET Interest Profiler</h2>
          </summary>
          <div class="collapse-content">
            <div class="card-body p-0">
              <p>Low, Moderate, and High below are this app's labels around the scale midpoint. They are not official scores.</p>
              <div class="grid items-start gap-3 lg:grid-cols-2">
                <article v-for="area in results.interests.areas" :key="area.id" class="card card-border bg-base-100">
                  <div class="card-body">
                    <h3 class="card-title">{{ area.name }}: {{ levelLabel(area.level) }}</h3>
                    <p class="mb-0">{{ describeScale(`i${area.id}`, area.level, area.name) }}</p>
                  </div>
                </article>
              </div>
              <h3>Ideas versus data</h3>
              <p>
                {{ results.interpretation.dataIdeasPole }} (score {{ results.interpretation.dataIdeas.toFixed(1) }}).
                Positive is toward data. Negative is toward ideas. Near the middle means the score is small next to the
                largest possible swing.
              </p>
              <h3>People versus things</h3>
              <p class="mb-0">
                {{ results.interpretation.peopleThingsPole }} (score {{ results.interpretation.peopleThings.toFixed(1) }}).
                Positive is toward people. Negative is toward things.
              </p>
            </div>
          </div>
        </details>
      </section>

      <section
        v-if="results.followUp.interests || results.followUp.values"
        class="card card-border bg-base-100"
        aria-labelledby="followup-heading"
        data-testid="followup"
      >
        <div class="card-body">
          <h2 id="followup-heading">Questions that can settle open ties</h2>
          <p>
            Your scores left something unresolved. These fixed questions are the same for everyone. They are optional, there
            are at most {{ FOLLOW_UP_QUESTION_CAP }}, and your choices are kept in the prompt as extra context. They do not
            change the scores above.
          </p>

          <div v-if="results.followUp.interests" class="flex flex-col gap-3" data-testid="followup-interests">
            <h3>
              {{ results.followUp.interests.names.join(' and ') }} are tied at
              {{ results.followUp.interests.count }}
            </h3>
            <p class="mb-0">Pick the option you would choose first. If neither feels right, say so.</p>
            <FollowUpChoice
              v-for="question in results.followUp.interests.questions"
              :key="question.id"
              :question="question"
              @answer="(id, value) => emit('followUp', id, value)"
            />
            <div class="alert alert-info items-start" role="status">
              <span>{{ results.followUp.interests.summary }}</span>
            </div>
          </div>

          <div v-if="results.followUp.values" class="flex flex-col gap-3" data-testid="followup-values">
            <h3>Which work values matter most</h3>
            <p class="mb-0">
              You rated {{ results.followUp.values.scales.map((scale) => scale.name).join(', ') }} as High. Choosing
              between them shows which come first.
            </p>
            <FollowUpChoice
              v-for="question in results.followUp.values.questions"
              :key="question.id"
              :question="question"
              @answer="(id, value) => emit('followUp', id, value)"
            />
            <div class="alert alert-info items-start" role="status">
              <span>{{ results.followUp.values.summary }}</span>
            </div>
          </div>
        </div>
      </section>

      <PromptGenerator
        :prompt="prompt"
        :task-ids="taskIds"
        :custom-task="customTask"
        :context="context"
        @update:task-ids="emit('update:taskIds', $event)"
        @update:custom-task="emit('update:customTask', $event)"
        @update:context="emit('update:context', $event)"
      />

      <section class="card card-border bg-base-100" aria-labelledby="save-heading">
        <div class="card-body">
          <h2 id="save-heading">Save a copy</h2>
          <ExportButtons :text-export="textExport" :json-export="jsonExport" />
          <PrivacyControls
            :save-locally="saveLocally"
            @update:save-locally="emit('update:saveLocally', $event)"
            @clear="emit('clear')"
          />
        </div>
      </section>
    </div>
  </section>
</template>
