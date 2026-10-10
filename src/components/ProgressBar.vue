<script setup lang="ts">
defineProps<{
  value: number
  label: string
}>()
</script>

<template>
  <progress class="progress progress-primary h-3 w-full" :value="value" max="100" :aria-label="label"></progress>
</template>
