<template>
 <div>
    <!-- Page transitions -->
    <NuxtLayout>
      <Transition name="page" mode="out-in">
      </Transition>
    </NuxtLayout>

    <!-- Loading overlay during route change -->
    <Transition name="overlay-fade">
      <div
        v-if="isNavigating"
        class="fixed inset-0 bg-white z-50 flex items-center justify-center"
      >
        <img src="/assets/images/logos-12-12.png" alt="Loading" class="w-20 h-20 animate-spin-slow" />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const isNavigating = ref(false)

const router = useRouter()

router.beforeEach(() => {
  isNavigating.value = true
})

router.afterEach(() => {
  setTimeout(() => {
    isNavigating.value = false
  }, 600) // matches animation duration
})
</script>
<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.01s ease;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.01s ease;
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