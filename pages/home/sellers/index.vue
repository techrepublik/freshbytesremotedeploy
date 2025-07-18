<script setup>
import SellerFilter from '@/components/sellers/SellerFilter.vue';
import SellerTable from '@/components/sellers/SellerTable.vue';
import SellersHeader from '@/components/sellers/SellersHeader.vue';
import SellerAddModal from '~/components/sellers/SellerAddModal.vue'
import SellerUpdateModal from '~/components/sellers/SellerUpdateModal.vue'
import SellerDeleteModal from '~/components/sellers/SellerDeleteModal.vue'
import SellerDetailModal from '~/components/sellers/SellerDetailModal.vue'

definePageMeta({
    layout: "home",
});

const config = useRuntimeConfig();
const api = config.public.API_LINK;

// Filters
const search = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')

// Pagination
const currentPage = ref(1);
const pageSize = 20;

// Compose query string for API
const queryString = computed(() => {
  const params = new URLSearchParams()
  if (search.value) params.append('search', search.value)
  if (selectedRole.value) params.append('role', selectedRole.value)
  if (selectedStatus.value) params.append('status', selectedStatus.value)
  params.append('page', currentPage.value.toString())
  params.append('page_size', pageSize.toString())
  return params.toString() ? `?${params.toString()}` : ''
})

// Fetch sellers from your API with filters
const { data, pending, error, refresh } = await useFetch(
  () => `${api}api/sellers/${queryString.value}`,
  { server: false }
)

const loading = computed(() => pending.value);
const sellers = ref([])

