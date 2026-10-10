<script setup lang="ts">
import { ref } from 'vue'
import type { PromptContext, TaskId } from '../prompt/buildPrompt'
import { TASK_PRESETS } from '../prompt/buildPrompt'

const props = defineProps<{
  prompt: string
  taskIds: readonly TaskId[]
  customTask: string
  context: PromptContext
}>()

const emit = defineEmits<{
  'update:taskIds': [value: TaskId[]]
  'update:customTask': [value: string]
  'update:context': [value: PromptContext]
}>()

const copyNote = ref('')
const promptBox = ref<HTMLTextAreaElement | null>(null)

function onCustomTask(event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLTextAreaElement)) return
  emit('update:customTask', target.value)
}

function onTaskToggle(id: TaskId, event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  const next = TASK_PRESETS.map((task) => task.id).filter((taskId) =>
    taskId === id ? target.checked : props.taskIds.includes(taskId),
  )
  emit('update:taskIds', next)
}

function patchContext(key: keyof PromptContext, event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return
  emit('update:context', { ...props.context, [key]: target.value })
}

async function copyPrompt(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.prompt)
    copyNote.value = 'Copied.'
  } catch {
    promptBox.value?.focus()
    promptBox.value?.select()
    copyNote.value = 'Clipboard is unavailable. The prompt is selected so you can copy it.'
  }
}
</script>

<template>
  <section class="card card-border bg-base-100" aria-labelledby="prompt-heading">
    <div class="card-body">
      <h2 id="prompt-heading" class="card-title text-2xl">Prompt to copy</h2>
      <div class="alert alert-info items-start">
        <div>
          <p>
            The scores above are as far as this page goes. It does not contact Claude, Gemini, ChatGPT, DeepSeek, or any
            other model.
          </p>
          <p class="mb-0">
            Copy the prompt and paste it as the first message in a chat model you already use. That is how you continue:
            the model can ask follow-up questions and help you interpret these tendencies for the task you choose.
            Nothing leaves this browser until you paste it yourself.
          </p>
        </div>
      </div>
      <p>Choose one or more tasks, and add context only if you want it included in the prompt.</p>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Tasks</legend>
        <label v-for="task in TASK_PRESETS" :key="task.id" class="fieldset-label gap-3">
          <input
            class="checkbox checkbox-primary"
            type="checkbox"
            :checked="taskIds.includes(task.id)"
            @change="onTaskToggle(task.id, $event)"
          />
          <span>{{ task.label }}</span>
        </label>
      </fieldset>
      <fieldset v-if="taskIds.includes('custom')" class="fieldset">
        <legend class="fieldset-legend">Your task</legend>
        <textarea id="custom-task" class="textarea w-full" aria-label="Your task" :value="customTask" rows="3" @input="onCustomTask"></textarea>
      </fieldset>
      <div class="grid gap-4 lg:grid-cols-2">
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Country or region</legend>
          <input id="country" class="input w-full" aria-label="Country or region" type="text" :value="context.country" autocomplete="country-name" @input="patchContext('country', $event)" />
          <p class="label mb-0">Optional</p>
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Education</legend>
          <input id="education" class="input w-full" aria-label="Education" type="text" :value="context.education" @input="patchContext('education', $event)" />
          <p class="label mb-0">Optional</p>
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Constraints</legend>
          <textarea id="constraints" class="textarea w-full" aria-label="Constraints" rows="2" :value="context.constraints" @input="patchContext('constraints', $event)"></textarea>
          <p class="label mb-0">Optional</p>
        </fieldset>
        <fieldset class="fieldset">
          <legend class="fieldset-legend">Goals</legend>
          <textarea id="goals" class="textarea w-full" aria-label="Goals" rows="2" :value="context.goals" @input="patchContext('goals', $event)"></textarea>
          <p class="label mb-0">Optional</p>
        </fieldset>
      </div>
      <fieldset class="fieldset">
        <legend class="fieldset-legend">Prompt</legend>
        <textarea id="prompt-text" ref="promptBox" class="textarea min-h-64 w-full" aria-label="Prompt" readonly rows="16" :value="prompt"></textarea>
      </fieldset>
      <div class="card-actions">
        <button type="button" class="btn btn-primary" @click="copyPrompt">Copy prompt</button>
      </div>
      <div v-if="copyNote" class="alert alert-info" role="status">
        <span>{{ copyNote }}</span>
      </div>
    </div>
  </section>
</template>
