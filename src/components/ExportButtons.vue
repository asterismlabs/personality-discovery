<script setup lang="ts">
defineProps<{
  textExport: string
  jsonExport: string
}>()

function download(filename: string, contents: string, type: string): void {
  const blob = new Blob([contents], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="join join-vertical sm:join-horizontal">
    <button type="button" class="btn btn-outline join-item" @click="download('discovery-results.txt', textExport, 'text/plain')">
      Download results as text
    </button>
    <button type="button" class="btn btn-outline join-item" @click="download('discovery-results.json', jsonExport, 'application/json')">
      Download results as JSON
    </button>
  </div>
</template>
