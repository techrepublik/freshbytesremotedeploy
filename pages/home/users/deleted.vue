<script setup>
import UserHeader from '~/components/users/UserHeader.vue';
import UserDeletedFilter from '~/components/users/UserDeletedFilter.vue';
import UserTable from '~/components/users/UserTable.vue';
import UserDeleteModal from '~/components/users/UserDeleteModal.vue';
import UserOpenModal from '~/components/users/UserOpenModal.vue';
import { ref, watch, computed, onMounted } from 'vue'

definePageMeta({
  layout: 'home',
})

const config = useRuntimeConfig();
const api = config.public.API_LINK;

function clearFilters() {
  searchTerm.value = ''
  selectedRole.value = ''
}

// Filter states
const searchTerm = ref('')
const selectedRole = ref('')

const showDeleteModal = ref(false)
const userToDelete = ref(null)
const usersToDelete = ref([])

// Function to get auth headers
const getAuthHeaders = () => {
  const accessTokenCookie = useCookie('auth-access-token')
  const token = accessTokenCookie.value
  
  return token ? {
    Authorization: `Bearer ${token}`
  } : {}
}

// Fetch deleted users from your API
const { data, pending, error, refresh } = await useFetch(
  () => `${api}/api/users/?is_deleted=true`,
  { 
    server: false,
    headers: computed(() => getAuthHeaders()),
    onResponseError({ response }) {
      console.error('Deleted Users API Error:', response.status, response._data);
      if (response.status === 401) {
        navigateTo('/login');
      }
    }
  }
)

// Store all deleted users
const allUsers = ref([])
const loading = computed(() => pending.value)

// Pagination
const currentPage = ref(1)
const pageSize = 20

const getUserRole = (user) => {
  if (user.is_superuser) return 'administrator'
  if (user.role === 'seller') return 'seller'
  return 'customer'
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
watch([searchTerm, selectedRole], () => {
  currentPage.value = 1
})

// Watch for API data changes
watch(data, (val) => {
  if (val && Array.isArray(val) && val.length > 0) {
    allUsers.value = val
      .filter(u => u.is_deleted === true) // Only show deleted users
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
    allUsers.value = []
  }
}, { immediate: true })

// User details modal
const showUserDetailsModal = ref(false);
const selectedUserDetails = ref(null);

function openUserDetailsModal(user) {
  selectedUserDetails.value = user;
  showUserDetailsModal.value = true;
}

function closeUserDetailsModal() {
  showUserDetailsModal.value = false;
  selectedUserDetails.value = null;
}

// Restore user function
async function restoreUser(user) {
  try {
    await $fetch(`${api}/api/users/${user.user_id}/`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: {
        is_deleted: false,
        is_active: true // Enable user when restoring
      }
    });
    
    // Remove from deleted users list
    allUsers.value = allUsers.value.filter(u => u.user_id !== user.user_id);
    alert('User restored and enabled successfully!');
  } catch (error) {
    console.error('Failed to restore user:', error);
    alert('Failed to restore user. Please try again.');
  }
}

// Permanently delete user
function openDeleteModal(user) {
  userToDelete.value = user;
  usersToDelete.value = [];
  showDeleteModal.value = true;
}

function closeDeleteModal() {
  showDeleteModal.value = false;
  userToDelete.value = null;
  usersToDelete.value = [];
}

async function handleUserDeleteSuccess(deletedUsers) {
  if (Array.isArray(deletedUsers)) {
    // Bulk delete - remove from current view
    const deletedIds = deletedUsers.map(u => u.user_id);
    allUsers.value = allUsers.value.filter(u => !deletedIds.includes(u.user_id));
  } else {
    // Single user delete - remove from current view
    allUsers.value = allUsers.value.filter(u => u.user_id !== deletedUsers.user_id);
  }
  
  // Refresh the data to ensure consistency
  refresh();
}

