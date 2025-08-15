<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
})

const emit = defineEmits(['close', 'success'])

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
const form = ref({
  user_name: '',
  first_name: '',
  last_name: '',
  user_email: '',
  password: '',
  user_phone: '',
  user_address: '',
  street: '',
  barangay: '',
  city: '',
  province: '',
  zip_code: '',
  role: 'customer',
  is_superuser: false,
  is_active: true,
  is_deleted: false,
  is_staff: false,
  terms_accepted: true,
  phone_verified: false,
  email_verified: false,
  avatar: null,
})

const avatarPreview = ref(null)
const avatarInput = ref(null)

// Clear form when modal opens
watch(() => props.show, (val) => {
  if (val) {
    resetForm()
  }
})

function resetForm() {
  Object.assign(form.value, {
    user_name: '',
    first_name: '',
    last_name: '',
    user_email: '',
    password: '',
    user_phone: '',
    user_address: '',
    street: '',
    barangay: '',
    city: '',
    province: '',
    zip_code: '',
    role: 'customer',
    is_superuser: false,
    is_active: true,
    is_deleted: false,
    is_staff: false,
    terms_accepted: true,
    phone_verified: false,
    email_verified: false,
    avatar: null,
  })
  clearAvatarUpload()
}

function clearAvatarUpload() {
  avatarPreview.value = null
  form.value.avatar = null
  if (avatarInput.value) {
    avatarInput.value.value = ''
  }
}

function closeModal() {
  clearAvatarUpload()
  emit('close')
}

function onAvatarChange(e) {
  const file = e.target.files[0]
  
  if (!file) {
    clearAvatarUpload()
    return
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file')
    clearAvatarUpload()
    return
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    alert('Image file must be less than 5MB')
    clearAvatarUpload()
    return
  }

  form.value.avatar = file
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (ev) => {
    avatarPreview.value = ev.target.result
  }
  reader.readAsDataURL(file)
}

function removeAvatar() {
  clearAvatarUpload()
}

function triggerAvatarUpload() {
  avatarInput.value?.click()
}

async function submit() {
  // Validate required fields
  if (!form.value.user_name?.trim()) {
    alert('Username is required')
    return
  }
  
  if (!form.value.user_email?.trim()) {
    alert('Email is required')
    return
  }
  
  if (!form.value.password?.trim()) {
    alert('Password is required')
    return
  }

  loading.value = true
  try {
    // For administrators (superuser), send 'customer' as role and set is_superuser to true
    let role = form.value.role
    let is_superuser = form.value.is_superuser
    let is_staff = form.value.is_staff
    
    if (role === 'superuser') {
      role = 'customer'
      is_superuser = true
      is_staff = true
    }
    
    // Prepare the user data matching the backend schema
    const userData = {
      user_name: form.value.user_name.trim(),
      first_name: form.value.first_name?.trim() || '',
      last_name: form.value.last_name?.trim() || '',
      user_email: form.value.user_email.trim(),
      password: form.value.password,
      user_phone: form.value.user_phone?.trim() || '',
      street: form.value.street?.trim() || '',
      barangay: form.value.barangay?.trim() || '',
      city: form.value.city?.trim() || '',
      province: form.value.province?.trim() || '',
      zip_code: form.value.zip_code?.trim() || '',
      role: role,
      is_active: form.value.is_active,
      is_deleted: false,
      is_staff: is_staff,
      is_superuser: is_superuser,
      terms_accepted: true,
      phone_verified: false,
      email_verified: false
    }

    // Create user first
    const userResponse = await $fetch(`${api}/api/users/`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: userData
    })

    console.log('User creation response:', userResponse)

    // If avatar is provided, upload it separately
    if (form.value.avatar && userResponse.user_id) {
      try {
        const formData = new FormData()
        formData.append('avatar', form.value.avatar)
        
        const avatarResponse = await $fetch(`${api}/api/users/${userResponse.user_id}/avatar/`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData
        })
        
        // Update user response with avatar URL
        userResponse.avatar = avatarResponse.avatar || avatarResponse.avatar_url
      } catch (avatarError) {
        console.warn('Avatar upload failed, but user was created:', avatarError)
      }
    }

    emit('success', userResponse)
    closeModal()
    alert('User added successfully!')
  } catch (err) {
    console.error('Full error details:', {
      status: err.status,
      statusText: err.statusText,
      data: err.data,
      message: err.message
    })
    
    let errorMessage = 'Failed to add user. Please try again.'
    
    if (err.status === 400) {
      if (err.data?.detail) {
        errorMessage = err.data.detail
      } else if (err.data?.message) {
        errorMessage = err.data.message
      } else if (typeof err.data === 'object') {
        const errors = Object.entries(err.data).map(([field, messages]) => {
          const fieldName = field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
          return `${fieldName}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
        })
        errorMessage = errors.join('\n')
      }
    } else if (err.status === 401) {
      errorMessage = 'Authentication failed. Please log in again.'
    } else if (err.status === 403) {
      errorMessage = 'You do not have permission to create users.'
    }
    
    alert(errorMessage)
  } finally {
    loading.value = false
  }
}

// Address autocomplete
const addressQuery = ref('')
const addressSuggestions = ref([])
let debounceTimeout = null

// Keep input in sync with form
watch(() => form.value.user_address, (val) => {
  if (val !== addressQuery.value) addressQuery.value = val || ''
})

// Debounced search for address suggestions
watch(addressQuery, (query) => {
  clearTimeout(debounceTimeout)
  form.value.user_address = query
  
  if (!query) {
    addressSuggestions.value = []
    return
  }
  
  debounceTimeout = setTimeout(async () => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ph`
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
      addressSuggestions.value = await res.json()
    } catch (error) {
      console.error('Address lookup failed:', error)
    }
  }, 400)
})

