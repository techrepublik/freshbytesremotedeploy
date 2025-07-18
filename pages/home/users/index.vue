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

  // Filter states
  const searchTerm = ref('')
  const selectedRole = ref('')
  const selectedStatus = ref('')
  const accessToken = ref('')

  const showUserAddModal = ref(false)
  const showUserUpdateModal = ref(false)
  const showDeleteModal = ref(false)
  const userToUpdate = ref(null)
  const userToDelete = ref(null)
  const usersToDelete = ref(null)
  
  // Compose query string for API
  const queryString = computed(() => {
    const params = new URLSearchParams()
    if (searchTerm.value) params.append('search', searchTerm.value)
    if (selectedRole.value) params.append('role', selectedRole.value)
    if (selectedStatus.value) params.append('status', selectedStatus.value)
    return params.toString() ? `?${params.toString()}` : ''
  })

  // Function to get auth headers
  const getAuthHeaders = () => {
    const accessTokenCookie = useCookie('auth-access-token')
    const token = accessTokenCookie.value || accessToken.value
    
    return token ? {
      Authorization: `Bearer ${token}`
    } : {}
  }

  // Fetch users from your API with filters
  const { data, pending, error, refresh } = await useFetch(
    () => `${api}/api/users/?is_deleted=false`,
    { 
      server: false,
      headers: computed(() => getAuthHeaders()),
      onResponseError({ response }) {
        console.error('Users API Error:', response.status, response._data);
        if (response.status === 401) {
          navigateTo('/login');
        }
      }
    }
  )

  // Store all users (unfiltered)
  const allUsers = ref([])
  const loading = computed(() => pending.value)

  // Pagination
  const currentPage = ref(1)
  const pageSize = 20

  const getUserRole = (user) => {
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
  if (val && Array.isArray(val) && val.length > 0) {
    allUsers.value = val
      .filter(u => u.is_deleted === false)
      .map(u => ({
        user_id: u.user_id,
        user_name: u.user_name,
        first_name: u.first_name || '',
        last_name: u.last_name || '',
        user_phone: u.user_phone || '',
        user_address: u.user_address || '',
        avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.user_name)}`,
        user_email: u.user_email,
        role: u.role || '',
        is_superuser: u.is_superuser || false,
        is_active: u.is_active || false,
        created_at: u.created_at,
        updated_at: u.updated_at,
        deleted_at: u.deleted_at,
        is_deleted: u.is_deleted,
        selected: false
      }))
  } else {
      // Add test data when no API data - with new role logic
      allUsers.value = Array.from({ length: 50 }, (_, i) => {
        let role, is_admin, is_superuser;
        
        // Create diverse test data
        if (i % 20 === 0) {
          // Super User (is_superuser: true)
          role = 'Administrator';
          is_superuser = true;
        } else if (i % 10 === 0) {
          // Seller
          role = 'seller';
          is_admin = false;
          is_superuser = false;
        } else {
          // Customer
          role = 'customer';
          is_admin = false;
          is_superuser = false;
        }
        
        return {
          user_id: `uid${String(i + 1).padStart(5, '0')}`,
          user_name: `user${i + 1}`,
          first_name: `First${i + 1}`,
          last_name: `Last${i + 1}`,
          user_phone: `+639${String(Math.floor(Math.random() * 100000000)).padStart(9, '0')}`,
          user_address: `${i + 1} Sample Street, Manila, Philippines`,
          avatar: `https://ui-avatars.com/api/?name=User${i + 1}`,
          user_email: `user${i + 1}@example.com`,
          role: role,
          status: i % 7 === 0 ? 'Suspended' : 'Active',
          is_superuser: is_superuser,
          is_active: i % 7 !== 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          selected: false
        }
      })
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
    showUserUpdateModal.value = false;  // Change from showUpdateModal to showUserUpdateModal
    userToUpdate.value = null;
  }

  function resetUserSelections() {
    // Uncheck all users
    allUsers.value.forEach(user => {
      user.selected = false;
    });
  }

  function handleUserUpdateSuccess() {
    manualRefresh(); // You might have a function like this
    closeUserUpdateModal();
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

  function handleUserAddSuccess() { 
    manualRefresh() // Only refresh when user is actually added
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