// Fixed data watcher with correct variable references
watch(data, (val) => {
  if (val) {
    sellers.value = (Array.isArray(val) ? val : val.results || val.sellers || []).map(s => ({
      seller_id: s.seller_id,
      seller_name: s.seller_name || s.user?.user_name || 'Unknown',
      first_name: s.first_name || s.user?.first_name || '',
      last_name: s.last_name || s.user?.last_name || '',
      avatar: s.avatar || s.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.seller_name || 'User')}`,
      seller_email: s.seller_email || s.user?.user_email || 'No email',
      seller_phone: s.seller_phone || s.user?.user_phone || '',
      seller_address: s.seller_address || s.user?.user_address || '',
      role: s.is_admin ? 'Admin' : (s.is_seller ? 'Seller' : 'User'),
      status: s.is_active ? 'Active' : 'Inactive',
      selected: false
    }))
  }
}, { immediate: true })

// Refetch sellers when filters change and reset to page 1
watch([search, selectedRole, selectedStatus], () => {
  currentPage.value = 1
  refresh()
})

// Watch current page changes
watch(currentPage, () => {
  refresh()
})

// Computed properties for pagination
const total = computed(() => {
  return data.value?.count || data.value?.total || sellers.value.length || 0
})

const totalPages = computed(() => Math.ceil(total.value / pageSize))

const paginatedSellers = computed(() => {
  // If API handles pagination, return all sellers
  // If client-side pagination, slice the array
  if (data.value?.count !== undefined) {
    return sellers.value // API handles pagination
  } else {
    // Client-side pagination fallback
    const start = (currentPage.value - 1) * pageSize;
    return sellers.value.slice(start, start + pageSize);
  }
})

// Computed properties for selection
const allSelected = computed({
  get: () => sellers.value.length > 0 && sellers.value.every(s => s.selected),
  set: (val) => {
    sellers.value.forEach(s => s.selected = val)
  }
})

const anySelected = computed(() => sellers.value.some(s => s.selected))
const selectedCount = computed(() => sellers.value.filter(s => s.selected).length)
const selectedSellers = computed(() => sellers.value.filter(s => s.selected))

// Function to clear all selections
function clearAllSelections() {
  sellers.value.forEach(seller => seller.selected = false)
}

// Pagination functions
function handlePageChange(page) {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
}

// Keep original function for backward compatibility
function goToPage(page) {
  handlePageChange(page)
}

// Event handlers for SellerFilter
function handleSearchUpdate(value) {
  search.value = value
}

function handleRoleUpdate(value) {
  selectedRole.value = value
}

function handleStatusUpdate(value) {
  selectedStatus.value = value
}

function handleClearFilters() {
  search.value = ''
  selectedRole.value = ''
  selectedStatus.value = ''
}

function handleDeleteSelected(selectedSellers) {
  openSellerDeleteModal(null, selectedSellers, 'multiple')
}

// Event handlers for SellerTable
function handleUpdateSeller(seller) {
  openSellerUpdateModal(seller)
}

function handleDeleteSeller(seller) {
  openSellerDeleteModal(seller, [], 'single')
}

function handleToggleStatus(seller, newStatus) {
  toggleSellerActive(seller)
}

function handleSelectAll(value) {
  allSelected.value = value
}

function handleSelectSeller(seller) {
  seller.selected = !seller.selected
}

// New handler for viewing seller details
function handleViewSellerDetails(seller) {
  openSellerDetailModal(seller)
}

async function toggleSellerActive(seller) {
  const newStatus = seller.status === 'Active' ? 'Inactive' : 'Active'
  try {
    // Call your API to update the seller's status
    await $fetch(`${api}api/sellers/${seller.seller_id}/status/`, {
      method: 'PATCH',
      body: { is_active: newStatus === 'Active' }
    })
    // Update local status
    seller.status = newStatus
  } catch (err) {
    alert('Failed to update status')
  }
}

// Add Modal functions
const showSellerAddModal = ref(false)

function openSellerAddModal() {
    showSellerAddModal.value = true
}

function closeSellerAddModal() {
    showSellerAddModal.value = false
}

function handleSellerAddSuccess() { 
  refresh() 
}

// Update Modal functions
const showSellerUpdateModal = ref(false)
const selectedSellerForUpdate = ref(null)

function openSellerUpdateModal(seller) {
    selectedSellerForUpdate.value = seller
    showSellerUpdateModal.value = true
}

function closeSellerUpdateModal() {
    showSellerUpdateModal.value = false
    selectedSellerForUpdate.value = null
}

function handleSellerUpdateSuccess() {
    refresh() // Refresh the seller list
}

// Delete Modal functions
const showSellerDeleteModal = ref(false)
const selectedSellerForDelete = ref(null)
const selectedSellersForDelete = ref([])
const deleteType = ref('single') // 'single' or 'multiple'

function openSellerDeleteModal(seller = null, sellers = [], type = 'single') {
    selectedSellerForDelete.value = seller
    selectedSellersForDelete.value = sellers
    deleteType.value = type
    showSellerDeleteModal.value = true
}

function closeSellerDeleteModal() {
    showSellerDeleteModal.value = false
    selectedSellerForDelete.value = null
    selectedSellersForDelete.value = []
    deleteType.value = 'single'
}

function handleSellerDeleteCancel() {
    clearAllSelections() // Clear all checkboxes when cancel is clicked
    closeSellerDeleteModal()
}

function handleSellerDeleteConfirm() {
    clearAllSelections() // Clear all checkboxes after successful delete
    refresh() // Refresh the seller list
    closeSellerDeleteModal()
}

// Detail Modal functions
const showSellerDetailModal = ref(false)
const selectedSellerForDetail = ref(null)

function openSellerDetailModal(seller) {
    selectedSellerForDetail.value = seller
    showSellerDetailModal.value = true
}

function closeSellerDetailModal() {
    showSellerDetailModal.value = false
    selectedSellerForDetail.value = null
}

// Fixed function name for header component
function openAddSellerModal() {
  openSellerAddModal()
}

const showTooltip = ref(false);
</script>

<template>
  <!-- Loading component -->
  <Loading :loading="loading" />

  <!-- Header -->
  <SellersHeader 
    title="All Sellers"
    subtitle="Manage and monitor seller accounts"
    @add-seller="openAddSellerModal" 
  />
  
  <!-- Add Seller Modal -->
  <SellerAddModal
    :show="showSellerAddModal"
    @close="closeSellerAddModal"
    @success="handleSellerAddSuccess"
  />
  
  <!-- Update Seller Modal -->
  <SellerUpdateModal
    :show="showSellerUpdateModal"
    :seller="selectedSellerForUpdate"
    @close="closeSellerUpdateModal"
    @success="handleSellerUpdateSuccess"
  />
  
  <!-- Delete Seller Modal -->
  <SellerDeleteModal
    :show="showSellerDeleteModal"
    :seller="selectedSellerForDelete"
    :selected-sellers="selectedSellersForDelete"
    :delete-type="deleteType"
    @close="closeSellerDeleteModal"
    @cancel="handleSellerDeleteCancel"
    @confirm="handleSellerDeleteConfirm"
  />
  
  <!-- Seller Detail Modal -->
  <SellerDetailModal
    :show="showSellerDetailModal"
    :seller="selectedSellerForDetail"
    @close="closeSellerDetailModal"
  />
  
  <!-- Filter Section -->
  <SellerFilter 
    :sellers="sellers"
    :loading="loading"
    @update:search="handleSearchUpdate"
    @update:selectedRole="handleRoleUpdate"
    @update:selectedStatus="handleStatusUpdate"
    @clear-filters="handleClearFilters"
    @delete-selected="handleDeleteSelected"
  />

  <!-- Seller Table -->
  <SellerTable 
    :sellers="paginatedSellers"
    :loading="loading"
    @update-seller="handleUpdateSeller"
    @delete-seller="handleDeleteSeller"
    @toggle-seller-status="handleToggleStatus"
    @select-all="handleSelectAll"
    @select-seller="handleSelectSeller"
    @view-seller-details="handleViewSellerDetails"
  />

  <!-- Pagination -->
  <Pagination
    :current-page="currentPage"
    :total-pages="totalPages"
    :total="total"
    :page-size="pageSize"
    @page-changed="handlePageChange"
  />
</template>