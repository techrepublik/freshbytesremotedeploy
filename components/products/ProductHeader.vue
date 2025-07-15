<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'All Products'
  },
  subtitle: {
    type: String,
    default: ''
  },
  showAddButton: {
    type: Boolean,
    default: true
  },
  breadcrumbItems: {
    type: Array,
    default: () => []
  },
  showTabs: {
    type: Boolean,
    default: true
  }
})

// Define emits for parent communication
const emit = defineEmits(['add-product'])

// Get current route to determine breadcrumb
const route = useRoute()

// Generate breadcrumb items based on current route
const computedBreadcrumbItems = computed(() => {
  if (props.breadcrumbItems.length > 0) {
    return props.breadcrumbItems
  }

  // Default breadcrumb structure
  const items = [
    {
      name: 'Home',
      href: '/home',
      icon: true
    },
    {
      name: 'Products',
      href: '/home/products'
    }
  ]

  // Add specific page breadcrumb based on route
  const path = route.path
  if (path.includes('/approvals')) {
    items.push({
      name: 'Approvals',
      href: '/home/products/approvals',
      current: true
    })
  } else if (path.includes('/analytics')) {
    items.push({
      name: 'Analytics',
      href: '/home/products/analytics',
      current: true
    })
  } else if (path === '/home/products') {
    items[1].current = true
  }

  return items
})
</script>

<template>
  <div class="relative min-h-auto mb-6">
    <!-- Enhanced Breadcrumb Navigation -->
    <nav class="flex mb-4" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
        <li v-for="(item, index) in computedBreadcrumbItems" :key="index" class="inline-flex items-center">
          <!-- First item (Home) with icon -->
          <template v-if="index === 0">
            <NuxtLink
              v-if="!item.current"
              :to="item.href"
              class="inline-flex items-center text-sm font-medium text-gray-700 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors duration-200">
              <svg v-if="item.icon" class="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
              </svg>
              {{ item.name }}
            </NuxtLink>
            <span v-else class="inline-flex items-center text-sm font-medium text-green-600 dark:text-green-400">
              <svg v-if="item.icon" class="w-3 h-3 me-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z" />
              </svg>
              {{ item.name }}
            </span>
          </template>
          
          <!-- Subsequent items -->
          <template v-else>
            <div class="flex items-center">
              <!-- Separator -->
              <svg class="rtl:rotate-180 w-3 h-3 text-gray-400 mx-1" aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="m1 9 4-4-4-4" />
              </svg>
              
              <!-- Link or current page indicator -->
              <NuxtLink
                v-if="!item.current"
                :to="item.href"
                class="ms-1 text-sm font-medium text-gray-700 hover:text-green-600 md:ms-2 dark:text-gray-400 dark:hover:text-green-400 transition-colors duration-200">
                {{ item.name }}
              </NuxtLink>
              <span v-else class="ms-1 text-sm font-medium text-green-600 md:ms-2 dark:text-green-400">
                {{ item.name }}
              </span>
            </div>
          </template>
        </li>
      </ol>
    </nav>
    
    <!-- Header with Dynamic Title and Subtitle -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
      <div class="mb-4 sm:mb-0">
        <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">{{ title }}</h1>
        <p v-if="subtitle" class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ subtitle }}</p>
      </div>
    </div>

    <!-- Navigation Tabs for Product Pages -->
    <div v-if="showTabs" class="border-b border-gray-200 dark:border-gray-700">
      <nav class="flex space-x-8" aria-label="Tabs">
        <NuxtLink
          to="/home/products"
          :class="[
            route.path === '/home/products'
              ? 'border-green-500 text-green-600 dark:text-green-400 dark:border-green-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200'
          ]">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
          All Products
        </NuxtLink>
        
        <NuxtLink
          to="/home/products/approvals"
          :class="[
            route.path === '/home/products/approvals'
              ? 'border-green-500 text-green-600 dark:text-green-400 dark:border-green-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200'
          ]">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          Approvals
        </NuxtLink>
        
        <NuxtLink
          to="/home/products/analytics"
          :class="[
            route.path === '/home/products/analytics'
              ? 'border-green-500 text-green-600 dark:text-green-400 dark:border-green-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300',
            'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200'
          ]">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"/>
            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"/>
          </svg>
          Analytics
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>