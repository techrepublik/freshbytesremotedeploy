<template>
  <div class="light">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <PageLoader />
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
<script setup>
import PageLoader from '~/components/PageLoader.vue'
</script>