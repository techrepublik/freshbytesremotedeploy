<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  show: { type: Boolean, required: true },
  userToUpdate: { type: Object, default: () => null },
});

const emit = defineEmits(['close', 'updated']);

const config = useRuntimeConfig();
const api = config.public.API_LINK;
const { accessToken } = useAuth()

// Function to get auth headers
const getAuthHeaders = () => {
  const token = accessToken.value
  
  return token ? {
    Authorization: `Bearer ${token}`
  } : {}
}

const loading = ref(false)

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
  street: '',
  barangay: '',
  city: '',
  province: '',
  zip_code: '',
  avatar: '',
  role: '',
  is_superuser: false,
  is_active: true,
  is_staff: false,
  created_at: '',
  updated_at: '',
  avatarFile: null
});

// Avatar upload handling
const avatarInput = ref(null);
const avatarPreview = ref('');

// Watch for prop changes
watch(() => props.userToUpdate, (newVal) => {
  if (newVal) {
    console.log('Received user to update:', newVal)
    
    // Determine role based on permissions
    let userRole = '';
    if (newVal.is_superuser) {
      userRole = 'superuser';
    } else {
      userRole = newVal.role || 'customer';
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
      street: newVal.street || '',
      barangay: newVal.barangay || '',
      city: newVal.city || '',
      province: newVal.province || '',
      zip_code: newVal.zip_code || '',
      avatar: newVal.avatar || '',
      role: userRole,
      is_superuser: newVal.is_superuser || false,
      is_active: newVal.is_active || newVal.status === 'Active',
      is_staff: newVal.is_staff || false,
      created_at: newVal.created_at || '',
      updated_at: newVal.updated_at || '',
      avatarFile: null
    };
    
    console.log('Mapped editedUser:', editedUser.value)
    
    // Clear any previous avatar preview and file when user changes
    clearAvatarUpload();
  }
}, { immediate: true });

