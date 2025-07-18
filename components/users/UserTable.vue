<script setup>
import { computed } from 'vue'

// Define props to receive data from parent
const props = defineProps({
  users: {
    type: Array,
    default: () => []
  },
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 20
  },
  isDeletedView: { type: Boolean, default: false }
})

// Define emits for parent communication
const emit = defineEmits([
  'update-user', 
  'delete-user',
  'restore-user',
  'permanent-delete',
  'toggle-status', 
  'toggle-all-selected', 
  'toggle-user-selected',
  'view-user'
])

const handleRestoreUser = (user) => {
  closeDropdown()
  emit('restore-user', user)
}

const viewUserDetails = (user) => {
  emit('view-user', user)
}

// Computed properties
const paginatedUsers = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize
  return props.users.slice(start, start + props.pageSize)
})

const allSelected = computed(() => {
  return paginatedUsers.value.length > 0 && paginatedUsers.value.every(user => user.selected)
})

const indeterminate = computed(() => {
  const selectedCount = paginatedUsers.value.filter(user => user.selected).length
  return selectedCount > 0 && selectedCount < paginatedUsers.value.length
})

const getUserRole = (user) => {
  if (user.is_superuser) return 'Administrator'
  if (user.role === 'seller') return 'seller'
  return 'customer'
}

// Helper function to get role badge styling
const getRoleBadgeClass = (user) => {
  const role = getUserRole(user)
  
  switch(role) {
    case 'Administrator':
      return 'px-4 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded'
    case 'seller':
      return 'px-4 py-1 text-xs font-medium bg-green-100 text-green-800 rounded'
    case 'customer':
    default:
      return 'px-4 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded'
  }
}

// Helper function to get role display name
const getRoleDisplayName = (user) => {
  const role = getUserRole(user)
  
  switch(role) {
    case 'Administrator':
      return 'Administrator'
    case 'seller':
      return 'Seller'
    case 'customer':
    default:
      return 'Customer'
  }
}

const getStatusText = (user) => {
  if (user.is_deleted) return 'Deleted'
  if (user.is_active) return 'Active'
  return 'Suspended'
}

const getStatusBadgeClass = (user) => {
  if (user.is_deleted) return 'text-red-600'
  if (user.is_active) return 'text-green-600'
  return 'text-yellow-600'
}

const openDropdownId = ref(null)

const toggleDropdown = (userId) => {
  if (openDropdownId.value === userId) {
    openDropdownId.value = null
  } else {
    openDropdownId.value = userId
  }
}

// Close dropdown when clicking outside
const closeDropdown = () => {
  openDropdownId.value = null
}

// Handle update user
const handleUpdateUser = (user) => {
  closeDropdown()
  emit('update-user', user)
}

// Handle delete user
const handleDeleteUser = (user) => {
  closeDropdown()
  if (props.isDeletedView) {
    // In deleted view, emit permanent-delete
    emit('permanent-delete', user)
  } else {
    // In normal view, emit regular delete (soft delete)
    emit('delete-user', user)
  }
}

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})

// Event handlers
const toggleUserSelected = (user) => {
  emit('toggle-user-selected', user)
}

const toggleUserActive = (user) => {
  emit('toggle-status', user)
}

const openUpdateModal = (user) => {
  emit('update-user', user)
}

const openDeleteModal = (user) => {
  emit('delete-user', user)
}

const toggleAllUsers = () => {
  const newValue = !allSelected.value
  emit('toggle-all-selected', newValue)
}

// Toggle individual user selection
const toggleUserSelection = (user) => {
  emit('toggle-user-selected', user)
}

// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
</script>

