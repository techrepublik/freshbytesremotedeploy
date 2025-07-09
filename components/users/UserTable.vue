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
  }
})

// Define emits for parent communication
const emit = defineEmits(['update-user', 'delete-user', 'toggle-status', 'toggle-all-selected', 'toggle-user-selected'])

// Computed properties
const paginatedUsers = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize
  return props.users.slice(start, start + props.pageSize)
})

const allSelected = computed({
  get: () => props.users.length > 0 && props.users.every(u => u.selected),
  set: (val) => {
    emit('toggle-all-selected', val)
  }
})

const getUserRole = (user) => {
  if (user.is_superuser) return 'superuser'
  if (user.is_admin) return 'admin'
  if (user.role === 'seller') return 'seller'
  return 'customer'
}

// Helper function to get role badge styling
const getRoleBadgeClass = (user) => {
  const role = getUserRole(user)
  
  switch(role) {
    case 'superuser':
      return 'px-4 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded'
    case 'admin':
      return 'px-4 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded'
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
    case 'superuser':
      return 'Super User'
    case 'admin':
      return 'Administrator'
    case 'seller':
      return 'Seller'
    case 'customer':
    default:
      return 'Customer'
  }
}

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
</script>

<template>
<!-- User Table -->
  <div class="overflow-x-auto bg-white rounded-lg">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-4 py-3 w-12 text-center align-middle">
            <input
              class="w-4 h-4 border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300"
              type="checkbox" 
              v-model="allSelected" 
            />
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
        <tr v-for="user in paginatedUsers" :key="user.user_id">
          <td class="px-4 py-3">
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
              <img :src="user.avatar" class="w-8 h-8 rounded-full mr-3" :alt="user.user_name" />
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
                  :checked="user.status === 'Active'"
                  @change.stop="toggleUserActive(user)"
                />
                <div
                  class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:w-5 after:h-5 after:transition-all peer-checked:bg-green-600">
                </div>
                <span class="ml-3 text-sm font-medium" :class="user.status === 'Active' ? 'text-green-600' : 'text-red-600'">
                  {{ user.status }}
                </span>
              </label>
            </div>
          </td>
          <td class="p-4 space-x-2 whitespace-nowrap">
            <div class="flex justify-center items-center space-x-2">
              <button type="button" @click.stop="openUpdateModal(user)"
                class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-[#29000] hover:text-white rounded-lg bg-primary-700 hover:bg-green-600 focus:ring-4 focus:ring-primary-300">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z">
                  </path>
                  <path fill-rule="evenodd"
                    d="M2 6a2 2 0 002-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                    clip-rule="evenodd"></path>
                </svg>
                Update
              </button>
              <button type="button" @click.stop="openDeleteModal(user)"
                class="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-red-700 rounded-lg hover:bg-red-800 focus:ring-4 focus:ring-red-300">
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd" />
                </svg>
                Delete item
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>