<template>
  <div class="light">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
      <PageLoader />
    </NuxtLayout>
  </div>
</template>
<script setup>
import PageLoader from '~/components/PageLoader.vue'
</script>