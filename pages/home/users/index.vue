<script setup>
  import UserHeader from '~/components/users/UserHeader.vue';
  import UserFilter from '~/components/users/UserFilter.vue';
  import UserTable from '~/components/users/UserTable.vue';
  import UserAddModal from '~/components/users/UserAddModal.vue';
  import UserUpdateModal from '~/components/users/UserUpdateModal.vue';
  import UserDeleteModal from '~/components/users/UserDeleteModal.vue';
  import { ref, watch, computed, onMounted } from 'vue'

  definePageMeta({
    layout: 'home',
  })

  const config = useRuntimeConfig();
  const api = config.public.API_LINK;

  // Filter states
  const searchQuery = ref('')
  const selectedRole = ref('')
  const selectedStatus = ref('')
  const accessToken = ref('')

  const showUserAddModal = ref(false)
  const showUserUpdateModal = ref(false)
  const showUserDeleteModal = ref(false)
  const userToUpdate = ref(null)
  const userToDelete = ref(null)
  
  // Compose query string for API
  const queryString = computed(() => {
    const params = new URLSearchParams()
    if (searchQuery.value) params.append('search', searchQuery.value)
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
    () => `${api}/api/users/`,
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
    if (user.is_superuser) return 'superuser'
    if (user.is_admin) return 'admin'
    if (user.role === 'seller') return 'seller'
    return 'customer'
  }

  // Apply filters locally to allUsers
  const filteredUsers = computed(() => {
    let filtered = [...allUsers.value]

    // Apply search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(user => 
        user.user_name.toLowerCase().includes(query) ||
        user.user_email.toLowerCase().includes(query) ||
        (user.first_name && user.first_name.toLowerCase().includes(query)) ||
        (user.last_name && user.last_name.toLowerCase().includes(query))
      )
    }

    // Apply role filter
    if (selectedRole.value) {
      filtered = filtered.filter(user => {
        const userRole = getUserRole(user)
        return userRole === selectedRole.value.toLowerCase()
      })
    }

    // Apply status filter
    if (selectedStatus.value) {
      filtered = filtered.filter(user => user.status === selectedStatus.value)
    }

    return filtered
  })

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
  watch([searchQuery, selectedRole, selectedStatus], () => {
    currentPage.value = 1
  })

  // Watch for API data changes (only runs once when component loads)
  watch(data, (val) => {
    if (val && Array.isArray(val) && val.length > 0) {
      allUsers.value = val.map(u => ({
        user_id: u.user_id,
        user_name: u.user_name,
        first_name: u.first_name || '',
        last_name: u.last_name || '',
        user_phone: u.user_phone || '',
        user_address: u.user_address || '',
        avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.user_name)}`,
        user_email: u.user_email,
        role: u.role || '',
        status: u.is_active ? 'Active' : 'Inactive',
        is_admin: u.is_admin || false,
        is_superuser: u.is_superuser || false,
        is_active: u.is_active || false,
        created_at: u.created_at,
        updated_at: u.updated_at,
        selected: false
      }))
    } else {
      // Add test data when no API data - with new role logic
      allUsers.value = Array.from({ length: 50 }, (_, i) => {
        let role, is_admin, is_superuser;
        
        // Create diverse test data
        if (i % 20 === 0) {
          // Super User (is_superuser: true)
          role = 'superuser';
          is_admin = true;
          is_superuser = true;
        } else if (i % 10 === 0) {
          // Admin (is_admin: true, is_superuser: false)
          role = 'admin';
          is_admin = true;
          is_superuser = false;
        } else if (i % 5 === 0) {
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
          status: i % 7 === 0 ? 'Inactive' : 'Active',
          is_admin: is_admin,
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
    searchQuery.value = value
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

  function closeUserUpdateModal() {
    showUserUpdateModal.value = false
    userToUpdate.value = null
  }

  function openDeleteModal(user) {
    userToDelete.value = user
    showUserDeleteModal.value = true
  }

  function closeUserDeleteModal() {
    showUserDeleteModal.value = false
    userToDelete.value = null
  }

  function handleUserUpdateSuccess() {
    manualRefresh() // Only refresh when user is actually updated
    closeUserUpdateModal()
  }

  function handleUserDeleteSuccess(deletedUser) {
    // Remove from local array
    allUsers.value = allUsers.value.filter(u => u.user_id !== deletedUser.user_id)
    closeUserDeleteModal()
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

  async function toggleUserActive(user) {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active'
    try {
      await $fetch(`${api}/api/users/${user.user_id}/`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: { is_active: newStatus === 'Active' }
      })
      user.status = newStatus
      user.is_active = newStatus === 'Active'
    } catch (err) {
      alert('Failed to update status')
      console.error(err)
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

  const handleToggleAllSelected = (value) => {
    paginatedUsers.value.forEach(u => u.selected = value)
  }

  const handleToggleUserSelected = (user) => {
    user.selected = !user.selected
  }

  const handleUpdateUser = (user) => {
    editUser(user)
  }

  const handleDeleteUser = (user) => {
    openDeleteModal(user)
  }

  const handleToggleUserStatus = (user) => {
    toggleUserActive(user)
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

  <!-- Update User Modal -->
  <UserUpdateModal
    :show="showUserUpdateModal"
    :user-to-update="userToUpdate"
    @close="closeUserUpdateModal"
    @updated="handleUserUpdateSuccess"
  />

  <!-- Delete User Modal -->
  <UserDeleteModal
    :show="showUserDeleteModal"
    :user-to-delete="userToDelete"
    @close="closeUserDeleteModal"
    @confirm="handleUserDeleteSuccess"
  />
  
  <!-- UserFilter component -->
  <UserFilter 
    :users="filteredUsers"
    @update:search="handleSearchUpdate"
    @update:role="handleRoleUpdate" 
    @update:status="handleStatusUpdate"
    @delete-selected="handleDeleteSelected"
  />

  <!-- UserTable component -->
  <UserTable 
    :users="paginatedUsers"
    :current-page="currentPage"
    :page-size="pageSize"
    @toggle-all-selected="handleToggleAllSelected"
    @toggle-user-selected="handleToggleUserSelected"
    @update-user="handleUpdateUser"
    @delete-user="handleDeleteUser"
    @toggle-status="handleToggleUserStatus"
  />

  <!-- Pagination component -->
  <Pagination
    :current-page="currentPage"
    :total-pages="totalPages"
    :total="total"
    :page-size="pageSize"
    @page-changed="handlePageChange"
  />
  
  <!-- Footer -->
  <Footer />

</template>