<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  users: { type: Array, default: () => [] },
  search: { type: String, default: '' },
  role: { type: String, default: '' }
})

const emit = defineEmits(['update:search', 'update:role', 'delete-selected', 'clear-filters'])

// Use computed properties for v-model binding
const search = computed({
  get: () => props.search,
  set: (value) => emit('update:search', value)
})

const role = computed({
  get: () => props.role,
  set: (value) => emit('update:role', value)
})

// Clear filters function
function clearFilters() {
  emit('update:search', '')
  emit('update:role', '')
  emit('clear-filters')
}

// Handle delete selected
function handleDeleteSelected() {
  emit('delete-selected')
}

// Computed for selected users count
const selectedCount = computed(() => {
  return props.users.filter(u => u.selected).length
})

const hasSelectedUsers = computed(() => {
  return props.users.some(u => u.selected)
})
</script>

<template>
  <!-- Custom Filter for Deleted Users -->
  <div class="flex items-center justify-between mb-4 mt-2 bg-white rounded-lg">
    <div class="flex flex-wrap gap-4 items-center">
      <!-- Search Input -->
      <div class="flex-1 min-w-64">
        <input 
          v-model="search"
          type="text" 
          placeholder="Search deleted users..." 
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>
      
      <!-- Role Filter -->
      <select 
        v-model="role" 
        class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
        <option value="">All Roles</option>
        <option value="administrator">Administrator</option>
        <option value="seller">Seller</option>
        <option value="customer">Customer</option>
      </select>
      
      <!-- Clear Button -->
      <button 
        @click="clearFilters"
        class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
        Clear
      </button>
    </div>

    <!-- Bulk Delete Button -->
    <button
      v-if="hasSelectedUsers"
      @click="handleDeleteSelected"
      class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
      :disabled="!hasSelectedUsers">
      Permanently Delete {{ selectedCount }} Selected
    </button>
  </div>
</template>