async function permanentDeleteUser(user) {
  if (confirm(`Are you sure you want to PERMANENTLY delete user "${user.user_name}"? This action cannot be undone!`)) {
    try {
      // Use DELETE method to completely remove from database
      await $fetch(`${api}/api/users/deleted/${user.user_id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      // Remove from local array
      allUsers.value = allUsers.value.filter(u => u.user_id !== user.user_id);
      alert('User permanently deleted successfully!');
    } catch (error) {
      console.error('Failed to permanently delete user:', error);
      alert('Failed to permanently delete user. Please try again.');
    }
  }
}

// Update the bulk permanent delete function
// async function permanentBulkDelete() {
//   const selectedUsers = allUsers.value.filter(u => u.selected);
  
//   if (selectedUsers.length === 0) {
//     alert('No users selected for deletion.');
//     return;
//   }

//   if (confirm(`Are you sure you want to PERMANENTLY delete ${selectedUsers.length} user(s)? This action cannot be undone!`)) {
//     try {
//       // Delete each user permanently
//       const deletePromises = selectedUsers.map(user =>
//         $fetch(`${api}/api/users/deleted/${user.user_id}/`, {
//           method: 'DELETE',
//           headers: getAuthHeaders()
//         })
//       );

//       await Promise.all(deletePromises);
      
//       // Remove from local array
//       const deletedIds = selectedUsers.map(u => u.user_id);
//       allUsers.value = allUsers.value.filter(u => !deletedIds.includes(u.user_id));
      
//       alert(`${selectedUsers.length} user(s) permanently deleted successfully!`);
//     } catch (error) {
//       console.error('Failed to permanently delete users:', error);
//       alert('Failed to permanently delete some users. Please try again.');
//     }
//   }
// }

function openPermanentDeleteModal(user) {
  userToDelete.value = user;
  usersToDelete.value = [];
  showDeleteModal.value = true;
}

// Selection handlers
const toggleAllSelected = (value) => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  const visibleUsers = filteredUsers.value.slice(start, end)

  visibleUsers.forEach(visibleUser => {
    const userInAllUsers = allUsers.value.find(u => u.user_id === visibleUser.user_id)
    if (userInAllUsers) {
      userInAllUsers.selected = value
    }
  })
}

const toggleUserSelected = (user) => {
  // Find the user in the main allUsers array and toggle selection
  const userInAllUsers = allUsers.value.find(u => u.user_id === user.user_id)
  if (userInAllUsers) {
    userInAllUsers.selected = !userInAllUsers.selected
  }
}

function openBulkPermanentDeleteModal() {
  const selectedUsers = allUsers.value.filter(u => u.selected)
  if (selectedUsers.length === 0) {
    alert('Please select users to delete.')
    return
  }
  
  console.log('Opening bulk permanent delete modal for:', selectedUsers.length, 'users')
  userToDelete.value = null
  usersToDelete.value = selectedUsers
  showDeleteModal.value = true
}

function resetUserSelections() {
  allUsers.value.forEach(user => {
    user.selected = false;
  });
}

</script>

<template>
  <Loading :loading="loading" />
  
  <!-- Header -->
  <UserHeader 
    title="Deleted Users"
    :breadcrumb-items="[
      { text: 'Home', link: '/home' },
      { text: 'Users', link: '/home/users' },
      { text: 'Deleted', link: '#' }
    ]"
    :show-add-button="false" />

  <!-- User Details Modal -->
  <UserOpenModal
    :show="showUserDetailsModal"
    :user="selectedUserDetails"
    @close="closeUserDetailsModal"
  />

  <!-- Delete User Modal (for permanent deletion) -->
  <UserDeleteModal 
    :show="showDeleteModal" 
    :userToDelete="userToDelete" 
    :usersToDelete="usersToDelete"
    :isPermanentDelete="true"
    @close="closeDeleteModal" 
    @confirm="handleUserDeleteSuccess"
    @reset-selections="resetUserSelections" 
  />
  
  <!-- Use the new UserDeletedFilter component -->
  <UserDeletedFilter 
    :users="allUsers"
    v-model:search="searchTerm" 
    v-model:role="selectedRole"
    @delete-selected="openBulkPermanentDeleteModal"
    @clear-filters="clearFilters"
  />

  <!-- User Table with restore action -->
  <UserTable 
    :users="filteredUsers"
    :current-page="currentPage"
    :page-size="pageSize"
    :is-deleted-view="true"
    @restore-user="restoreUser"
    @delete-user="openPermanentDeleteModal"
    @permanent-delete="openPermanentDeleteModal"
    @toggle-all-selected="toggleAllSelected"
    @toggle-user-selected="toggleUserSelected"
    @view-user="openUserDetailsModal"
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