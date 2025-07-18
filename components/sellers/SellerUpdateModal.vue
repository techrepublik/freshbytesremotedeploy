<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    show: {
        type: Boolean,
        required: true
    },
    seller: {
        type: Object,
        default: () => ({})
    }
})
const emit = defineEmits(['close', 'success'])

const loading = ref(false)
const form = ref({
    seller_name: '',
    first_name: '',
    last_name: '',
    seller_email: '',
    seller_phone: '',
    seller_address: '',
    avatar: null,
})
const avatarPreview = ref(null)

// Location search functionality
const locationQuery = ref('')
const locationSuggestions = ref([])
let debounceTimeout = null

// Watch for location query changes and search using OpenStreetMap
watch(locationQuery, (query) => {
    clearTimeout(debounceTimeout);
    if (!query) {
        locationSuggestions.value = [];
        return;
    }
    debounceTimeout = setTimeout(async () => {
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
            const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
            locationSuggestions.value = await res.json();
        } catch (error) {
            console.error('Location search error:', error);
            locationSuggestions.value = [];
        }
    }, 400);
});

// Location selection
function selectLocation(suggestion) {
    form.value.seller_address = suggestion.display_name;
    locationQuery.value = suggestion.display_name;
    locationSuggestions.value = [];
}

// Watch for modal show/hide and seller prop changes
watch(() => props.show, (val) => {
    if (val && props.seller) {
        // Pre-populate form with seller data
        Object.assign(form.value, {
            seller_name: props.seller.seller_name || '',
            first_name: props.seller.first_name || '',
            last_name: props.seller.last_name || '',
            seller_email: props.seller.seller_email || '',
            seller_phone: props.seller.seller_phone || '',
            seller_address: props.seller.seller_address || '',
            avatar: null, // Reset file input
        })
        locationQuery.value = props.seller.seller_address || ''
        avatarPreview.value = props.seller.avatar || null
        locationSuggestions.value = []
    }
})

function onAvatarChange(e) {
    const file = e.target.files[0]
    form.value.avatar = file
    if (file) {
        const reader = new FileReader()
        reader.onload = (ev) => {
            avatarPreview.value = ev.target.result
        }
        reader.readAsDataURL(file)
    }
}

async function submit() {
    loading.value = true
    try {
        const config = useRuntimeConfig()
        const api = config.public.API_LINK
        
        const formData = new FormData()
        for (const key in form.value) {
            if (form.value[key] !== null && form.value[key] !== '') {
                formData.append(key, form.value[key])
            }
        }
        
        await $fetch(`${api}/api/sellers/${props.seller.seller_id}/`, {
            method: 'PATCH',
            body: formData,
        })
        emit('success')
        emit('close')
    } catch (err) {
        console.error('Update error:', err)
        alert('Failed to update seller')
    } finally {
        loading.value = false
    }
}

// Handle address input changes for location search
function handleAddressInput(event) {
    const value = event.target.value
    form.value.seller_address = value
    locationQuery.value = value
}
</script>

<template>
    <!-- Update Seller Modal -->
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-gray-800/30">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-xl p-8 relative">
            <button
                @click="$emit('close')"
                type="button"
                class="absolute top-7 right-8 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                aria-label="Close"
            >
                &times;
            </button>
            <h2 class="text-xl font-semibold mb-4">Update Seller</h2>
            <form @submit.prevent="submit" class="space-y-3">
                <div>
                    <label class="block font-medium mb-1">Seller name</label>
                    <input 
                        v-model="form.seller_name" 
                        required 
                        class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none" 
                        placeholder="Type seller name" 
                    />
                </div>
                <div class="flex gap-2">
                    <div class="flex-1">
                        <label class="block text-sm font-medium mb-1">First Name</label>
                        <input 
                            v-model="form.first_name" 
                            required 
                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none" 
                            placeholder="First Name" 
                        />
                    </div>
                    <div class="flex-1">
                        <label class="block text-sm font-medium mb-1">Last Name</label>
                        <input 
                            v-model="form.last_name" 
                            required 
                            class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none" 
                            placeholder="Last Name" 
                        />
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Email</label>
                    <input 
                        v-model="form.seller_email" 
                        type="email" 
                        required 
                        class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none" 
                        placeholder="Email" 
                    />
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Phone Number</label>
                    <input 
                        v-model="form.seller_phone" 
                        required 
                        class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none" 
                        placeholder="Phone Number" 
                    />
                </div>
                
                <!-- Enhanced Home Address with Location Search -->
                <div class="relative">
                    <label class="block text-sm font-medium mb-1">Home Address</label>
                    <input 
                        :value="form.seller_address"
                        @input="handleAddressInput"
                        required 
                        class="w-full px-3 py-2 rounded bg-gray-100 border border-gray-300 focus:outline-none" 
                        placeholder="Start typing to search for address..." 
                        autocomplete="off"
                    />
                    
                    <!-- Location Suggestions Dropdown -->
                    <div v-if="locationSuggestions.length > 0" class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <div 
                            v-for="suggestion in locationSuggestions" 
                            :key="suggestion.place_id"
                            @click="selectLocation(suggestion)"
                            class="px-4 py-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                        >
                            <div class="flex items-start">
                                <svg class="w-4 h-4 text-gray-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium text-gray-900 truncate">{{ suggestion.display_name }}</p>
                                    <p class="text-xs text-gray-500 mt-1">{{ suggestion.type ? suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1) : 'Location' }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Loading indicator for location search -->
                    <div v-if="locationQuery && locationSuggestions.length === 0" class="absolute right-3 top-9">
                        <svg class="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium mb-1">Avatar</label>
                    <input type="file" accept="image/*" @change="onAvatarChange" class="w-full" />
                    <div v-if="avatarPreview" class="mt-2">
                        <img :src="avatarPreview" alt="Avatar Preview" class="w-16 h-16 rounded-full object-cover" />
                    </div>
                </div>
                <div class="flex justify-end gap-2 mt-4">
                    <button
                        @click="$emit('close')"
                        type="button"
                        class="px-6 h-12 text-base bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        :disabled="loading"
                        class="px-6 h-12 text-base rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                        <span v-if="loading">Updating...</span>
                        <span v-else>Update Seller</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>