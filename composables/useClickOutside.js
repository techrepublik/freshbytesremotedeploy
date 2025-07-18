// composables/useClickOutside.js
import { onMounted, onBeforeUnmount } from 'vue'

export function useClickOutside(elementRef, callback) {
  const handleClick = (e) => {
    if (elementRef.value && !elementRef.value.contains(e.target)) {
      callback()
    }
  }

  onMounted(() => {
    document.addEventListener('mousedown', handleClick)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClick)
  })
}
