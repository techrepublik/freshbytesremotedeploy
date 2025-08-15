<script setup>
  import UserHeader from '~/components/users/UserHeader.vue';
  import UserFilter from '~/components/users/UserFilter.vue';
  import UserTable from '~/components/users/UserTable.vue';
  import UserAddModal from '~/components/users/UserAddModal.vue';
  import UserUpdateModal from '~/components/users/UserUpdateModal.vue';
  import UserDeleteModal from '~/components/users/UserDeleteModal.vue';
  import UserOpenModal from '~/components/users/UserOpenModal.vue';
  import { ref, watch, computed, onMounted } from 'vue'

  definePageMeta({
    layout: 'home',
  })

  const config = useRuntimeConfig();
  const api = config.public.API_LINK;
  const { accessToken } = useAuth() // Use the auth composable

  // Filter states
  const searchTerm = ref('')
  const selectedRole = ref('')
  const selectedStatus = ref('')

  const showUserAddModal = ref(false)
  const showUserUpdateModal = ref(false)
  const showDeleteModal = ref(false)
  const userToUpdate = ref(null)
  const userToDelete = ref(null)
  const usersToDelete = ref(null)
  
  // Function to get auth headers - use the auth composable
  const getAuthHeaders = () => {
    const token = accessToken.value
    if (!token) {
      console.warn('No access token available')
      navigateTo('/login')
      return {}
    }
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  // Fetch users from your API with filters
  const { data, pending, error, refresh } = await useFetch(
    () => `${api}/api/users/?is_deleted=false`,
    { 
      server: false,
      headers: computed(() => getAuthHeaders()),
      transform: (response) => {
        console.log('Transform input:', response)
        // Handle different response formats
        if (Array.isArray(response)) {
          return response
        } else if (response.results && Array.isArray(response.results)) {
          return response.results
        } else if (response.data && Array.isArray(response.data)) {
          return response.data
        }
        return response
      },
      onResponseError({ response }) {
        console.error('Users API Error:', response.status, response._data);
        if (response.status === 401) {
          console.log('Unauthorized - redirecting to login')
          navigateTo('/login');
        } else if (response.status === 403) {
          console.log('Forbidden - insufficient permissions')
          alert('You do not have permission to access user data')
        }
      },
      // Add retry logic for failed requests
      retry: 1,
      retryDelay: 1000
    }
  )

  // Add this to your script setup in pages/home/users/index.vue
  onMounted(async () => {
    console.log('Access token:', accessToken.value)
    console.log('API endpoint:', `${api}/api/users/?is_deleted=false`)
    
    // Validate API connection first
    const isConnected = await validateApiConnection()
    if (!isConnected) {
      console.log('API connection failed, skipping data fetch')
      return
    }
    
    // Test the API call directly
    try {
      const testResponse = await $fetch(`${api}/api/users/?is_deleted=false`, {
        headers: getAuthHeaders()
      })
      console.log('Direct API test response:', testResponse)
    } catch (testError) {
      console.error('Direct API test error:', testError)
    }
    
    console.log('useFetch data:', data.value)
    console.log('useFetch error:', error.value)
  })

  // Store all users (unfiltered)
  const allUsers = ref([])
  const loading = computed(() => pending.value)

  // Pagination
  const currentPage = ref(1)
  const pageSize = 20

  const getUserRole = (user) => {
    if (user.display_role) {
      return user.display_role
    }
    
    // Fallback logic
    if (user.is_superuser) return 'Administrator'
    if (user.role === 'seller') return 'Seller'
    return 'Customer'
  }

  const getUserStatus = (user) => {
    if (user.is_deleted) return 'Deleted'
    if (user.is_active) return 'Active'
    return 'Suspended'
  }

  // Apply filters locally to allUsers
  const filteredUsers = computed(() => {
    let filtered = [...allUsers.value]

    // Apply search filter
    if (searchTerm.value) {
      const searchLower = searchTerm.value.toLowerCase();
      filtered = filtered.filter(user => {
        return user.user_name?.toLowerCase().includes(searchLower) || 
               user.user_email?.toLowerCase().includes(searchLower) ||
               user.first_name?.toLowerCase().includes(searchLower) || 
               user.last_name?.toLowerCase().includes(searchLower);
      });
    }
    
    // Apply role filter
    if (selectedRole.value) {
      filtered = filtered.filter(user => {
        const userRole = getUserRole(user);
        return userRole.toLowerCase() === selectedRole.value.toLowerCase();
      });
    }
    
    // Apply status filter
    if (selectedStatus.value) {
      if (selectedStatus.value === 'Active') {
        filtered = filtered.filter(user => user.is_active === true && user.is_deleted === false);
      } else if (selectedStatus.value === 'Suspended') {
        filtered = filtered.filter(user => user.is_active === false && user.is_deleted === false);
      }
    }
    
    return filtered;
  });

  // Paginate the filtered results
  const paginatedUsers = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return filteredUsers.value.slice(start, start + pageSize)
  })

  const total = computed(() => filteredUsers.value.length)
  const totalPages = computed(() => Math.ceil(total.value / pageSize))

  function handlePageChange(page) {
    currentPage.value = page
  }

  // Reset pagination when filters change
  watch([searchTerm, selectedRole, selectedStatus], () => {
    currentPage.value = 1
  })

  // Watch for API data changes (only runs once when component loads)
  watch(data, (val) => {
    console.log('Raw API data:', val)
    console.log('API data type:', typeof val)
    console.log('Is array:', Array.isArray(val))
    
    if (val) {
      // Handle different response formats
      let users = []
      if (Array.isArray(val)) {
        users = val
      } else if (val.results && Array.isArray(val.results)) {
        users = val.results
      } else if (val.data && Array.isArray(val.data)) {
        users = val.data
      }
      
      console.log('Extracted users:', users)
      
      if (users.length > 0) {
        allUsers.value = users
          .filter(u => u.is_deleted === false)
          .map(u => {
            // Determine the correct role display
            let displayRole = ''
            if (u.is_superuser) {
              displayRole = 'Administrator'
            } else if (u.role === 'seller') {
              displayRole = 'Seller'
            } else {
              displayRole = 'Customer'
            }

            return {
              user_id: u.user_id,
              user_name: u.user_name || '',
              first_name: u.first_name || '',
              last_name: u.last_name || '',
              user_phone: u.user_phone || '',
              user_address: u.user_address || '',
              street: u.street || '',
              barangay: u.barangay || '',
              city: u.city || '',
              province: u.province || '',
              zip_code: u.zip_code || '',
              avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.user_name || 'User')}`,
              user_email: u.user_email || '',
              role: u.role || 'customer', // Store the actual backend role
              display_role: displayRole, // Store the display role
              is_superuser: u.is_superuser || false,
              is_staff: u.is_staff || false,
              is_active: u.is_active || false,
              created_at: u.created_at,
              updated_at: u.updated_at,
              deleted_at: u.deleted_at,
              is_deleted: u.is_deleted || false,
              selected: false
            }
          })
        console.log('Processed users:', allUsers.value)
      } else {
        console.log('No users found in response')
        allUsers.value = []
      }
    } else {
      console.log('No data received from API')
      allUsers.value = []
    }
  }, { immediate: true })

  // Handle filter updates from UserFilter component
  const handleSearchUpdate = (value) => {
    searchTerm.value = value
  }

  const handleRoleUpdate = (value) => {
    selectedRole.value = value
  }

  const handleStatusUpdate = (value) => {
    selectedStatus.value = value
  }

  const handleDeleteSelected = () => {
    deleteSelectedUsers()
  }

  // Only refresh manually when needed (like after adding/updating users)
  function manualRefresh() {
    refresh()
  }

  const allSelected = computed({
    get: () => paginatedUsers.value.length > 0 && paginatedUsers.value.every(u => u.selected),
    set: (val) => {
      paginatedUsers.value.forEach(u => u.selected = val)
    }
  })

  const anySelected = computed(() => allUsers.value.some(u => u.selected))
  const selectedCount = computed(() => allUsers.value.filter(u => u.selected).length)

  function editUser(user) {
    userToUpdate.value = user
    showUserUpdateModal.value = true
  }

  function openUserUpdateModal(user) {
    userToUpdate.value = user;
    showUserUpdateModal.value = true;
  }

  function openDeleteModal(user) {
    userToDelete.value = user;
    usersToDelete.value = [];
    showDeleteModal.value = true
  }

  function closeUserUpdateModal() {
    showUserUpdateModal.value = false;
    userToUpdate.value = null;
  }

  function resetUserSelections() {
    // Uncheck all users
    allUsers.value.forEach(user => {
      user.selected = false;
    });
  }

  // Function to open modal for bulk deletion
  function openBulkDeleteModal() {
    userToDelete.value = null;
    usersToDelete.value = allUsers.value.filter(u => u.selected);
    showDeleteModal.value = true;
  }

  // Function to close the delete modal
  function closeDeleteModal() {
    showDeleteModal.value = false;
    userToDelete.value = null;
    usersToDelete.value = [];
  }

  function handleUserDeleteSuccess(deletedUsers) {
    if (Array.isArray(deletedUsers)) {
      // Bulk delete
      const deletedIds = deletedUsers.map(u => u.user_id);
      allUsers.value = allUsers.value.filter(u => !deletedIds.includes(u.user_id));
    } else {
      // Single user delete
      allUsers.value = allUsers.value.filter(u => u.user_id !== deletedUsers.user_id);
    }
  }

  // Add these refs to your existing code
  const showUserDetailsModal = ref(false);
  const selectedUserDetails = ref(null);

  // Add this function to open the user details modal
  function openUserDetailsModal(user) {
    selectedUserDetails.value = user;
    showUserDetailsModal.value = true;
  }

  // Add this function to close the user details modal
  function closeUserDetailsModal() {
    showUserDetailsModal.value = false;
    selectedUserDetails.value = null;
  }
  
  async function deleteUser(user) {
    if (confirm(`Are you sure you want to delete user "${user.user_name}"?`)) {
      try {
        await $fetch(`${api}/api/users/${user.user_id}/`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })
        
        // Remove from local array
        allUsers.value = allUsers.value.filter(u => u.user_id !== user.user_id)
        alert('User deleted successfully!')
      } catch (error) {
        console.error('Failed to delete user:', error)
        alert('Failed to delete user. Please try again.')
      }
    }
  }
  
  async function deleteSelectedUsers() {
    const selectedUsers = allUsers.value.filter(u => u.selected)
    if (confirm(`Are you sure you want to delete ${selectedUsers.length} selected user(s)?`)) {
      try {
        // Delete each selected user
        await Promise.all(selectedUsers.map(user => 
          $fetch(`${api}/api/users/${user.user_id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders()
          })
        ))
        
        // Remove from local array
        allUsers.value = allUsers.value.filter(u => !u.selected)
        alert(`${selectedUsers.length} user(s) deleted successfully!`)
      } catch (error) {
        console.error('Failed to delete users:', error)
        alert('Failed to delete some users. Please try again.')
      }
    }
  }

  async function toggleUserStatus(user) {
    try {
      // Toggle between Active and Suspended (not deleted)
      const newStatus = !user.is_active;
      
      // Call the API to update the status
      await $fetch(`${api}/api/users/${user.user_id}/`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: {
          is_active: newStatus
          // is_deleted stays false for current users
        }
      });
      
      // Update locally only after successful API call
      user.is_active = newStatus;
      
      console.log(`User ${user.user_name} status updated to ${newStatus ? 'Active' : 'Suspended'}`);
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert('Failed to update user status. Please try again.');
    }
  }

  const handleAddUser = () => {
    openUserAddModal()
  }

  function openUserAddModal() {
    showUserAddModal.value = true
  }

  function closeUserAddModal() {
    showUserAddModal.value = false
  }

  const toggleAllSelected = (value) => {
    paginatedUsers.value.forEach(u => u.selected = value)
  }

  const toggleUserSelected = (user) => {
    user.selected = !user.selected
  }

  const handleUpdateUser = (user) => {
    editUser(user)
  }

  const handleDeleteUser = (user) => {
    openDeleteModal(user)
  }

  function handleUserAddSuccess(newUser) { 
    console.log('New user added:', newUser)
    
    // Add the new user to the local state immediately if newUser is provided
    if (newUser && newUser.user_id) {
      // Determine display role
      let displayRole = ''
      if (newUser.is_superuser) {
        displayRole = 'Administrator'
      } else if (newUser.role === 'seller') {
        displayRole = 'Seller'
      } else {
        displayRole = 'Customer'
      }

      const userForList = {
        user_id: newUser.user_id,
        user_name: newUser.user_name || '',
        first_name: newUser.first_name || '',
        last_name: newUser.last_name || '',
        user_phone: newUser.user_phone || '',
        user_address: newUser.user_address || '',
        street: newUser.street || '',
        barangay: newUser.barangay || '',
        city: newUser.city || '',
        province: newUser.province || '',
        zip_code: newUser.zip_code || '',
        avatar: newUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.user_name)}`,
        user_email: newUser.user_email || '',
        role: newUser.role || 'customer',
        display_role: displayRole,
        is_superuser: newUser.is_superuser || false,
        is_staff: newUser.is_staff || false,
        is_active: newUser.is_active || false,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at,
        deleted_at: newUser.deleted_at,
        is_deleted: newUser.is_deleted || false,
        selected: false
      }
      
      // Add to beginning of list
      allUsers.value.unshift(userForList)
    }
    
    // Refresh from API to ensure consistency
    manualRefresh()
    
    // Close modal
    closeUserAddModal()
  }

  function handleUserUpdateSuccess(updatedUser) {
  console.log('User updated:', updatedUser)
  
  if (updatedUser && updatedUser.user_id) {
    // Find and update the user in the local array
    const index = allUsers.value.findIndex(u => u.user_id === updatedUser.user_id)
    
    if (index !== -1) {
      // Determine display role
      let displayRole = ''
      if (updatedUser.is_superuser) {
        displayRole = 'Administrator'
      } else if (updatedUser.role === 'seller') {
        displayRole = 'Seller'
      } else {
        displayRole = 'Customer'
      }

      // Update the user with all the new data
      allUsers.value[index] = {
        ...allUsers.value[index], // Keep existing data
        ...updatedUser, // Overwrite with updated data
        display_role: displayRole,
        selected: false // Reset selection state
      }
      
      console.log('User updated in local state:', allUsers.value[index])
    } else {
      console.warn('User not found in local array, refreshing data')
      // If user not found locally, refresh from API
      manualRefresh()
    }
  }
  
  // Close modal
  closeUserUpdateModal()
}

  // Add this function to your existing script
  const forceRefresh = async () => {
    apiLoading.value = true
    try {
      console.log('Force refreshing data...')
      await refresh()
      console.log('Data after refresh:', data.value)
      
      if (!data.value || (Array.isArray(data.value) && data.value.length === 0)) {
        console.warn('No data received after refresh')
        // Show user-friendly message
        alert('No user data available. Please check your connection and try again.')
      }
    } catch (error) {
      console.error('Force refresh failed:', error)
      await handleApiError(error)
    } finally {
      apiLoading.value = false
    }
  }

  // Add this function to validate API connectivity
  const validateApiConnection = async () => {
    if (!accessToken.value) {
      console.error('No access token available')
      navigateTo('/login')
      return false
    }
    
    try {
      // Test API connectivity with a simple call
      await $fetch(`${api}/api/users/me/`, {
        headers: getAuthHeaders()
      })
      return true
    } catch (error) {
      console.error('API connection failed:', error)
      if (error.status === 401) {
        navigateTo('/login')
      }
      return false
    }
  }

  // Add this function to handle token refresh
  const handleApiError = async (error) => {
    if (error.status === 401) {
      console.log('Token expired, attempting refresh...')
      try {
        const { refreshAccessToken } = useAuth()
        await refreshAccessToken()
        
        // Retry the original request
        await refresh()
        console.log('Token refreshed successfully')
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError)
        navigateTo('/login')
      }
    }
  }

</script>

<template>
  <Loading :loading="loading" />
  
  <!-- Use the Header component -->
  <UserHeader 
    title="All Users"
    :breadcrumb-items="[
      { text: 'Home', link: '/home' },
      { text: 'Users', link: '#' }
    ]"
    add-button-text="Add new user" @add-clicked="handleAddUser" />

  <!-- Add Product Modal -->
  <UserAddModal
    :show="showUserAddModal"
    @close="closeUserAddModal"
    @success="handleUserAddSuccess"
  />

  <!-- User Details Modal -->
  <UserOpenModal
    :show="showUserDetailsModal"
    :user="selectedUserDetails"
    @close="closeUserDetailsModal"
  />

  <!-- Update User Modal -->
  <UserUpdateModal
    :show="showUserUpdateModal"
    :userToUpdate="userToUpdate"
    @close="closeUserUpdateModal"
    @updated="handleUserUpdateSuccess"
  />

  <!-- Delete User Modal -->
  <UserDeleteModal 
    :show="showDeleteModal" 
    :userToDelete="userToDelete" 
    :usersToDelete="usersToDelete"
    :isPermanentDelete="false"
    @close="closeDeleteModal" 
    @confirm="handleUserDeleteSuccess"
    @reset-selections="resetUserSelections" 
  />
  
  <!-- UserFilter component -->
  <UserFilter 
    :users="allUsers" 
    v-model:search="searchTerm" 
    v-model:role="selectedRole"
    v-model:status="selectedStatus"
    @delete-selected="openBulkDeleteModal" 
  />

  <!-- UserTable component -->
  <UserTable 
    :users="filteredUsers"
    :current-page="currentPage"
    :page-size="pageSize"
    @update-user="openUserUpdateModal"
    @delete-user="openDeleteModal"
    @toggle-status="toggleUserStatus"
    @toggle-all-selected="toggleAllSelected"
    @toggle-user-selected="toggleUserSelected"
    @view-user="openUserDetailsModal"
  />

  <!-- Pagination component -->
  <Pagination
    :current-page="currentPage"
    :total-pages="totalPages"
    :total="total"
    :page-size="pageSize"
    @page-changed="handlePageChange"
  />
</template>