<script setup lang="ts">
import { EXTERNAL_LINKS } from '../data/links'

defineProps<{
  showingAbout: boolean
}>()

const emit = defineEmits<{
  about: []
  back: []
}>()
</script>

<template>
  <footer class="footer sm:footer-horizontal mt-8 rounded-box bg-base-200 p-6 text-base-content">
    <aside>
      <p>
        This application includes information from the
        <a class="link" :href="EXTERNAL_LINKS.onetTools">O*NET Career Exploration Tools</a>
        by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the
        <a class="link" :href="EXTERNAL_LINKS.ccByNd">CC BY-ND 4.0</a>
        license. O*NET® is a trademark of USDOL/ETA.
      </p>
    </aside>
    <nav>
      <h2 class="footer-title">This app</h2>
      <button v-if="showingAbout" type="button" class="btn btn-outline" @click="emit('back')">Back</button>
      <button v-else type="button" class="btn btn-outline" @click="emit('about')">Sources and limitations</button>
    </nav>
  </footer>
</template>
