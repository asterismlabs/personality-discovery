<script setup lang="ts">
import type { ResponseScale } from '../data/types'

defineProps<{
  itemId: string
  text: string
  scale: ResponseScale
  modelValue: number | undefined
  invalid: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()
</script>

<template>
  <fieldset
    :id="`item-${itemId}`"
    class="fieldset rounded-box border border-base-300 bg-base-100 p-4"
    :class="invalid ? 'border-error' : ''"
    tabindex="-1"
    :aria-invalid="invalid || undefined"
  >
    <legend class="fieldset-legend text-base">{{ text }}</legend>
    <div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
      <label v-for="option in scale.options" :key="option.value" class="fieldset-label gap-2">
        <input
          class="radio radio-primary"
          type="radio"
          :name="itemId"
          :value="option.value"
          :checked="modelValue === option.value"
          @change="emit('update:modelValue', option.value)"
        />
        <span>{{ option.label }}</span>
      </label>
    </div>
  </fieldset>
</template>
