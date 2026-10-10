<script setup lang="ts">
defineProps<{
  itemId: string
  text: string
  checked: boolean
}>()

const emit = defineEmits<{
  'update:checked': [value: boolean]
}>()

function onChange(event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  emit('update:checked', target.checked)
}
</script>

<template>
  <label class="fieldset-label gap-3" :for="itemId">
    <input :id="itemId" class="checkbox checkbox-primary" type="checkbox" :checked="checked" @change="onChange" />
    <span>{{ text }}</span>
  </label>
</template>
