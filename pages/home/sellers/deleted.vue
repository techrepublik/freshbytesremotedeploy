<script setup>
// filepath: c:\Users\ejfay\FreshBytes\freshbytes-admin\pages\home\sellers\deleted.vue
definePageMeta({
    layout: "home",
});

const config = useRuntimeConfig();
const api = config.public.API_LINK;

// Filters
const search = ref('')
const selectedRole = ref('')

// Pagination
const currentPage = ref(1);
const pageSize = 20;

// Compose query string for API
const queryString = computed(() => {
  const params = new URLSearchParams()
  if (search.value) params.append('search', search.value)
  if (selectedRole.value) params.append('role', selectedRole.value)
  params.append('page', currentPage.value.toString())
  params.append('page_size', pageSize.toString())
  params.append('deleted', 'true') // Filter for deleted sellers only
  return params.toString() ? `?${params.toString()}` : ''
})

// Fetch deleted sellers from your API
const { data, pending, error, refresh } = await useFetch(
  () => `${api}api/sellers/deleted/${queryString.value}`,
  { server: false }
)

const loading = computed(() => pending.value);
const deletedSellers = ref([])

// Data watcher for deleted sellers
watch(data, (val) => {
  if (val) {
    deletedSellers.value = (Array.isArray(val) ? val : val.results || val.sellers || []).map(s => ({
      seller_id: s.seller_id,
      seller_name: s.seller_name || s.user?.user_name || 'Unknown',
      first_name: s.first_name || s.user?.first_name || '',
      last_name: s.last_name || s.user?.last_name || '',
      avatar: s.avatar || s.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.seller_name || 'User')}`,
      seller_email: s.seller_email || s.user?.user_email || 'No email',
      seller_phone: s.seller_phone || s.user?.user_phone || '',
      seller_address: s.seller_address || s.user?.user_address || '',
      role: s.is_admin ? 'Admin' : (s.is_seller ? 'Seller' : 'User'),
      deleted_at: s.deleted_at || s.date_deleted,
      selected: false
    }))
  }
}, { immediate: true })

// Refetch sellers when filters change and reset to page 1
watch([search, selectedRole], () => {
  currentPage.value = 1
  refresh()
})

// Watch current page changes
watch(currentPage, () => {
  refresh()
})

// Computed properties for pagination
const total = computed(() => {
  return data.value?.count || data.value?.total || deletedSellers.value.length || 0
})

const totalPages = computed(() => Math.ceil(total.value / pageSize))

const paginatedSellers = computed(() => {
  if (data.value?.count !== undefined) {
    return deletedSellers.value // API handles pagination
  } else {
    const start = (currentPage.value - 1) * pageSize;
    return deletedSellers.value.slice(start, start + pageSize);
  }
})

// Selection management
const allSelected = computed({
  get: () => deletedSellers.value.length > 0 && deletedSellers.value.every(s => s.selected),
  set: (val) => {
    deletedSellers.value.forEach(s => s.selected = val)
  }
})

const selectedSellers = computed(() => deletedSellers.value.filter(s => s.selected))
const hasSelectedSellers = computed(() => selectedSellers.value.length > 0)

// Function to clear all selections
function clearAllSelections() {
  deletedSellers.value.forEach(seller => seller.selected = false)
}

// Pagination functions
function handlePageChange(page) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
}

// Filter handlers
function handleSearchUpdate(value) {
  search.value = value
}

function handleRoleUpdate(value) {
  selectedRole.value = value
}

function handleClearFilters() {
  search.value = ''
  selectedRole.value = ''
}

// Selection handlers
function handleSelectAll(value) {
  allSelected.value = value
}

function handleSelectSeller(seller) {
  seller.selected = !seller.selected
}

// Restore seller function
async function restoreSeller(seller) {
  if (!confirm(`Are you sure you want to restore seller "${seller.seller_name}"?`)) {
    return
  }
  
  try {
    await $fetch(`${api}/api/sellers/${seller.seller_id}/restore/`, {
      method: 'PATCH'
    })
    
    // Show success message
    alert(`Seller "${seller.seller_name}" has been restored successfully!`)
    
    // Refresh the list
    refresh()
  } catch (err) {
    console.error('Restore error:', err)
    alert('Failed to restore seller')
  }
}

// Permanent delete function
async function permanentDeleteSeller(seller) {
  if (!confirm(`Are you sure you want to PERMANENTLY delete seller "${seller.seller_name}"? This action cannot be undone!`)) {
    return
  }
  
  // Double confirmation for permanent delete
  if (!confirm(`This will permanently delete all data for "${seller.seller_name}". Are you absolutely sure?`)) {
    return
  }
  
  try {
    await $fetch(`${api}/api/sellers/${seller.seller_id}/permanent-delete/`, {
      method: 'DELETE'
    })
    
    // Show success message
    alert(`Seller "${seller.seller_name}" has been permanently deleted.`)
    
    // Refresh the list
    refresh()
  } catch (err) {
    console.error('Permanent delete error:', err)
    alert('Failed to permanently delete seller')
  }
}

// Bulk restore function
async function restoreSelectedSellers() {
  if (!confirm(`Are you sure you want to restore ${selectedSellers.value.length} selected seller(s)?`)) {
    return
  }
  
  try {
    const restorePromises = selectedSellers.value.map(seller => 
      $fetch(`${api}/api/sellers/${seller.seller_id}/restore/`, {
        method: 'PATCH'
      })
    )
    
    await Promise.all(restorePromises)
    
    alert(`${selectedSellers.value.length} seller(s) restored successfully!`)
    clearAllSelections()
    refresh()
  } catch (err) {
    console.error('Bulk restore error:', err)
    alert('Failed to restore some sellers')
  }
}

// Bulk permanent delete function
async function permanentDeleteSelectedSellers() {
  if (!confirm(`Are you sure you want to PERMANENTLY delete ${selectedSellers.value.length} selected seller(s)? This action cannot be undone!`)) {
    return
  }
  
  // Double confirmation for bulk permanent delete
  if (!confirm(`This will permanently delete all data for ${selectedSellers.value.length} seller(s). Are you absolutely sure?`)) {
    return
  }
  
  try {
    const deletePromises = selectedSellers.value.map(seller => 
      $fetch(`${api}/api/sellers/${seller.seller_id}/permanent-delete/`, {
        method: 'DELETE'
      })
    )
    
    await Promise.all(deletePromises)
    
    alert(`${selectedSellers.value.length} seller(s) permanently deleted.`)
    clearAllSelections()
    refresh()
  } catch (err) {
    console.error('Bulk permanent delete error:', err)
    alert('Failed to permanently delete some sellers')
  }
}

// Format date function
function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <!-- Loading component -->
  <Loading :loading="loading" />

  <!-- Header -->
  <div class="mb-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Deleted Sellers</h1>
        <p class="text-gray-600 mt-1">Manage and restore deleted seller accounts</p>
      </div>
      <div class="flex items-center gap-3">
        <NuxtLink 
          to="/home/sellers" 
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Current Sellers
        </NuxtLink>
      </div>
    </div>
  </div>
  
  <!-- Filters -->
  <div class="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
    <!-- Filters (left side) -->
    <div class="flex flex-wrap gap-3">
      <!-- Search Input -->
      <div class="relative">
        <input 
          v-model="search" 
          type="text" 
          placeholder="Search deleted sellers..."
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

      <!-- Clear Button -->
      <button 
        class="flex items-center px-4 py-2 h-10 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200" 
        @click="handleClearFilters"
        :disabled="loading"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
        Clear
      </button>
    </div>

    <!-- Actions (right side) -->
    <div class="flex items-center gap-3">
      <!-- Selected Items Info -->
      <div v-if="hasSelectedSellers" class="text-sm text-gray-600">
        <span class="font-medium">{{ selectedSellers.length }}</span> 
        {{ selectedSellers.length === 1 ? 'seller' : 'sellers' }} selected
      </div>

      <!-- Bulk Actions -->
      <div v-if="hasSelectedSellers" class="flex gap-2">
        <!-- Bulk Restore Button -->
        <button
          class="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200"
          @click="restoreSelectedSellers"
          :disabled="loading"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          Restore {{ selectedSellers.length }}
        </button>
        
        <!-- Bulk Permanent Delete Button -->
        <button
          class="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-200"
          @click="permanentDeleteSelectedSellers"
          :disabled="loading"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
          </svg>
          Delete Permanently
        </button>
      </div>
    </div>
  </div>

  <!-- Deleted Sellers Table -->
  <div class="overflow-x-auto bg-white rounded-lg">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-3 w-12 text-center align-middle">
            <input
              class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
              type="checkbox" 
              v-model="allSelected" />
          </th>
          <th class="p-4 text-left text-xs font-medium text-gray-500 uppercase">Seller ID</th>
          <th class="p-4 text-left text-xs font-medium text-gray-500 uppercase">Avatar & Name</th>
          <th class="p-4 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
          <th class="p-4 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
          <th class="p-4 text-left text-xs font-medium text-gray-500 uppercase">Deleted Date</th>
          <th class="p-4 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="seller in paginatedSellers" :key="seller.seller_id" class="hover:bg-gray-50">
          <td class="px-4 py-3">
            <input
              class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
              type="checkbox" 
              :checked="seller.selected"
              @change="handleSelectSeller(seller)" />
          </td>
          <td class="px-4 py-3 font-semibold text-gray-900">{{ seller.seller_id }}</td>
          <td class="px-4 py-3">
            <div class="flex items-center">
              <img :src="seller.avatar" 
                   :alt="seller.seller_name"
                   class="w-10 h-10 rounded-full mr-3 border-2 border-gray-200" />
              <div>
                <div class="font-semibold text-gray-900">{{ seller.seller_name }}</div>
                <div class="text-sm text-gray-500">{{ seller.first_name }} {{ seller.last_name }}</div>
              </div>
            </div>
          </td>
          <td class="px-4 py-3 font-medium text-gray-900">{{ seller.seller_email }}</td>
          <td class="px-4 py-3">
            <span v-if="seller.role === 'Admin'"
              class="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Admin</span>
            <span v-else-if="seller.role === 'Seller'"
              class="px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Seller</span>
            <span v-else class="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">User</span>
          </td>
          <td class="px-4 py-3 text-sm text-gray-600">{{ formatDate(seller.deleted_at) }}</td>
          <td class="px-4 py-3">
            <div class="flex justify-center gap-2">
              <!-- Restore Button -->
              <button
                @click="restoreSeller(seller)"
                class="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
                :disabled="loading"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Restore
              </button>
              
              <!-- Permanent Delete Button -->
              <button
                @click="permanentDeleteSeller(seller)"
                class="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors"
                :disabled="loading"
              >
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
                Delete
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- Empty State -->
    <div v-if="!loading && deletedSellers.length === 0" class="text-center py-12">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
      </svg>
      <h3 class="text-xl font-medium text-gray-900 mb-2">No deleted sellers found</h3>
      <p class="text-gray-500">There are no deleted sellers to display.</p>
    </div>
  </div>

  <!-- Pagination -->
  <Pagination
    :current-page="currentPage"
    :total-pages="totalPages"
    :total="total"
    :page-size="pageSize"
    @page-changed="handlePageChange"
  />
</template>