watch(() => editedUser.value.role, (newRole) => {
  // If role is superuser (Administrator), set is_superuser to true
  if (newRole === 'superuser') {
    editedUser.value.is_superuser = true;
    editedUser.value.is_staff = true;
  } else {
    editedUser.value.is_superuser = false;
    editedUser.value.is_staff = false;
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

// Computed for formatted dates
const formattedCreatedAt = computed(() => {
  if (!editedUser.value.created_at) return 'Not available'
  try {
    return new Date(editedUser.value.created_at).toLocaleString()
  } catch (error) {
    return 'Invalid date'
  }
})

const formattedUpdatedAt = computed(() => {
  if (!editedUser.value.updated_at) return 'Not available'
  try {
    return new Date(editedUser.value.updated_at).toLocaleString()
  } catch (error) {
    return 'Invalid date'
  }
})

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
  
  if (!file) {
    clearAvatarUpload();
    return;
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    clearAvatarUpload();
    return;
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image file must be less than 5MB');
    clearAvatarUpload();
    return;
  }

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    avatarPreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
  
  // Store file for upload
  editedUser.value.avatarFile = file;
}

function removeAvatar() {
  clearAvatarUpload();
}

async function updateUser() {
  if (!isFormValid.value) {
    alert('Please fill in all required fields and ensure passwords match.');
    return;
  }

  loading.value = true;
  try {
    // For administrators (superuser), send 'customer' as role and set is_superuser to true
    let role = editedUser.value.role;
    let is_superuser = editedUser.value.is_superuser;
    let is_staff = editedUser.value.is_staff;
    
    if (role === 'superuser') {
      role = 'customer'; // Use customer as the base role for admins
      is_superuser = true;
      is_staff = true;
    }

    // Prepare the update data according to your API structure
    const updateData = {
      user_name: editedUser.value.user_name,
      first_name: editedUser.value.first_name,
      last_name: editedUser.value.last_name,
      user_email: editedUser.value.user_email,
      user_phone: editedUser.value.user_phone,
      user_address: editedUser.value.user_address,
      street: editedUser.value.street,
      barangay: editedUser.value.barangay,
      city: editedUser.value.city,
      province: editedUser.value.province,
      zip_code: editedUser.value.zip_code,
      role: role,
      is_superuser: is_superuser,
      is_staff: is_staff,
      is_active: editedUser.value.is_active
    };

    // Only include password if it's being changed
    if (editedUser.value.password) {
      updateData.password = editedUser.value.password;
    }

    console.log('Updating user with data:', updateData);

    // Update user data
    const userResponse = await $fetch(`${api}/api/users/${editedUser.value.user_id}/`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: updateData
    });

    console.log('User update response:', userResponse);

    // Update the local editedUser with the response data to show updated timestamps
    if (userResponse.updated_at) {
      editedUser.value.updated_at = userResponse.updated_at;
    }

    // If there's a new avatar file, handle file upload
    if (editedUser.value.avatarFile) {
      try {
        const formData = new FormData();
        formData.append('avatar', editedUser.value.avatarFile);
        
        const avatarResponse = await $fetch(`${api}/api/users/${editedUser.value.user_id}/avatar/`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData
        });
        
        console.log('Avatar upload response:', avatarResponse);
        
        // Update avatar URL if returned
        if (avatarResponse.avatar || avatarResponse.avatar_url) {
          editedUser.value.avatar = avatarResponse.avatar || avatarResponse.avatar_url;
        }
      } catch (avatarError) {
        console.warn('Avatar upload failed, but user was updated:', avatarError);
      }
    }

    // Emit updated user data with proper structure
    const updatedUserForParent = {
      ...userResponse,
      display_role: role === 'customer' && is_superuser ? 'Administrator' : 
                   role === 'seller' ? 'Seller' : 'Customer'
    };

    emit('updated', updatedUserForParent);
    
    // Clear avatar upload on successful update
    clearAvatarUpload();
    closeModal();
    alert('User updated successfully!');
  } catch (error) {
    console.error('Full error details:', {
      status: error.status,
      statusText: error.statusText,
      data: error.data,
      message: error.message
    });
    
    let errorMessage = 'Failed to update user. Please try again.';
    
    if (error.status === 400) {
      if (error.data?.detail) {
        errorMessage = error.data.detail;
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (typeof error.data === 'object') {
        const errors = Object.entries(error.data).map(([field, messages]) => {
          const fieldName = field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
          return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`;
        });
        errorMessage = errors.join('\n');
      }
    } else if (error.status === 401) {
      errorMessage = 'Authentication failed. Please log in again.';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to update this user.';
    }
    
    alert(errorMessage);
  } finally {
    loading.value = false;
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
            <!-- Avatar Preview or Current Avatar -->
            <div class="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-300">
              <img 
                v-if="avatarPreview"
                :src="avatarPreview" 
                alt="Avatar preview" 
                class="w-full h-full object-cover"
              />
              <img 
                v-else-if="editedUser.avatar"
                :src="editedUser.avatar" 
                :alt="editedUser.user_name"
                class="w-full h-full object-cover"
              />
              <img 
                v-else
                :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(editedUser.user_name || 'User')}`" 
                :alt="editedUser.user_name"
                class="w-full h-full object-cover"
              />
            </div>
            
            <!-- Upload button -->
            <button type="button" 
                    @click="triggerAvatarUpload"
                    class="absolute bottom-0 right-0 bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    title="Change avatar">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
            </button>
            
            <!-- Remove button (only show if there's a preview) -->
            <button v-if="avatarPreview" 
                    type="button" 
                    @click="removeAvatar"
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                    title="Remove new avatar">
              ×
            </button>
          </div>
          
          <!-- File Input (Hidden) -->
          <input ref="avatarInput" 
                 type="file" 
                 accept="image/*" 
                 @change="handleAvatarChange"
                 class="hidden">
          
          <!-- Upload Guidelines -->
          <p class="text-xs text-gray-500 mt-2 text-center">
            Click + to change avatar
            <span v-if="avatarPreview" class="text-green-600 block">(New image selected)</span>
            <span class="block">Max 5MB • JPG, PNG, GIF</span>
          </p>
        </div>

        <!-- User Information Summary -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-sm font-medium text-gray-900 mb-2">User Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-600">Created:</span>
              <span class="ml-2 text-gray-900">{{ formattedCreatedAt }}</span>
            </div>
            <div>
              <span class="text-gray-600">Last Updated:</span>
              <span class="ml-2 text-gray-900">{{ formattedUpdatedAt }}</span>
            </div>
            <div>
              <span class="text-gray-600">User ID:</span>
              <span class="ml-2 text-gray-900">{{ editedUser.user_id }}</span>
            </div>
            <div>
              <span class="text-gray-600">Current Role:</span>
              <span class="ml-2 text-gray-900">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="{
                        'bg-green-100 text-green-800': editedUser.role === 'superuser',
                        'bg-blue-100 text-blue-800': editedUser.role === 'seller',
                        'bg-gray-100 text-gray-800': editedUser.role === 'customer'
                      }">
                  {{ editedUser.role === 'superuser' ? 'Administrator' : 
                     editedUser.role === 'seller' ? 'Seller' : 'Customer' }}
                </span>
              </span>
            </div>
          </div>
        </div>

        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Username *</label>
            <input type="text" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                   v-model="editedUser.user_name"
                   required
                   placeholder="Enter username">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input type="email" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                   v-model="editedUser.user_email"
                   required
                   placeholder="Enter email address">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input type="text" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                   v-model="editedUser.first_name"
                   placeholder="Enter first name">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input type="text" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                   v-model="editedUser.last_name"
                   placeholder="Enter last name">
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input type="tel" 
                   class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                   v-model="editedUser.user_phone"
                   placeholder="Enter phone number">
          </div>
        </div>

        <!-- Address Section -->
        <div class="border-t pt-6">
          <h3 class="text-lg font-medium mb-4">Address Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Street -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Street</label>
              <input 
                v-model="editedUser.street" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter street address"
              />
            </div>

            <!-- Barangay -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Barangay</label>
              <input 
                v-model="editedUser.barangay" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter barangay"
              />
            </div>

            <!-- City -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input 
                v-model="editedUser.city" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter city"
              />
            </div>

            <!-- Province -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Province</label>
              <input 
                v-model="editedUser.province" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter province"
              />
            </div>

            <!-- Zip Code -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
              <input 
                v-model="editedUser.zip_code" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter zip code"
              />
            </div>

            <!-- Full Address (with autocomplete) -->
            <div class="col-span-full">
              <label class="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
              <div class="relative">
                <input type="text"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       placeholder="Type your full address for suggestions"
                       v-model="addressQuery"
                       autocomplete="off">
                <ul v-if="addressSuggestions.length"
                    class="absolute bg-white border border-gray-300 rounded shadow mt-1 z-50 w-full max-h-48 overflow-auto">
                  <li v-for="suggestion in addressSuggestions"
                      :key="suggestion.place_id || suggestion.osm_id"
                      @click="selectAddress(suggestion)"
                      class="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm">
                    {{ suggestion.display_name }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Password Section -->
        <div class="border-t pt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Change Password (Optional)</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input type="password" 
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                     v-model="editedUser.password"
                     placeholder="Leave blank to keep current password">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <input type="password" 
                     class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
            <label class="block text-sm font-medium text-gray-700 mb-2">User Role</label>
            <select v-model="editedUser.role" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="customer">Customer</option>
              <option value="seller">Seller</option>
              <option value="superuser">Administrator</option>
            </select>
            <p class="text-sm text-gray-500 mt-1">
              Select the appropriate role for this user.
            </p>
          </div>

          <!-- Permission Checkboxes -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex items-center">
              <input type="checkbox" 
                     id="is_active"
                     class="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" 
                     v-model="editedUser.is_active">
              <label for="is_active" class="text-gray-700">
                <span class="font-medium">Active Account</span>
                <span class="block text-xs text-gray-500">Account is active and can log in</span>
              </label>
            </div>
          </div>

          <!-- Role Hierarchy Info -->
          <div class="mt-4 p-3 bg-green-50 rounded-lg">
            <h4 class="text-sm font-medium text-green-900 mb-2">Role Information:</h4>
            <ul class="text-xs text-green-800 space-y-1">
              <li><span class="font-medium">Administrator:</span> Full system access (is_superuser = true)</li>
              <li><span class="font-medium">Seller:</span> Can manage and sell products</li>
              <li><span class="font-medium">Customer:</span> Regular user with basic permissions</li>
            </ul>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-4 pt-6 border-t">
          <button type="button" 
                  @click="closeModal"
                  class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500">
            Cancel
          </button>
          <button type="submit" 
                  :disabled="!isFormValid || loading"
                  class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed">
            {{ loading ? 'Updating...' : 'Update User' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>