<template>
<!-- User Table -->
  <div class="bg-white rounded-lg">
    <table v-if="paginatedUsers.length > 0" class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th scope="col" class="p-4">
            <div class="flex items-center">
              <input 
                :id="`checkbox-all-${isDeletedView ? 'deleted' : 'active'}`"
                type="checkbox" 
                :checked="allSelected"
                :indeterminate="indeterminate"
                @change="toggleAllUsers"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2">
              <label :for="`checkbox-all-${isDeletedView ? 'deleted' : 'active'}`" class="sr-only">Select all</label>
            </div>
          </th>
          <th scope="col" class="p-4 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
          <th scope="col" class="p-4 text-left text-xs font-medium text-gray-500 uppercase">Avatar & Name</th>
          <th scope="col" class="p-4 text-left text-xs font-medium text-gray-500 uppercase">User Email</th>
          <th scope="col" class="p-4 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
          <th scope="col" class="p-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          <th scope="col" class="p-4 text-left text-xs font-medium text-gray-500 uppercase">Joined Date</th>
          <th scope="col" class="p-4 text-center text-xs font-medium text-gray-500 uppercase">Action</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr 
          v-for="user in paginatedUsers" 
          :key="user.user_id"
          class="hover:bg-gray-50 cursor-pointer"
          @click="viewUserDetails(user)"
        >
          <td class="px-4 py-3" @click.stop>
            <input
              class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300"
              type="checkbox" 
              :checked="user.selected"
              @change="toggleUserSelected(user)"
            />
          </td>
          <td class="px-4 py-3 font-semibold">{{ user.user_id }}</td>
          <td class="px-4 py-3">
            <div class="flex items-center">
              <img :src="user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_name)}`" 
              class="w-8 h-8 rounded-full mr-3" :alt="user.user_name" />
              <div>
                <div class="font-semibold">{{ user.user_name }}</div>
                <div v-if="user.first_name || user.last_name" class="text-sm text-gray-500">
                  {{ user.first_name }} {{ user.last_name }}
                </div>
              </div>
            </div>
          </td>
          <td class="px-4 py-3 font-semibold">{{ user.user_email }}</td>
          <td class="px-4 py-3">
            <span :class="getRoleBadgeClass(user)">
              {{ getRoleDisplayName(user) }}
            </span>
          </td>
          <td class="p-4 text-base font-medium whitespace-nowrap">
            <div class="flex items-center">
              <label class="inline-flex items-center cursor-pointer" @click.stop>
                <input
                  type="checkbox"
                  class="sr-only peer"
                  :checked="user.is_active"
                  @change.stop="toggleUserActive(user)"
                />
                <div
                  class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all peer-checked:bg-green-600">
                </div>
                <span class="ml-3 text-sm font-medium" :class="getStatusBadgeClass(user)">
                  {{ getStatusText(user) }}
                </span>
              </label>
            </div>
          </td>
          <td class="px-4 py-3 font-semibold">{{ formatDate(user.created_at) }}</td>
          <td class="p-4 space-x-2 whitespace-nowrap" @click.stop>
            <div class="flex justify-center items-center">
              <!-- Dropdown container -->
              <div class="relative inline-block text-left">
                <!-- Ellipsis button -->
                <button 
                  type="button" 
                  @click.stop="toggleDropdown(user.user_id)"
                  class="inline-flex items-center justify-center w-8 h-8 text-gray-400 bg-transparent border-0 rounded-lg hover:text-gray-900 hover:bg-gray-100 focus:ring-4 focus:ring-gray-300"
                  :id="`dropdown-button-${user.user_id}`"
                  aria-expanded="false"
                  aria-haspopup="true">
                  <span class="sr-only">Open dropdown</span>
                  <!-- Three dots icon -->
                  <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 3">
                    <path d="M2 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm6.041 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM14 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z"/>
                  </svg>
                </button>
                
                <!-- Dropdown menu -->
                <div 
                  v-show="openDropdownId === user.user_id"
                  :id="`dropdown-${user.user_id}`"
                  class="absolute right-0 z-10 mt-2 w-44 bg-white divide-y divide-gray-100 rounded-lg shadow-lg border border-gray-200"
                  role="menu"
                  :aria-labelledby="`dropdown-button-${user.user_id}`">
                  <ul class="py-2 text-sm text-gray-700" role="none">
                    
                    <!-- Restore option (only show in deleted view) -->
                    <li v-if="isDeletedView" role="none">
                      <button 
                        type="button"
                        @click.stop="handleRestoreUser(user)"
                        class="flex items-center w-full px-4 py-2 text-left text-green-600 hover:bg-green-50 focus:bg-green-50"
                        role="menuitem">
                        <svg class="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
                        </svg>
                        Restore & Enable
                      </button>
                    </li>

                    <!-- Update option (only show in normal view, NOT in deleted view) -->
                    <li v-if="!isDeletedView" role="none">
                      <button 
                        type="button"
                        @click.stop="handleUpdateUser(user)"
                        class="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100"
                        role="menuitem">
                        <svg class="w-4 h-4 mr-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path>
                          <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path>
                        </svg>
                        Update
                      </button>
                    </li>

                    <!-- Delete option (show in both views but with different text) -->
                    <li role="none">
                      <button 
                        type="button"
                        @click.stop="handleDeleteUser(user)"
                        class="flex items-center w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 focus:bg-red-50"
                        role="menuitem">
                        <svg class="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                        {{ isDeletedView ? 'Permanently Delete' : 'Delete' }}
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- No users found message -->
    <div v-else class="flex flex-col items-center justify-center py-16 px-6">
      <!-- Icon -->
      <div class="flex items-center justify-center w-16 h-16 mb-6 bg-gray-100 rounded-full">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
        </svg>
      </div>
      
      <!-- Main Message -->
      <h3 class="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
      
      <!-- Description -->
      <p class="text-gray-500 text-center mb-6 max-w-sm">
        <span v-if="isDeletedView">
          No deleted users found.
        </span>
        <span v-else>
          No users match your current search and filter criteria.
        </span>
      </p>
    </div>
  </div>
</template>