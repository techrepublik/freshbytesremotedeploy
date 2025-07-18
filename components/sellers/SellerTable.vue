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
const emit = defineEmits([
  'update-seller',
  'delete-seller',
  'toggle-seller-status',
  'select-all',
  'select-seller',
  'view-seller-details' // Add new emit for viewing details
])

// Track which dropdown is open
const openDropdown = ref(null)

// Computed property for select all checkbox
const allSelected = computed({
  get() {
    return props.sellers.length > 0 && props.sellers.every(seller => seller.selected)
  },
  set(value) {
    emit('select-all', value)
  }
})

// Handle individual seller selection
const handleSellerSelection = (seller) => {
  emit('select-seller', seller)
}

// Handle seller status toggle
const toggleSellerActive = (seller) => {
  const newStatus = seller.status === 'Active' ? 'Inactive' : 'Active'
  emit('toggle-seller-status', seller, newStatus)
}

// Handle view details
const viewSellerDetails = (seller) => {
  emit('view-seller-details', seller)
  openDropdown.value = null // Close dropdown
}

// Handle update modal
const openUpdateModal = (seller) => {
  emit('update-seller', seller)
  openDropdown.value = null // Close dropdown
}

// Handle delete modal
const openDeleteModal = (seller) => {
  emit('delete-seller', seller)
  openDropdown.value = null // Close dropdown
}

// Toggle dropdown
const toggleDropdown = (sellerId) => {
  openDropdown.value = openDropdown.value === sellerId ? null : sellerId
}

// Close dropdown when clicking outside
const closeDropdown = () => {
  openDropdown.value = null
}

// Close dropdown on escape key
onMounted(() => {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDropdown()
    }
  })
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-container')) {
      closeDropdown()
    }
  })
})
</script>

<template>
  <!-- Seller Table -->
  <div class="overflow-x-auto bg-white rounded-lg">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-3 w-12 text-center align-middle">
            <input
              class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
              type="checkbox" 
              v-model="allSelected" />
          </th>
          <th class="p-4 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
          <th class="p-4 text-left text-xs font-medium text-gray-500 uppercase">Avatar & Name</th>
          <th class="p-4 text-left text-xs font-medium text-gray-500 uppercase">User Email</th>
          <th class="p-4 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
          <th class="p-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          <th class="p-4 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="seller in sellers" :key="seller.seller_id">
          <td class="px-4 py-3">
            <input
              class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
              type="checkbox" 
              :checked="seller.selected"
              @change="handleSellerSelection(seller)" />
          </td>
          <td class="px-4 py-3 font-semibold">{{ seller.seller_id }}</td>
          <td class="px-4 py-3">
            <div class="flex items-center">
              <img :src="seller.avatar || '/assets/images/default-avatar.png'" 
                   :alt="seller.seller_name"
                   class="w-8 h-8 rounded-full mr-3" />
              <span class="font-semibold">{{ seller.seller_name }}</span>
            </div>
          </td>
          <td class="px-4 py-3 font-semibold">{{ seller.seller_email }}</td>
          <td class="px-4 py-3">
            <span v-if="seller.role === 'Admin'"
              class="px-4 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">Admin</span>
            <span v-else-if="seller.role === 'Seller'"
              class="px-4 py-1 text-xs font-medium bg-purple-100 text-green-800 rounded">Seller</span>
            <span v-else class="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">User</span>
          </td>
          <td class="p-4 text-base font-medium whitespace-nowrap">
            <div class="flex items-center">
              <label class="inline-flex items-center cursor-pointer" @click.stop>
                <input
                  type="checkbox"
                  class="sr-only peer"
                  :checked="seller.status === 'Active'"
                  @change.stop="toggleSellerActive(seller)"
                />
                <div
                  class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 dark:peer-checked:bg-green-600">
                </div>
                <span class="ml-3 text-sm font-medium" :class="seller.status === 'Active' ? 'text-green-600' : 'text-red-600'">
                  {{ seller.status }}
                </span>
              </label>
            </div>
          </td>
          <td class="p-4 whitespace-nowrap">
            <div class="flex justify-center items-center">
              <!-- Dropdown Container -->
              <div class="relative dropdown-container">
                <!-- Dropdown Trigger Button -->
                <button
                  type="button"
                  @click.stop="toggleDropdown(seller.seller_id)"
                  :disabled="loading"
                  class="inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  :aria-expanded="openDropdown === seller.seller_id"
                  aria-haspopup="true"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                  </svg>
                </button>

                <!-- Dropdown Menu -->
                <div
                  v-if="openDropdown === seller.seller_id"
                  class="absolute right-0 z-50 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div class="py-1">
                    <!-- View Details Option -->
                    <button
                      type="button"
                      @click="viewSellerDetails(seller)"
                      class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                      role="menuitem"
                    >
                      <svg class="w-4 h-4 mr-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
                      </svg>
                      View Details
                    </button>

                    <!-- Update Option -->
                    <button
                      type="button"
                      @click="openUpdateModal(seller)"
                      class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                      role="menuitem"
                    >
                      <svg class="w-4 h-4 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path>
                        <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path>
                      </svg>
                      Update Seller
                    </button>

                    <!-- Divider -->
                    <hr class="border-gray-200 dark:border-gray-600">

                    <!-- Delete Option -->
                    <button
                      type="button"
                      @click="openDeleteModal(seller)"
                      class="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors duration-200"
                      role="menuitem"
                    >
                      <svg class="w-4 h-4 mr-3 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                      Delete Seller
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- Empty State -->
    <div v-if="!loading && sellers.length === 0" class="text-center py-8">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <h3 class="text-xl font-medium text-gray-900 mb-2">No sellers found</h3>
      <p class="text-gray-500">No sellers match your current filters.</p>
    </div>
  </div>
</template>