watch(() => form.value.role, (newRole) => {
  if (newRole === 'superuser') {
    form.value.is_superuser = true;
    form.value.is_staff = true;
  } else {
    form.value.is_superuser = false;
    form.value.is_staff = false;
  }
});

function selectAddress(suggestion) {
  form.value.user_address = suggestion.display_name
  addressQuery.value = suggestion.display_name
  addressSuggestions.value = []
}
</script>

<template>
  <!-- Add User Modal -->
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
    <div class="bg-white rounded-lg shadow-lg w-3xl max-w-4xl p-8 relative max-h-[90vh] overflow-y-auto">
      <button
        @click="closeModal"
        type="button"
        class="absolute top-7 right-7 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
        aria-label="Close"
      >
        &times;
      </button>
      
      <h2 class="text-2xl font-semibold mb-6">Add New User</h2>
      
      <form @submit.prevent="submit" class="space-y-6">
        <!-- Avatar Section -->
        <div class="flex flex-col items-center mb-6">
          <div class="relative">
            <!-- Avatar Preview or Placeholder -->
            <div class="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-300">
              <img 
                v-if="avatarPreview" 
                :src="avatarPreview" 
                alt="Avatar preview" 
                class="w-full h-full object-cover"
              />
              <svg 
                v-else 
                class="w-12 h-12 text-gray-400" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
              </svg>
            </div>
            
            <!-- Remove Avatar Button (only show if avatar exists) -->
            <button
              v-if="avatarPreview"
              @click="removeAvatar"
              type="button"
              class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
              title="Remove avatar"
            >
              ×
            </button>
          </div>
          
          <!-- Upload Button -->
          <button
            @click="triggerAvatarUpload"
            type="button"
            class="mt-3 px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {{ avatarPreview ? 'Change Avatar' : 'Upload Avatar' }}
          </button>
          
          <!-- File Input (Hidden) -->
          <input 
            ref="avatarInput" 
            type="file" 
            accept="image/*" 
            @change="onAvatarChange" 
            class="hidden"
          />
          
          <!-- Upload Guidelines -->
          <p class="text-xs text-gray-500 mt-2 text-center">
            Maximum file size: 5MB<br>
            Supported formats: JPG, PNG, GIF
          </p>
        </div>

        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Username -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Username *</label>
            <input 
              v-model="form.user_name" 
              type="text" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter username"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input 
              v-model="form.user_email" 
              type="email" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter email address"
            />
          </div>

          <!-- First Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input 
              v-model="form.first_name" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter first name"
            />
          </div>

          <!-- Last Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input 
              v-model="form.last_name" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter last name"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Password *</label>
            <input 
              v-model="form.password" 
              type="password" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter password"
            />
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <input 
              v-model="form.user_phone" 
              type="tel" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter phone number"
            />
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
                v-model="form.street" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter street address"
              />
            </div>

            <!-- Barangay -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Barangay</label>
              <input 
                v-model="form.barangay" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter barangay"
              />
            </div>

            <!-- City -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input 
                v-model="form.city" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter city"
              />
            </div>

            <!-- Province -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Province</label>
              <input 
                v-model="form.province" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter province"
              />
            </div>

            <!-- Zip Code -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
              <input 
                v-model="form.zip_code" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter zip code"
              />
            </div>
          </div>
        </div>

        <!-- Role & Permissions Section -->
        <div class="border-t pt-6">
          <h3 class="text-lg font-medium mb-4">Role & Permissions</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Role -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select 
                v-model="form.role" 
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="customer">Customer</option>
                <option value="seller">Seller</option>
                <option value="superuser">Administrator</option>
              </select>
            </div>

            <!-- Status Checkboxes -->
            <div class="flex flex-col space-y-2">
              <div class="flex items-center">
                <input 
                  type="checkbox" 
                  id="add_is_active"
                  class="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" 
                  v-model="form.is_active"
                />
                <label for="add_is_active" class="text-sm text-gray-700">
                  Active Account
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
          >
            {{ loading ? 'Adding...' : 'Add User' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>