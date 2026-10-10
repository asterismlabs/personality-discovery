<script setup lang="ts">
import type { FollowUpQuestion } from '../scoring/followUp'

defineProps<{
  question: FollowUpQuestion
}>()

const emit = defineEmits<{
  answer: [id: string, value: string]
}>()
</script>

<template>
  <fieldset :id="`followup-${question.id}`" class="fieldset rounded-box border border-base-300 bg-base-100 p-4">
    <legend class="fieldset-legend text-base">{{ question.prompt }}</legend>
    <div class="flex flex-col gap-2">
      <label v-for="option in question.options" :key="option.value" class="fieldset-label gap-3">
        <input
          class="radio radio-primary"
          type="radio"
          :name="question.id"
          :value="option.value"
          :checked="question.answer === option.value"
          @change="emit('answer', question.id, option.value)"
        />
        <span>{{ option.text }}</span>
      </label>
    </div>
  </fieldset>
</template>
