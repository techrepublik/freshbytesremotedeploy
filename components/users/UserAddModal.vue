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

// Function to get auth headers
const getAuthHeaders = () => {
  const accessTokenCookie = useCookie('auth-access-token')
  const token = accessTokenCookie.value
  
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
  role: 'customer', // Add role field
  is_superuser: false,
  is_active: true,
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
    role: 'customer', // Add role field
    is_superuser: false,
    is_active: true,
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
  form.value.avatar = file
  if (file) {
    const reader = new FileReader()
    reader.onload = (ev) => {
      avatarPreview.value = ev.target.result
    }
    reader.readAsDataURL(file)
  } else {
    avatarPreview.value = null
  }
}

function removeAvatar() {
  clearAvatarUpload()
}

async function submit() {
  loading.value = true
  try {
    // For administrators (superuser), send 'customer' as role and set is_superuser to true
    let role = form.value.role
    let is_superuser = form.value.is_superuser
    
    if (role === 'superuser') {
      role = 'customer' // Use customer as the base role for admins
      is_superuser = true
    }
    
    // Prepare the user data
    const userData = {
      user_name: form.value.user_name,
      first_name: form.value.first_name,
      last_name: form.value.last_name,
      user_email: form.value.user_email,
      password: form.value.password,
      user_phone: form.value.user_phone,
      user_address: form.value.user_address,
      role: role, // Use the adjusted role
      is_superuser: is_superuser,
      is_active: form.value.is_active
    }
    
    console.log('Sending user data:', userData)

    // Create user first
    const userResponse = await $fetch(`${api}/api/users/`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: userData
    })

    // If avatar is provided, upload it separately
    if (form.value.avatar && userResponse.user_id) {
      try {
        const formData = new FormData()
        formData.append('avatar', form.value.avatar)
        
        await $fetch(`${api}/api/users/${userResponse.user_id}/avatar/`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: formData
        })
      } catch (avatarError) {
        console.warn('Avatar upload failed, but user was created:', avatarError)
      }
    }

    emit('success')
    closeModal()
    alert('User added successfully!')
  } catch (err) {
    console.error('Failed to add user:', err)
    alert('Failed to add user. Please try again.')
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
  // If role is superuser (Administrator), set is_superuser to true
  if (newRole === 'superuser') {
    form.value.is_superuser = true;
  } else {
    form.value.is_superuser = false;
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
            <img :src="avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.user_name || 'User')}`" 
                 class="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                 alt="User Avatar">
            
            <!-- Upload button -->
            <button type="button" 
                    @click="$refs.avatarInput.click()"
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
                 @change="onAvatarChange"
                 class="hidden">
          
          <p class="text-sm text-gray-500 mt-2">
            Click the + icon to add avatar
            <span v-if="avatarPreview" class="text-green-600">(Image selected)</span>
          </p>
        </div>

        <!-- Basic Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block mb-1 font-medium text-gray-700">Username *</label>
            <input v-model="form.user_name" 
                   type="text"
                   required 
                   class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                   placeholder="Type username" />
          </div>
          
          <div>
            <label class="block mb-1 font-medium text-gray-700">Email *</label>
            <input v-model="form.user_email" 
                   type="email" 
                   required 
                   class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                   placeholder="Email address" />
          </div>

          <div>
            <label class="block mb-1 font-medium text-gray-700">First Name</label>
            <input v-model="form.first_name" 
                   type="text"
                   class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                   placeholder="First Name" />
          </div>

          <div>
            <label class="block mb-1 font-medium text-gray-700">Last Name</label>
            <input v-model="form.last_name" 
                   type="text"
                   class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                   placeholder="Last Name" />
          </div>

          <div>
            <label class="block mb-1 font-medium text-gray-700">Password *</label>
            <input v-model="form.password" 
                   type="password" 
                   required 
                   class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                   placeholder="Password" />
          </div>

          <div>
            <label class="block mb-1 font-medium text-gray-700">Phone Number</label>
            <input v-model="form.user_phone" 
                   type="tel"
                   class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
                   placeholder="+63 XXX XXX XXXX" />
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

        <!-- Role & Permissions Section -->
        <div class="border-t pt-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Role & Permissions</h3>
          
          <!-- Role Selection -->
          <div class="mb-6">
            <label class="block mb-2 font-medium text-gray-700">User Role</label>
            <select v-model="form.role" 
                    class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent">
              <option value="">Role</option>
              <option value="superuser">Administrator</option>
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
                    id="add_is_active"
                    class="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" 
                    v-model="form.is_active">
              <label for="add_is_active" class="text-gray-700">
                <span class="font-medium">Active</span>
                <span class="block text-xs text-gray-500">Account is active</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end space-x-4 pt-6 border-t">
          <button
            @click="closeModal"
            type="button"
            class="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Adding User...</span>
            <span v-else>Add User</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>