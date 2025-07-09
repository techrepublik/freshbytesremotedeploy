<script setup>
    import { computed } from 'vue'

    // Define props to receive data from parent
    const props = defineProps({
    currentPage: {
        type: Number,
        default: 1
    },
    totalPages: {
        type: Number,
        default: 1
    },
    total: {
        type: Number,
        default: 0
    },
    pageSize: {
        type: Number,
        default: 20
    }
    })

    // Define emits for parent communication
    const emit = defineEmits(['page-changed'])

    // Handle page change
    const goToPage = (page) => {
    if (page < 1 || page > props.totalPages) return
    emit('page-changed', page)
    }

    // Computed for showing range
    const showingStart = computed(() => (props.currentPage - 1) * props.pageSize + 1)
    const showingEnd = computed(() => Math.min(props.currentPage * props.pageSize, props.total))

    // Generate page numbers to show (max 5 pages)
    const visiblePages = computed(() => {
    const start = Math.max(1, props.currentPage - 2)
    const end = Math.min(props.totalPages, start + 4)
    const pages = []
    for (let i = start; i <= end; i++) {
        pages.push(i)
    }
    return pages
    })
</script>

<template>
  <div v-if="props.total > 0" class="bg-white dark:bg-gray-800 rounded-lg">
    <!-- Divider -->
    <hr class="my-4 border-gray-200 dark:border-gray-700">

    <!-- Pagination -->
    <div class="flex items-center justify-between mb-4">
      <!-- Pagination Controls (left, arrows and page numbers) -->
      <div>
        <ul class="inline-flex items-center -space-x-px">
          <li>
            <button
              class="flex items-center justify-center h-10 w-10 ms-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-s-lg hover:bg-gray-100 hover:border-gray-500 hover:text-neutral-950 disabled:opacity-50"
              :disabled="props.currentPage === 1"
              @click="goToPage(props.currentPage - 1)"
            >
              <span class="sr-only">Previous</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="4" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </li>
          <li v-for="page in visiblePages" :key="page">
            <button
              class="flex items-center justify-center h-10 w-10 leading-tight border border-gray-300
                hover:bg-gray-100 hover:text-green-700
                focus:z-20 focus:ring-2 focus:ring-green-500
                transition"
              :class="{
                'bg-green-50 text-green-600 border-green-400': props.currentPage === page,
                'bg-white text-gray-500': props.currentPage !== page
              }"
              @click="goToPage(page)"
            >
              {{ page }}
            </button>
          </li>
          <li>
            <button
              class="flex items-center justify-center h-10 w-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:border-gray-500 hover:text-neutral-950 disabled:opacity-50"
              :disabled="props.currentPage === props.totalPages"
              @click="goToPage(props.currentPage + 1)"
            >
              <span class="sr-only">Next</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="4" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </li>
          <!-- Showing Info -->
          <li class="text-sm text-gray-600 ml-4">
            Showing <span class="font-semibold">{{ showingStart }}</span>
            -
            <span class="font-semibold">{{ showingEnd }}</span>
            of <span class="font-semibold">{{ props.total }}</span>
          </li>
        </ul>
      </div>
      <!-- Green Buttons (right) -->
      <div class="flex items-center space-x-6">
        <div class="flex items-center space-x-2">
          <button
            class="flex items-center px-6 py-2 bg-green-700 text-white rounded-xl font-semibold text-base shadow hover:bg-green-800 transition disabled:opacity-50"
            :disabled="props.currentPage === 1"
            @click="goToPage(props.currentPage - 1)"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" stroke-width="4" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          <button
            class="flex items-center px-6 py-2 bg-green-700 text-white rounded-xl font-semibold text-base shadow hover:bg-green-800 transition disabled:opacity-50"
            :disabled="props.currentPage === props.totalPages"
            @click="goToPage(props.currentPage + 1)"
          >
            Next
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" stroke-width="4" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>