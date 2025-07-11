<script setup>

    import { ref, computed } from 'vue'

    // Define props to receive data from parent
    const props = defineProps({
        users: {
            type: Array,
            default: () => []
        }
        })

    // Define emits for parent communication
    const emit = defineEmits(['update:search', 'update:role', 'update:status', 'delete-selected'])

    // Filter states
    const search = ref('')
    const selectedRole = ref('')
    const selectedStatus = ref('')

    // Emit changes to parent
    const updateSearch = (value) => {
    search.value = value
    emit('update:search', value)
    }

    const updateRole = (value) => {
    selectedRole.value = value
    emit('update:role', value)
    }

    const updateStatus = (value) => {
    selectedStatus.value = value
    emit('update:status', value)
    }

    // Clear all filters
    const clearFilters = () => {
    search.value = ''
    selectedRole.value = ''
    selectedStatus.value = ''
    emit('update:search', '')
    emit('update:role', '')
    emit('update:status', '')
    }

    // Handle delete selected
    const handleDeleteSelected = () => {
    emit('delete-selected')
    }

    // Computed for selected count
    const selectedCount = computed(() => {
    return props.users?.filter(user => user.selected).length || 0
    })

</script>

<template>
<!-- Filters -->
  <div class="flex items-center justify-between mb-3">
    <!-- Filters (left side) -->
    <div class="flex flex-wrap gap-2">
      <input 
        :value="search" 
        @input="updateSearch($event.target.value)"
        type="text" 
        placeholder="Search for users"
        class="px-4 py-2 h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" 
      />
      
      <select 
        :value="selectedRole"
        @change="updateRole($event.target.value)"
        class="px-4 py-2 pr-8 h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
      >
        <option value="">Roles</option>
        <option value="Administrator">Administrator</option>
        <option value="seller">Seller</option>
        <option value="customer">Customer</option>
      </select>
      
      <select 
        :value="selectedStatus"
        @change="updateStatus($event.target.value)"
        class="px-4 py-2 h-10 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
      >
        <option value="">Status</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>
      
      <!-- Clear Button -->
      <button 
        class="px-4 py-2 h-10 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition" 
        @click="clearFilters"
      >
        Clear
      </button>
    </div>
    
    <!-- Delete Button (right side) -->
    <button
      class="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition disabled:opacity-50 mt-2"
      :disabled="selectedCount === 0" 
      @click="handleDeleteSelected"
    >
      Delete {{ selectedCount }} item<span v-if="selectedCount > 1">s</span>
    </button>
  </div>
</template>