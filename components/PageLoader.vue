<!-- components/PageLoader.vue -->
<template>
  <Transition name="overlay-fade">
    <div
      v-if="show"
      class="fixed inset-0 bg-white z-50 flex items-center justify-center"
    >
      <img src="/assets/images/logos-12-12.png" alt="Loading" class="w-20 h-20 animate-spin-slow" />
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const show = ref(false)
const authRoutes = ['/Login', '/register']
const router = useRouter()

router.beforeEach((to, from, next) => {
  show.value = authRoutes.includes(to.path)
  next()
})

router.afterEach(() => {
  setTimeout(() => {
    show.value = false
  }, 500)
})
</script>

<style scoped>
.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0s ease;
}
.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}
@keyframes spin-slow {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.animate-spin-slow {
  animation: spin-slow 1.5s linear infinite;
}
</style>
