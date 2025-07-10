<script setup>
import { ref } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  userToDelete: { type: Object, default: null },
  usersToDelete: { type: Array, default: () => [] },
})

const emit = defineEmits(['close', 'confirm', 'reset-selections'])

const loading = ref(false)

const config = useRuntimeConfig();
const api = config.public.API_LINK;

// Computed to determine if we're in bulk delete mode
const isBulkDelete = computed(() => props.usersToDelete && props.usersToDelete.length > 0);

// Computed to get the count of users to delete
const deleteCount = computed(() => isBulkDelete.value ? props.usersToDelete.length : 1);

// Function to get auth headers
const getAuthHeaders = () => {
  const accessTokenCookie = useCookie('auth-access-token')
  const token = accessTokenCookie.value
  
  return token ? {
    Authorization: `Bearer ${token}`
  } : {}
}

function closeModal(resetSelections = true) {
  emit('close')
  
  // When canceling, also emit event to reset selections
  if (resetSelections && isBulkDelete.value) {
    emit('reset-selections')
  }
}

async function confirmDelete() {
  if ((!props.userToDelete && !isBulkDelete.value) || loading.value) return;
  
  loading.value = true
  try {
    if (isBulkDelete.value) {
      // Bulk delete
      await Promise.all(props.usersToDelete.map(user => 
        $fetch(`${api}/api/users/${user.user_id}/`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        })
      ));
      emit('confirm', props.usersToDelete);
    } else {
      // Single user delete
      await $fetch(`${api}/api/users/${props.userToDelete.user_id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      emit('confirm', props.userToDelete);
    }
    
    closeModal(false);
    alert(`${isBulkDelete.value ? 'Users' : 'User'} deleted successfully!`);
  } catch (error) {
    console.error('Failed to delete user(s):', error);
    alert('Failed to delete user(s). Please try again.');
  } finally {
    loading.value = false;
  }
}

// Helper function to determine user role for display
const getUserRole = (user) => {
  if (user.is_superuser) return 'Administrator'
  if (user.role === 'seller') return 'Seller'
  return 'Customer'
}
</script>

<template>
  <div v-if="show && (userToDelete || (usersToDelete && usersToDelete.length > 0))"
       class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30"
       @click.self="closeModal">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative"
         @click.stop>
      <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
              @click="closeModal" 
              aria-label="Close">
        &times;
      </button>
      
      <div class="text-center">
        <!-- Warning Icon -->
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ isBulkDelete ? `Delete ${deleteCount} Users` : 'Delete User' }}
        </h3>
        
        <!-- Single User Info -->
        <div v-if="!isBulkDelete && userToDelete" class="mb-4 p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-center mb-2">
            <img :src="userToDelete.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userToDelete.user_name)}`" 
                 class="w-10 h-10 rounded-full mr-3" 
                 :alt="userToDelete.user_name">
            <div>
              <div class="font-semibold text-gray-900">{{ userToDelete.user_name }}</div>
              <div class="text-sm text-gray-500">{{ userToDelete.user_email }}</div>
            </div>
          </div>
          <div class="text-xs text-gray-500">
            Role: {{ getUserRole(userToDelete) }} | 
            Status: {{ userToDelete.is_active ? 'Active' : 'Inactive' }}
          </div>
        </div>
        
        <!-- Bulk Users Info -->
        <div v-else-if="isBulkDelete" class="mb-4 p-3 bg-gray-50 rounded-lg text-left">
          <p class="font-medium mb-2">Selected users:</p>
          <div class="max-h-40 overflow-y-auto">
            <div v-for="user in usersToDelete" :key="user.user_id" 
                 class="flex items-center py-2 border-b border-gray-100 last:border-0">
              <img :src="user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_name)}&size=30`" 
                   class="w-6 h-6 rounded-full mr-2" 
                   :alt="user.user_name">
              <div class="text-sm">
                <span class="font-medium">{{ user.user_name }}</span>
                <span class="text-xs text-gray-500 ml-2">({{ getUserRole(user) }})</span>
              </div>
            </div>
          </div>
        </div>

        <p class="text-sm text-gray-500 mb-6">
          Are you sure you want to delete 
          {{ isBulkDelete ? 'these users' : 'this user' }}? 
          This action cannot be undone.
          All user data, including orders and history, will be permanently removed.
        </p>

        <!-- Action Buttons -->
        <div class="flex justify-center space-x-4">
          <button type="button" 
            @click="closeModal(true)"
            class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
            :disabled="loading">
              Cancel
          </button>
          <button type="button" 
                  @click="confirmDelete"
                  :disabled="loading"
                  class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
            <span v-if="loading">Deleting...</span>
            <span v-else>{{ isBulkDelete ? `Delete ${deleteCount} Users` : 'Delete User' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>