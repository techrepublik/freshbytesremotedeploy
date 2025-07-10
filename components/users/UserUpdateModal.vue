<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, required: true },
  userToUpdate: { type: Object, default: () => null },
});

const emit = defineEmits(['close', 'updated']);

const config = useRuntimeConfig();
const api = config.public.API_LINK;

// Function to get auth headers
const getAuthHeaders = () => {
  const accessTokenCookie = useCookie('auth-access-token')
  const token = accessTokenCookie.value
  
  return token ? {
    Authorization: `Bearer ${token}`
  } : {}
}

// Make a local editable copy of the user
const editedUser = ref({
  user_id: null,
  user_name: '',
  first_name: '',
  last_name: '',
  user_email: '',
  password: '',
  confirmPassword: '',
  user_phone: '',
  user_address: '',
  avatar: '',
  role: '',
  is_superuser: false,
  is_active: true
});

// Avatar upload handling
const avatarInput = ref(null);
const avatarPreview = ref('');

// Watch for prop changes
watch(() => props.userToUpdate, (newVal) => {
  if (newVal) {
    // Determine role based on permissions
    let userRole = '';
    if (newVal.is_superuser) {
      userRole = 'Administrator';
    } else {
      userRole = newVal.role || '';
    }
    editedUser.value = {
      user_id: newVal.user_id,
      user_name: newVal.user_name || '',
      first_name: newVal.first_name || '',
      last_name: newVal.last_name || '',
      user_email: newVal.user_email || '',
      password: '', // Don't populate password for security
      confirmPassword: '',
      user_phone: newVal.user_phone || newVal.phone_number || '',
      user_address: newVal.user_address || newVal.home_address || '',
      avatar: newVal.avatar || '',
      role: userRole,
      is_superuser: newVal.is_superuser || false,
      is_active: newVal.is_active || newVal.status === 'Active'
    };
    
    // Clear any previous avatar preview and file when user changes
    clearAvatarUpload();
  }
}, { immediate: true });

watch(() => editedUser.value.role, (newRole) => {
  // If role is Administrator, set is_superuser to true
  if (newRole === 'Administrator') {
    editedUser.value.is_superuser = true;
  } else {
    editedUser.value.is_superuser = false;
  }
});

// Computed properties
const isPasswordMatch = computed(() => {
  if (!editedUser.value.password && !editedUser.value.confirmPassword) return true;
  return editedUser.value.password === editedUser.value.confirmPassword;
});

const isFormValid = computed(() => {
  return editedUser.value.user_name && 
         editedUser.value.user_email && 
         isPasswordMatch.value;
});

// Clear avatar upload function
function clearAvatarUpload() {
  avatarPreview.value = '';
  editedUser.value.avatarFile = null;
  if (avatarInput.value) {
    avatarInput.value.value = '';
  }
}

function closeModal() {
  // Clear avatar upload when closing
  clearAvatarUpload();
  emit('close');
}

function triggerAvatarUpload() {
  avatarInput.value?.click();
}

function handleAvatarChange(event) {
  const file = event.target.files[0];
  if (file) {
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      avatarPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
    
    // Store file for upload
    editedUser.value.avatarFile = file;
  }
}

async function updateUser() {
  if (!isFormValid.value) {
    alert('Please fill in all required fields and ensure passwords match.');
    return;
  }

  try {
    // Prepare the update data according to your API structure
    const updateData = {
      user_name: editedUser.value.user_name,
      first_name: editedUser.value.first_name,
      last_name: editedUser.value.last_name,
      user_email: editedUser.value.user_email,
      user_phone: editedUser.value.user_phone,
      user_address: editedUser.value.user_address,
      is_superuser: editedUser.value.is_superuser,
      is_active: editedUser.value.is_active
    };

    if (editedUser.value.role === 'Administrator') {
      // For administrators, use a default role (like customer) and rely on is_superuser flag
      updateData.role = 'customer';
    } else {
      // For non-administrators, use the selected role
      updateData.role = editedUser.value.role;
    }

    // Only include password if it's being changed
    if (editedUser.value.password) {
      updateData.password = editedUser.value.password;
    }

    // If there's a new avatar file, handle file upload
    if (editedUser.value.avatarFile) {
      const formData = new FormData();
      formData.append('avatar', editedUser.value.avatarFile);
      
      // Upload avatar first
      try {
        const avatarResponse = await $fetch(`${api}/api/users/${editedUser.value.user_id}/avatar/`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData
        });
        
        if (avatarResponse.avatar_url) {
          updateData.avatar = avatarResponse.avatar_url;
        }
      } catch (avatarError) {
        console.warn('Avatar upload failed, continuing with user update:', avatarError);
      }
    }

    // Update user data
    await $fetch(`${api}/api/users/${editedUser.value.user_id}/`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: updateData
    });

    emit('updated');
    // Clear avatar upload on successful update
    clearAvatarUpload();
    closeModal();
    alert('User updated successfully!');
  } catch (error) {
    console.error('Failed to update user:', error);
    alert('Failed to update user. Please try again.');
  }
}

// Address autocomplete
const addressQuery = ref('');
const addressSuggestions = ref([]);
let debounceTimeout = null;

// Keep input in sync with editedUser
watch(() => editedUser.value.user_address, (val) => {
  if (val !== addressQuery.value) addressQuery.value = val || '';
});

