<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  saveLocally: boolean
}>()

const emit = defineEmits<{
  'update:saveLocally': [value: boolean]
  clear: []
}>()

const confirming = ref(false)

function onClear(): void {
  confirming.value = false
  emit('clear')
}

function onSaveChange(event: Event): void {
  const target = event.target
  if (!(target instanceof HTMLInputElement)) return
  emit('update:saveLocally', target.checked)
}
</script>

<template>
  <fieldset class="fieldset rounded-box border border-base-300 bg-base-100 p-4">
    <label class="fieldset-label gap-3">
      <input class="checkbox checkbox-primary" type="checkbox" :checked="props.saveLocally" @change="onSaveChange" />
      <span>Save progress on this device</span>
    </label>
    <p class="mb-0 text-sm">
      Off by default. Answers stay in this tab until you close it. Turning this on stores them in this browser only.
      Nothing is uploaded.
    </p>
    <div v-if="!confirming">
      <button type="button" class="btn btn-outline" @click="confirming = true">Clear all data</button>
    </div>
    <template v-else>
      <p class="mb-0 text-sm">This removes answers from this browser and starts over.</p>
      <div class="join join-vertical sm:join-horizontal" role="group" aria-label="Confirm clearing data">
        <button type="button" class="btn btn-primary join-item" @click="onClear">Yes, clear everything</button>
        <button type="button" class="btn btn-outline join-item" @click="confirming = false">Cancel</button>
      </div>
    </template>
  </fieldset>
</template>
