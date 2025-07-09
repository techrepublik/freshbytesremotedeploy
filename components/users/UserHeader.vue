<script setup>
  const props = defineProps({
    title: {
      type: String,
      default: 'All Users'
    },
    breadcrumbItems: {
      type: Array,
      default: () => [
        { text: 'Home', link: '/home' },
        { text: 'Users', link: '#' }
      ]
    },
    showAddButton: {
      type: Boolean,
      default: true
    },
    addButtonText: {
      type: String,
      default: 'Add new user'
    }
  })

  // Define emits for parent communication
  const emit = defineEmits(['add-clicked'])

  // Handle add button click
  const handleAddClick = () => {
    emit('add-clicked')
  }
</script>

<template>
<!-- Breadcrumb -->
  <nav class="flex mb-2" aria-label="Breadcrumb">
    <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
      <li class="inline-flex items-center" v-for="(item, index) in props.breadcrumbItems" :key="index">
        <!-- First item (Home) -->
        <NuxtLink 
          v-if="index === 0" 
          :to="item.link"
          class="inline-flex items-center text-sm font-medium text-gray-800 hover:text-green-800 dark:text-gray-400 dark:hover:text-white"
        >
          <svg class="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor"
            viewBox="0 0 20 20">
            <path
              d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
          </svg>
          {{ item.text }}
        </NuxtLink>
        
        <!-- Other items -->
        <div v-else class="flex items-center">
          <svg class="rtl:rotate-180 w-3 h-3 text-gray-600 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 6 10">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="m1 9 4-4-4-4" />
          </svg>
          <NuxtLink 
            v-if="item.link !== '#'"
            :to="item.link"
            class="ms-1 text-sm font-medium text-gray-800 hover:text-green-800 md:ms-2 dark:text-gray-400 dark:hover:text-white"
          >
            {{ item.text }}
          </NuxtLink>
          <span 
            v-else
            class="ms-1 text-sm font-medium text-gray-800 md:ms-2 dark:text-gray-400"
          >
            {{ item.text }}
          </span>
        </div>
      </li>
    </ol>
  </nav>

  <!-- Title Header -->
  <div class="flex justify-between items-center mt-3 mb-3">
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">
      {{ props.title }}
    </h1>
    <button
      v-if="props.showAddButton"
      class="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
      @click="handleAddClick"
    >
      <span class="mr-2">+</span> {{ props.addButtonText }}
    </button>
  </div>
</template>