// Debounced search for address suggestions
watch(addressQuery, (query) => {
  clearTimeout(debounceTimeout);
  editedUser.value.user_address = query;
  
  if (!query) {
    addressSuggestions.value = [];
    return;
  }
  
  debounceTimeout = setTimeout(async () => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ph`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      addressSuggestions.value = await res.json();
    } catch (error) {
      console.error('Address lookup failed:', error);
    }
  }, 400);
});

function selectAddress(suggestion) {
  editedUser.value.user_address = suggestion.display_name;
  addressQuery.value = suggestion.display_name;
  addressSuggestions.value = [];
}

// Function to remove uploaded avatar
function removeAvatar() {
  clearAvatarUpload();
}
</script>

<template>
  <div v-if="show && userToUpdate"
       class="fixed inset-0 z-60 flex items-center justify-center bg-gray-800/30"
       @click.self="closeModal">
    <div class="bg-white text-gray-900 rounded-lg shadow-lg w-3xl max-w-4xl p-8 relative max-h-[90vh] overflow-y-auto"
         @click.stop>
      <button class="absolute top-7 right-7 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              @click.stop="closeModal" 
              aria-label="Close">&times;</button>
      
      <h2 class="text-2xl font-semibold mb-6 text-gray-900">Update User</h2>
      
      <form class="space-y-6" @submit.prevent="updateUser">
        <!-- Avatar Section -->
        <div class="flex flex-col items-center mb-6">
          <div class="relative">
            <img :src="avatarPreview || editedUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(editedUser.user_name || 'User')}`" 
                 class="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                 :alt="editedUser.user_name">
            
            <!-- Upload button -->
            <button type="button" 
                    @click="triggerAvatarUpload"
                    class="absolute bottom-0 right-0 bg-green-600 text-white rounded-full p-2 hover:bg-green-700">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
            
            <!-- Remove button (only show if there's a preview) -->
            <button v-if="avatarPreview" 
                    type="button" 
                    @click="removeAvatar"
                    class="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <input ref="avatarInput" 
                 type="file" 
                 accept="image/*" 
                 @change="handleAvatarChange"
                 class="hidden">
          
          <p class="text-sm text-gray-500 mt-2">
            Click the + icon to change avatar
            <span v-if="avatarPreview" class="text-green-600">(New image selected)</span>
          </p>
        </div>

        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block mb-1 font-medium text-gray-700">Username *</label>
            <input type="text" 
                   class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                   v-model="editedUser.user_name"
                   required>
          </div>
          
          <div>
            <label class="block mb-1 font-medium text-gray-700">Email *</label>
            <input type="email" 
                   class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                   v-model="editedUser.user_email"
                   required>
          </div>

          <div>
            <label class="block mb-1 font-medium text-gray-700">First Name</label>
            <input type="text" 
                   class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                   v-model="editedUser.first_name">
          </div>

          <div>
            <label class="block mb-1 font-medium text-gray-700">Last Name</label>
            <input type="text" 
                   class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                   v-model="editedUser.last_name">
          </div>

          <div>
            <label class="block mb-1 font-medium text-gray-700">Phone Number</label>
            <input type="tel" 
                   class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                   v-model="editedUser.user_phone"
                   placeholder="+63 XXX XXX XXXX">
          </div>
        </div>

        <!-- Address -->
        <div>
          <label class="block mb-1 font-medium text-gray-700">Address</label>
          <div class="relative">
            <input type="text"
                   class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                   placeholder="Type your address"
                   v-model="addressQuery"
                   autocomplete="off">
            <ul v-if="addressSuggestions.length"
                class="absolute bg-white border border-gray-300 rounded shadow mt-1 z-50 w-full max-h-48 overflow-auto">
              <li v-for="suggestion in addressSuggestions"
                  :key="suggestion.place_id || suggestion.osm_id"
                  @click="selectAddress(suggestion)"
                  class="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                {{ suggestion.display_name }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Password Section -->
        <div class="border-t pt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Change Password (Optional)</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 font-medium text-gray-700">New Password</label>
              <input type="password" 
                     class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                     v-model="editedUser.password"
                     placeholder="Leave blank to keep current password">
            </div>

            <div>
              <label class="block mb-1 font-medium text-gray-700">Confirm New Password</label>
              <input type="password" 
                     class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                     :class="{ 'border-red-500': !isPasswordMatch }"
                     v-model="editedUser.confirmPassword"
                     placeholder="Confirm new password">
              <p v-if="!isPasswordMatch" class="text-red-500 text-sm mt-1">Passwords do not match</p>
            </div>
          </div>
        </div>

        <!-- Role and Permissions -->
        <div class="border-t pt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Role & Permissions</h3>
          
          <!-- Role Selection -->
          <div class="mb-6">
            <label class="block mb-2 font-medium text-gray-700">User Role</label>
            <select v-model="editedUser.role" 
                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="">Role</option>
              <option value="Administrator">Administrator</option>
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
            </select>
            <p class="text-sm text-gray-500 mt-1">
              Basic role assignment. Additional permissions can be set below.
            </p>
          </div>

          <!-- Permission Checkboxes -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="flex items-center">
              <input type="checkbox" 
                     id="is_active"
                     class="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" 
                     v-model="editedUser.is_active">
              <label for="is_active" class="text-gray-700">
                <span class="font-medium">Active</span>
                <span class="block text-xs text-gray-500">Account is active</span>
              </label>
            </div>
          </div>

          <!-- Role Hierarchy Info -->
          <div class="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 class="text-sm font-medium text-green-900 mb-2">Role Hierarchy:</h4>
            <ul class="text-xs text-green-800 space-y-1">
              <li><span class="font-medium">Admin:</span> Full system access (is_superuser = true)</li>
              <li><span class="font-medium">Seller:</span> Can sell products (role = "seller")</li>
              <li><span class="font-medium">Customer:</span> Regular user (role = "customer")</li>
            </ul>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-4 pt-6 border-t">
          <button type="button" 
                  @click="closeModal"
                  class="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition">
            Cancel
          </button>
          <button type="submit" 
                  :disabled="!isFormValid"
                  class="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
            Update User
          </button>
        </div>
      </form>
    </div>
  </div>
</template>