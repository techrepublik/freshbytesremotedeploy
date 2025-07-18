<script setup>

// Define props
const props = defineProps({
  sellers: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Define emits
const emit = defineEmits(['delete-selected', 'update:search', 'update:selectedRole', 'update:selectedStatus', 'clear-filters'])

// Reactive filter variables
const search = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')

// Computed property for selected sellers
const selectedSellers = computed(() => {
  return props.sellers.filter(seller => seller.selected)
})

const hasSelectedSellers = computed(() => {
  return selectedSellers.value.length > 0
})

// Computed for active filters count
const activeFiltersCount = computed(() => {
  let count = 0
  if (search.value) count++
  if (selectedRole.value) count++
  if (selectedStatus.value) count++
  return count
})

// Watch for changes and emit to parent
watch(search, (newValue) => {
  emit('update:search', newValue)
})

watch(selectedRole, (newValue) => {
  emit('update:selectedRole', newValue)
})

watch(selectedStatus, (newValue) => {
  emit('update:selectedStatus', newValue)
})

// Handle delete selected
function handleDeleteSelected() {
  if (selectedSellers.value.length > 0) {
    emit('delete-selected', selectedSellers.value)
  }
}

// Handle clear filters
function handleClearFilters() {
  search.value = ''
  selectedRole.value = ''
  selectedStatus.value = ''
  emit('clear-filters')
}
</script>

<template>
  <!-- Filters -->
  <div class="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
    <!-- Filters (left side) -->
    <div class="flex flex-wrap gap-3">
      <!-- Search Input -->
      <div class="relative">
        <input 
          v-model="search" 
          type="text" 
          placeholder="Search sellers by name or email..."
          class="pl-10 pr-4 py-2 h-10 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          :disabled="loading"
        />
        <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>

      <!-- Role Filter -->
      <div class="relative">
        <select 
          v-model="selectedRole"
          class="px-4 py-2 pr-8 h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white"
          :disabled="loading"
        >
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Seller">Seller</option>
          <option value="User">User</option>
        </select>
        <svg class="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>

      <!-- Status Filter -->
      <div class="relative">
        <select 
          v-model="selectedStatus"
          class="px-4 py-2 pr-8 h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white"
          :disabled="loading"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <svg class="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>

      <!-- Clear Button -->
      <button 
        class="flex items-center px-4 py-2 h-10 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50" 
        @click="handleClearFilters"
        :disabled="loading || activeFiltersCount === 0"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        Clear
        <span v-if="activeFiltersCount > 0" class="ml-1 px-1.5 py-0.5 text-xs bg-gray-300 text-gray-700 rounded-full">
          {{ activeFiltersCount }}
        </span>
      </button>
    </div>

    <!-- Actions (right side) -->
    <div class="flex items-center gap-3">
      <!-- Selected Items Info -->
      <div v-if="hasSelectedSellers" class="text-sm text-gray-600">
        <span class="font-medium">{{ selectedSellers.length }}</span> 
        {{ selectedSellers.length === 1 ? 'seller' : 'sellers' }} selected
      </div>

      <!-- Delete Button -->
      <button
        class="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!hasSelectedSellers || loading" 
        @click="handleDeleteSelected"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
        Delete {{ selectedSellers.length }} 
        {{ selectedSellers.length === 1 ? 'Seller' : 'Sellers' }}
      </button>
    </div>
  </div>
</template>