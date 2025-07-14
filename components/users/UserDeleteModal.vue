<script setup>
import { ref } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  userToDelete: { type: Object, default: null },
  usersToDelete: { type: Array, default: () => [] },
  isPermanentDelete: { type: Boolean, default: false }, // Add this prop
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
      if (props.isPermanentDelete) {
        // Hard delete - remove from database completely
        await Promise.all(props.usersToDelete.map(user => 
          $fetch(`${api}/api/users/deleted/${user.user_id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders()
          })
        ));
      } else {
        // Soft delete - mark as deleted
        await Promise.all(props.usersToDelete.map(user => 
          $fetch(`${api}/api/users/${user.user_id}/`, {
            method: 'PATCH',
            headers: {
              ...getAuthHeaders(),
              'Content-Type': 'application/json'
            },
            body: {
              is_deleted: true,
              is_active: false
            }
          })
        ));
      }
      emit('confirm', props.usersToDelete);
    } else {
      // Single user delete
      if (props.isPermanentDelete) {
        // Hard delete - remove from database completely
        await $fetch(`${api}/api/users/deleted/${props.userToDelete.user_id}/`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });
      } else {
        // Soft delete - mark as deleted
        await $fetch(`${api}/api/users/${props.userToDelete.user_id}/`, {
          method: 'PATCH',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json'
          },
          body: {
            is_deleted: true,
            is_active: false
          }
        });
      }
      emit('confirm', props.userToDelete);
    }
    
    closeModal(false);
    const action = props.isPermanentDelete ? 'permanently deleted' : 'deleted';
    alert(`${isBulkDelete.value ? 'Users' : 'User'} ${action} successfully!`);
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
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full mb-4"
             :class="isPermanentDelete ? 'bg-red-100' : 'bg-red-100'">
          <svg class="h-6 w-6" :class="isPermanentDelete ? 'text-red-600' : 'text-red-600'" 
               fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ isPermanentDelete ? 'Permanently ' : '' }}Delete {{ isBulkDelete ? `${deleteCount} Users` : 'User' }}
        </h3>
        
        <!-- Permanent Delete Warning -->
        <div v-if="isPermanentDelete" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-sm text-red-800 font-medium">
            ⚠️ PERMANENT DELETION WARNING
          </p>
          <p class="text-xs text-red-700 mt-1">
            This will completely remove the user(s) from the database. This action cannot be undone!
          </p>
        </div>
        
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
            Status: {{ userToDelete.is_active ? 'Active' : 'Suspended' }}
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
          {{ isPermanentDelete 
            ? `Are you sure you want to permanently delete ${isBulkDelete ? 'these users' : 'this user'}? This will completely remove all data from the database and cannot be undone.`
            : `Are you sure you want to delete ${isBulkDelete ? 'these users' : 'this user'}? ${isBulkDelete ? 'They' : 'The user'} will be moved to deleted users and can be restored later.`
          }}
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
                  :class="isPermanentDelete 
                    ? 'px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed'
                    : 'px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed'">
            <span v-if="loading">{{ isPermanentDelete ? 'Permanently Deleting...' : 'Deleting...' }}</span>
            <span v-else>{{ isPermanentDelete ? 'Permanently ' : '' }}Delete {{ isBulkDelete ? `${deleteCount} Users` : 'User' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>