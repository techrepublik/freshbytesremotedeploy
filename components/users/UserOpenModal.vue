<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, required: true },
  user: { type: Object, default: null },
});

const emit = defineEmits(['close']);

function closeModal() {
  emit('close');
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

// Helper function to determine user role for display
const getUserRole = (user) => {
  if (!user) return '';
  if (user.is_superuser) return 'Administrator';
  if (user.role === 'seller') return 'Seller';
  return 'Customer';
}

// Get badge styling based on role
const getRoleBadgeClass = computed(() => {
  if (!props.user) return '';
  
  const role = getUserRole(props.user);
  
  switch(role) {
    case 'Administrator':
      return 'px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded';
    case 'Seller':
      return 'px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded';
    case 'Customer':
    default:
      return 'px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded';
  }
});

// Get status badge styling
const getStatusBadgeClass = computed(() => {
  if (!props.user) return '';
  
  return props.user.is_active
    ? 'px-3 py-1 text-xs font-medium bg-green-100 text-green-800 rounded'
    : 'px-3 py-1 text-xs font-medium bg-red-100 text-red-800 rounded';
});
</script>

<template>
  <div v-if="show && user"
       class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30"
       @click.self="closeModal">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto"
         @click.stop>
      <!-- Close button -->
      <button class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl"
              @click="closeModal" 
              aria-label="Close">
        &times;
      </button>
      
      <!-- User header with avatar -->
      <div class="flex items-center mb-6 pb-4 border-b border-gray-200">
        <div class="flex-shrink-0 mr-4">
          <img :src="user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_name)}&size=80`" 
               class="w-20 h-20 rounded-full object-cover border-2 border-gray-200" 
               :alt="user.user_name">
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900">{{ user.user_name }}</h2>
          <div class="text-gray-600">{{ user.first_name }} {{ user.last_name }}</div>
          <div class="mt-2 flex items-center space-x-2">
            <span :class="getRoleBadgeClass">{{ getUserRole(user) }}</span>
            <span :class="getStatusBadgeClass">{{ user.is_active ? 'Active' : 'Inactive' }}</span>
          </div>
        </div>
      </div>
      
      <!-- User details -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Contact Information -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="font-bold text-gray-700 mb-3 border-b pb-2">Contact Information</h3>
          <ul class="space-y-3">
            <li class="flex items-start">
              <span class="text-gray-500 w-24 flex-shrink-0">Email:</span>
              <span class="text-gray-900 font-medium">{{ user.user_email }}</span>
            </li>
            <li class="flex items-start">
              <span class="text-gray-500 w-24 flex-shrink-0">Phone:</span>
              <span class="text-gray-900 font-medium">{{ user.user_phone || 'Not provided' }}</span>
            </li>
            <li class="flex items-start">
              <span class="text-gray-500 w-24 flex-shrink-0">Address:</span>
              <span class="text-gray-900 font-medium break-words">{{ user.user_address || 'Not provided' }}</span>
            </li>
          </ul>
        </div>
        
        <!-- Account Information -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="font-bold text-gray-700 mb-3 border-b pb-2">Account Information</h3>
          <ul class="space-y-3">
            <li class="flex items-start">
              <span class="text-gray-500 w-24 flex-shrink-0">User ID:</span>
              <span class="text-gray-900 font-mono text-sm break-all">{{ user.user_id }}</span>
            </li>
            <li class="flex items-start">
              <span class="text-gray-500 w-24 flex-shrink-0">Role:</span>
              <span class="text-gray-900">{{ getUserRole(user) }}</span>
            </li>
            <li class="flex items-start">
              <span class="text-gray-500 w-24 flex-shrink-0">Status:</span>
              <span class="text-gray-900">{{ user.is_active ? 'Active' : 'Inactive' }}</span>
            </li>
            <li class="flex items-start">
              <span class="text-gray-500 w-24 flex-shrink-0">Admin:</span>
              <span class="text-gray-900">{{ user.is_superuser ? 'Yes' : 'No' }}</span>
            </li>
          </ul>
        </div>
        
        <!-- Timestamps -->
        <div class="bg-gray-50 p-4 rounded-lg md:col-span-2">
          <h3 class="font-bold text-gray-700 mb-3 border-b pb-2">Timestamps</h3>
          <ul class="space-y-3">
            <li class="flex items-start">
              <span class="text-gray-500 w-24 flex-shrink-0">Created:</span>
              <span class="text-gray-900">{{ formatDate(user.created_at) }}</span>
            </li>
            <li class="flex items-start">
              <span class="text-gray-500 w-24 flex-shrink-0">Updated:</span>
              <span class="text-gray-900">{{ formatDate(user.updated_at) }}</span>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Action buttons at the bottom -->
      <div class="mt-6 flex justify-end space-x-3">
        <button @click="closeModal"
                class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
          Close
        </button>
      </div>
    </div>
  </div>
</template>